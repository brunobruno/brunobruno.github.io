/**
 * Thin client for the World Bank Indicators API (public, no key).
 * https://api.worldbank.org/v2/country/all/indicator/{INDICATOR}?format=json&mrv=1
 *
 * Indicators used:
 *   NY.GDP.MKTP.CD  GDP (current US$)
 *   SP.POP.TOTL     Population, total
 *
 * Results are cached in sessionStorage for the tab's lifetime so view switches
 * don't refetch, and a static fallback keeps the globe alive offline.
 */
const BASE = 'https://api.worldbank.org/v2/country'

export const INDICATORS = {
  gdp: 'NY.GDP.MKTP.CD',
  population: 'SP.POP.TOTL',
}

// Aggregates (regions, income groups) share the endpoint with countries; skip them.
const AGGREGATES = new Set([
  'AFE', 'AFW', 'ARB', 'CSS', 'CEB', 'EAR', 'EAS', 'EAP', 'TEA', 'EMU', 'ECS', 'ECA', 'TEC', 'EUU', 'FCS', 'HPC',
  'HIC', 'IBD', 'IBT', 'IDB', 'IDX', 'IDA', 'LTE', 'LCN', 'LAC', 'TLA', 'LDC', 'LMY', 'LIC', 'LMC', 'MEA', 'MNA',
  'TMN', 'MIC', 'NAC', 'INX', 'OED', 'OSS', 'PSS', 'PST', 'PRE', 'SST', 'SAS', 'TSA', 'SSF', 'SSA', 'TSS', 'UMC',
  'WLD', 'EAR',
])

const cacheKey = (indicator, scope) => `wb:${indicator}:${scope}`

async function fetchIndicator(indicator, scope = 'all') {
  const key = cacheKey(indicator, scope)
  const cached = sessionStorage.getItem(key)
  if (cached) return JSON.parse(cached)

  // The CDN in front of the API occasionally serves a cached copy without CORS
  // headers; a per-day cache-buster keeps us on a fresh, CORS-enabled response.
  const day = new Date().toISOString().slice(0, 10)
  const res = await fetch(`${BASE}/${scope}/indicator/${indicator}?format=json&mrv=1&per_page=400&d=${day}`)
  if (!res.ok) throw new Error(`World Bank ${indicator} ${res.status}`)
  const [, rows] = await res.json()
  const out = {}
  for (const r of rows || []) {
    const iso = r.countryiso3code
    if (!iso || r.value == null) continue
    if (scope === 'all' && AGGREGATES.has(iso)) continue
    out[iso] = { value: r.value, year: Number(r.date), name: r.country.value }
  }
  sessionStorage.setItem(key, JSON.stringify(out))
  return out
}

/** { gdp: {ISO3: {value, year}}, population: {ISO3: {...}}, world: {gdp, population, year} } */
export async function loadWorldData() {
  const settled = await Promise.allSettled([
    fetchIndicator(INDICATORS.gdp),
    fetchIndicator(INDICATORS.population),
    fetchIndicator(INDICATORS.gdp, 'WLD'),
    fetchIndicator(INDICATORS.population, 'WLD'),
  ])
  if (settled.every((s) => s.status === 'rejected')) throw settled[0].reason
  const [gdp, population, worldGdp, worldPop] = settled.map((s) => (s.status === 'fulfilled' ? s.value : {}))
  return {
    gdp,
    population,
    world: {
      gdp: worldGdp.WLD?.value ?? (Object.values(gdp).reduce((a, r) => a + r.value, 0) || null),
      population: worldPop.WLD?.value ?? (Object.values(population).reduce((a, r) => a + r.value, 0) || null),
      year: worldPop.WLD?.year ?? worldGdp.WLD?.year ?? new Date().getFullYear() - 1,
    },
  }
}

/** Compact money formatting: 1.23e12 → "$1.23T". */
export function money(n, digits = 1) {
  if (n == null || Number.isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(digits)}T`
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(digits)}B`
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(digits)}M`
  return `$${Math.round(n).toLocaleString('en-US')}`
}

export function people(n) {
  if (n == null) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  return Math.round(n).toLocaleString('en-US')
}
