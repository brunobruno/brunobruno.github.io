import { geocode } from './cities'

/**
 * Frontend openings for the Experimental globe.
 *
 * LinkedIn has no public job-search API (the Jobs API is partner-only and
 * scraping violates its terms), so we pull from the free, CORS-enabled
 * Arbeitnow job board (https://www.arbeitnow.com/api/job-board-api — mostly
 * European listings, 300 per page, newest first). Each job links to the
 * original posting and to an equivalent LinkedIn search for the same role/city.
 *
 * Primary source: public/data/jobs.json — a daily snapshot rebuilt by the
 * "Refresh jobs data" GitHub Action from Arbeitnow + Adzuna (20 world markets;
 * needs ADZUNA_APP_ID/ADZUNA_APP_KEY repo secrets) + RemoteOK + Jobicy +
 * Remotive + Himalayas + HN "Who is hiring"; see scripts/fetch-jobs.mjs.
 * Live fallback: the free, CORS-enabled Arbeitnow board, fetched client-side.
 *
 * Filter: frontend-ish titles (incl. full-stack), last 6 months, geocoded to
 * a known city anywhere in the world (data/cities.js covers ~80 countries).
 * Cached for one hour.
 */
const API = 'https://www.arbeitnow.com/api/job-board-api'
const SNAPSHOT = `${import.meta.env.BASE_URL}data/jobs.json`
const PAGES = 16 // newest-first; more pages = deeper history for the 6-month window
const FRONTEND = /front.?end|full.?stack|react|angular|vue|svelte|next\.?js|typescript|javascript|web ?developer|ui ?engineer|ui ?developer/i
const CACHE_KEY = 'xp:jobs:v6'
const TTL = 60 * 60 * 1000

export const linkedinSearch = (title, city) =>
  `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent(city)}&f_TPR=r15552000`

const normalise = (j) => {
  const geo = geocode(j.location)
  if (!geo) return null
  return {
    id: j.slug,
    title: j.title,
    company: j.company_name,
    location: j.location,
    city: geo.city,
    lat: geo.lat,
    lng: geo.lng,
    cc: geo.cc,
    remote: Boolean(j.remote),
    tags: (j.tags || []).slice(0, 5),
    types: j.job_types || [],
    posted: j.created_at * 1000,
    url: j.url,
    linkedin: linkedinSearch(j.title, geo.city),
  }
}

export async function loadJobs() {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    const { at, jobs } = JSON.parse(cached)
    if (Date.now() - at < TTL) return jobs
  }
  // Prefer the CI-built snapshot (Arbeitnow + Adzuna + RemoteOK + Jobicy + Remotive, worldwide).
  const snap = await fetch(SNAPSHOT).then((r) => (r.ok ? r.json() : null)).catch(() => null)
  if (snap?.jobs?.length) {
    const jobs = snap.jobs.filter((j) => j.posted > Date.now() - 180 * 86400000)
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), jobs }))
    return jobs
  }
  // Live fallback: Arbeitnow only (mostly DACH + UK/NL).
  const pages = await Promise.allSettled(
    Array.from({ length: PAGES }, (_, i) => fetch(`${API}?page=${i + 1}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))),
  )
  const raw = pages.flatMap((p) => (p.status === 'fulfilled' ? p.value.data : []))
  if (!raw.length) throw new Error('Arbeitnow unavailable')

  const all = raw.filter((j) => FRONTEND.test(j.title)).map(normalise).filter(Boolean)
  let jobs = all.filter((j) => j.posted > Date.now() - 180 * 86400000)
  jobs.sort((a, b) => b.posted - a.posted)
  jobs = jobs.slice(0, 200)
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), jobs }))
  return jobs
}

/** Group jobs by city for pins: [{ city, lat, lng, jobs: [...] }] */
export function groupByCity(jobs) {
  const map = new Map()
  for (const j of jobs) {
    const key = `${j.lat},${j.lng}`
    if (!map.has(key)) map.set(key, { city: j.city, lat: j.lat, lng: j.lng, cc: j.cc, jobs: [] })
    map.get(key).jobs.push(j)
  }
  return [...map.values()]
}

export const ago = (ms) => {
  const d = Math.floor((Date.now() - ms) / 86400000)
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`
}

/** First `n` characters + ellipsis, as the globe tooltip wants. */
export const clip = (s, n = 10) => (s.length > n ? `${s.slice(0, n)}…` : s)
