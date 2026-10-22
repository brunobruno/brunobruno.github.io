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
 * Filter: frontend-ish titles, posted within the last 7 days (widened to 30 if
 * the week is thin), located in a city we can geocode. Cached for one hour.
 */
const API = 'https://www.arbeitnow.com/api/job-board-api'
const PAGES = 8
const FRONTEND = /front.?end|react|angular|vue|svelte|next\.?js|typescript|javascript|web ?developer|ui ?engineer|ui ?developer/i
const CACHE_KEY = 'xp:jobs:v1'
const TTL = 60 * 60 * 1000

export const linkedinSearch = (title, city) =>
  `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent(city)}&f_TPR=r604800`

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
  const pages = await Promise.allSettled(
    Array.from({ length: PAGES }, (_, i) => fetch(`${API}?page=${i + 1}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))),
  )
  const raw = pages.flatMap((p) => (p.status === 'fulfilled' ? p.value.data : []))
  if (!raw.length) throw new Error('Arbeitnow unavailable')

  const all = raw.filter((j) => FRONTEND.test(j.title)).map(normalise).filter(Boolean)
  const since = (days) => Date.now() - days * 86400000
  let jobs = all.filter((j) => j.posted > since(7))
  if (jobs.length < 8) jobs = all.filter((j) => j.posted > since(30))
  jobs.sort((a, b) => b.posted - a.posted)
  jobs = jobs.slice(0, 60)
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), jobs }))
  return jobs
}

/** Group jobs by city for pins: [{ city, lat, lng, jobs: [...] }] */
export function groupByCity(jobs) {
  const map = new Map()
  for (const j of jobs) {
    const key = `${j.lat},${j.lng}`
    if (!map.has(key)) map.set(key, { city: j.city, lat: j.lat, lng: j.lng, jobs: [] })
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
