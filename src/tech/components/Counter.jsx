import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

const defaultFormat = (n) => Math.round(n).toLocaleString('en-US')

/**
 * Counts from 0 to `value` when scrolled into view. `format` turns the
 * tweened number into text (defaults to locale grouping). The formatter is
 * read through a ref so inline arrow functions don't restart the tween.
 */
export default function Counter({ value, format = defaultFormat, duration = 2.2, delay = 0, className = '' }) {
  const ref = useRef(null)
  const fmt = useRef(format)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [text, setText] = useState(() => format(0))

  useEffect(() => {
    fmt.current = format
  })

  useEffect(() => {
    if (!inView || value == null) return
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setText(fmt.current(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration, delay])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}

/**
 * A number that keeps ticking after it lands — e.g. a population clock.
 * `rate` is units per second added on top of `value` from `since` (ms epoch).
 */
export function LiveCounter({ value, since, rate, format = defaultFormat, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView || value == null) return
    const target = () => value + ((Date.now() - since) / 1000) * rate
    let raf
    const intro = animate(0, target(), { duration: 2.6, ease: [0.16, 1, 0.3, 1], onUpdate: setN })
    intro.then(() => {
      const tick = () => {
        setN(target())
        raf = requestAnimationFrame(tick)
      }
      tick()
    })
    return () => {
      intro.stop()
      cancelAnimationFrame(raf)
    }
  }, [inView, value, since, rate])

  return (
    <span ref={ref} className={className}>
      {format(n)}
    </span>
  )
}
