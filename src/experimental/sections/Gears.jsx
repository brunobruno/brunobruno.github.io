import { useMemo, useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import './Gears.css'

const MODULE = 16 // px per tooth of pitch diameter — shared by all gears so they mesh
const TEETH = [26, 12, 34, 16, 44, 10, 24, 38, 14, 30, 20, 48]
const ANGLES = [70, 118, 55, 125, 80, 110, 48, 132, 72, 105, 95] // direction (deg, y-down) to the next gear
const FINISH = ['brass', 'steel', 'brass', 'copper', 'steel', 'brass', 'steel', 'copper', 'brass', 'steel', 'copper', 'brass']
const DRIVE_TURNS = 4 // revolutions of the first gear across the whole scroll

/** Gear outline: trapezoid teeth around the pitch circle, plus spoke cut-outs (evenodd). */
function gearPath(n, m) {
  const r = (n * m) / 2
  const ra = r + m * 0.9 // addendum
  const rd = r - m * 1.15 // dedendum
  const step = (Math.PI * 2) / n
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = i * step
    const w = step * 0.5
    const t = step * 0.08 // tip taper
    pts.push([rd, a - w * 0.5 - t * 0.5], [rd, a - w * 0.5 + t * 0.5], [ra, a - w * 0.5 + t * 1.6], [ra, a + w * 0.5 - t * 1.6], [rd, a + w * 0.5 - t * 0.5], [rd, a + w * 0.5 + t * 0.5])
  }
  let d = pts.map(([rr, a], i) => `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`).join(' ') + 'Z'
  // hub hole
  const hub = Math.max(m * 0.9, r * 0.14)
  d += ` M${hub} 0 A${hub} ${hub} 0 1 0 ${-hub} 0 A${hub} ${hub} 0 1 0 ${hub} 0Z`
  // spoke windows on bigger gears
  if (n >= 20) {
    const spokes = n >= 40 ? 6 : 5
    const ri = hub * 2.1, ro = rd * 0.72, gap = 0.16
    for (let s = 0; s < spokes; s++) {
      const a0 = (s / spokes) * Math.PI * 2 + gap, a1 = ((s + 1) / spokes) * Math.PI * 2 - gap
      d += ` M${(Math.cos(a0) * ri).toFixed(1)} ${(Math.sin(a0) * ri).toFixed(1)} L${(Math.cos(a0) * ro).toFixed(1)} ${(Math.sin(a0) * ro).toFixed(1)} A${ro} ${ro} 0 0 1 ${(Math.cos(a1) * ro).toFixed(1)} ${(Math.sin(a1) * ro).toFixed(1)} L${(Math.cos(a1) * ri).toFixed(1)} ${(Math.sin(a1) * ri).toFixed(1)} A${ri} ${ri} 0 0 0 ${(Math.cos(a0) * ri).toFixed(1)} ${(Math.sin(a0) * ri).toFixed(1)}Z`
    }
  }
  return d
}

/** Lay the train out top→bottom and compute the phase each gear needs to mesh with its driver. */
function buildTrain() {
  const gears = []
  let x = 0, y = 0
  TEETH.forEach((n, i) => {
    const r = (n * MODULE) / 2
    const pitch = 360 / n
    if (i === 0) {
      gears.push({ n, r, x, y, dir: 1, ratio: 1, phase: 0, finish: FINISH[i], path: gearPath(n, MODULE) })
      return
    }
    const prev = gears[i - 1]
    const theta = (ANGLES[(i - 1) % ANGLES.length] * Math.PI) / 180
    x = prev.x + Math.cos(theta) * (prev.r + r)
    y = prev.y + Math.sin(theta) * (prev.r + r)
    const thetaDeg = (theta * 180) / Math.PI
    const ratio = prev.ratio * (prev.n / n)
    // the driver has a tooth at angle thetaDeg + its phase; we need a gap there
    const prevTooth = ((thetaDeg - prev.phase) % (360 / prev.n) + 360 / prev.n) % (360 / prev.n)
    const phase = thetaDeg + 180 + pitch / 2 - prevTooth * (prev.n / n) * (prev.dir === 1 ? 1 : -1)
    gears.push({ n, r, x, y, dir: -prev.dir, ratio, phase, finish: FINISH[i], path: gearPath(n, MODULE) })
  })
  const pad = MODULE * 3
  const minX = Math.min(...gears.map((g) => g.x - g.r)) - pad
  const maxX = Math.max(...gears.map((g) => g.x + g.r)) + pad
  const minY = Math.min(...gears.map((g) => g.y - g.r)) - pad
  const maxY = Math.max(...gears.map((g) => g.y + g.r)) + pad
  return { gears, viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`, w: maxX - minX, h: maxY - minY }
}

export default function Gears() {
  return (
    <PinnedSection id="gears" className="gears" height="480vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const { gears, viewBox, w, h } = useMemo(() => buildTrain(), [])
  // one shared drive angle: scroll adds torque, time adds a lazy idle turn
  const t = useMotionValue(0)
  useAnimationFrame((ms) => t.set(ms / 1000))
  const drive = useTransform([p, t], ([pv, tv]) => pv * 360 * DRIVE_TURNS + tv * 14)

  // the train is taller than the viewport: scroll pans down along it (px, from the rendered width)
  const trainY = useTransform(p, (v) => {
    const svgWidth = Math.min(window.innerWidth * 0.92, 1100)
    const svgHeight = svgWidth * (h / w)
    return -Math.max(0, svgHeight - window.innerHeight * 0.9) * v
  })
  const introOpacity = useTransform(p, [0, 0.12, 0.2], [1, 1, 0])
  const outroOpacity = useTransform(p, [0.86, 0.96], [0, 1])
  const rpm = useTransform(drive, (d) => Math.round((d % 360) + 360) % 360)

  return (
    <>
      <div className="gears__bg" />
      <motion.svg className="gears__svg" viewBox={viewBox} style={{ y: trainY }} aria-hidden>
        <defs>
          <linearGradient id="g-brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2c115" />
            <stop offset="0.5" stopColor="#c8862b" />
            <stop offset="1" stopColor="#6e3a12" />
          </linearGradient>
          <linearGradient id="g-steel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3f6fb" />
            <stop offset="0.5" stopColor="#9aa6b8" />
            <stop offset="1" stopColor="#3b4454" />
          </linearGradient>
          <linearGradient id="g-copper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb089" />
            <stop offset="0.5" stopColor="#c0603a" />
            <stop offset="1" stopColor="#5a2614" />
          </linearGradient>
          <filter id="g-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>
        {gears.map((g, i) => (
          <Gear key={i} g={g} drive={drive} />
        ))}
      </motion.svg>

      <motion.div className="container gears__copy gears__copy--intro" style={{ opacity: introOpacity }}>
        <p className="hud">Lab 03 · Gears</p>
        <h2 className="display gears__title">
          Scroll is
          <br />
          <span className="gradient-text gears__title-accent">torque.</span>
        </h2>
        <p className="phrase">
          Twelve gears, one <em>module</em>, zero slipping. Keep turning.
        </p>
      </motion.div>

      <motion.div className="gears__dial glass">
        <span className="hud hud--acid">Drive shaft</span>
        <motion.span className="gears__dial-value">{rpm}</motion.span>
        <span className="hud">degrees</span>
      </motion.div>

      <motion.div className="container gears__copy gears__copy--outro" style={{ opacity: outroOpacity }}>
        <p className="phrase gears__outro-phrase">
          Every system is a train of small, honest <em>ratios</em>.
        </p>
      </motion.div>
    </>
  )
}

function Gear({ g, drive }) {
  const ref = useRef(null)
  // Write the SVG transform attribute imperatively: rotate() around the local
  // origin (= the gear's centre after the parent's translate). Passing a
  // MotionValue through motion.g's `transform` prop is not reliably applied
  // as an SVG attribute, which left the gears static.
  useMotionValueEvent(drive, 'change', (d) => {
    ref.current?.setAttribute('transform', `rotate(${(d * g.ratio * g.dir + g.phase).toFixed(2)})`)
  })
  return (
    <g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`} className={`gears__gear gears__gear--${g.finish}`}>
      <g ref={ref} transform={`rotate(${g.phase.toFixed(2)})`}>
        <path d={g.path} fill={`url(#g-${g.finish})`} fillRule="evenodd" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" filter="url(#g-shadow)" />
        <circle r={Math.max(MODULE * 0.9, g.r * 0.14) + MODULE * 0.55} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="4 6" />
      </g>
      <circle r={MODULE * 0.3} fill="#0b0b0d" />
    </g>
  )
}
