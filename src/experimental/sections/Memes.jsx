import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useTransform } from 'framer-motion'
import Globe from 'react-globe.gl'
import { MeshPhongMaterial } from 'three'
import { ParallaxSection, Reveal } from '../../components/Parallax'
import { useGlobeLifecycle, useGlobeWatchdog } from '../../components/useGlobeLifecycle'
import { loadMemes, cap, price, pct, coinPage } from '../data/memes'
import './Memes.css'

const GEO_URL = `${import.meta.env.BASE_URL}data/countries.geojson`
const HOME_POV = { lat: 25, lng: 10, altitude: 2.0 }

export default function Memes() {
  return (
    <ParallaxSection id="memes" className="memes">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const [land, setLand] = useState([])
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)
  const [size, setSize] = useState({ w: 600, h: 600 })
  const globeRef = useRef(null)
  const frameRef = useRef(null)
  const { key: globeKey, register } = useGlobeLifecycle()

  useEffect(() => {
    fetch(GEO_URL).then((r) => r.json()).then((g) => setLand(g.features.filter((f) => f.properties.ISO_A3 !== 'ATA')))
    loadMemes().then(setData).catch(setError)
  }, [])

  const coins = data?.coins ?? []
  const maxCap = Math.max(1, ...coins.map((c) => c.cap))
  const globeMaterial = useMemo(() => new MeshPhongMaterial({ color: '#0d0a05', emissive: '#0a0703', shininess: 6 }), [])

  const flyTo = useCallback((c) => {
    setSelected(c)
    globeRef.current?.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.0 }, 1000)
    if (globeRef.current) globeRef.current.controls().autoRotate = false
  }, [])
  const reset = useCallback(() => {
    setSelected(null)
    if (globeRef.current) {
      globeRef.current.pointOfView(HOME_POV, 1000)
      globeRef.current.controls().autoRotate = true
    }
  }, [])
  // Idempotent on purpose — onGlobeReady re-fires if the kapsule re-initializes
  // (React replaying the mount effect re-invokes comp(domEl), resetting the
  // camera to the default POV), so each init must re-apply our setup.
  const onReady = useCallback(() => {
    const g = globeRef.current
    if (!g) return
    const c = g.controls()
    c.autoRotate = true
    c.autoRotateSpeed = 0.5
    c.enableZoom = false
    c.enablePan = false
    g.pointOfView(HOME_POV, 0)
    g.resumeAnimation()
    register(g)
  }, [register])
  useEffect(() => onReady(), [onReady])
  useGlobeWatchdog(globeRef, onReady)

  useEffect(() => {
    const el = frameRef.current
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
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
  const scale = useTransform(p, [0, 0.4, 0.85, 1], [0.75, 1, 1, 0.92])
  const fade = useTransform(p, [0, 0.25, 0.85, 1], [0, 1, 1, 0])

  const tip = (c) => `<div class="memes__tip">$${c.sym} · ${cap(c.cap)}</div>`
  const coinColor = (c) => (selected?.id === c.id ? '#ffffff' : hover?.id === c.id ? '#ffe600' : c.chg24 >= 0 ? '#b6f04a' : '#ff5470')

  return (
    <div className="container memes__layout">
      <motion.div className="memes__globe-wrap" style={{ y: rise, scale, opacity: fade }}>
        <div ref={frameRef} className="memes__frame">
          <Globe
            key={globeKey}
            ref={globeRef}
            width={size.w}
            height={size.h}
            backgroundColor="rgba(0,0,0,0)"
            globeMaterial={globeMaterial}
            showAtmosphere
            atmosphereColor="#ffd23f"
            atmosphereAltitude={0.16}
            hexPolygonsData={land}
            hexPolygonResolution={3}
            hexPolygonMargin={0.55}
            hexPolygonUseDots
            hexPolygonColor={() => 'rgba(255,157,0,0.28)'}
            pointsData={coins}
            pointLat="lat"
            pointLng="lng"
            pointAltitude={(c) => 0.03 + Math.sqrt(c.cap / maxCap) * 0.3}
            pointRadius={(c) => (selected?.id === c.id ? 0.75 : hover?.id === c.id ? 0.62 : 0.42)}
            pointColor={coinColor}
            pointResolution={16}
            pointsMerge={false}
            pointLabel={tip}
            onPointHover={setHover}
            onPointClick={flyTo}
            ringsData={selected ? [selected] : hover ? [hover] : []}
            ringLat="lat"
            ringLng="lng"
            ringColor={() => (t) => `rgba(255,210,63,${1 - t})`}
            ringMaxRadius={4}
            ringPropagationSpeed={2}
            ringRepeatPeriod={800}
            onGlobeReady={onReady}
            onGlobeClick={reset}
            animateIn={false}
            waitForGlobeReady={false}
          />
          {!data && !error && (
            <div className="memes__loading hud">
              <span className="memes__loading-ring" />
              Weighing the casino…
            </div>
          )}
        </div>
      </motion.div>

      <div className="memes__side">
        <Reveal>
          <p className="hud">Lab 06 · Casino</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display memes__title">
            The meme
            <br />
            <span className="gradient-text memes__title-accent">economy.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="phrase">
            Top memecoins by market cap, <em>live</em> from CoinGecko. Each pin is a bag — click one.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="glass memes__panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected?.id ?? 'board'}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {selected ? (
                  <>
                    <div className="memes__panel-head">
                      <img className="memes__coin-img" src={selected.img} alt="" width="44" height="44" />
                      <div>
                        <h3 className="wide memes__coin">
                          {selected.name} <span className="memes__sym">${selected.sym}</span>
                        </h3>
                        <p className="hud">rank #{selected.rank ?? '—'} · global crypto</p>
                      </div>
                      <button className="memes__close" onClick={reset} aria-label="Back to globe">×</button>
                    </div>
                    <dl className="memes__stats">
                      <div>
                        <dt className="hud">Price</dt>
                        <dd className="memes__stat">{price(selected.price)}</dd>
                      </div>
                      <div>
                        <dt className="hud">Market cap</dt>
                        <dd className="memes__stat">{cap(selected.cap)}</dd>
                      </div>
                      <div>
                        <dt className="hud">24h</dt>
                        <dd className={`memes__stat ${selected.chg24 >= 0 ? 'is-up' : 'is-down'}`}>{pct(selected.chg24)}</dd>
                      </div>
                      <div>
                        <dt className="hud">Volume 24h</dt>
                        <dd className="memes__stat">{cap(selected.vol)}</dd>
                      </div>
                      <div>
                        <dt className="hud">From ATH</dt>
                        <dd className={`memes__stat ${selected.athGap >= -20 ? 'is-up' : 'is-down'}`}>{pct(selected.athGap)}</dd>
                      </div>
                      <div>
                        <dt className="hud">Share of memes</dt>
                        <dd className="memes__stat">{data ? pct((selected.cap / data.totalCap) * 100) : '—'}</dd>
                      </div>
                    </dl>
                    <p className="memes__links">
                      <a href={coinPage(selected.id)} target="_blank" rel="noreferrer">CoinGecko ↗</a>
                      <a href={`https://www.binance.com/en/trade/${selected.sym}_USDT`} target="_blank" rel="noreferrer">Binance ↗</a>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="wide memes__coin">{error ? 'Feed offline' : data ? cap(data.totalCap) : 'Loading…'}</h3>
                    <p className="hud">
                      {error
                        ? 'CoinGecko rate limit — retry soon'
                        : data
                          ? `${coins.length} memecoins · ${data.share != null ? `${data.share.toFixed(2)}% of all crypto · ` : ''}24h ${pct(data.day)}`
                          : 'CoinGecko market data'}
                    </p>
                    {data && (
                      <ul className="memes__board">
                        {[...coins]
                          .sort((a, b) => b.cap - a.cap)
                          .slice(0, 8)
                          .map((c, i) => (
                            <li key={c.id}>
                              <button onClick={() => flyTo(c)}>
                                <span className="hud">{String(i + 1).padStart(2, '0')}</span>
                                <img className="memes__coin-img memes__coin-img--sm" src={c.img} alt="" width="20" height="20" loading="lazy" />
                                <span className="memes__board-name">
                                  {c.name} <em className="memes__sym">${c.sym}</em>
                                </span>
                                <span className="memes__board-cap">{cap(c.cap)}</span>
                                <b className={c.chg24 >= 0 ? 'is-up' : 'is-down'}>{pct(c.chg24)}</b>
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                    <p className="memes__hint">
                      Memecoins have no geography — pins are a stylised world map of where the money pools.
                      Data: CoinGecko free API, cached 30 min.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
