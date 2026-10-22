/**
 * Nightly job-board snapshot for the Experimental "Openings" globe.
 *
 * Fetches frontend-ish openings from two public sources and writes a
 * normalised, geocoded list to public/data/jobs.json — the app reads that
 * static file first and only falls back to a live Arbeitnow fetch.
 *
 * Sources:
 *  - Arbeitnow job board (no key)          https://www.arbeitnow.com/api/job-board-api
 *  - Adzuna Jobs API (free key, set env)   https://developer.adzuna.com
 *      ADZUNA_APP_ID / ADZUNA_APP_KEY — in GitHub as repo secrets, locally via
 *      `set ADZUNA_APP_ID=... && set ADZUNA_APP_KEY=...` before `node scripts/fetch-jobs.mjs`.
 *
 * Every entry carries `cc` (ISO alpha-2) and lat/lng so the globe can pin and
 * flag it; jobs are Europe-only, posted within the last 180 days.
 */
import { writeFileSync } from 'node:fs'
import { geocode, EUROPE } from '../src/experimental/data/cities.js'

const OUT = new URL('../public/data/jobs.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const FRONTEND = /front.?end|full.?stack|react|angular|vue|svelte|next\.?js|typescript|javascript|web ?developer|ui ?engineer|ui ?developer/i
const SINCE = Date.now() - 180 * 86400000

const linkedinSearch = (title, city) =>
  `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent(city)}&f_TPR=r15552000`

const normalise = ({ id, title, company, location, posted, url, remote = false, tags = [], types = [], source }) => {
  const geo = geocode(location)
  if (!geo || !EUROPE.has(geo.cc) || posted < SINCE) return null
  return {
    id, title: title.replace(/<[^>]+>/g, ''), company, location, posted, url,
    remote, tags: tags.slice(0, 5), types,
    city: geo.city, lat: geo.lat, lng: geo.lng, cc: geo.cc,
    linkedin: linkedinSearch(title, geo.city), source,
  }
}

/** Arbeitnow: free, no key — DACH-centric. Newest-first, 300/page. */
async function arbeitnow() {
  const pages = await Promise.allSettled(
    Array.from({ length: 16 }, (_, i) =>
      fetch(`https://www.arbeitnow.com/api/job-board-api?page=${i + 1}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    ),
  )
  const raw = pages.flatMap((p) => (p.status === 'fulfilled' ? p.value.data : []))
  return raw
    .filter((j) => FRONTEND.test(j.title))
    .map((j) =>
      normalise({
        id: `aw-${j.slug}`, title: j.title, company: j.company_name, location: j.location,
        posted: j.created_at * 1000, url: j.url, remote: Boolean(j.remote),
        tags: j.tags || [], types: j.job_types || [], source: 'arbeitnow',
      }),
    )
    .filter(Boolean)
}

/**
 * Adzuna: free dev key (1k calls/mo) — this snapshot pattern means only the
 * cron ever calls it. One newest-first page of "frontend developer" per
 * supported European market.
 */
async function adzuna() {
  const { ADZUNA_APP_ID: id, ADZUNA_APP_KEY: key } = process.env
  if (!id || !key) {
    console.log('adzuna: skipped (ADZUNA_APP_ID/ADZUNA_APP_KEY not set)')
    return []
  }
  const countries = ['gb', 'fr', 'de', 'nl', 'ch', 'at', 'be', 'es', 'it', 'pl', 'ru'] // Adzuna's European markets
  const pages = await Promise.allSettled(
    countries.map((cc) =>
      fetch(
        `https://api.adzuna.com/v1/api/jobs/${cc}/search/1?app_id=${id}&app_key=${key}` +
          `&what=${encodeURIComponent('frontend developer')}&results_per_page=50&sort_by=date&content-type=application/json`,
      ).then((r) => (r.ok ? r.json() : Promise.reject(`${cc}:${r.status}`))),
    ),
  )
  return pages
    .flatMap((p, i) => (p.status === 'fulfilled' ? p.value.results.map((j) => ({ j, cc: countries[i] })) : []))
    .filter(({ j }) => FRONTEND.test(j.title) || /front.?end|web/i.test(j.category?.label || ''))
    .map(({ j }) =>
      normalise({
        id: `az-${j.id}`, title: j.title, company: j.company?.display_name || '',
        location: j.location?.display_name || '', posted: Date.parse(j.created) || Date.now(),
        url: j.redirect_url, remote: /remote/i.test(`${j.title} ${j.location?.display_name}`),
        tags: [j.category?.label].filter(Boolean), types: [j.contract_time].filter(Boolean),
        source: 'adzuna',
      }),
    )
    .filter(Boolean)
}

const [a, z] = await Promise.all([arbeitnow().catch(() => []), adzuna().catch(() => [])])
const seen = new Set()
const jobs = [...z, ...a]
  .sort((x, y) => y.posted - x.posted)
  .filter((j) => {
    const k = `${j.title}|${j.company}|${j.city}`.toLowerCase()
    return seen.has(k) ? false : seen.add(k)
  })
  .slice(0, 150)

writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), jobs }))
console.log(`jobs.json: ${jobs.length} jobs (adzuna ${z.length}, arbeitnow ${a.length})`)
