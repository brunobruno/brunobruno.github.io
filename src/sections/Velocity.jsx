import { motion, useTransform, useScroll, useVelocity, useSpring } from 'framer-motion'
import { PinnedSection } from '../components/Parallax'
import FlowField from '../components/FlowField'
import './Velocity.css'

const rows = [
  { text: 'SPEED', dir: 1, cls: 'fill' },
  { text: 'LIGHT', dir: -1, cls: 'outline' },
  { text: 'MOTION', dir: 1, cls: 'neon' },
]

export default function Velocity() {
  return (
    <PinnedSection id="velocity" className="velo" height="220vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  // skew the type with real scroll velocity, so it leans into the motion
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const skew = useSpring(useTransform(velocity, [-2500, 0, 2500], [-8, 0, 8]), { stiffness: 200, damping: 30 })

  const sweep = useTransform(p, [0, 1], ['-120%', '220%'])
  const copyOpacity = useTransform(p, [0.4, 0.55, 0.9, 1], [0, 1, 1, 0])
  const copyX = useTransform(p, [0.4, 0.55], [-40, 0])
  const haze = useTransform(p, [0, 1], [0.15, 0.5])

  return (
    <>
      <FlowField className="velo__canvas" density={260} />
      <motion.div className="velo__haze" style={{ opacity: haze }} />
      <motion.div className="velo__sweep" style={{ x: sweep }} />

      <motion.div className="velo__rows" style={{ skewX: skew }}>
        {rows.map((r, i) => (
          <Row key={r.text} p={p} {...r} i={i} />
        ))}
      </motion.div>

      <motion.div className="container velo__copy" style={{ opacity: copyOpacity, x: copyX }}>
        <p className="eyebrow">Futurism, 1913</p>
        <p className="phrase">
          Boccioni wanted to paint not the runner but the <em>running</em>.
        </p>
        <p className="body">
          A century later I measure it in milliseconds. Time to first paint, time to interactive, the frame budget of a
          gesture. Performance is not an engineering metric — it is the feeling of speed, and feeling is art's
          territory.
        </p>
      </motion.div>
    </>
  )
}

function Row({ p, text, dir, cls, i }) {
  const x = useTransform(p, [0, 1], [`${dir * 30}vw`, `${-dir * 30}vw`])
  const opacity = useTransform(p, [0, 0.1 + i * 0.08, 0.85, 1], [0, 1, 1, 0])
  const repeated = Array.from({ length: 4 }, () => text).join(' · ')
  return (
    <motion.div className={`display velo__row velo__row--${cls}`} style={{ x, opacity }}>
      {repeated} ·
    </motion.div>
  )
}
