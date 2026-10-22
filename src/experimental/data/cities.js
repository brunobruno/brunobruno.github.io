/** City → coordinates used to pin job postings. Keys are lower-case, diacritics stripped. */
export const CITIES = {
  berlin: [52.52, 13.405], munich: [48.137, 11.575], muenchen: [48.137, 11.575], munchen: [48.137, 11.575],
  hamburg: [53.551, 9.994], frankfurt: [50.11, 8.682], 'frankfurt am main': [50.11, 8.682], cologne: [50.938, 6.96],
  koeln: [50.938, 6.96], koln: [50.938, 6.96], stuttgart: [48.776, 9.182], duesseldorf: [51.228, 6.773],
  dusseldorf: [51.228, 6.773], nuremberg: [49.452, 11.077], nuernberg: [49.452, 11.077], nurnberg: [49.452, 11.077],
  darmstadt: [49.872, 8.651], leipzig: [51.34, 12.375], dresden: [51.05, 13.738], hannover: [52.375, 9.732],
  karlsruhe: [49.007, 8.404], bremen: [53.079, 8.802], bonn: [50.737, 7.098], mannheim: [49.489, 8.467],
  heidelberg: [49.399, 8.672], essen: [51.456, 7.012], dortmund: [51.514, 7.466], mainz: [49.993, 8.247],
  wiesbaden: [50.082, 8.24], regensburg: [49.013, 12.102], augsburg: [48.371, 10.898], freiburg: [47.999, 7.842],
  zurich: [47.377, 8.541], zuerich: [47.377, 8.541], bern: [46.948, 7.447], basel: [47.559, 7.588],
  geneva: [46.204, 6.143], genf: [46.204, 6.143], lucerne: [47.05, 8.306], luzern: [47.05, 8.306],
  lausanne: [46.52, 6.633], zug: [47.166, 8.515], winterthur: [47.5, 8.724], 'st. gallen': [47.424, 9.377],
  vienna: [48.208, 16.374], wien: [48.208, 16.374], graz: [47.071, 15.439], linz: [48.306, 14.286],
  amsterdam: [52.37, 4.895], utrecht: [52.09, 5.122], rotterdam: [51.924, 4.479], 'the hague': [52.07, 4.3],
  'den haag': [52.07, 4.3], eindhoven: [51.441, 5.47], groningen: [53.219, 6.568], nijmegen: [51.842, 5.853],
  london: [51.507, -0.128], manchester: [53.483, -2.244], edinburgh: [55.953, -3.188], dublin: [53.35, -6.26],
  paris: [48.857, 2.352], lyon: [45.764, 4.836], barcelona: [41.385, 2.173], madrid: [40.417, -3.704],
  lisbon: [38.722, -9.139], lisboa: [38.722, -9.139], porto: [41.158, -8.629], milan: [45.464, 9.19],
  milano: [45.464, 9.19], rome: [41.903, 12.496], roma: [41.903, 12.496], brussels: [50.85, 4.352],
  luxembourg: [49.612, 6.13], copenhagen: [55.676, 12.568], stockholm: [59.329, 18.069], oslo: [59.914, 10.752],
  helsinki: [60.17, 24.938], warsaw: [52.23, 21.012], krakow: [50.065, 19.945], prague: [50.075, 14.438],
  budapest: [47.498, 19.04], bucharest: [44.427, 26.103], athens: [37.984, 23.728], tallinn: [59.437, 24.754],
  riga: [56.95, 24.105], vilnius: [54.687, 25.28], zagreb: [45.815, 15.982], belgrade: [44.787, 20.457],
  'new york': [40.713, -74.006], 'san francisco': [37.775, -122.419], boston: [42.36, -71.059],
  austin: [30.267, -97.743], seattle: [47.606, -122.332], toronto: [43.653, -79.383], vancouver: [49.283, -123.121],
  'sao paulo': [-23.551, -46.633], 'mexico city': [19.433, -99.133], 'buenos aires': [-34.604, -58.382],
  sydney: [-33.869, 151.209], melbourne: [-37.814, 144.963], singapore: [1.352, 103.82], tokyo: [35.676, 139.65],
  bangalore: [12.972, 77.594], bengaluru: [12.972, 77.594], 'tel aviv': [32.085, 34.782], dubai: [25.205, 55.271],
}

const strip = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Returns { city, lat, lng } for a free-text location, or null if no known city matches. */
export function geocode(location = '') {
  const tokens = strip(location)
    .split(/[,/|()\-–]+| bei | near /)
    .map((t) => t.trim())
    .filter(Boolean)
  for (const t of tokens) {
    const key = Object.keys(CITIES).find((c) => t === c || t.startsWith(`${c} `) || t.endsWith(` ${c}`))
    if (key) {
      const [lat, lng] = CITIES[key]
      return { city: key.replace(/\b\w/g, (m) => m.toUpperCase()), lat, lng }
    }
  }
  return null
}
