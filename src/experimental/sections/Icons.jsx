import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useTransform } from 'framer-motion'
import Globe from 'react-globe.gl'
import { MeshPhongMaterial } from 'three'
import { ParallaxSection, Reveal } from '../../components/Parallax'
import { useGlobeLifecycle, useGlobeWatchdog } from '../../components/useGlobeLifecycle'
import { useNearViewport } from '../components/useNearViewport'
import Flag from '../../components/Flag'
import { ICONS, loadProfile, loadSnapshot, prefetchProfiles, instagramUrl, wikipediaUrl, fmtFollowers, fmtCount, ago } from '../data/famous'
import './Icons.css'

const GEO_URL = `${import.meta.env.BASE_URL}data/countries.geojson`
const WORLD_POV = { lat: 24, lng: -20, altitude: 2.3 } // ≠ the init default 2.5 (watchdog signature)
const asset = (path) => (path && !path.startsWith('http') ? `${import.meta.env.BASE_URL}${path}` : path)
const clip = (s, n = 150) => (s && s.length > n ? `${s.slice(0, n).trimEnd()}…` : s)

export default function Icons() {
  return (
    <ParallaxSection id="icons" className="fame">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const [land, setLand] = useState([])
  const [profiles, setProfiles] = useState({})
  const [live, setLive] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: 600, h: 600 })
  const globeRef = useRef(null)
  const frameRef = useRef(null)
  const near = useNearViewport(frameRef)
  const { key: globeKey, register } = useGlobeLifecycle()

  useEffect(() => {
    fetch(GEO_URL).then((r) => r.json()).then((g) => setLand(g.features.filter((f) => f.properties.ISO_A3 !== 'ATA')))
    let alive = true
    loadSnapshot().then((s) => alive && setLive(s?.icons ?? null))
    prefetchProfiles(ICONS, (wiki, profile) => alive && setProfiles((prev) => ({ ...prev, [wiki]: profile })))
    return () => { alive = false }
  }, [])

  // merge the twice-weekly Apify snapshot: a pin jumps to the latest geotagged
  // post when there is one (otherwise it stays at the home city), and the
  // follower count updates to the scraped figure
  const items = useMemo(
    () =>
      ICONS.map((i) => {
        const l = live?.[i.handle]
        const geo = l?.post?.lat != null ? l.post : null
        return {
          ...i,
          lat: geo ? geo.lat : i.lat,
          lng: geo ? geo.lng : i.lng,
          cc: geo?.cc ?? i.cc,
          place: geo ? l.post.location ?? i.place : i.place,
          followers: l?.followers ? l.followers / 1e6 : i.followers,
          live: l ?? null,
        }
      }),
    [live],
  )

  const ensureProfile = useCallback((icon) => {
    if (!icon || profiles[icon.wiki]) return
    loadProfile(icon.wiki).then((profile) => setProfiles((prev) => ({ ...prev, [icon.wiki]: profile }))).catch(() => {})
  }, [profiles])

  const globeMaterial = useMemo(() => new MeshPhongMaterial({ color: '#0a0712', emissive: '#0b0414', shininess: 8 }), [])
  const maxFollowers = useMemo(() => Math.max(...items.map((i) => i.followers)), [items])
  const leaderboard = useMemo(() => [...items].sort((a, b) => b.followers - a.followers), [items])
  const countries = useMemo(() => new Set(items.map((i) => i.cc)).size, [items])
  const total = useMemo(() => items.reduce((s, i) => s + i.followers, 0), [items])

  const flyTo = useCallback((icon) => {
    setSelected(icon)
    ensureProfile(icon)
    globeRef.current?.pointOfView({ lat: icon.lat, lng: icon.lng, altitude: 1.1 }, 1000)
    if (globeRef.current) globeRef.current.controls().autoRotate = false
  }, [ensureProfile])

  const reset = useCallback(() => {
    setSelected(null)
    if (globeRef.current) {
      globeRef.current.pointOfView(WORLD_POV, 1000)
      globeRef.current.controls().autoRotate = true
    }
  }, [])

  const onHover = useCallback((icon) => {
    setHover(icon)
    ensureProfile(icon)
  }, [ensureProfile])

  // Idempotent on purpose: react-kapsule may re-init the globe (and reset the
  // camera) after mount, so every (re-)ready must re-apply the setup.
  const onReady = useCallback(() => {
    const g = globeRef.current
    if (!g) return
    const c = g.controls()
    c.autoRotate = true
    c.autoRotateSpeed = 0.35
    c.enableZoom = false
    c.enablePan = false
    g.pointOfView(WORLD_POV, 0)
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

  const onMove = useCallback((e) => {
    const r = frameRef.current.getBoundingClientRect()
    setCursor({ x: e.clientX - r.left, y: e.clientY - r.top })
  }, [])

  const rise = useTransform(p, [0, 0.35], [120, 0])
  const scale = useTransform(p, [0, 0.4, 0.85, 1], [0.75, 1, 1, 0.92])
  const fade = useTransform(p, [0, 0.25, 0.85, 1], [0, 1, 1, 0])

  const active = selected ?? null
  const hovered = hover && hover !== selected ? hover : null
  const hoverProfile = hovered ? profiles[hovered.wiki] : null
  // keep the hover card inside the frame
  const cardLeft = cursor.x > size.w * 0.55
  const cardTop = cursor.y > size.h * 0.6

  return (
    <div className="container fame__layout">
      <motion.div className="fame__globe-wrap" style={{ y: rise, scale, opacity: fade }}>
        <div ref={frameRef} className="fame__frame" onPointerMove={onMove}>
          {near && (

          <Globe
            key={globeKey}
            ref={globeRef}
            width={size.w}
            height={size.h}
            backgroundColor="rgba(0,0,0,0)"
            globeMaterial={globeMaterial}
            showAtmosphere
            atmosphereColor="#ffe600"
            atmosphereAltitude={0.16}
            hexPolygonsData={land}
            hexPolygonResolution={3}
            hexPolygonMargin={0.58}
            hexPolygonUseDots
            hexPolygonColor={() => 'rgba(139,92,246,0.42)'}
            pointsData={items}
            pointLat="lat"
            pointLng="lng"
            pointAltitude={(i) => 0.005 + (i.followers / maxFollowers) * 0.07}
            pointRadius={(i) => (i === active ? 0.8 : i === hovered ? 0.7 : 0.3 + (i.followers / maxFollowers) * 0.4)}
            pointColor={(i) => (i === active ? '#ffffff' : i === hovered ? '#ffe600' : '#ff3fa4')}
            pointResolution={16}
            pointsMerge={false}
            pointLabel={() => ''}
            onPointHover={onHover}
            onPointClick={flyTo}
            ringsData={active ? [active] : hovered ? [hovered] : []}
            ringLat="lat"
            ringLng="lng"
            ringColor={() => (t) => `rgba(255,230,0,${1 - t})`}
            ringMaxRadius={4}
            ringPropagationSpeed={2}
            ringRepeatPeriod={800}
            onGlobeReady={onReady}
            onGlobeClick={reset}
            animateIn={false}
            waitForGlobeReady={false}
          />
          )}

          {/* hover card: portrait + bio streamed from Wikipedia */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                key={hovered.handle}
                className={`fame__card glass ${cardLeft ? 'fame__card--left' : ''} ${cardTop ? 'fame__card--top' : ''}`}
                style={{ left: cursor.x, top: cursor.y }}
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <Portrait profile={hoverProfile} name={hovered.name} live={hovered.live} />
                <div className="fame__card-body">
                  <p className="hud hud--acid">@{hovered.handle} · ≈{fmtFollowers(hovered.followers)}</p>
                  <h4 className="wide fame__card-name">{hovered.name}</h4>
                  <p className="fame__card-place">
                    <Flag a2={hovered.cc} size={14} className="fame__flag" /> {hovered.place} · {hovered.field}
                  </p>
                  {hovered.live?.post ? (
                    <>
                      <p className="fame__card-post">
                        'Latest post' · {ago(hovered.live.post.timestamp)}
                        {hovered.live.post.likes != null && ` · ${fmtCount(hovered.live.post.likes)} likes`}
                      </p>
                      <p className="fame__card-text">{clip(hovered.live.post.caption || '—', 170)}</p>
                    </>
                  ) : (
                    <p className="fame__card-text">{hoverProfile ? hoverProfile.extract : 'Loading…'}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="fame__side">
        <Reveal>
          <p className="hud">Lab 04 · Icons</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display fame__title">
            Where the
            <br />
            <span className="gradient-text fame__title-accent">faces live.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="phrase">
            The most-followed <em>humans</em> on Instagram — pins land on their latest post. Hover one.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="glass fame__panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={active?.handle ?? 'none'}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {active ? (
                  <Detail icon={active} profile={profiles[active.wiki]} rank={leaderboard.indexOf(active) + 1} onClose={reset} onExpand={() => setLightbox(active)} />
                ) : (
                  <>
                    <h3 className="wide fame__heading">≈{fmtFollowers(total)} followers</h3>
                    <p className="hud">
                      {leaderboard.length} icons · {countries} countries · refreshed weekly
                    </p>
                    <ul className="fame__board">
                      {leaderboard.map((i, n) => (
                        <li key={i.handle}>
                          <button onClick={() => flyTo(i)} onMouseEnter={() => ensureProfile(i)}>
                            <span className="fame__rank">{String(n + 1).padStart(2, '0')}</span>
                            <Avatar profile={profiles[i.wiki]} name={i.name} live={i.live} />
                            <span className="fame__board-name">
                              {i.name}
                              <small><Flag a2={i.cc} size={11} className="fame__flag" /> {i.place}</small>
                            </span>
                            <b>{fmtFollowers(i.followers)}</b>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="fame__hint">
                      Pins mark each icon's latest post — where it was posted when there's a location, their home city otherwise.
                      Posts, images and follower counts refresh twice a week from public Instagram data via Apify;
                      portraits and bios stream live from Wikipedia.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>

      <AnimatePresence>
        {lightbox?.live?.post?.image && (
          <PostLightbox post={lightbox.live.post} icon={lightbox} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function PostLightbox({ post, icon, onClose }) {
  return (
    <motion.div className="fame__lightbox" onClick={onClose}>
      <motion.figure
        className="fame__lightbox-card glass"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={asset(post.image)} alt={`Latest post by @${icon.handle}`} />
        <figcaption>
          <p className="hud hud--acid">@{icon.handle} · {ago(post.timestamp)}{post.location ? ` · ${post.location}` : ''}</p>
          <p className="fame__lightbox-caption">{post.caption || 'No caption.'}</p>
          <p className="fame__post-meta">
            {post.likes != null && <span>{fmtCount(post.likes)} likes</span>}
            {post.comments != null && <span>{fmtCount(post.comments)} comments</span>}
            <a href={post.url} target="_blank" rel="noreferrer">View post ↗</a>
          </p>
        </figcaption>
      </motion.figure>
      <button className="fame__lightbox-close" onClick={onClose} aria-label="Close">×</button>
    </motion.div>
  )
}

/* Image preference: vendored post image > vendored avatar > Wikipedia portrait */
function Portrait({ profile, name, live }) {
  const src = live?.post?.image || live?.avatar ? asset(live?.post?.image ?? live.avatar) : profile?.image
  return (
    <div className="fame__portrait">
      {src ? <img src={src} alt={name} loading="lazy" /> : <span className="fame__portrait-ph">{name[0]}</span>}
    </div>
  )
}

function Avatar({ profile, name, live }) {
  const src = live?.avatar ? asset(live.avatar) : profile?.image
  return (
    <span className="fame__avatar">
      {src ? <img src={src} alt="" loading="lazy" /> : <span>{name[0]}</span>}
    </span>
  )
}

function Detail({ icon, profile, rank, onClose, onExpand }) {
  const post = icon.live?.post
  return (
    <>
      <div className="fame__detail-head">
        {icon.live?.post?.image ? (
          <button className="fame__expand" onClick={onExpand} title="Expand post">
            <Portrait profile={profile} name={icon.name} live={icon.live} />
            <span className="fame__expand-tag">expand</span>
          </button>
        ) : (
          <Portrait profile={profile} name={icon.name} live={icon.live} />
        )}
        <div>
          <p className="hud hud--acid">@{icon.handle}</p>
          <h3 className="wide fame__heading">{icon.name}</h3>
          <p className="fame__card-place">
            <Flag a2={icon.cc} size={14} className="fame__flag" /> {icon.place} · {icon.field}
          </p>
        </div>
        <button className="fame__close" onClick={onClose} aria-label="Back to globe">×</button>
      </div>
      <div className="fame__stats">
        <div>
          <span className="hud">Followers</span>
          <b>≈{fmtFollowers(icon.followers)}</b>
        </div>
        <div>
          <span className="hud">Rank</span>
          <b>#{rank}{icon.live?.verified ? ' · verified' : ''}</b>
        </div>
      </div>
      {post && (
        <div className="fame__post">
          <p className="hud hud--acid">
            'Latest post' · {ago(post.timestamp)}
            {post.location ? ` · ${post.location}` : ''}
          </p>
          <p className="fame__post-caption">{clip(post.caption || 'No caption.', 420)}</p>
          <p className="fame__post-meta">
            {post.likes != null && <span>{fmtCount(post.likes)} likes</span>}
            {post.comments != null && <span>{fmtCount(post.comments)} comments</span>}
            <a href={post.url} target="_blank" rel="noreferrer">View post ↗</a>
          </p>
        </div>
      )}
      <p className="hud">{profile?.description ?? ''}</p>
      <p className="fame__detail-text serif">{profile ? profile.extract : 'Loading…'}</p>
      <p className="fame__links">
        <a href={instagramUrl(icon.handle)} target="_blank" rel="noreferrer">Instagram ↗</a>
        <a href={wikipediaUrl(icon.wiki)} target="_blank" rel="noreferrer">Wikipedia ↗</a>
      </p>
    </>
  )
}
