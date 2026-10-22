import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import FireScene from '../components/FireScene'
import './Fire.css'

export default function Fire() {
  return (
    <PinnedSection id="fire" className="fire" height="460vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const progressRef = useRef(0)
  const wrapRef = useRef(null)
  const [active, setActive] = useState(false)
  useMotionValueEvent(p, 'change', (v) => (progressRef.current = v))

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '20%' })
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  const introOpacity = useTransform(p, [0, 0.08, 0.14], [1, 1, 0])
  const introY = useTransform(p, [0, 0.14], [0, -40])
  const midOpacity = useTransform(p, [0.3, 0.38, 0.5, 0.58], [0, 1, 1, 0])
  const outroOpacity = useTransform(p, [0.84, 0.94], [0, 1])
  const outroScale = useTransform(p, [0.84, 1], [0.86, 1])

  return (
    <>
      <div ref={wrapRef} className="fire__canvas">
        <FireScene progressRef={progressRef} active={active} />
      </div>

      <motion.div className="container fire__copy fire__copy--intro" style={{ opacity: introOpacity, y: introY }}>
        <p className="hud">Lab 05 · Combustion</p>
        <h2 className="display fire__title">
          Some ideas
          <br />
          <span className="gradient-text fire__title-accent">need a spark.</span>
        </h2>
        <p className="phrase">
          <em>Scroll</em> — let it catch.
        </p>
      </motion.div>

      <motion.div className="container fire__copy fire__copy--mid" style={{ opacity: midOpacity }}>
        <p className="phrase">
          The fire doesn't ask what it costs. It just makes <em>room.</em>
        </p>
      </motion.div>

      <motion.div className="container fire__copy fire__copy--outro" style={{ opacity: outroOpacity, scale: outroScale }}>
        <p className="display fire__word">IGNITE</p>
        <p className="body">Everything after the smoke clears is fuel.</p>
      </motion.div>
    </>
  )
}
