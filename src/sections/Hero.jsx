import { motion, useTransform } from 'framer-motion'
import { ParallaxSection, Layer } from '../components/Parallax'
import { profile } from '../data/content'
import './Hero.css'

export default function Hero() {
  return (
    <ParallaxSection id="hero" className="hero">
      {(p) => <HeroInner p={p} />}
    </ParallaxSection>
  )
}

function HeroInner({ p }) {
  const fade = useTransform(p, [0.5, 0.95], [1, 0])
  return (
    <>
      {/* Bauhaus primitives, softened into light */}
      <Layer progress={p} speed={0.5} rotate={25} className="hero__circle" />
      <Layer progress={p} speed={0.8} rotate={-40} className="hero__triangle" />
      <Layer progress={p} speed={0.3} className="hero__bar" />
      <Layer progress={p} speed={1.1} x={6} className="hero__small-circle" />
      <Layer progress={p} speed={0.2} className="hero__grid" />

      <motion.div className="container hero__content" style={{ opacity: fade }}>
        <motion.p
          className="eyebrow hero__eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Frontend lead · Digital designer · Europe
        </motion.p>

        <h1 className="display hero__title">
          <motion.span
            className="hero__title-first"
            initial={{ opacity: 0, y: 60, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.2, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Bruno
          </motion.span>
          <motion.span
            className="hero__title-accent"
            initial={{ opacity: 0, y: 60, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.45, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Galati
          </motion.span>
        </h1>

        <motion.p
          className="serif hero__tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
        >
          A developer with an <em>artist's eye</em>.
        </motion.p>

        <motion.p
          className="hero__lede"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.2 }}
        >
          Eighteen years composing interfaces the way painters compose canvases — with structure, rhythm and
          restraint. From São Paulo to Rome, Cologne, Barcelona and Berlin, I've led teams that turn complex systems
          into things people actually enjoy touching. What follows is not a résumé. It's a walk through the ideas
          that shaped how I build.
        </motion.p>

        <motion.p
          className="italic hero__quote"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 1.2 }}
        >
          “Form follows feeling. Code follows form.”
        </motion.p>
      </motion.div>

      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
        style={{ opacity: fade }}
      >
        <span>Scroll</span>
        <span className="hero__scroll-line" />
      </motion.div>
    </>
  )
}
