import { motion, useTransform } from 'framer-motion'
import { ParallaxSection, Layer, Reveal } from '../../components/Parallax'
import Counter from '../components/Counter'
import './Technology.css'

// years (approx.) for each technology to reach ~100 million users — widely cited figures
const adoption = [
  { name: 'Telephone', years: 75 },
  { name: 'Radio', years: 38 },
  { name: 'Television', years: 13 },
  { name: 'Web', years: 7 },
  { name: 'Facebook', years: 4.5 },
  { name: 'Instagram', years: 2.5 },
  { name: 'ChatGPT', years: 2 / 12 },
]
const MAX = adoption[0].years

const columns = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 7.3 + 2) % 100,
  speed: 0.25 + ((i * 7) % 9) / 10,
  h: 24 + ((i * 13) % 40),
  delay: -(i * 1.3),
  dur: 6 + (i % 5) * 2,
}))

export default function Technology() {
  return (
    <ParallaxSection id="technology" className="techno">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const floorZ = useTransform(p, [0, 1], ['0px', '-260px'])
  const floorOpacity = useTransform(p, [0, 0.2, 0.8, 1], [0, 0.9, 0.9, 0])
  const horizon = useTransform(p, [0, 1], ['55%', '35%'])
  return (
    <>
      <motion.div className="techno__floor-wrap" style={{ opacity: floorOpacity }}>
        <motion.div className="techno__floor" style={{ z: floorZ }} />
        <motion.div className="techno__horizon" style={{ top: horizon }} />
      </motion.div>

      {columns.map((c, i) => (
        <Layer key={i} progress={p} speed={c.speed} className="techno__col" style={{ left: `${c.left}%`, '--h': `${c.h}vh`, '--delay': `${c.delay}s`, '--dur': `${c.dur}s` }} />
      ))}

      <div className="container techno__content">
        <div className="techno__lead">
          <Reveal>
            <p className="hud">Transmission 04 · Technology</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display techno__title">
              Every curve
              <br />
              <span className="gradient-text techno__title-accent">is getting steeper.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="phrase">
              The telephone took a lifetime to reach 100 million people. The last one took a <em>weekend</em>.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="body">
              Technology doesn't just change what we can do; it changes how fast the next change arrives. Money moves
              at the speed of code. Cities are organised by the apps on their phones. Elections, medicine, language,
              love — all now routed through interfaces somebody designed, on a deadline, with taste or without it.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="body">
              That's the responsibility hiding inside the word "frontend": we are the last layer between a trillion
              transistors and a human being. Make it kind. Make it clear. Make it fast enough to feel like trust.
            </p>
          </Reveal>
          <Reveal delay={0.45}>
            <p className="italic techno__note">
              There are now more connected devices than human beings — and every one of them ends in an interface.
            </p>
          </Reveal>
        </div>

        <div className="techno__side">
          <Reveal delay={0.15}>
            <div className="glass techno__chart">
              <p className="hud hud--lime">Time to 100 million users</p>
              {/* variants propagate from the list: a scaleX(0) bar has no box, so it could never observe itself */}
              <motion.ul initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
                {adoption.map((a, i) => (
                  <li key={a.name}>
                    <span className="techno__chart-name">{a.name}</span>
                    <span className="techno__chart-track">
                      <motion.i
                        variants={{ hidden: { scaleX: 0 }, show: { scaleX: Math.max(a.years / MAX, 0.012) } }}
                        transition={{ duration: 1.4, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </span>
                    <span className="techno__chart-val">
                      {a.years >= 1 ? `${a.years} yrs` : `${Math.round(a.years * 12)} months`}
                    </span>
                  </li>
                ))}
              </motion.ul>
            </div>
          </Reveal>

          <div className="techno__stats">
            <Reveal delay={0.2}>
              <div className="glass techno__stat">
                <p className="stat techno__stat-value">
                  <Counter value={5.5} format={(n) => `${n.toFixed(1)}B`} />
                </p>
                <p className="techno__stat-label">people online today</p>
                <p className="hud">ITU · 2024</p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="glass techno__stat">
                <p className="stat techno__stat-value">
                  <Counter value={2.6} format={(n) => `${n.toFixed(1)}B`} />
                </p>
                <p className="techno__stat-label">still waiting for their first interface</p>
                <p className="hud">ITU · 2024</p>
              </div>
            </Reveal>
            <Reveal delay={0.35}>
              <div className="glass techno__stat">
                <p className="stat techno__stat-value">
                  <Counter value={8.9} format={(n) => `${n.toFixed(1)}B`} />
                </p>
                <p className="techno__stat-label">mobile connections — more than there are people</p>
                <p className="hud">GSMA · 2024</p>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="glass techno__stat">
                <p className="stat techno__stat-value">
                  <Counter value={6.67} format={(n) => `${Math.floor(n)}h ${String(Math.round((n % 1) * 60)).padStart(2, '0')}m`} />
                </p>
                <p className="techno__stat-label">of screen time per person per day</p>
                <p className="hud">DataReportal · 2024</p>
              </div>
            </Reveal>
            <Reveal delay={0.45}>
              <div className="glass techno__stat">
                <p className="stat techno__stat-value">
                  <Counter value={2} format={(n) => `${n.toFixed(0)}×`} />
                </p>
                <p className="techno__stat-label">transistors every ~two years, for sixty years</p>
                <p className="hud">Moore · 1965 →</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  )
}
