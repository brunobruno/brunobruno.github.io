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
 *  - RemoteOK board (no key, worldwide)    https://remoteok.com/api
 *  - Jobicy remote board (no key)          https://jobicy.com/api/v2/remote-jobs
 *  - Remotive remote board (no key)        https://remotive.com/api/remote-jobs
 *
 * Every entry carries `cc` (ISO alpha-2) and lat/lng so the globe can pin and
 * flag it; jobs are worldwide, posted within the last 180 days.
 */
import { writeFileSync } from 'node:fs'
import { geocode } from '../src/experimental/data/cities.js'

const OUT = new URL('../public/data/jobs.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const FRONTEND = /front.?end|full.?stack|react|angular|vue|svelte|next\.?js|typescript|javascript|web ?developer|ui ?engineer|ui ?developer/i
const SINCE = Date.now() - 180 * 86400000

const linkedinSearch = (title, city) =>
  `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent(city)}&f_TPR=r15552000`

const normalise = ({ id, title, company, location, posted, url, remote = false, tags = [], types = [], source }) => {
  const geo = geocode(location)
  if (!geo || posted < SINCE) return null
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
 * supported market (20 countries across five continents).
 */
async function adzuna() {
  const { ADZUNA_APP_ID: id, ADZUNA_APP_KEY: key } = process.env
  if (!id || !key) {
    console.log('adzuna: skipped (ADZUNA_APP_ID/ADZUNA_APP_KEY not set)')
    return []
  }
  // All Adzuna markets — the globe shows worldwide openings.
  const countries = ['gb', 'fr', 'de', 'nl', 'ch', 'at', 'be', 'es', 'it', 'pl', 'ru', 'us', 'ca', 'au', 'nz', 'in', 'sg', 'za', 'br', 'mx']
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

/** RemoteOK: free, no key — worldwide remote-friendly board. */
async function remoteok() {
  const raw = await fetch('https://remoteok.com/api', {
    headers: { 'User-Agent': 'Mozilla/5.0 (jobs-globe snapshot; github.com/brunobruno)' },
  }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  return raw
    .filter((j) => j.position) // index 0 is a metadata/legal blob
    .filter((j) => FRONTEND.test(j.position) || (j.tags || []).some((t) => FRONTEND.test(t)))
    .map((j) =>
      normalise({
        id: `rk-${j.id}`, title: j.position, company: j.company, location: j.location,
        posted: Date.parse(j.date) || Date.now(), url: j.url, remote: true,
        tags: j.tags || [], types: [], source: 'remoteok',
      }),
    )
    .filter(Boolean)
}

const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (jobs-globe snapshot; github.com/brunobruno)' } }

/** Jobicy: free, no key — worldwide remote board, tag=frontend. */
async function jobicy() {
  const raw = await fetch('https://jobicy.com/api/v2/remote-jobs?count=50&tag=frontend', UA)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  return raw.jobs
    .filter((j) => FRONTEND.test(j.jobTitle))
    .map((j) =>
      normalise({
        id: `jb-${j.id}`, title: j.jobTitle, company: j.companyName, location: j.jobGeo,
        posted: Date.parse(j.pubDate) || Date.now(), url: j.url, remote: true,
        tags: [j.jobIndustry].filter(Boolean), types: [j.jobType].filter(Boolean), source: 'jobicy',
      }),
    )
    .filter(Boolean)
}

/** Remotive: free, no key — worldwide remote board. */
async function remotive() {
  const raw = await fetch('https://remotive.com/api/remote-jobs?limit=200', UA)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  return raw.jobs
    .filter((j) => FRONTEND.test(j.title) || (j.tags || []).some((t) => FRONTEND.test(t)))
    .map((j) =>
      normalise({
        id: `rm-${j.id}`, title: j.title, company: j.company_name, location: j.candidate_required_location,
        posted: Date.parse(j.publication_date) || Date.now(), url: j.url, remote: true,
        tags: j.tags || [], types: [j.job_type].filter(Boolean), source: 'remotive',
      }),
    )
    .filter(Boolean)
}

const [a, z, r, j, m] = await Promise.all([
  arbeitnow().catch(() => []),
  adzuna().catch(() => []),
  remoteok().catch(() => []),
  jobicy().catch(() => []),
  remotive().catch(() => []),
])
const seen = new Set()
const jobs = [...z, ...r, ...j, ...m, ...a]
  .sort((x, y) => y.posted - x.posted)
  .filter((x) => {
    const k = `${x.title}|${x.company}|${x.city}`.toLowerCase()
    return seen.has(k) ? false : seen.add(k)
  })
  .slice(0, 300)

writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), jobs }))
console.log(`jobs.json: ${jobs.length} jobs (adzuna ${z.length}, remoteok ${r.length}, jobicy ${j.length}, remotive ${m.length}, arbeitnow ${a.length})`)
