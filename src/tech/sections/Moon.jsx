import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import MoonScene from '../components/MoonScene'
import './Moon.css'

export default function Moon() {
  return (
    <PinnedSection id="moon" className="moon" height="340vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const sunRef = useRef(0.6)
  const wrapRef = useRef(null)
  const [active, setActive] = useState(false)
  const [landing, setLanding] = useState(null)

  // scroll sweeps the sun around the Moon: thin crescent on arrival → full moon for the finale
  // (camera sits on +z, so full = sun angle π/2, new = -π/2)
  useMotionValueEvent(p, 'change', (v) => (sunRef.current = -1.07 + v * 2.84))

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '20%' })
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!landing) return
    const t = setTimeout(() => setLanding(null), 3200)
    return () => clearTimeout(t)
  }, [landing])

  const moonScale = useTransform(p, [0, 0.3, 0.75, 1], [0.3, 0.9, 1.05, 0.9])
  const moonY = useTransform(p, [0, 0.3, 0.8, 1], ['38vh', '4vh', '0vh', '-22vh'])
  const moonX = useTransform(p, [0, 0.3, 0.75, 1], ['20vw', '20vw', '14vw', '0vw'])
  const moonOpacity = useTransform(p, [0, 0.06], [0.4, 1])

  const introOpacity = useTransform(p, [0, 0.3, 0.38], [1, 1, 0])
  const introY = useTransform(p, [0, 0.38], [0, -60])
  const midOpacity = useTransform(p, [0.42, 0.52, 0.66, 0.74], [0, 1, 1, 0])
  const midX = useTransform(p, [0.42, 0.74], [-40, 20])
  const outroOpacity = useTransform(p, [0.8, 0.9], [0, 1])
  const outroY = useTransform(p, [0.8, 0.95], [50, 0])
  const dustOpacity = useTransform(p, [0.2, 0.5, 1], [0, 0.5, 0.2])

  return (
    <>
      <motion.div className="moon__dust" style={{ opacity: dustOpacity }} />

      <motion.div ref={wrapRef} className="moon__stage" style={{ scale: moonScale, y: moonY, x: moonX, opacity: moonOpacity }}>
        <div className="moon__glow" />
        <MoonScene sunRef={sunRef} active={active} onLanding={setLanding} />
      </motion.div>

      <motion.div className="container moon__copy moon__copy--intro" style={{ opacity: introOpacity, y: introY }}>
        <p className="hud">Transmission 06 · Moon</p>
        <h2 className="display moon__title">
          We have
          <br />
          <span className="gradient-text moon__title-accent">been here before.</span>
        </h2>
        <p className="phrase">
          The first landing ran on <em>4 kilobytes</em> of RAM and an unreasonable amount of intention.
        </p>
      </motion.div>

      <motion.div className="container moon__copy moon__copy--mid" style={{ opacity: midOpacity, x: midX }}>
        <p className="phrase">
          Constraints are not the enemy of ambition. They are its <em>launchpad</em>.
        </p>
        <p className="body">
          The Apollo Guidance Computer had 72 KB of read-only memory, a 2 MHz clock and an interface made of three
          buttons and a number pad. Its designers shipped the most important user experience of the century. Today
          the tab you're reading this in has a million times the memory. The question was never the hardware.
        </p>
        <p className="hud hud--lime">Drag to orbit · scroll to change the phase · click to choose a landing site</p>
      </motion.div>

      <motion.div className="container moon__copy moon__copy--outro" style={{ opacity: outroOpacity, y: outroY }}>
        <p className="phrase moon__outro-phrase">
          So pick a crater. Name it. <em>Build</em> the thing that gets us there.
        </p>
        <p className="body">
          That's the whole philosophy, in two views: the art taught me how to see; the technology keeps teaching me
          how little of what I know will matter in ten years — and how much the seeing will. Let's go somewhere new.
        </p>
      </motion.div>

      <AnimatePresence>
        {landing && (
          <motion.div
            className="moon__toast glass"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hud hud--lime">Touchdown confirmed</span>
            <strong>{landing.label}</strong>
            <span>{landing.sub}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
