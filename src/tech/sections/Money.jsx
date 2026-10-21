import { useMemo } from 'react'
import { motion, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import Counter from '../components/Counter'
import { useWorld } from '../world'
import { money } from '../data/worldbank'
import './Money.css'

const STREAMS = Array.from({ length: 9 }, (_, i) => ({
  top: 6 + i * 11,
  dur: 9 + (i % 4) * 3,
  delay: -i * 1.7,
  width: 18 + (i % 3) * 10,
  hue: i % 3 === 0 ? 'var(--lime)' : i % 3 === 1 ? 'var(--cyan)' : 'var(--violet)',
}))

const PALETTE = ['#c6ff3f', '#9ef0a6', '#6fdbd0', '#19c3e6', '#4aa8ff', '#7c7cf2', '#8b5cf6', '#b06af0', '#e07bd6', '#ff8fb3']

export default function Money() {
  return (
    <PinnedSection id="money" className="money" height="320vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const { data } = useWorld()
  const worldGdp = data?.world.gdp ?? 110e12
  const slices = useMemo(() => {
    if (!data) return []
    const ranked = Object.entries(data.gdp)
      .map(([id, v]) => ({ id, name: v.name, gdp: v.value }))
      .sort((a, b) => b.gdp - a.gdp)
      .slice(0, 10)
    let offset = 0
    return ranked.map((r, i) => {
      const share = r.gdp / worldGdp
      const s = { ...r, share, offset, color: PALETTE[i] }
      offset += share
      return s
    })
  }, [data, worldGdp])
  const covered = slices.reduce((a, s) => a + s.share, 0)

  const ringScale = useTransform(p, [0, 0.3], [0.6, 1])
  const ringOpacity = useTransform(p, [0, 0.12, 0.88, 1], [0.3, 1, 1, 0])
  // intro: ring sits right of the headline; mid: slides left to make room for the copy; outro: centred
  const ringX = useTransform(p, [0, 0.3, 0.42, 0.7, 0.8], ['17vw', '17vw', '-18vw', '-18vw', '0vw'])
  const legendOpacity = useTransform(p, [0.38, 0.46, 0.7, 0.78], [0, 1, 1, 0])
  const ringRotate = useTransform(p, [0, 1], [-90, 30])
  const draw = useTransform(p, [0.1, 0.55], [0, 1])
  const restDraw = useTransform(p, [0.5, 0.7], [0, 1])

  const introOpacity = useTransform(p, [0, 0.3, 0.38], [1, 1, 0])
  const introY = useTransform(p, [0, 0.38], [0, -60])
  const midOpacity = useTransform(p, [0.4, 0.5, 0.68, 0.76], [0, 1, 1, 0])
  const midY = useTransform(p, [0.4, 0.76], [40, -40])
  const outroOpacity = useTransform(p, [0.78, 0.88], [0, 1])
  const outroY = useTransform(p, [0.78, 0.9], [60, 0])
  const streamsOpacity = useTransform(p, [0, 0.15, 0.85, 1], [0, 0.6, 0.6, 0])

  return (
    <>
      <motion.div className="money__streams" style={{ opacity: streamsOpacity }} aria-hidden>
        {STREAMS.map((s, i) => (
          <span
            key={i}
            className="money__stream"
            style={{ top: `${s.top}%`, '--dur': `${s.dur}s`, '--delay': `${s.delay}s`, '--w': `${s.width}vw`, '--hue': s.hue }}
          />
        ))}
      </motion.div>

      <motion.div className="money__ring-wrap" style={{ scale: ringScale, opacity: ringOpacity, x: ringX }}>
        <motion.svg className="money__ring" viewBox="-110 -110 220 220" style={{ rotate: ringRotate }}>
          <circle r="92" fill="none" stroke="rgba(207,232,255,0.07)" strokeWidth="14" />
          <circle r="70" fill="none" stroke="rgba(207,232,255,0.05)" strokeWidth="0.6" strokeDasharray="1 3" />
          <circle r="104" fill="none" stroke="rgba(207,232,255,0.08)" strokeWidth="0.4" />
          {slices.map((s) => (
            <Slice key={s.id} s={s} draw={draw} />
          ))}
          <Rest start={covered} draw={restDraw} />
        </motion.svg>

        <div className="money__center">
          <p className="hud">Gross world product</p>
          <p className="stat money__total">
            <Counter value={worldGdp / 1e12} format={(n) => `$${n.toFixed(1)}T`} duration={2.6} />
          </p>
          <p className="hud money__center-sub">{data ? `World Bank · ${data.world.year}` : 'estimating…'}</p>
        </div>

        <motion.ul className="money__legend" style={{ opacity: legendOpacity }}>
          {slices.slice(0, 10).map((s) => (
            <li key={s.id}>
              <i style={{ background: s.color }} />
              <span>{s.name}</span>
              <b>{(s.share * 100).toFixed(1)}%</b>
            </li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div className="container money__copy money__copy--intro" style={{ opacity: introOpacity, y: introY }}>
        <p className="hud hud--lime">Transmission 03 · Capital</p>
        <h2 className="display money__title">
          Money is the
          <br />
          <span className="gradient-text money__title-accent">oldest software.</span>
        </h2>
        <p className="phrase">
          A shared <em>story</em> that runs on every human CPU, with no downtime since 600 BC.
        </p>
      </motion.div>

      <motion.div className="container money__copy money__copy--mid" style={{ opacity: midOpacity, y: midY }}>
        <p className="phrase">
          Ten economies write most of the <em>ledger</em>. The rest of the circle is 180 countries — and most of the
          future users.
        </p>
        <p className="body">
          Every dollar is a message about what we value. Technology didn't invent the message; it made it travel at
          the speed of light, settle in milliseconds and compound in places a bank branch never reached. Where
          capital goes, infrastructure follows — and interfaces follow infrastructure.
        </p>
      </motion.div>

      <motion.div className="container money__copy money__copy--outro" style={{ opacity: outroOpacity, y: outroY }}>
        <div className="money__facts">
          <Fact value={7.5} fmt={(n) => `$${n.toFixed(1)}T`} label="traded in FX markets every single day" src="BIS Triennial Survey, 2022" />
          <Fact value={worldGdp / (data?.world.population ?? 8.2e9)} fmt={(n) => money(n, 0)} label="of output per human being per year" src={`World Bank · ${data?.world.year ?? '—'}`} />
          <Fact value={65} fmt={(n) => `${Math.round(n)} ms`} label="for a payment to cross the Atlantic" src="Light in fibre, round trip" />
        </div>
        <p className="phrase money__closing">
          Design for the <em>whole</em> circle — not just the bright part.
        </p>
      </motion.div>
    </>
  )
}

function Slice({ s, draw }) {
  const dashoffset = useTransform(draw, (d) => 1 - s.share * d)
  return (
    <motion.circle
      r="92"
      fill="none"
      stroke={s.color}
      strokeWidth="14"
      pathLength="1"
      strokeDasharray="1"
      strokeLinecap="butt"
      style={{ strokeDashoffset: dashoffset, rotate: s.offset * 360 }}
    />
  )
}

function Rest({ start, draw }) {
  const share = Math.max(0, 1 - start)
  const dashoffset = useTransform(draw, (d) => 1 - share * d)
  return (
    <motion.circle
      r="92"
      fill="none"
      stroke="rgba(207,232,255,0.22)"
      strokeWidth="14"
      pathLength="1"
      strokeDasharray="1"
      style={{ strokeDashoffset: dashoffset, rotate: start * 360 }}
    />
  )
}

function Fact({ value, fmt, label, src }) {
  return (
    <div className="glass money__fact">
      <p className="stat money__fact-value">
        <Counter value={value} format={fmt} duration={2} />
      </p>
      <p className="money__fact-label">{label}</p>
      <p className="hud">{src}</p>
    </div>
  )
}
