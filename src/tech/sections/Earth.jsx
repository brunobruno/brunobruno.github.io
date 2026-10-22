import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useTransform } from 'framer-motion'
import Globe from 'react-globe.gl'
import { MeshPhongMaterial, Color } from 'three'
import { ParallaxSection, Reveal } from '../../components/Parallax'
import { useGlobeLifecycle } from '../../components/useGlobeLifecycle'
import Flag from '../../components/Flag'
import { useWorld } from '../world'
import { companyFor, asOf } from '../data/companies'
import { money, people } from '../data/worldbank'
import './Earth.css'

const GEO_URL = `${import.meta.env.BASE_URL}data/countries.geojson`
const LIME = new Color('#c6ff3f')
const CYAN = new Color('#19c3e6')
const DIM = new Color('#17304a')

const iso3 = (f) => (f.properties.ISO_A3 !== '-99' ? f.properties.ISO_A3 : f.properties.ADM0_A3)

/** Centroid of the largest ring, so France isn't placed in the Atlantic by its territories. */
function centroid(f) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  let best = null, bestArea = -1
  for (const poly of polys) {
    const ring = poly[0]
    let a = 0, cx = 0, cy = 0
    for (let i = 0, n = ring.length - 1; i < n; i++) {
      const [x0, y0] = ring[i], [x1, y1] = ring[i + 1]
      const cross = x0 * y1 - x1 * y0
      a += cross
      cx += (x0 + x1) * cross
      cy += (y0 + y1) * cross
    }
    const area = Math.abs(a / 2)
    if (area > bestArea && a !== 0) {
      bestArea = area
      best = { lng: cx / (3 * a), lat: cy / (3 * a) }
    }
  }
  return best || { lng: 0, lat: 0 }
}

export default function Earth() {
  return (
    <ParallaxSection id="earth" className="earth">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const { data, error } = useWorld()
  const [features, setFeatures] = useState([])
  const [hover, setHover] = useState(null)
  const [selected, setSelected] = useState(null)
  const [size, setSize] = useState({ w: 600, h: 600 })
  const [ready, setReady] = useState(false)
  const globeRef = useRef(null)
  const frameRef = useRef(null)
  const { key: globeKey, register } = useGlobeLifecycle()

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((g) => setFeatures(g.features.filter((f) => iso3(f) !== 'ATA')))
  }, [])

  // metrics per ISO3: live World Bank values, else Natural Earth estimates
  const metrics = useMemo(() => {
    const m = {}
    for (const f of features) {
      const id = iso3(f)
      const live = data?.gdp[id]
      const pop = data?.population[id]
      m[id] = {
        id,
        name: f.properties.ADMIN,
        a2: f.properties.ISO_A2 !== '-99' ? f.properties.ISO_A2 : f.properties.WB_A2,
        continent: f.properties.CONTINENT,
        gdp: live?.value ?? f.properties.GDP_MD_EST * 1e6,
        gdpYear: live?.year ?? f.properties.GDP_YEAR,
        pop: pop?.value ?? f.properties.POP_EST,
        company: companyFor(id),
        ...centroid(f),
        live: Boolean(live),
      }
    }
    return m
  }, [features, data])

  const ranked = useMemo(
    () => Object.values(metrics).filter((m) => m.gdp > 0).sort((a, b) => b.gdp - a.gdp),
    [metrics],
  )
  const top = ranked.slice(0, 12)
  const maxGdp = ranked[0]?.gdp ?? 1

  const colorFor = useCallback(
    (f) => {
      const m = metrics[iso3(f)]
      if (!m) return 'rgba(23,48,74,0.5)'
      const t = Math.max(0, Math.min(1, (Math.log10(m.gdp || 1e8) - 9) / 4.6))
      const c = t < 0.5 ? DIM.clone().lerp(CYAN, t * 2) : CYAN.clone().lerp(LIME, (t - 0.5) * 2)
      const isSel = selected?.id === m.id, isHov = hover === m.id
      if (isSel) return '#ffffff'
      if (isHov) return `#${c.clone().lerp(new Color('#ffffff'), 0.5).getHexString()}`
      return `#${c.getHexString()}`
    },
    [metrics, selected, hover],
  )

  const labels = useMemo(
    () =>
      top.map((m, i) => ({
        lat: m.lat,
        lng: m.lng,
        text: `${money(m.gdp, 1)}${m.company ? ` · ${m.company.name}` : ''}`,
        size: 1.15 - i * 0.05,
        rank: i,
      })),
    [top],
  )

  const arcs = useMemo(() => {
    if (!selected) return []
    return top
      .filter((m) => m.id !== selected.id)
      .slice(0, 8)
      .map((m) => ({ startLat: m.lat, startLng: m.lng, endLat: selected.lat, endLng: selected.lng }))
  }, [selected, top])

  const rings = selected ? [{ lat: selected.lat, lng: selected.lng }] : []

  const globeMaterial = useMemo(() => {
    const mat = new MeshPhongMaterial({ color: '#070b18', emissive: '#040816', shininess: 8 })
    mat.transparent = true
    mat.opacity = 0.96
    return mat
  }, [])

  const flyTo = useCallback((m) => {
    setSelected(m)
    globeRef.current?.pointOfView({ lat: m.lat, lng: m.lng, altitude: 1.7 }, 1100)
    if (globeRef.current) globeRef.current.controls().autoRotate = false
  }, [])

  const reset = useCallback(() => {
    setSelected(null)
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: 2.3 }, 1100)
      globeRef.current.controls().autoRotate = true
    }
  }, [])

  // `waitForGlobeReady={false}` makes the scene visible immediately but means
  // onGlobeReady can fire before React forwards the callback — so setup runs
  // once per mounted globe instance from an effect instead.
  const initedFor = useRef(-1)
  const onReady = useCallback(() => {
    const g = globeRef.current
    if (!g || initedFor.current === globeKey) return
    initedFor.current = globeKey
    const c = g.controls()
    c.autoRotate = true
    c.autoRotateSpeed = 0.55
    c.enableZoom = false
    c.enablePan = false
    g.pointOfView({ lat: 22, lng: 10, altitude: 2.3 }, 0)
    g.resumeAnimation()
    register(g)
    setReady(true)
  }, [globeKey, register])

  useEffect(() => onReady(), [onReady])

  // keep the WebGL canvas sized to its frame, and asleep when offscreen
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => {
      const g = globeRef.current
      if (!g) return
      if (e.isIntersecting) g.resumeAnimation()
      else g.pauseAnimation()
    })
    io.observe(el)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  const rise = useTransform(p, [0, 0.35], [120, 0])
  const scale = useTransform(p, [0, 0.4, 0.85, 1], [0.72, 1, 1, 0.9])
  const fade = useTransform(p, [0, 0.25, 0.85, 1], [0, 1, 1, 0])
  const haloRotate = useTransform(p, [0, 1], [0, 90])

  const focus = selected || null
  const worldGdp = data?.world.gdp
  const worldPop = data?.world.population

  return (
    <>
      <motion.div className="earth__halo" style={{ rotate: haloRotate, opacity: fade }} />

      <div className="container earth__layout">
        <motion.div className="earth__globe-wrap" style={{ y: rise, scale, opacity: fade }}>
          <div ref={frameRef} className="earth__frame">
            {features.length > 0 && (
              <Globe
                key={globeKey}
                ref={globeRef}
                width={size.w}
                height={size.h}
                backgroundColor="rgba(0,0,0,0)"
                globeMaterial={globeMaterial}
                showAtmosphere
                atmosphereColor="#19c3e6"
                atmosphereAltitude={0.22}
                hexPolygonsData={features}
                hexPolygonResolution={3}
                hexPolygonMargin={0.38}
                hexPolygonUseDots
                hexPolygonColor={colorFor}
                hexPolygonAltitude={(f) => 0.006 + (metrics[iso3(f)]?.gdp || 0) / maxGdp * 0.05}
                hexPolygonsTransitionDuration={600}
                onHexPolygonHover={(f) => setHover(f ? iso3(f) : null)}
                onHexPolygonClick={(f) => {
                  const m = metrics[iso3(f)]
                  if (m) flyTo(m)
                }}
                labelsData={labels}
                labelText="text"
                labelSize="size"
                labelDotRadius={0.35}
                labelColor={() => 'rgba(198,255,63,0.95)'}
                labelResolution={2}
                labelAltitude={0.06}
                arcsData={arcs}
                arcColor={() => ['rgba(25,195,230,0.1)', 'rgba(198,255,63,0.9)']}
                arcStroke={0.35}
                arcAltitudeAutoScale={0.45}
                arcDashLength={0.5}
                arcDashGap={0.6}
                arcDashAnimateTime={1600}
                arcsTransitionDuration={600}
                ringsData={rings}
                ringColor={() => (t) => `rgba(198,255,63,${1 - t})`}
                ringMaxRadius={6}
                ringPropagationSpeed={2.2}
                ringRepeatPeriod={900}
                onGlobeReady={onReady}
                onGlobeClick={reset}
                animateIn={false}
                waitForGlobeReady={false}
              />
            )}
            {!ready && (
              <div className="earth__loading hud">
                <span className="earth__loading-ring" />
                Acquiring planet…
              </div>
            )}
            <div className={`earth__cursor-label hud${hover && metrics[hover] ? ' is-on' : ''}`}>
              {hover && metrics[hover] ? (
                <>
                  <Flag a2={metrics[hover].a2} size={14} className="earth__flagimg" /> {metrics[hover].name}
                </>
              ) : null}
            </div>
          </div>
        </motion.div>

        <div className="earth__side">
          <Reveal>
            <p className="hud">Transmission 02 · Earth</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display earth__title">
              One planet,
              <br />
              <span className="gradient-text earth__title-accent">one ledger.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="phrase">
              Spin it. Tap a country. Every light is <em>work</em> somebody did.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="glass earth__panel">
              <AnimatePresence mode="wait">
                <motion.div
                  key={focus?.id ?? 'world'}
                  initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {focus ? (
                    <>
                      <div className="earth__panel-head">
                        <span className="earth__flag"><Flag a2={focus.a2} size={30} className="earth__flagimg" /></span>
                        <div>
                          <h3 className="wide earth__country">{focus.name}</h3>
                          <p className="hud">{focus.continent}{focus.live ? ` · World Bank ${focus.gdpYear}` : ' · estimate'}</p>
                        </div>
                        <button className="earth__close" onClick={reset} aria-label="Back to world view">×</button>
                      </div>
                      <dl className="earth__stats">
                        <div>
                          <dt className="hud">GDP</dt>
                          <dd className="stat">{money(focus.gdp, 2)}</dd>
                        </div>
                        <div>
                          <dt className="hud">People</dt>
                          <dd className="stat">{people(focus.pop)}</dd>
                        </div>
                        <div>
                          <dt className="hud">Per capita</dt>
                          <dd className="stat">{money(focus.gdp / focus.pop, 0)}</dd>
                        </div>
                      </dl>
                      <div className="earth__company">
                        <p className="hud hud--lime">Largest company · ~{asOf}</p>
                        {focus.company ? (
                          <>
                            <p className="earth__company-name serif">{focus.company.name}</p>
                            <p className="earth__company-meta">
                              <span className="stat">{focus.company.cap ? money(focus.company.cap * 1e9, 0) : '—'}</span>
                              <span className="hud">{focus.company.sector}</span>
                            </p>
                          </>
                        ) : (
                          <p className="earth__company-name serif">Not in the index yet.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="earth__panel-head">
                        <span className="earth__flag">🌍</span>
                        <div>
                          <h3 className="wide earth__country">World</h3>
                          <p className="hud">
                            {error ? 'Live data offline · estimates' : data ? `World Bank · ${data.world.year}` : 'Receiving telemetry…'}
                          </p>
                        </div>
                      </div>
                      <dl className="earth__stats">
                        <div>
                          <dt className="hud">Gross product</dt>
                          <dd className="stat">{worldGdp ? money(worldGdp, 1) : '···'}</dd>
                        </div>
                        <div>
                          <dt className="hud">People</dt>
                          <dd className="stat">{worldPop ? people(worldPop) : '···'}</dd>
                        </div>
                        <div>
                          <dt className="hud">Economies</dt>
                          <dd className="stat">{ranked.length || '···'}</dd>
                        </div>
                      </dl>
                      <p className="earth__hint">Drag to orbit · click a country to land</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <ol className="earth__top">
              {top.slice(0, 8).map((m, i) => (
                <li key={m.id}>
                  <button className={selected?.id === m.id ? 'is-active' : ''} onClick={() => flyTo(m)}>
                    <span className="hud">{String(i + 1).padStart(2, '0')}</span>
                    <span className="earth__top-name"><Flag a2={m.a2} size={14} className="earth__flagimg" /> {m.name}</span>
                    <span className="earth__top-bar"><i style={{ width: `${(m.gdp / maxGdp) * 100}%` }} /></span>
                    <span className="earth__top-val">{money(m.gdp, 1)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </>
  )
}
