import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useTransform } from 'framer-motion'
import Globe from 'react-globe.gl'
import { MeshPhongMaterial } from 'three'
import { ParallaxSection, Reveal } from '../../components/Parallax'
import { loadJobs, groupByCity, ago, clip } from '../data/jobs'
import './JobsGlobe.css'

const GEO_URL = `${import.meta.env.BASE_URL}data/countries.geojson`

export default function JobsGlobe() {
  return (
    <ParallaxSection id="jobs" className="jobs">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const [land, setLand] = useState([])
  const [jobs, setJobs] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)
  const [size, setSize] = useState({ w: 600, h: 600 })
  const globeRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    fetch(GEO_URL).then((r) => r.json()).then((g) => setLand(g.features.filter((f) => f.properties.ISO_A3 !== 'ATA')))
    loadJobs().then(setJobs).catch(setError)
  }, [])

  const cities = useMemo(() => (jobs ? groupByCity(jobs) : []), [jobs])
  const maxJobs = Math.max(1, ...cities.map((c) => c.jobs.length))

  const globeMaterial = useMemo(() => new MeshPhongMaterial({ color: '#0b0612', emissive: '#09040f', shininess: 6 }), [])

  const flyTo = useCallback((c) => {
    setSelected(c)
    globeRef.current?.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.4 }, 1000)
    if (globeRef.current) globeRef.current.controls().autoRotate = false
  }, [])
  const reset = useCallback(() => {
    setSelected(null)
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 48, lng: 8, altitude: 2.1 }, 1000)
      globeRef.current.controls().autoRotate = true
    }
  }, [])
  const onReady = useCallback(() => {
    const g = globeRef.current
    if (!g) return
    const c = g.controls()
    c.autoRotate = true
    c.autoRotateSpeed = 0.4
    c.enableZoom = false
    c.enablePan = false
    g.pointOfView({ lat: 48, lng: 8, altitude: 2.1 }, 0)
  }, [])

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

  // tooltip on the planet: first 10 letters of the first title, plus a count
  const tip = (c) => {
    const first = clip(c.jobs[0].title, 10)
    return `<div class="jobs__tip">${first}${c.jobs.length > 1 ? ` <b>+${c.jobs.length - 1}</b>` : ''}</div>`
  }

  const week = jobs?.length ? Math.max(0, ...jobs.map((j) => (Date.now() - j.posted) / 86400000)) : 0

  return (
    <div className="container jobs__layout">
      <motion.div className="jobs__globe-wrap" style={{ y: rise, scale, opacity: fade }}>
        <div ref={frameRef} className="jobs__frame">
          {land.length > 0 && (
            <Globe
              ref={globeRef}
              width={size.w}
              height={size.h}
              backgroundColor="rgba(0,0,0,0)"
              globeMaterial={globeMaterial}
              showAtmosphere
              atmosphereColor="#ff3fa4"
              atmosphereAltitude={0.18}
              hexPolygonsData={land}
              hexPolygonResolution={3}
              hexPolygonMargin={0.55}
              hexPolygonUseDots
              hexPolygonColor={() => 'rgba(139,92,246,0.45)'}
              pointsData={cities}
              pointLat="lat"
              pointLng="lng"
              pointAltitude={(c) => 0.04 + (c.jobs.length / maxJobs) * 0.22}
              pointRadius={(c) => (selected?.city === c.city ? 0.7 : hover?.city === c.city ? 0.6 : 0.45)}
              pointColor={(c) => (selected?.city === c.city ? '#ffffff' : hover?.city === c.city ? '#ffe600' : '#ff3fa4')}
              pointResolution={16}
              pointsMerge={false}
              pointLabel={tip}
              onPointHover={setHover}
              onPointClick={flyTo}
              ringsData={selected ? [selected] : hover ? [hover] : []}
              ringLat="lat"
              ringLng="lng"
              ringColor={() => (t) => `rgba(255,230,0,${1 - t})`}
              ringMaxRadius={4}
              ringPropagationSpeed={2}
              ringRepeatPeriod={800}
              onGlobeReady={onReady}
              onGlobeClick={reset}
              animateIn={false}
            />
          )}
          {!jobs && !error && (
            <div className="jobs__loading hud">
              <span className="jobs__loading-ring" />
              Scanning job boards…
            </div>
          )}
        </div>
      </motion.div>

      <div className="jobs__side">
        <Reveal>
          <p className="hud">Lab 02 · Openings</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display jobs__title">
            Where the
            <br />
            <span className="gradient-text jobs__title-accent">work is.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="phrase">
            Live frontend openings from the last <em>{week > 7 ? '30' : '7'} days</em>. Click a pin.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="glass jobs__panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected?.city ?? 'none'}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {selected ? (
                  <>
                    <div className="jobs__panel-head">
                      <div>
                        <h3 className="wide jobs__city">{selected.city}</h3>
                        <p className="hud">
                          {selected.jobs.length} opening{selected.jobs.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <button className="jobs__close" onClick={reset} aria-label="Back to globe">×</button>
                    </div>
                    <ul className="jobs__list">
                      {selected.jobs.map((j) => (
                        <li key={j.id} className="jobs__job">
                          <p className="jobs__job-title serif">{j.title}</p>
                          <p className="jobs__job-meta">
                            <span>{j.company}</span>
                            <span className="hud hud--acid">{ago(j.posted)}</span>
                          </p>
                          {j.tags.length > 0 && (
                            <p className="jobs__tags">
                              {j.tags.map((t) => (
                                <span key={t}>{t}</span>
                              ))}
                              {j.remote && <span>remote</span>}
                            </p>
                          )}
                          <p className="jobs__links">
                            <a href={j.url} target="_blank" rel="noreferrer">View posting ↗</a>
                            <a href={j.linkedin} target="_blank" rel="noreferrer">Search on LinkedIn ↗</a>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 className="wide jobs__city">{error ? 'Board offline' : jobs ? `${jobs.length} openings` : 'Scanning…'}</h3>
                    <p className="hud">
                      {error ? 'Try again later' : jobs ? `${cities.length} cities · Arbeitnow` : 'Arbeitnow job board'}
                    </p>
                    {jobs && (
                      <ul className="jobs__cities">
                        {[...cities]
                          .sort((a, b) => b.jobs.length - a.jobs.length)
                          .slice(0, 8)
                          .map((c) => (
                            <li key={c.city}>
                              <button onClick={() => flyTo(c)}>
                                <span>{c.city}</span>
                                <b>{c.jobs.length}</b>
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                    <p className="jobs__hint">
                      LinkedIn exposes no public jobs API, so pins come from the open Arbeitnow board; each posting links
                      to the matching LinkedIn search.
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
