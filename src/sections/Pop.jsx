import { motion, useTransform } from 'framer-motion'
import { ParallaxSection, Reveal } from '../components/Parallax'
import './Pop.css'

const words = ['Ship', 'Learn', 'Repeat']
const palettes = [
  ['#ff3fa4', '#ffe600'],
  ['#19c3e6', '#0b0b0d'],
  ['#ffe600', '#d7261e'],
  ['#0b0b0d', '#19c3e6'],
  ['#d7261e', '#ff3fa4'],
  ['#c6ff3f', '#1f3fbf'],
]

export default function Pop() {
  return (
    <ParallaxSection id="pop" className="pop">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const marqueeA = useTransform(p, [0, 1], ['0%', '-40%'])
  const marqueeB = useTransform(p, [0, 1], ['-40%', '0%'])
  return (
    <>
      <div className="pop__grid" aria-hidden>
        {palettes.map(([bg, fg], i) => (
          <Tile key={i} p={p} bg={bg} fg={fg} i={i} />
        ))}
      </div>

      <motion.div className="pop__marquee pop__marquee--top display" style={{ x: marqueeA }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i}>{words.join(' · ')} · </span>
        ))}
      </motion.div>
      <motion.div className="pop__marquee pop__marquee--bottom display" style={{ x: marqueeB }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i}>18 years · 4 countries · 5 languages · </span>
        ))}
      </motion.div>

      <div className="container pop__content">
        <Reveal>
          <p className="eyebrow">Pop Art, 1962</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display pop__title">
            Repetition is
            <br />
            <span className="pop__title-pink">not boring.</span>
            <br />
            <span className="pop__title-sm">It's mastery.</span>
          </h2>
        </Reveal>
        <div className="pop__cols">
          <Reveal delay={0.2}>
            <p className="phrase">
              Warhol printed the same soup can thirty-two times and made us <em>see</em> it for the first time.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="body">
              Production software is pop art: the same login, the same table, the same form — shipped again and again
              until it becomes invisible. Newspaper paywalls, lottery apps, hospital kiosks, government portals, CRMs
              for millions. The craft is in making the thirty-second one better than the first.
            </p>
          </Reveal>
        </div>
      </div>
    </>
  )
}

function Tile({ p, bg, fg, i }) {
  const y = useTransform(p, [0, 1], [(i % 3) * 80 - 80, -((i % 3) * 80 - 80)])
  const rotate = useTransform(p, [0, 1], [i % 2 ? -6 : 6, i % 2 ? 6 : -6])
  return (
    <motion.div className="pop__tile" style={{ background: bg, color: fg, y, rotate }}>
      <span className="display pop__tile-glyph">{'</>'}</span>
      <span className="pop__tile-dots" />
    </motion.div>
  )
}
