import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import VortexScene from '../components/VortexScene'
import './Vortex.css'

export default function Vortex() {
  return (
    <PinnedSection id="vortex" className="vortex" height="620vh">
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
  const midOpacity = useTransform(p, [0.4, 0.46, 0.56, 0.62], [0, 1, 1, 0])
  const outroOpacity = useTransform(p, [0.94, 1], [0, 1])
  const vignette = useTransform(p, [0, 1], [0.35, 0.7])

  return (
    <>
      <div ref={wrapRef} className="vortex__canvas">
        <VortexScene progressRef={progressRef} active={active} />
      </div>
      <motion.div className="vortex__vignette" style={{ opacity: vignette }} />

      <motion.div className="container vortex__copy vortex__copy--intro" style={{ opacity: introOpacity, y: introY }}>
        <p className="hud">Lab 01 · Vortex</p>
        <h1 className="display vortex__title">
          Fall
          <br />
          <span className="gradient-text vortex__title-accent">forward.</span>
        </h1>
        <p className="phrase">
          A kaleidoscope of every glyph I've ever typed. <em>Scroll</em> to dive.
        </p>
      </motion.div>

      <motion.div className="container vortex__copy vortex__copy--mid" style={{ opacity: midOpacity }}>
        <p className="phrase">
          Half-way down, the letters stop being <em>language</em> and start being light.
        </p>
      </motion.div>

      <motion.div className="container vortex__copy vortex__copy--outro" style={{ opacity: outroOpacity }}>
        <p className="hud hud--acid">You made it to the end of the tunnel</p>
        <p className="body">It's the only direction worth building in.</p>
      </motion.div>
    </>
  )
}
