import { motion, useTransform } from 'framer-motion'
import { ParallaxSection, Layer, Reveal } from '../components/Parallax'
import { timeline } from '../data/content'
import './Suprematism.css'

export default function Suprematism() {
  return (
    <ParallaxSection id="suprematism" className="supre">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const wedgeX = useTransform(p, [0, 1], ['-30vw', '40vw'])
  const wedgeRotate = useTransform(p, [0, 1], [-10, 18])
  return (
    <>
      {/* Lissitzky's red wedge piercing the white circle */}
      <Layer progress={p} speed={0.35} className="supre__circle" />
      <motion.div className="supre__wedge" style={{ x: wedgeX, rotate: wedgeRotate }} />
      <Layer progress={p} speed={0.9} rotate={30} className="supre__bar supre__bar--a" />
      <Layer progress={p} speed={-0.4} rotate={-12} className="supre__bar supre__bar--b" />
      <Layer progress={p} speed={0.6} rotate={50} className="supre__square" />

      <div className="container supre__content">
        <div className="supre__head">
          <Reveal>
            <p className="eyebrow">Suprematism & Constructivism, 1915–1925</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display supre__title">
              Beat the
              <span className="supre__title-red"> chaos </span>
              with the
              <span className="supre__title-outline"> wedge</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="phrase">
              Malevich painted a black square and called it <em>the zero of form</em>. Lissitzky turned geometry into
              a battle plan.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="body">
              Leading a team is composition under pressure: decide the direction, cut the noise, let every shape point
              the same way. These are the places where I pushed the wedge.
            </p>
          </Reveal>
        </div>

        <ol className="supre__timeline">
          {timeline.map((t, i) => (
            <TimelineItem key={t.org + t.year} t={t} i={i} p={p} />
          ))}
        </ol>
      </div>
    </>
  )
}

function TimelineItem({ t, i }) {
  const side = i % 2 === 0 ? 'left' : 'right'
  return (
    <motion.li
      className={`supre__item supre__item--${side}`}
      initial={{ opacity: 0, x: side === 'left' ? -60 : 60, rotate: side === 'left' ? -3 : 3 }}
      whileInView={{ opacity: 1, x: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="display supre__year">{t.year}</span>
      <div className="supre__card">
        <p className="supre__org">
          {t.org} <span className="supre__place">— {t.place}</span>
        </p>
        <p className="supre__what">{t.what}</p>
        <div className="chips">
          {t.stack.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.li>
  )
}
