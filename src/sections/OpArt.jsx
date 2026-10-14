import { motion, useTransform } from 'framer-motion'
import { PinnedSection } from '../components/Parallax'
import './OpArt.css'

export default function OpArt() {
  return (
    <PinnedSection id="opart" className="op" height="200vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  // two ring fields drift apart and back together -> moiré interference
  const ax = useTransform(p, [0, 0.5, 1], ['-6vw', '4vw', '14vw'])
  const ay = useTransform(p, [0, 1], ['-4vh', '6vh'])
  const bx = useTransform(p, [0, 0.5, 1], ['6vw', '-2vw', '-14vw'])
  const by = useTransform(p, [0, 1], ['4vh', '-6vh'])
  const aScale = useTransform(p, [0, 1], [1, 1.25])
  const bScale = useTransform(p, [0, 1], [1.1, 0.95])

  const word1 = useTransform(p, [0, 1], ['-10%', '10%'])
  const word2 = useTransform(p, [0, 1], ['10%', '-10%'])
  const copyOpacity = useTransform(p, [0.3, 0.45, 0.85, 1], [0, 1, 1, 0])
  const ringColor = useTransform(p, [0, 1], ['#e9e2d3', '#c6ff3f'])

  return (
    <>
      <motion.div className="op__rings op__rings--a" style={{ x: ax, y: ay, scale: aScale }} />
      <motion.div className="op__rings op__rings--b" style={{ x: bx, y: by, scale: bScale, '--ring': ringColor }} />

      <div className="op__words" aria-hidden>
        <motion.span className="display op__word" style={{ x: word1 }}>
          ILLUSION
        </motion.span>
        <motion.span className="display op__word op__word--outline" style={{ x: word2 }}>
          IS INTERFACE
        </motion.span>
      </div>

      <motion.div className="container op__copy" style={{ opacity: copyOpacity }}>
        <p className="eyebrow">Op Art, 1964</p>
        <p className="phrase">
          Riley painted still lines that <em>refuse</em> to stay still. The movement happens in you.
        </p>
        <p className="body">
          Every interface is an optical contract: nothing on the screen is real, yet it must feel solid, fast and
          true. Perception is the medium. I design for the eye first, the DOM second.
        </p>
      </motion.div>
    </>
  )
}
