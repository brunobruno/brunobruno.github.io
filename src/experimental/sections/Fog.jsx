import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import FogScene from '../components/FogScene'
import './Fog.css'

export default function Fog() {
  return (
    <PinnedSection id="fog" className="fog" height="460vh">
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

  const introOpacity = useTransform(p, [0, 0.1, 0.16], [1, 1, 0])
  const introY = useTransform(p, [0, 0.16], [0, -40])
  const midOpacity = useTransform(p, [0.38, 0.46, 0.56, 0.64], [0, 1, 1, 0])
  const outroOpacity = useTransform(p, [0.82, 0.92], [0, 1])
  const outroScale = useTransform(p, [0.82, 1], [0.86, 1])

  return (
    <>
      <div ref={wrapRef} className="fog__canvas">
        <FogScene progressRef={progressRef} active={active} />
      </div>

      <motion.div className="container fog__copy fog__copy--intro" style={{ opacity: introOpacity, y: introY }}>
        <p className="hud">Lab 04 · Fog</p>
        <h2 className="display fog__title">
          Sit inside
          <br />
          <span className="gradient-text fog__title-accent">the noise.</span>
        </h2>
        <p className="phrase">
          Not everything is signal. <em>Scroll</em> — the smoke is listening.
        </p>
      </motion.div>

      <motion.div className="container fog__copy fog__copy--mid" style={{ opacity: midOpacity }}>
        <p className="phrase">
          Between the input and the idea there is a long grey corridor. Most people scroll past it.
        </p>
      </motion.div>

      <motion.div className="container fog__copy fog__copy--outro" style={{ opacity: outroOpacity, scale: outroScale }}>
        <p className="display fog__word">EMERGE</p>
        <p className="body">Clarity isn't found. It's what remains when you stop demanding it.</p>
      </motion.div>
    </>
  )
}
