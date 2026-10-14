import { motion, useTransform } from 'framer-motion'
import { PinnedSection } from '../components/Parallax'
import './Perspective.css'

const FRAMES = 9
const RAYS = 16
const colors = ['rgba(198,255,63,0.7)', 'rgba(25,195,230,0.7)', 'rgba(243,238,228,0.6)']

export default function Perspective() {
  return (
    <PinnedSection id="perspective" className="persp" height="220vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const raysRotate = useTransform(p, [0, 1], [0, 90])
  const titleScale = useTransform(p, [0, 0.5, 1], [0.6, 1, 1.6])
  const titleOpacity = useTransform(p, [0, 0.25, 0.75, 1], [0, 1, 1, 0])
  const copyOpacity = useTransform(p, [0.35, 0.5, 0.85, 1], [0, 1, 1, 0])
  const copyY = useTransform(p, [0.35, 0.5], [40, 0])
  const glow = useTransform(p, [0, 0.5, 1], [0.15, 0.45, 0.6])

  return (
    <>
      <motion.div className="persp__glow" style={{ opacity: glow }} />

      <motion.svg className="persp__rays" viewBox="-100 -100 200 200" style={{ rotate: raysRotate }}>
        {Array.from({ length: RAYS }).map((_, i) => {
          const a = (i / RAYS) * Math.PI * 2
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={Math.cos(a) * 200}
              y2={Math.sin(a) * 200}
              stroke="var(--paper)"
              strokeOpacity={i % 2 ? 0.08 : 0.18}
              strokeWidth="0.3"
            />
          )
        })}
      </motion.svg>

      <div className="persp__tunnel">
        {Array.from({ length: FRAMES }).map((_, i) => (
          <Frame key={i} p={p} i={i} />
        ))}
      </div>

      <motion.div className="persp__title-wrap" style={{ scale: titleScale, opacity: titleOpacity }}>
        <p className="eyebrow">Florence, 1415</p>
        <h2 className="display persp__title">
          Perspective
          <span className="persp__title-sub">was the first user interface</span>
        </h2>
      </motion.div>

      <motion.div className="container persp__copy" style={{ opacity: copyOpacity, y: copyY }}>
        <p className="phrase">
          Brunelleschi held up a mirror and proved that <em>depth</em> could be computed.
        </p>
        <p className="body">
          Six centuries later we still render the world on flat glass and trick the eye into believing in space. A
          vanishing point is just a very old algorithm — and every layout I compose is still negotiating with it.
        </p>
      </motion.div>
    </>
  )
}

/**
 * Each frame lives at a fixed depth slot; as progress advances the camera
 * moves forward, frames grow, pass the viewer and recycle to the far end.
 */
function Frame({ p, i }) {
  const phase = i / FRAMES
  const z = useTransform(p, (v) => {
    const t = (phase + v * 2) % 1 // 0 = far, 1 = at the camera
    return t
  })
  const scale = useTransform(z, (t) => 0.04 + Math.pow(t, 3) * 3.2)
  const opacity = useTransform(z, (t) => (t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1) * 0.7)
  const rotate = useTransform(z, (t) => (i % 2 ? 1 : -1) * t * 30 + i * 6)
  const border = useTransform(z, (t) => `${0.6 + t * 2.4}px`)
  return (
    <motion.div
      className="persp__frame"
      style={{ scale, opacity, rotate, borderWidth: border, borderColor: colors[i % colors.length], zIndex: Math.round(i) }}
    />
  )
}
