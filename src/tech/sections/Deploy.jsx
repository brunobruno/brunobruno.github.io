import { motion, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import { tenurePhrase } from '../../data/content'
import './Deploy.css'

// the pipeline, in order — each stage becomes visible as scroll advances
const LOG = [
  { t: '$ git push origin main', cls: 'cmd' },
  { t: '▸ cloning repository…', cls: '' },
  { t: '▸ npm ci — 847 packages resolved', cls: '' },
  { t: '▸ vitest — 312 tests passed', cls: 'ok' },
  { t: '▸ vite build — 427 modules transformed', cls: 'ok' },
  { t: '▸ docker build -t app:sha-a94ff37', cls: '' },
  { t: '▸ pushing image to registry…', cls: '' },
  { t: '▸ kubectl rollout status deploy/app', cls: '' },
  { t: '✓ deployment "app" successfully rolled out', cls: 'ok' },
  { t: '✓ health checks passing — 3/3 replicas', cls: 'ok' },
  { t: '✓ live in production', cls: 'live' },
]

export default function Deploy() {
  return (
    <PinnedSection id="deploy" className="deploy" height="300vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const introOpacity = useTransform(p, [0, 0.22, 0.32], [1, 1, 0])
  const introY = useTransform(p, [0, 0.32], [0, -60])
  const termScale = useTransform(p, [0.05, 0.35, 0.9, 1], [0.85, 1, 1, 0.94])
  const termOpacity = useTransform(p, [0, 0.15, 0.9, 1], [0, 1, 1, 0.85])
  const outroOpacity = useTransform(p, [0.82, 0.92], [0, 1])
  const barScale = useTransform(p, [0.3, 0.82], [0, 1])

  return (
    <>
      <motion.div className="container deploy__copy deploy__copy--intro" style={{ opacity: introOpacity, y: introY }}>
        <p className="hud hud--lime">Transmission 06 · Deploy</p>
        <h2 className="display deploy__title">
          Code is poetry.
          <br />
          <span className="gradient-text deploy__title-accent">Deploys are proof.</span>
        </h2>
        <p className="phrase">
          The prettiest architecture means nothing until it <em>survives</em> production.
        </p>
      </motion.div>

      <motion.div className="deploy__term glass" style={{ scale: termScale, opacity: termOpacity }}>
        <div className="deploy__term-bar">
          <span className="deploy__dot" /><span className="deploy__dot" /><span className="deploy__dot" />
          <span className="deploy__term-title">ci/cd — main</span>
        </div>
        <div className="deploy__term-body">
          {LOG.map((l, i) => (
            <Line key={i} p={p} i={i} line={l} />
          ))}
          <motion.span className="deploy__cursor" style={{ opacity: useTransform(p, [0.9, 0.95], [0, 1]) }}>▌</motion.span>
        </div>
        <motion.div className="deploy__bar" style={{ scaleX: barScale }} />
      </motion.div>

      <motion.div className="container deploy__copy deploy__copy--outro" style={{ opacity: outroOpacity }}>
        <p className="phrase">
          {tenurePhrase()} of shipping — and every commit is still a small <em>promise</em> that tomorrow it works.
        </p>
        <p className="hud">web · native · hybrid · kiosk · api — one pipeline, five platforms</p>
      </motion.div>
    </>
  )
}

function Line({ p, i, line }) {
  const start = 0.3 + i * 0.045
  const opacity = useTransform(p, [start, start + 0.03], [0, 1])
  const x = useTransform(p, [start, start + 0.03], [-8, 0])
  return (
    <motion.p className={`deploy__line deploy__line--${line.cls}`} style={{ opacity, x }}>
      {line.t}
    </motion.p>
  )
}
