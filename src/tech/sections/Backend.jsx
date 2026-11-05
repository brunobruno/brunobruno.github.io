import { motion, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import Counter from '../components/Counter'
import { tenure } from '../../data/content'
import './Backend.css'

const STREAMS = Array.from({ length: 9 }, (_, i) => ({
  top: 6 + i * 11,
  dur: 9 + (i % 4) * 3,
  delay: -i * 1.7,
  width: 18 + (i % 3) * 10,
  hue: i % 3 === 0 ? 'var(--lime)' : i % 3 === 1 ? 'var(--cyan)' : 'var(--violet)',
}))

// The request journey: client → edge → API → services/queues → data → response.
const NODES = [
  { id: 'client', x: 4, y: 25, w: 15, h: 10, label: 'Clients', sub: 'web · iOS · Android' },
  { id: 'edge', x: 27, y: 25, w: 14, h: 10, label: 'Edge', sub: 'CDN · TLS' },
  { id: 'api', x: 49, y: 25, w: 14, h: 10, label: 'API', sub: 'REST · GraphQL' },
  { id: 'svc', x: 71, y: 11, w: 16, h: 10, label: 'Services', sub: 'Node · Laravel · Py' },
  { id: 'queue', x: 71, y: 41, w: 16, h: 10, label: 'Queues', sub: 'jobs · events' },
  { id: 'data', x: 94, y: 25, w: 16, h: 10, label: 'Data', sub: 'SQL · cache' },
]

const EDGES = [
  [19, 30, 27, 30],
  [41, 30, 49, 30],
  [63, 28, 71, 18],
  [63, 32, 71, 44],
  [87, 18, 94, 28],
  [87, 44, 94, 32],
]

const RESPONSE = 'M 94,28 C 70,4 34,4 11,27'

export default function Backend() {
  return (
    <PinnedSection id="backend" className="backend" height="320vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const streamsOpacity = useTransform(p, [0, 0.15, 0.85, 1], [0, 0.6, 0.6, 0])

  // pipeline staging: centred → shifts left for the mid copy → centres for the outro
  const pipeScale = useTransform(p, [0, 0.3], [0.6, 1])
  const pipeOpacity = useTransform(p, [0, 0.12, 0.88, 1], [0.3, 1, 1, 0])
  const pipeX = useTransform(p, [0, 0.3, 0.42, 0.7, 0.8], ['8vw', '8vw', '-16vw', '-16vw', '0vw'])

  const introOpacity = useTransform(p, [0, 0.3, 0.38], [1, 1, 0])
  const introY = useTransform(p, [0, 0.38], [0, -60])
  const midOpacity = useTransform(p, [0.4, 0.5, 0.68, 0.76], [0, 1, 1, 0])
  const midY = useTransform(p, [0.4, 0.76], [40, -40])
  const outroOpacity = useTransform(p, [0.78, 0.88], [0, 1])
  const outroY = useTransform(p, [0.78, 0.9], [60, 0])

  const nodeDraw = useTransform(p, [0.1, 0.45], [0, 1])
  const edgeDraw = useTransform(p, [0.3, 0.62], [0, 1])
  const respDraw = useTransform(p, [0.6, 0.78], [0, 1])
  const respOffset = useTransform(respDraw, (d) => 1 - d)

  return (
    <>
      <motion.div className="backend__streams" style={{ opacity: streamsOpacity }} aria-hidden>
        {STREAMS.map((s, i) => (
          <span
            key={i}
            className="backend__stream"
            style={{ top: `${s.top}%`, '--dur': `${s.dur}s`, '--delay': `${s.delay}s`, '--w': `${s.width}vw`, '--hue': s.hue }}
          />
        ))}
      </motion.div>

      <motion.div className="backend__pipe" style={{ scale: pipeScale, opacity: pipeOpacity, x: pipeX }}>
        <svg viewBox="0 0 116 56" className="backend__diagram" role="img" aria-label="Request journey diagram">
          {/* response arc, drawn last */}
          <motion.path
            d={RESPONSE}
            fill="none"
            stroke="var(--lime)"
            strokeWidth="0.5"
            strokeDasharray="1.4 1.4"
            pathLength="1"
            style={{ strokeDashoffset: respOffset }}
          />
          <motion.text
            className="backend__resp-label"
            x="52"
            y="7"
            style={{ opacity: respDraw }}
          >
            response · ms
          </motion.text>

          {/* edges */}
          {EDGES.map(([x1, y1, x2, y2], i) => (
            <Edge key={i} x1={x1} y1={y1} x2={x2} y2={y2} draw={edgeDraw} i={i} />
          ))}

          {/* nodes */}
          {NODES.map((n, i) => (
            <Node key={n.id} n={n} draw={nodeDraw} order={i} />
          ))}
        </svg>
      </motion.div>

      <motion.div className="container backend__copy backend__copy--intro" style={{ opacity: introOpacity, y: introY }}>
        <p className="hud hud--lime">Transmission 03 · Backend</p>
        <h2 className="display backend__title">
          The invisible
          <br />
          <span className="gradient-text backend__title-accent">half.</span>
        </h2>
        <p className="phrase">
          Every tap on a screen is a thousand requests you never see — and that's the part I <em>love</em> most.
        </p>
      </motion.div>

      <motion.div className="container backend__copy backend__copy--mid" style={{ opacity: midOpacity, y: midY }}>
        <p className="phrase">
          Web, native and hybrid apps, kiosks — every surface stands on <em>services</em> I designed.
        </p>
        <p className="body">
          REST & GraphQL APIs, queues and workers, databases, deploys. A two-year-delayed legacy PHP system for the EU
          rescued with a Laravel middleware. Hospital kiosks in Node. Hybrid mobile apps in Cordova and PWAs that
          behave like natives. The visible half of an app is the easy half.
        </p>
        <p className="backend__chips">
          {['Node', 'Laravel', 'Python', 'GraphQL', 'REST', 'SQL', 'Docker', 'Azure', 'CI/CD'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
      </motion.div>

      <motion.div className="container backend__copy backend__copy--outro" style={{ opacity: outroOpacity, y: outroY }}>
        <div className="backend__facts">
          <Fact value={5} fmt={(n) => `${Math.round(n)}`} label="platforms shipped: web, PWA, hybrid, kiosk, API" src="across 18+ apps" />
          <Fact value={tenure().years} fmt={(n) => `${Math.round(n)}+`} label="years building both halves — glass and engine" src={`since 2008 · ${tenure().months} mo ${tenure().days} d today`} />
          <Fact value={24} fmt={(n) => `${Math.round(n)} mo`} label="of delay recovered on one legacy migration" src="EASA · Laravel middleware" />
        </div>
        <p className="phrase backend__closing">
          The pretty half gets the applause. The invisible half gets the <em>uptime</em>.
        </p>
      </motion.div>
    </>
  )
}

function Node({ n, draw, order }) {
  const opacity = useTransform(draw, [order * 0.14, order * 0.14 + 0.14], [0, 1])
  const y = useTransform(draw, [order * 0.14, order * 0.14 + 0.14], [4, 0])
  return (
    <motion.g style={{ opacity, y }}>
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="2" className="backend__node" />
      <text x={n.x + n.w / 2} y={n.y + 4} className="backend__node-label">{n.label}</text>
      <text x={n.x + n.w / 2} y={n.y + 7.6} className="backend__node-sub">{n.sub}</text>
      <circle cx={n.x + n.w / 2} cy={n.y + n.h + 2} r="0.7" className="backend__node-dot" />
    </motion.g>
  )
}

function Edge({ x1, y1, x2, y2, draw, i }) {
  const window0 = i * 0.1
  const dashoffset = useTransform(draw, (d) => {
    const t = Math.min(1, Math.max(0, (d - window0) / (1 - window0)))
    return 1 - t
  })
  return (
    <>
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="var(--cyan)"
        strokeWidth="0.6"
        pathLength="1"
        strokeDasharray="1"
        style={{ strokeDashoffset: dashoffset }}
      />
      {/* request packet travelling along the edge once it exists */}
      <motion.circle
        r="0.9"
        className="backend__packet"
        style={{
          opacity: dashoffset.get() < 0.05 ? 1 : 0,
          offsetPath: `path('M ${x1} ${y1} L ${x2} ${y2}')`,
          animationDelay: `${i * 0.6}s`,
          animationDuration: '1.6s',
        }}
      />
    </>
  )
}

function Fact({ value, fmt, label, src }) {
  return (
    <div className="glass backend__fact">
      <p className="stat backend__fact-value">
        <Counter value={value} format={fmt} duration={2} />
      </p>
      <p className="backend__fact-label">{label}</p>
      <p className="hud">{src}</p>
    </div>
  )
}
