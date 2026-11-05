import { motion, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import { tenure } from '../../data/content'
import './Backend.css'

// Stack Overflow Developer Survey 2025 — % of professional developers using each (≈)
const LANGS = [
  { name: 'JavaScript', pct: 66, mine: true },
  { name: 'Python', pct: 57, mine: true },
  { name: 'SQL', pct: 51, mine: true },
  { name: 'TypeScript', pct: 44, mine: true },
  { name: 'Java', pct: 30 },
  { name: 'C#', pct: 27 },
  { name: 'C++', pct: 23 },
  { name: 'PHP', pct: 19, mine: true },
  { name: 'Go', pct: 14 },
  { name: 'Rust', pct: 13 },
]

const FRAMES = [
  { name: 'Node.js', pct: 49, mine: true },
  { name: 'Express', pct: 22, mine: true },
  { name: 'FastAPI', pct: 16 },
  { name: 'Spring Boot', pct: 15 },
  { name: '.NET', pct: 15 },
  { name: 'Django', pct: 11 },
  { name: 'Laravel', pct: 7, mine: true },
  { name: 'Flask', pct: 8 },
  { name: 'NestJS', pct: 6, mine: true },
  { name: 'Rails', pct: 4 },
]

export default function Backend() {
  return (
    <PinnedSection id="backend" className="backend" height="300vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const introOpacity = useTransform(p, [0, 0.2, 0.3], [1, 1, 0])
  const introY = useTransform(p, [0, 0.3], [0, -50])
  const chartOpacity = useTransform(p, [0.1, 0.3, 0.88, 1], [0.4, 1, 1, 0])
  const chartX = useTransform(p, [0, 0.35, 0.45, 0.72, 0.82], ['10vw', '10vw', '-14vw', '-14vw', '0vw'])
  const midOpacity = useTransform(p, [0.42, 0.52, 0.7, 0.78], [0, 1, 1, 0])
  const outroOpacity = useTransform(p, [0.8, 0.9], [0, 1])

  return (
    <>
      <motion.div className="container backend__copy backend__copy--intro" style={{ opacity: introOpacity, y: introY }}>
        <p className="hud hud--lime">Transmission 03 · Backend</p>
        <h2 className="display backend__title">
          What the back
          <br />
          <span className="gradient-text backend__title-accent">of the house runs.</span>
        </h2>
        <p className="phrase">
          The invisible half has a <em>ranking</em> — and I'm fluent in the top rows.
        </p>
      </motion.div>

      <motion.div className="backend__charts" style={{ opacity: chartOpacity, x: chartX }}>
        <Chart p={p} title="Languages" src="Stack Overflow Survey 2025" rows={LANGS} offset={0.32} />
        <Chart p={p} title="Frameworks & runtimes" src="same survey" rows={FRAMES} offset={0.42} />
        <motion.div className="backend__legend" style={{ opacity: useTransform(p, [0.6, 0.7], [0, 1]) }}>
          <span><i className="backend__sw backend__sw--mine" /> in my daily kit</span>
          <span><i className="backend__sw backend__sw--other" /> the rest of the field</span>
        </motion.div>
      </motion.div>

      <motion.div className="container backend__copy backend__copy--mid" style={{ opacity: midOpacity }}>
        <p className="phrase">
          Five of the top ten languages live in my <em>repos</em> — the rest are one project away.
        </p>
        <p className="body">
          Node for services and kiosks, Laravel to rescue a two-year-delayed legacy system, Python on intelligence
          platforms, SQL under everything. The list isn't trivia — it's a map of where I've already worked.
        </p>
      </motion.div>

      <motion.div className="container backend__copy backend__copy--outro" style={{ opacity: outroOpacity }}>
        <p className="backend__stack">
          {['Node', 'Express', 'Laravel', 'GraphQL', 'REST', 'SQL', 'Docker', 'Azure', 'CI/CD'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
        <p className="phrase backend__closing">
          {tenure().years}+ years behind the glass — the part users <em>never</em> see is the part I own.
        </p>
      </motion.div>
    </>
  )
}

function Chart({ p, title, src, rows, offset }) {
  const headOpacity = useTransform(p, [offset - 0.04, offset], [0, 1])
  return (
    <div className="glass backend__chart">
      <motion.div className="backend__chart-head" style={{ opacity: headOpacity }}>
        <span className="wide">{title}</span>
        <span className="hud">{src}</span>
      </motion.div>
      {rows.map((r, i) => (
        <Row key={r.name} p={p} i={i} r={r} offset={offset} />
      ))}
    </div>
  )
}

function Row({ p, i, r, offset }) {
  const start = offset + i * 0.032
  const scaleX = useTransform(p, [start, start + 0.09], [0, 1])
  const opacity = useTransform(p, [start, start + 0.05], [0, 1])
  return (
    <div className={`backend__row ${r.mine ? 'backend__row--mine' : ''}`}>
      <motion.span className="backend__row-name" style={{ opacity }}>
        {r.mine && <i className="backend__dot" />}
        {r.name}
      </motion.span>
      <div className="backend__row-track">
        <motion.span className="backend__row-fill" style={{ scaleX }} />
      </div>
      <motion.span className="backend__row-pct" style={{ opacity }}>{r.pct}%</motion.span>
    </div>
  )
}
