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
 *  - Himalayas remote board (no key)       https://himalayas.app/jobs/api
 *  - HN "Who is hiring" (no key, worldwide) https://hn.algolia.com — the largest
 *    monthly tech-hiring thread; ~400 comments, worldwide locations
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

/** Himalayas: free, no key — worldwide remote board, cursor-paginated. */
async function himalayas() {
  const out = []
  let cursor = ''
  for (let i = 0; i < 4; i++) {
    const raw = await fetch(`https://himalayas.app/jobs/api?limit=100${cursor ? `&cursor=${cursor}` : ''}`, UA)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    out.push(...(raw.jobs || []))
    cursor = raw.nextCursor
    if (!cursor) break
  }
  return out
    .filter((j) => FRONTEND.test(j.title) || (j.categories || []).some((c) => FRONTEND.test(c)))
    .map((j) =>
      normalise({
        id: `hm-${j.guid || j.companySlug}`, title: j.title, company: j.companyName,
        location: (j.locationRestrictions || [])[0] || '',
        posted: Date.parse(j.pubDate) || Date.now(), url: j.applicationLink || 'https://himalayas.app',
        remote: true, tags: (j.categories || []).slice(0, 5), types: [j.employmentType].filter(Boolean),
        source: 'himalayas',
      }),
    )
    .filter(Boolean)
}

/**
 * HN "Who is hiring" — the biggest worldwide tech-hiring thread, posted monthly.
 * Comments are loosely pipe-separated ("Company | Role | Location"); every
 * fragment is offered to the geocoder, first hit wins. Algolia API, no key.
 */
const HN_US = /^(u\.?s\.?a?\.?|united states|america|us only|usa only|us remote|remote us)$/i
const HN_UK = /^(u\.?k\.?|uk only|united kingdom)$/i
const NOISE = /\b(remote[- ]?first|on[- ]?site|onsite|hybrid|full[- ]?time|part[- ]?time|contract(ors?)?|visa|relocat\w*|authorized|eligible|citizenship|required|preferred|series [a-e]|y ?combinator|yc ?[ws]\d{2})\b/gi
async function hnHiring() {
  const search = await fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&query=who%20is%20hiring&hitsPerPage=30', UA)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  const story = search.hits.find((h) => /^Ask HN: Who is hiring/i.test(h.title))
  if (!story) return []
  const item = await fetch(`https://hn.algolia.com/api/v1/items/${story.objectID}`, UA)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  return (item.children || [])
    .filter((c) => c.text && FRONTEND.test(c.text))
    .map((c) => {
      const text = c.text.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()
      const parts = text.split(/\s*[|•·]\s*|\s+[—–]\s+/).map((s) => s.trim()).filter(Boolean)
      let geo = null
      for (const raw of parts) {
        const p = raw.replace(NOISE, ' ').replace(/\s+/g, ' ').trim()
        if (!p || p.length > 80) continue
        geo = geocode(HN_US.test(p) ? 'united states' : HN_UK.test(p) ? 'united kingdom' : p)
        if (geo) break
      }
      if (!geo) return null
      const role = parts.find((p) => FRONTEND.test(p)) || parts[1] || parts[0]
      return normalise({
        id: `hn-${c.id}`,
        title: role && role.length < 90 ? role.replace(/\s*\([^)]*\)/g, '').trim() : 'Frontend Engineer',
        company: (parts[0] || 'HN').replace(/\s*\(.*$/, '').replace(NOISE, ' ').replace(/\s+/g, ' ').trim().slice(0, 60),
        location: geo.city,
        posted: story.created_at_i * 1000,
        url: `https://news.ycombinator.com/item?id=${c.id}`,
        remote: /remote/i.test(text), tags: [], types: [], source: 'hackernews',
      })
    })
    .filter(Boolean)
}

const [a, z, r, j, m, h, n] = await Promise.all([
  arbeitnow().catch(() => []),
  adzuna().catch(() => []),
  remoteok().catch(() => []),
  jobicy().catch(() => []),
  remotive().catch(() => []),
  himalayas().catch(() => []),
  hnHiring().catch((e) => (console.log('hn:', e.message || e), [])),
])
const seen = new Set()
const jobs = [...z, ...n, ...r, ...j, ...m, ...h, ...a]
  .sort((x, y) => y.posted - x.posted)
  .filter((x) => {
    const k = `${x.title}|${x.company}|${x.city}`.toLowerCase()
    return seen.has(k) ? false : seen.add(k)
  })
  .slice(0, 400)

writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), jobs }))
console.log(`jobs.json: ${jobs.length} jobs (adzuna ${z.length}, hn ${n.length}, remoteok ${r.length}, jobicy ${j.length}, remotive ${m.length}, himalayas ${h.length}, arbeitnow ${a.length})`)
