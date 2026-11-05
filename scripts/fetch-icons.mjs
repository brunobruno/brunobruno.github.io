/**
 * Instagram snapshot for the Experimental "Icons" globe.
 *
 * Instagram exposes no public read API for other accounts (profile pages are an
 * empty login-walled app shell, the internal endpoints need session cookies and
 * nothing sends CORS headers), so this runs server-side through Apify's
 * Instagram Profile Scraper and writes a static snapshot the site can read:
 *
 *   public/data/icons.json           followers + latest geotagged post per handle
 *   public/data/icons/<handle>.jpg   post image (cdninstagram URLs expire in days
 *   public/data/icons/<handle>-a.jpg and block hotlinking, so we vendor them)
 *
 * Requires APIFY_TOKEN (GitHub repo secret; locally `set APIFY_TOKEN=...`).
 * Cost: the actor is pay-per-result (~$0.0026 × 55 profiles ≈ $0.15 per run);
 * the workflow runs twice a week to stay inside Apify's $5/month free credit.
 *
 * Location: the most recent post that carries `locationName` is used (checked
 * against the last 12 posts). Geocoding tries the project's city table first and
 * falls back to Nominatim (OpenStreetMap, 1 req/s, UA required) for venues.
 * Handles with no geotagged post keep `post` but no lat/lng — the slide then
 * pins them at their home city.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { ICONS } from '../src/experimental/data/famous.js'
import { geocode } from '../src/experimental/data/cities.js'

const TOKEN = process.env.APIFY_TOKEN
if (!TOKEN) {
  console.error('APIFY_TOKEN is not set')
  process.exit(1)
}

const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const OUT = `${root}public/data/icons.json`
const IMG_DIR = `${root}public/data/icons`
const ACTOR = 'apify~instagram-profile-scraper'
const API = 'https://api.apify.com/v2'
const UA = 'brunobruno.github.io portfolio (icons globe; contact: brngalati@gmail.com)'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { icons: {} }

/* ---------- 1. run the actor and wait ---------- */
async function scrape(usernames) {
  const start = await fetch(`${API}/acts/${ACTOR}/runs?token=${TOKEN}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ usernames }),
  })
  if (!start.ok) throw new Error(`actor start ${start.status}: ${await start.text()}`)
  const run = (await start.json()).data
  console.log(`run ${run.id} started (${usernames.length} profiles)`)

  let status = run.status
  let datasetId = run.defaultDatasetId
  for (let i = 0; i < 90 && !['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status); i++) {
    await sleep(10_000)
    const r = await fetch(`${API}/actor-runs/${run.id}?token=${TOKEN}`).then((x) => x.json())
    status = r.data.status
    datasetId = r.data.defaultDatasetId
    process.stdout.write(`  ${status}\r`)
  }
  console.log(`\nrun finished: ${status}`)
  if (status !== 'SUCCEEDED') throw new Error(`actor ${status}`)

  const items = await fetch(`${API}/datasets/${datasetId}/items?token=${TOKEN}&clean=true`).then((r) => r.json())
  console.log(`${items.length} profiles returned`)
  return items
}

/* ---------- 2. geocode a post location ---------- */
const nominatimCache = new Map()
async function nominatim(name) {
  if (nominatimCache.has(name)) return nominatimCache.get(name)
  await sleep(1100) // usage policy: max 1 request per second
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(name)}`
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } })
  const hit = res.ok ? (await res.json())[0] : null
  const out = hit
    ? { lat: +hit.lat, lng: +hit.lon, cc: hit.address?.country_code ?? null, label: hit.address?.city || hit.address?.town || hit.address?.state || name.split(',')[0] }
    : null
  nominatimCache.set(name, out)
  return out
}

async function locate(name) {
  const local = geocode(name)
  if (local) return { lat: local.lat, lng: local.lng, cc: local.cc, label: local.city }
  return nominatim(name)
}

/* ---------- 3. vendor an image ---------- */
async function download(url, file) {
  if (!url) return null
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(res.status)
    writeFileSync(`${IMG_DIR}/${file}`, Buffer.from(await res.arrayBuffer()))
    return `data/icons/${file}`
  } catch (e) {
    console.warn(`  image failed for ${file}: ${e.message}`)
    return null
  }
}

/* ---------- main ---------- */
mkdirSync(IMG_DIR, { recursive: true })
const byHandle = new Map(ICONS.map((i) => [i.handle.toLowerCase(), i]))
const items = await scrape(ICONS.map((i) => i.handle))

const icons = {}
for (const item of items) {
  const handle = (item.username ?? '').toLowerCase()
  const icon = byHandle.get(handle)
  if (!icon || item.error) {
    console.warn(`  skipped ${handle || item.inputUrl}: ${item.error ?? 'not in ICONS'}`)
    continue
  }
  const posts = (item.latestPosts ?? []).filter((p) => p.timestamp).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const latest = posts[0] ?? null
  const geotagged = posts.find((p) => p.locationName) ?? null
  const post = geotagged ?? latest
  const prev = previous.icons?.[handle]
  const unchanged = prev?.post?.shortCode && prev.post.shortCode === post?.shortCode

  let where = null
  if (post?.locationName) {
    where = await locate(post.locationName)
    if (!where) console.warn(`  could not geocode "${post.locationName}" (${handle})`)
  }

  const avatar = unchanged && prev.avatar ? prev.avatar : await download(item.profilePicUrlHD ?? item.profilePicUrl, `${handle}-a.jpg`)
  const image = post ? (unchanged && prev.post.image ? prev.post.image : await download(post.displayUrl, `${handle}.jpg`)) : null

  icons[handle] = {
    name: item.fullName || icon.name,
    followers: item.followersCount ?? null,
    verified: Boolean(item.verified),
    avatar,
    post: post
      ? {
          shortCode: post.shortCode,
          url: post.url,
          caption: (post.caption ?? '').slice(0, 600),
          timestamp: post.timestamp,
          likes: post.likesCount ?? null,
          comments: post.commentsCount ?? null,
          image,
          location: post.locationName ?? null,
          ...(where ? { lat: where.lat, lng: where.lng, cc: where.cc, place: where.label } : {}),
        }
      : null,
  }
  console.log(`  ${handle.padEnd(22)} ${String(item.followersCount ?? '-').padStart(10)}  ${post?.locationName ?? '(no geotag)'}${where ? ` → ${where.lat.toFixed(2)},${where.lng.toFixed(2)}` : ''}`)
}

const geotaggedCount = Object.values(icons).filter((i) => i.post?.lat != null).length
writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), source: 'apify/instagram-profile-scraper', icons }, null, 1))
console.log(`wrote ${Object.keys(icons).length} icons (${geotaggedCount} with a geotagged post) → public/data/icons.json`)
