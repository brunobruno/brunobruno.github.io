import { useEffect, useRef } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { PinnedSection } from '../../components/Parallax'
import { LiveCounter } from '../components/Counter'
import { useWorld } from '../world'
import './Population.css'

// UN World Population Prospects 2024: ~+70M people / year net ≈ 2.2 per second
const NET_PER_SECOND = 2.2
const COLS = 50
const ROWS = 20
const TOTAL = COLS * ROWS

export default function Population() {
  return (
    <PinnedSection id="population" className="people" height="300vh">
      {(p) => <Scene p={p} />}
    </PinnedSection>
  )
}

function Scene({ p }) {
  const { data } = useWorld()
  const base = data?.world.population ?? 8.2e9
  const year = data?.world.year ?? new Date().getFullYear() - 1
  const since = Date.UTC(year, 6, 1) // World Bank totals are mid-year estimates
  const perDot = base / TOTAL

  const lit = useTransform(p, [0.08, 0.62], [0, 1])
  const matrixOpacity = useTransform(p, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
  const matrixScale = useTransform(p, [0, 0.5, 1], [0.92, 1, 1.06])
  const headOpacity = useTransform(p, [0, 0.3, 0.4], [1, 1, 0])
  const headY = useTransform(p, [0, 0.4], [0, -40])
  const clockOpacity = useTransform(p, [0.42, 0.52, 0.78, 0.86], [0, 1, 1, 0])
  const clockScale = useTransform(p, [0.42, 0.52], [0.9, 1])
  const outroOpacity = useTransform(p, [0.86, 0.94], [0, 1])
  const outroY = useTransform(p, [0.86, 0.96], [40, 0])

  return (
    <>
      <motion.div className="people__matrix-wrap" style={{ opacity: matrixOpacity, scale: matrixScale }}>
        <DotMatrix lit={lit} />
      </motion.div>

      <motion.div className="container people__head" style={{ opacity: headOpacity, y: headY }}>
        <p className="hud">Transmission 05 · People</p>
        <h2 className="display people__title">
          Eight billion
          <br />
          <span className="gradient-text people__title-accent">reasons to care.</span>
        </h2>
        <p className="phrase">
          Each dot is <em>{Math.round(perDot / 1e6)} million</em> people. Keep scrolling and watch them arrive.
        </p>
      </motion.div>

      <motion.div className="people__clock glass" style={{ opacity: clockOpacity, scale: clockScale }}>
        <p className="hud hud--lime">Humans on Earth · live estimate</p>
        <p className="stat people__number">
          <LiveCounter value={base} since={since} rate={NET_PER_SECOND} format={(n) => Math.floor(n).toLocaleString('en-US')} />
        </p>
        <div className="people__rates">
          <span>
            <b>+4.3</b> births / s
          </span>
          <span className="people__rates-sep" />
          <span>
            <b>−1.9</b> deaths / s
          </span>
          <span className="people__rates-sep" />
          <span>
            <b>+{NET_PER_SECOND}</b> net / s
          </span>
        </div>
        <p className="hud people__src">World Bank {year} baseline · UN WPP 2024 rates</p>
      </motion.div>

      <motion.div className="container people__outro" style={{ opacity: outroOpacity, y: outroY }}>
        <p className="phrase people__outro-phrase">
          Not "users". <em>Neighbours</em> with a screen.
        </p>
        <p className="body">
          Roughly one person in three has never opened a browser. Most who have are on a four-year-old phone, on a
          slow connection, in a language your design system didn't ship. The accessible version isn't the edge case —
          it's the planet.
        </p>
      </motion.div>
    </>
  )
}

/** Canvas grid of 1,000 dots that light up as `lit` (0→1) advances; lit dots breathe softly. */
function DotMatrix({ lit }) {
  const ref = useRef(null)
  const litRef = useRef(0)
  useMotionValueEvent(lit, 'change', (v) => (litRef.current = v))

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf, w, h, t = 0
    // deterministic per-dot jitter so the wave front feels organic
    const jitter = Array.from({ length: TOTAL }, (_, i) => ((i * 7919) % 97) / 97)

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const frame = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)
      const cell = Math.min(w / COLS, h / ROWS)
      const ox = (w - cell * COLS) / 2
      const oy = (h - cell * ROWS) / 2
      const front = litRef.current * (TOTAL + 60)
      for (let i = 0; i < TOTAL; i++) {
        const col = i % COLS
        const row = (i / COLS) | 0
        const x = ox + col * cell + cell / 2
        const y = oy + row * cell + cell / 2
        const on = Math.max(0, Math.min(1, (front - i - jitter[i] * 60) / 40))
        if (on <= 0) {
          ctx.fillStyle = 'rgba(207,232,255,0.07)'
          ctx.beginPath()
          ctx.arc(x, y, cell * 0.12, 0, Math.PI * 2)
          ctx.fill()
          continue
        }
        const pulse = 0.75 + 0.25 * Math.sin(t * 1.6 + col * 0.35 + row * 0.5)
        const r = cell * (0.12 + 0.2 * on * pulse)
        const hot = on * pulse
        ctx.fillStyle = `rgba(${Math.round(25 + 173 * hot)},${Math.round(195 + 60 * hot)},${Math.round(230 - 167 * hot)},${0.35 + 0.65 * on})`
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(frame)
      } else {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })

    resize()
    io.observe(canvas)
    window.addEventListener('resize', resize)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="people__matrix" aria-hidden />
}
