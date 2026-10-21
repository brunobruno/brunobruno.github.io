import { motion, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import './Evolution.css'

const eras = [
  { year: '−2.6M', name: 'Stone', note: 'The first interface was an edge.' },
  { year: '1440', name: 'Press', note: 'Ideas learned to copy themselves.' },
  { year: '1947', name: 'Transistor', note: 'Logic became small enough to hide.' },
  { year: '1991', name: 'Web', note: 'Every screen became a window.' },
  { year: '2007', name: 'Touch', note: 'The interface disappeared into the hand.' },
  { year: '2022', name: 'Models', note: 'Software started to write software.' },
  { year: 'Now', name: 'You', note: 'The next tool is the one you choose to learn.' },
]

export default function Evolution() {
  return (
    <PinnedSection id="evolution" className="evo" height="380vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  // act 1 – title; act 2 – the timeline flies past; act 3 – the closing line
  const titleOpacity = useTransform(p, [0, 0.22, 0.3], [1, 1, 0])
  const titleY = useTransform(p, [0, 0.3], [0, -120])
  const titleScale = useTransform(p, [0, 0.3], [1, 0.9])

  const railOpacity = useTransform(p, [0.26, 0.34, 0.78, 0.86], [0, 1, 1, 0])
  const railX = useTransform(p, [0.3, 0.82], ['55vw', '-62vw'])
  const beamScale = useTransform(p, [0.3, 0.82], [0, 1])

  const outroOpacity = useTransform(p, [0.84, 0.92, 1], [0, 1, 1])
  const outroY = useTransform(p, [0.84, 0.94], [60, 0])

  const ring1 = useTransform(p, [0, 1], [0, 140])
  const ring2 = useTransform(p, [0, 1], [0, -220])
  const ring3 = useTransform(p, [0, 1], [0, 90])
  const ringScale = useTransform(p, [0, 1], [0.8, 1.35])
  const sunGlow = useTransform(p, [0, 0.5, 1], [0.35, 0.7, 0.25])

  return (
    <>
      <motion.div className="evo__sun" style={{ opacity: sunGlow }} />
      <motion.div className="evo__rings" style={{ scale: ringScale }}>
        <motion.div className="orbit evo__ring evo__ring--1" style={{ rotate: ring1 }} />
        <motion.div className="orbit evo__ring evo__ring--2" style={{ rotate: ring2 }} />
        <motion.div className="orbit evo__ring evo__ring--3" style={{ rotate: ring3 }} />
      </motion.div>

      <motion.div className="container evo__title-wrap" style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}>
        <motion.p
          className="hud"
          initial={{ opacity: 0, letterSpacing: '0.9em' }}
          animate={{ opacity: 1, letterSpacing: '0.34em' }}
          transition={{ delay: 0.4, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          Transmission 01 · Evolution
        </motion.p>
        <h1 className="display evo__title">
          <motion.span
            initial={{ opacity: 0, y: 70, filter: 'blur(16px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Nothing
          </motion.span>
          <motion.span
            className="gradient-text evo__title-accent"
            initial={{ opacity: 0, y: 70, filter: 'blur(16px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.45, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            stays built.
          </motion.span>
        </h1>
        <motion.p
          className="serif evo__tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
        >
          Technology is a <em>verb</em>, not a noun.
        </motion.p>
        <motion.p
          className="evo__lede"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.2 }}
        >
          I've rebuilt my toolkit five times in eighteen years — jQuery to Angular to React, PHP to Node to models that
          write Node. Every stack I ever mastered is now a museum piece, and that is the most exciting thing about this
          job. The tools evolve; the craft is learning to evolve with them, and knowing which parts of you shouldn't.
        </motion.p>
        <motion.p
          className="italic evo__quote"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 1.2 }}
        >
          “The future is not a place we go. It's a thing we compile.”
        </motion.p>
        <motion.div className="evo__scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}>
          <span>Scroll to launch</span>
          <span className="evo__scroll-line" />
        </motion.div>
      </motion.div>

      <motion.div className="evo__rail" style={{ opacity: railOpacity }}>
        <motion.div className="evo__beam" style={{ scaleX: beamScale }} />
        <motion.div className="evo__eras" style={{ x: railX }}>
          {eras.map((e, i) => (
            <Era key={e.name} e={e} i={i} p={p} />
          ))}
        </motion.div>
      </motion.div>

      <motion.div className="container evo__outro" style={{ opacity: outroOpacity, y: outroY }}>
        <p className="hud hud--lime">What stayed</p>
        <p className="phrase evo__outro-phrase">
          Frameworks expire. <em>Curiosity</em> compounds.
        </p>
        <p className="body">
          So this second journey is not about what I know today. It's about the forces that keep rewriting the
          ground under all of us — the planet, its money, its machines and its people — and why that is a reason to
          build, not to fear.
        </p>
      </motion.div>
    </>
  )
}

function Era({ e, i, p }) {
  // each era brightens as it crosses the centre of the viewport
  const centre = 0.3 + ((i + 0.5) / eras.length) * 0.52
  const glow = useTransform(p, [centre - 0.09, centre, centre + 0.09], [0.45, 1, 0.45])
  const lift = useTransform(p, [centre - 0.09, centre, centre + 0.09], [24, -10, 24])
  const scale = useTransform(p, [centre - 0.09, centre, centre + 0.09], [0.9, 1.08, 0.9])
  return (
    <motion.article className="evo__era" style={{ opacity: glow, y: lift, scale }}>
      <span className="evo__era-dot" />
      <span className="hud">{e.year}</span>
      <h3 className="wide evo__era-name">{e.name}</h3>
      <p className="evo__era-note">{e.note}</p>
    </motion.article>
  )
}
