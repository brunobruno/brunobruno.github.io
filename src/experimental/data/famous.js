/**
 * The most-followed real people on Instagram, for the Experimental "Icons" globe.
 *
 * Reality check: Instagram exposes no public API for other accounts' posts, profile
 * pages are login-walled and its CDN refuses cross-origin requests, so "last geotagged
 * post" cannot be read from a browser. Instead every icon is pinned at their home city
 * (hometown or current base) and the portrait + bio stream live from the Wikipedia
 * REST summary API (CORS-enabled, hotlinkable thumbnails).
 *
 * `followers` are approximate millions — a 2025 snapshot, labelled "≈" in the UI.
 * To add someone: handle, display name, exact Wikipedia title, followers (M),
 * home city (lat/lng, label, ISO-3166 alpha-2) and a one-word field.
 */
export const ICONS = [
  { handle: 'cristiano', name: 'Cristiano Ronaldo', wiki: 'Cristiano_Ronaldo', followers: 660, lat: 24.71, lng: 46.68, place: 'Riyadh', cc: 'sa', field: 'Football' },
  { handle: 'leomessi', name: 'Lionel Messi', wiki: 'Lionel_Messi', followers: 505, lat: 25.76, lng: -80.19, place: 'Miami', cc: 'us', field: 'Football' },
  { handle: 'selenagomez', name: 'Selena Gomez', wiki: 'Selena_Gomez', followers: 420, lat: 34.05, lng: -118.24, place: 'Los Angeles', cc: 'us', field: 'Music · Film' },
  { handle: 'therock', name: 'Dwayne Johnson', wiki: 'Dwayne_Johnson', followers: 395, lat: 34.07, lng: -118.4, place: 'Beverly Hills', cc: 'us', field: 'Film' },
  { handle: 'kyliejenner', name: 'Kylie Jenner', wiki: 'Kylie_Jenner', followers: 393, lat: 34.13, lng: -118.7, place: 'Calabasas', cc: 'us', field: 'Beauty' },
  { handle: 'arianagrande', name: 'Ariana Grande', wiki: 'Ariana_Grande', followers: 375, lat: 40.71, lng: -74.01, place: 'New York', cc: 'us', field: 'Music' },
  { handle: 'kimkardashian', name: 'Kim Kardashian', wiki: 'Kim_Kardashian', followers: 356, lat: 34.16, lng: -118.65, place: 'Hidden Hills', cc: 'us', field: 'Media' },
  { handle: 'beyonce', name: 'Beyoncé', wiki: 'Beyoncé', followers: 310, lat: 29.76, lng: -95.37, place: 'Houston', cc: 'us', field: 'Music' },
  { handle: 'khloekardashian', name: 'Khloé Kardashian', wiki: 'Khloé_Kardashian', followers: 300, lat: 34.14, lng: -118.66, place: 'Calabasas', cc: 'us', field: 'Media' },
  { handle: 'justinbieber', name: 'Justin Bieber', wiki: 'Justin_Bieber', followers: 290, lat: 42.98, lng: -81.25, place: 'London, Ontario', cc: 'ca', field: 'Music' },
  { handle: 'kendalljenner', name: 'Kendall Jenner', wiki: 'Kendall_Jenner', followers: 288, lat: 34.08, lng: -118.41, place: 'Beverly Hills', cc: 'us', field: 'Fashion' },
  { handle: 'taylorswift', name: 'Taylor Swift', wiki: 'Taylor_Swift', followers: 280, lat: 36.16, lng: -86.78, place: 'Nashville', cc: 'us', field: 'Music' },
  { handle: 'virat.kohli', name: 'Virat Kohli', wiki: 'Virat_Kohli', followers: 270, lat: 28.61, lng: 77.21, place: 'New Delhi', cc: 'in', field: 'Cricket' },
  { handle: 'jlo', name: 'Jennifer Lopez', wiki: 'Jennifer_Lopez', followers: 250, lat: 40.84, lng: -73.87, place: 'The Bronx', cc: 'us', field: 'Music · Film' },
  { handle: 'neymarjr', name: 'Neymar', wiki: 'Neymar', followers: 230, lat: -23.96, lng: -46.33, place: 'Santos', cc: 'br', field: 'Football' },
  { handle: 'nickiminaj', name: 'Nicki Minaj', wiki: 'Nicki_Minaj', followers: 225, lat: 10.65, lng: -61.52, place: 'Port of Spain', cc: 'tt', field: 'Music' },
  { handle: 'mileycyrus', name: 'Miley Cyrus', wiki: 'Miley_Cyrus', followers: 210, lat: 35.93, lng: -86.87, place: 'Franklin', cc: 'us', field: 'Music' },
  { handle: 'katyperry', name: 'Katy Perry', wiki: 'Katy_Perry', followers: 205, lat: 34.42, lng: -119.7, place: 'Santa Barbara', cc: 'us', field: 'Music' },
  { handle: 'zendaya', name: 'Zendaya', wiki: 'Zendaya', followers: 180, lat: 37.8, lng: -122.27, place: 'Oakland', cc: 'us', field: 'Film' },
  { handle: 'kevinhart4real', name: 'Kevin Hart', wiki: 'Kevin_Hart', followers: 175, lat: 39.95, lng: -75.17, place: 'Philadelphia', cc: 'us', field: 'Comedy' },
  { handle: 'iamcardib', name: 'Cardi B', wiki: 'Cardi_B', followers: 165, lat: 40.82, lng: -73.92, place: 'The Bronx', cc: 'us', field: 'Music' },
  { handle: 'kingjames', name: 'LeBron James', wiki: 'LeBron_James', followers: 160, lat: 41.08, lng: -81.52, place: 'Akron', cc: 'us', field: 'Basketball' },
  { handle: 'badgalriri', name: 'Rihanna', wiki: 'Rihanna', followers: 150, lat: 13.1, lng: -59.61, place: 'Bridgetown', cc: 'bb', field: 'Music · Beauty' },
  { handle: 'champagnepapi', name: 'Drake', wiki: 'Drake_(musician)', followers: 145, lat: 43.65, lng: -79.38, place: 'Toronto', cc: 'ca', field: 'Music' },
  { handle: 'k.mbappe', name: 'Kylian Mbappé', wiki: 'Kylian_Mbappé', followers: 125, lat: 40.42, lng: -3.7, place: 'Madrid', cc: 'es', field: 'Football' },
  { handle: 'billieeilish', name: 'Billie Eilish', wiki: 'Billie_Eilish', followers: 125, lat: 34.11, lng: -118.19, place: 'Highland Park', cc: 'us', field: 'Music' },
  { handle: 'gal_gadot', name: 'Gal Gadot', wiki: 'Gal_Gadot', followers: 108, lat: 32.09, lng: 34.78, place: 'Tel Aviv', cc: 'il', field: 'Film' },
  { handle: 'lalalalisa_m', name: 'Lisa', wiki: 'Lisa_(rapper)', followers: 105, lat: 13.76, lng: 100.5, place: 'Bangkok', cc: 'th', field: 'K-pop' },
  { handle: 'narendramodi', name: 'Narendra Modi', wiki: 'Narendra_Modi', followers: 95, lat: 23.02, lng: 72.57, place: 'Ahmedabad', cc: 'in', field: 'Politics' },
  { handle: 'shraddhakapoor', name: 'Shraddha Kapoor', wiki: 'Shraddha_Kapoor', followers: 95, lat: 19.08, lng: 72.88, place: 'Mumbai', cc: 'in', field: 'Film' },
  { handle: 'shakira', name: 'Shakira', wiki: 'Shakira', followers: 92, lat: 10.96, lng: -74.8, place: 'Barranquilla', cc: 'co', field: 'Music' },
  { handle: 'priyankachopra', name: 'Priyanka Chopra', wiki: 'Priyanka_Chopra', followers: 92, lat: 19.06, lng: 72.83, place: 'Mumbai', cc: 'in', field: 'Film' },
  { handle: 'snoopdogg', name: 'Snoop Dogg', wiki: 'Snoop_Dogg', followers: 90, lat: 33.77, lng: -118.19, place: 'Long Beach', cc: 'us', field: 'Music' },
  { handle: 'davidbeckham', name: 'David Beckham', wiki: 'David_Beckham', followers: 88, lat: 51.56, lng: 0.01, place: 'Leytonstone', cc: 'gb', field: 'Football' },
  { handle: 'dualipa', name: 'Dua Lipa', wiki: 'Dua_Lipa', followers: 88, lat: 51.51, lng: -0.13, place: 'London', cc: 'gb', field: 'Music' },
  { handle: 'jennierubyjane', name: 'Jennie', wiki: 'Jennie_(singer)', followers: 88, lat: 37.57, lng: 126.98, place: 'Seoul', cc: 'kr', field: 'K-pop' },
  { handle: 'khaby00', name: 'Khaby Lame', wiki: 'Khaby_Lame', followers: 80, lat: 45.07, lng: 7.69, place: 'Turin', cc: 'it', field: 'Creator' },
  { handle: 'ronaldinho', name: 'Ronaldinho', wiki: 'Ronaldinho', followers: 78, lat: -30.03, lng: -51.23, place: 'Porto Alegre', cc: 'br', field: 'Football' },
  { handle: 'gigihadid', name: 'Gigi Hadid', wiki: 'Gigi_Hadid', followers: 78, lat: 40.76, lng: -73.98, place: 'Manhattan', cc: 'us', field: 'Fashion' },
  { handle: 'emmawatson', name: 'Emma Watson', wiki: 'Emma_Watson', followers: 75, lat: 48.86, lng: 2.35, place: 'Paris', cc: 'fr', field: 'Film' },
  { handle: 'tomholland2013', name: 'Tom Holland', wiki: 'Tom_Holland', followers: 70, lat: 51.42, lng: -0.3, place: 'Kingston upon Thames', cc: 'gb', field: 'Film' },
  { handle: 'mrbeast', name: 'MrBeast', wiki: 'MrBeast', followers: 68, lat: 35.61, lng: -77.37, place: 'Greenville', cc: 'us', field: 'Creator' },
  { handle: 'thv', name: 'V', wiki: 'V_(singer)', followers: 66, lat: 35.87, lng: 128.6, place: 'Daegu', cc: 'kr', field: 'K-pop' },
  { handle: 'iamzlatanibrahimovic', name: 'Zlatan Ibrahimović', wiki: 'Zlatan_Ibrahimović', followers: 65, lat: 55.6, lng: 13.0, place: 'Malmö', cc: 'se', field: 'Football' },
  { handle: 'mosalah', name: 'Mohamed Salah', wiki: 'Mohamed_Salah', followers: 65, lat: 30.94, lng: 30.94, place: 'Nagrig', cc: 'eg', field: 'Football' },
  { handle: 'beingsalmankhan', name: 'Salman Khan', wiki: 'Salman_Khan', followers: 60, lat: 23.26, lng: 77.41, place: 'Bhopal', cc: 'in', field: 'Film' },
  { handle: 'lewishamilton', name: 'Lewis Hamilton', wiki: 'Lewis_Hamilton', followers: 40, lat: 51.9, lng: -0.2, place: 'Stevenage', cc: 'gb', field: 'Formula 1' },
  { handle: 'jackiechan', name: 'Jackie Chan', wiki: 'Jackie_Chan', followers: 30, lat: 22.32, lng: 114.17, place: 'Hong Kong', cc: 'hk', field: 'Film' },
  { handle: 'chrishemsworth', name: 'Chris Hemsworth', wiki: 'Chris_Hemsworth', followers: 59, lat: -28.64, lng: 153.61, place: 'Byron Bay', cc: 'au', field: 'Film' },
  { handle: 'badbunnypr', name: 'Bad Bunny', wiki: 'Bad_Bunny', followers: 48, lat: 18.43, lng: -66.19, place: 'Vega Baja', cc: 'pr', field: 'Music' },
  { handle: 'rosalia.vt', name: 'Rosalía', wiki: 'Rosalía', followers: 27, lat: 41.39, lng: 2.17, place: 'Barcelona', cc: 'es', field: 'Music' },
  { handle: 'anitta', name: 'Anitta', wiki: 'Anitta_(singer)', followers: 64, lat: -22.91, lng: -43.17, place: 'Rio de Janeiro', cc: 'br', field: 'Music' },
  { handle: 'huda', name: 'Huda Kattan', wiki: 'Huda_Kattan', followers: 55, lat: 25.2, lng: 55.27, place: 'Dubai', cc: 'ae', field: 'Beauty' },
  { handle: 'nusr_et', name: 'Nusret Gökçe', wiki: 'Nusret_Gökçe', followers: 60, lat: 40.1, lng: 29.06, place: 'Bursa', cc: 'tr', field: 'Food' },
  { handle: 'jackson_wang852', name: 'Jackson Wang', wiki: 'Jackson_Wang', followers: 32, lat: 22.28, lng: 114.16, place: 'Hong Kong', cc: 'hk', field: 'Music' },
]

export const instagramUrl = (handle) => `https://www.instagram.com/${handle}/`
export const wikipediaUrl = (title) => `https://en.wikipedia.org/wiki/${title}`

export const fmtFollowers = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)}B` : `${m}M`)

const KEY = 'xp:fame:v2:'
const SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const inflight = new Map()

/**
 * Portrait + description + first paragraph from Wikipedia, cached per session.
 * Returns `{ image, description, extract }` (image may be null).
 */
export function loadProfile(title) {
  const key = KEY + title
  try {
    const hit = sessionStorage.getItem(key)
    if (hit) return Promise.resolve(JSON.parse(hit))
  } catch { /* storage unavailable */ }
  if (inflight.has(title)) return inflight.get(title)
  const p = fetch(SUMMARY + encodeURIComponent(title))
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((d) => {
      const profile = {
        image: d.thumbnail?.source ?? null,
        description: d.description ?? '',
        extract: d.extract ?? '',
      }
      try { sessionStorage.setItem(key, JSON.stringify(profile)) } catch { /* quota */ }
      return profile
    })
    .finally(() => inflight.delete(title))
  inflight.set(title, p)
  return p
}

let snapPromise = null

/**
 * Static snapshot written by `scripts/fetch-icons.mjs` (Apify, twice a week):
 * `{ generated, source, icons: { handle: { followers, avatar, post } } }`.
 * `post` is the most recent post carrying a `locationName` — the pin's real geo.
 * Returns null when the snapshot hasn't been generated yet.
 */
export function loadSnapshot() {
  if (!snapPromise) {
    snapPromise = fetch(`${import.meta.env.BASE_URL}data/icons.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((s) => (s?.icons && typeof s.icons === 'object' ? s : null))
      .catch(() => null)
  }
  return snapPromise
}

/** "3 d ago" / "2 h ago" from a timestamp. */
export function ago(ts) {
  const d = Date.now() - new Date(ts).getTime()
  if (d < 3600e3) return `${Math.max(1, (d / 60e3) | 0)}m ago`
  if (d < 86400e3) return `${(d / 3600e3) | 0}h ago`
  if (d < 30 * 86400e3) return `${(d / 86400e3) | 0}d ago`
  return new Date(ts).toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

export const fmtCount = (n) => (n == null ? '—' : n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1e3).toFixed(0)}K`)

/** Warm the cache a few at a time so the first hover is instant. */
export async function prefetchProfiles(icons, onEach, concurrency = 4) {
  const queue = [...icons]
  const worker = async () => {
    while (queue.length) {
      const icon = queue.shift()
      try {
        onEach(icon.wiki, await loadProfile(icon.wiki))
      } catch { /* a missing article just means no portrait */ }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
}
