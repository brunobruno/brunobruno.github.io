import { motion, useTransform } from 'framer-motion'
import { ParallaxSection, Layer, Reveal } from '../components/Parallax'
import './Machine.css'

const brushes = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  w: 14 + ((i * 29) % 40),
  rot: (i * 47) % 180,
  speed: 0.2 + ((i * 13) % 10) / 10,
  hue: ['var(--neon)', 'var(--pop-pink)', 'var(--klein)', 'var(--yolk)', 'var(--paper)'][i % 5],
}))

const nodes = Array.from({ length: 24 }, (_, i) => ({
  x: 10 + ((i * 67) % 80),
  y: 10 + ((i * 41) % 80),
}))

export default function Machine() {
  return (
    <ParallaxSection id="machine" className="machine">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const netOpacity = useTransform(p, [0.1, 0.45, 0.9], [0, 0.7, 0])
  const dash = useTransform(p, [0.1, 0.6], [1, 0])
  return (
    <>
      {/* generative brush strokes, each drifting at its own speed */}
      {brushes.map((b, i) => (
        <Layer
          key={i}
          progress={p}
          speed={b.speed}
          rotate={12}
          className="machine__brush"
          style={{ left: `${b.left}%`, top: `${b.top}%`, width: `${b.w}vw`, background: b.hue, rotate: `${b.rot}deg` }}
        />
      ))}

      {/* a neural lattice that draws itself in */}
      <motion.svg className="machine__net" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: netOpacity }}>
        {nodes.map((a, i) =>
          nodes.slice(i + 1, i + 4).map((b, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--neon)"
              strokeWidth="0.12"
              pathLength="1"
              style={{ strokeDasharray: 1, strokeDashoffset: dash }}
            />
          )),
        )}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="0.45" fill="var(--neon)" />
        ))}
      </motion.svg>

      <div className="container machine__content">
        <Reveal>
          <p className="eyebrow">Now</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display machine__title">
            The brush
            <br />
            <span className="machine__title-neon">learned to</span>
            <br />
            <span className="outline">dream</span>
          </h2>
        </Reveal>

        <div className="machine__grid">
          <Reveal delay={0.2}>
            <p className="phrase">
              The camera did not kill painting. It <em>freed</em> it — and gave us Impressionism, Cubism, everything
              after.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="body">
              Artificial intelligence is the camera of our century. It does not replace the artist; it removes the
              excuse. When a model can write the boilerplate, generate the variations and test the edge cases, what
              remains is the part that was always human: taste, intention, and the courage to decide.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="body">
              I work with Claude, GPT and Copilot daily — not as autocomplete, but as a studio of apprentices. I set the
              composition; they mix the paint. Together we ship in days what used to take quarters, and we ship it
              more beautifully. That is the incredible: not machines that make art, but <strong>artists with machines</strong>.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <ul className="machine__principles">
            <li>
              <span className="wide">01</span> Design before code. Code before scale.
            </li>
            <li>
              <span className="wide">02</span> AI amplifies judgement; it does not supply it.
            </li>
            <li>
              <span className="wide">03</span> Every pixel owes something to someone who painted first.
            </li>
          </ul>
        </Reveal>
      </div>
    </>
  )
}
