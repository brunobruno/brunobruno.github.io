import { motion, useTransform } from 'framer-motion'
import { ParallaxSection, Reveal } from '../components/Parallax'
import './DeStijl.css'

/* Mondrian-style composition: each cell drifts at a different speed. */
const cells = [
  { c: 'red', area: '1 / 1 / 4 / 4', speed: 0.5 },
  { c: 'white', area: '1 / 4 / 2 / 7', speed: -0.2 },
  { c: 'blue', area: '2 / 4 / 4 / 5', speed: 0.9 },
  { c: 'white', area: '2 / 5 / 3 / 7', speed: 0.2 },
  { c: 'yellow', area: '3 / 5 / 4 / 7', speed: -0.6 },
  { c: 'white', area: '4 / 1 / 6 / 2', speed: 0.4 },
  { c: 'black', area: '4 / 2 / 5 / 3', speed: -0.9 },
  { c: 'white', area: '4 / 3 / 6 / 7', speed: 0.1 },
  { c: 'yellow', area: '5 / 2 / 6 / 3', speed: 0.7 },
]

export default function DeStijl() {
  return (
    <ParallaxSection id="destijl" className="destijl">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  return (
    <>
      <div className="destijl__canvas" aria-hidden>
        {cells.map((cell, i) => (
          <Cell key={i} p={p} {...cell} />
        ))}
      </div>

      <div className="container destijl__content">
        <Reveal>
          <p className="eyebrow">De Stijl, 1917</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display destijl__title">
            Structure
            <br />
            <span className="outline">is freedom</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="phrase">
            Mondrian reduced the world to lines and primaries — and found <em>infinite</em> room inside the grid.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="body">
            A design system is the same bet: constrain the vocabulary so the team can speak faster. Tokens, components,
            contracts between frontend and backend. The tools come and go — the grid stays.
          </p>
        </Reveal>
      </div>
    </>
  )
}

function Cell({ p, c, area, speed }) {
  const y = useTransform(p, [0, 1], [speed * 120, -speed * 120])
  return <motion.div className={`destijl__cell destijl__cell--${c}`} style={{ gridArea: area, y }} />
}
