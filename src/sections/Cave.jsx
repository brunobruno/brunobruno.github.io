import { motion } from 'framer-motion'
import { ParallaxSection, Layer, Reveal } from '../components/Parallax'
import './Cave.css'

const orbs = [
  { left: '58%', top: '18%', size: '30vw', color: 'var(--ochre)', opacity: 0.75, blur: 60, speed: 0.5, dx: 40, dy: 30, duration: 14, delay: 0 },
  { left: '72%', top: '48%', size: '22vw', color: 'var(--yolk)', opacity: 0.45, blur: 70, speed: 0.9, dx: -30, dy: 45, duration: 18, delay: 2 },
  { left: '48%', top: '60%', size: '16vw', color: 'var(--blood)', opacity: 0.5, blur: 50, speed: 0.3, dx: 50, dy: -20, duration: 12, delay: 1 },
  { left: '82%', top: '14%', size: '12vw', color: 'var(--bone)', opacity: 0.35, blur: 40, speed: 1.2, dx: -25, dy: 25, duration: 16, delay: 3 },
  { left: '64%', top: '78%', size: '18vw', color: 'var(--lascaux)', opacity: 0.9, blur: 55, speed: 0.7, dx: 35, dy: 35, duration: 20, delay: 0.5 },
  { left: '36%', top: '28%', size: '9vw', color: 'var(--yolk)', opacity: 0.4, blur: 30, speed: 1.0, dx: -40, dy: -30, duration: 11, delay: 4 },
]

export default function Cave() {
  return (
    <ParallaxSection id="cave" className="cave">
      {(p) => <CaveInner p={p} />}
    </ParallaxSection>
  )
}

function CaveInner({ p }) {
  return (
    <>
      <Layer progress={p} speed={0.15} className="cave__wall" />
      <Layer progress={p} speed={0.6} rotate={10} className="cave__blot cave__blot--a" />
      <Layer progress={p} speed={0.9} rotate={-18} className="cave__blot cave__blot--b" />
      <Layer progress={p} speed={0.4} className="cave__blot cave__blot--c" />

      {/* pigment orbs: parallax with the scroll, plus a slow float of their own */}
      {orbs.map((o, i) => (
        <Layer key={i} progress={p} speed={o.speed} className="cave__orb-track" style={{ left: o.left, top: o.top }}>
          <motion.div
            className="cave__orb"
            style={{ width: o.size, height: o.size, background: o.color, opacity: o.opacity, filter: `blur(${o.blur}px)` }}
            animate={{ x: [0, o.dx, 0, -o.dx, 0], y: [0, -o.dy, 0, o.dy, 0], scale: [1, 1.08, 1, 0.94, 1] }}
            transition={{ duration: o.duration, repeat: Infinity, ease: 'easeInOut', delay: o.delay }}
          />
        </Layer>
      ))}

      <div className="container cave__content">
        <Reveal>
          <p className="eyebrow">Lascaux, 17,000 years ago</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display cave__title">
            Before writing,
            <br />
            <span className="cave__title-accent">we drew.</span>
          </h2>
        </Reveal>
        <div className="cave__columns">
          <Reveal delay={0.2}>
            <p className="phrase">
              Someone blew pigment over a hand and left a message for the future: <em>I was here. I made this.</em>
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="body">
              Every interface I build still carries that gesture. A screen is a cave wall with better lighting. The tools
              changed — ochre became pixels, torches became GPUs — but the urge is identical: to make something another
              human can understand at a glance.
            </p>
            <p className="body" style={{ marginTop: '1rem' }}>
              I started as a digital designer in 2008, hand in paint. Eighteen years later I lead frontend teams across
              Europe, still trying to leave a clean mark on the wall.
            </p>
          </Reveal>
        </div>
      </div>
    </>
  )
}
