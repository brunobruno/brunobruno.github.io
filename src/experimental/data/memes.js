/**
 * Live memecoin data for the Experimental "Casino" globe.
 *
 * CoinGecko free API (no key, CORS-enabled, ~10 calls/min shared per IP):
 *  - /coins/markets?category=meme-token → top memecoins by market cap
 *  - /global                            → total crypto market cap (for share %)
 *
 * Coins have no geography, so the globe is a *stylised world view*: each coin
 * is hashed into one of six inhabited continent boxes — stable per coin id,
 * spread so the leaderboard reads like a world map of where the money pools.
 * Cached in sessionStorage for 30 min; bump CACHE_KEY if the shape changes.
 */
const API = 'https://api.coingecko.com/api/v3'
const CACHE_KEY = 'xp:meme:v1'
const TTL = 30 * 60 * 1000

/** Rough inhabited-land boxes: [latMin, latMax, lngMin, lngMax]. */
const REGIONS = [
  [25, 62, -125, -66], // North America
  [-33, 5, -75, -40], // South America
  [42, 60, -5, 32], // Europe
  [-28, 24, -16, 44], // Africa
  [12, 55, 62, 140], // Asia
  [-34, -16, 114, 150], // Oceania
]

const hash = (s) => {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return Math.abs(h)
}

export function placeCoin(id) {
  const h = hash(id)
  const [la0, la1, lo0, lo1] = REGIONS[h % REGIONS.length]
  const lat = la0 + ((h >>> 8) % 1000) / 1000 * (la1 - la0)
  const lng = lo0 + ((h >>> 18) % 1000) / 1000 * (lo1 - lo0)
  return { lat, lng }
}

export const cap = (n) =>
  n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T` : n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : `$${(n / 1e3).toFixed(0)}K`

export const price = (n) => (n >= 0.01 ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 4 })}` : `$${n.toPrecision(3)}`)

export const pct = (n) => `${n > 0 ? '+' : ''}${n?.toFixed(1) ?? '0.0'}%`

export const coinPage = (id) => `https://www.coingecko.com/en/coins/${id}`

export async function loadMemes() {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    const { at, data } = JSON.parse(cached)
    if (Date.now() - at < TTL) return data
  }
  const [markets, global] = await Promise.all([
    fetch(`${API}/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=24&page=1&sparkline=false&price_change_percentage=24h`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    fetch(`${API}/global`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ])
  const coins = markets.map((c) => ({
    id: c.id,
    sym: c.symbol.toUpperCase(),
    name: c.name,
    img: c.image,
    price: c.current_price,
    cap: c.market_cap,
    vol: c.total_volume,
    chg24: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0,
    rank: c.market_cap_rank,
    athGap: c.ath_change_percentage,
    ...placeCoin(c.id),
  }))
  const totalCap = coins.reduce((s, c) => s + (c.cap || 0), 0)
  const worldCap = global?.data?.total_market_cap?.usd ?? null
  const data = {
    coins,
    totalCap,
    share: worldCap ? (totalCap / worldCap) * 100 : null,
    day: coins.length ? coins.reduce((s, c) => s + c.chg24 * (c.cap || 0), 0) / Math.max(totalCap, 1) : 0,
  }
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  return data
}
