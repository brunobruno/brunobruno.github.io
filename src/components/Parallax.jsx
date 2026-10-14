import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

/**
 * Wraps a full section and exposes a 0→1 scroll progress to its children
 * through the render-prop pattern: progress is 0 when the section enters
 * from below and 1 when it has left through the top.
 */
export function ParallaxSection({ id, className = '', style, children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.4 })
  return (
    <section id={id} ref={ref} className={`section ${className}`} style={style}>
      {typeof children === 'function' ? children(progress) : children}
    </section>
  )
}

/**
 * A tall section whose inner stage stays pinned to the viewport while the
 * user scrolls through it. Progress runs 0→1 across the pinned distance,
 * so children can play a scene rather than merely drift.
 */
export function PinnedSection({ id, className = '', height = '300vh', children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.3 })
  return (
    <section id={id} ref={ref} className={`pinned ${className}`} style={{ height }}>
      <div className="pinned__stage">{children(progress)}</div>
    </section>
  )
}

/**
 * A layer that drifts vertically (and optionally rotates/scales) at a given speed
 * relative to the section's scroll progress. speed > 0 moves slower than the page
 * (background), speed < 0 moves faster (foreground).
 */
export function Layer({ progress, speed = 0.3, rotate = 0, scale = [1, 1], x = 0, className = '', style, children }) {
  const y = useTransform(progress, [0, 1], [`${speed * 60}vh`, `${-speed * 60}vh`])
  const r = useTransform(progress, [0, 1], [-rotate, rotate])
  const s = useTransform(progress, [0, 1], scale)
  const tx = useTransform(progress, [0, 1], [`${-x}vw`, `${x}vw`])
  return (
    <motion.div className={className} style={{ y, rotate: r, scale: s, x: tx, willChange: 'transform', ...style }}>
      {children}
    </motion.div>
  )
}

/** Fade + rise in when scrolled into view. */
export function Reveal({ children, delay = 0, y = 40, className = '', style, once = true }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.35 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Splits a headline into words that stagger upward from behind a mask. */
export function SplitWords({ text, className = '', delay = 0, stagger = 0.06 }) {
  const words = text.split(' ')
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  )
}
