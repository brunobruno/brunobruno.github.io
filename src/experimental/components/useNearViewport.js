import { useEffect, useState } from 'react'

/**
 * True while `ref`'s element is within `margin` of the viewport (default: 120%
 * of viewport height on every side). WebGL scenes mount only when near and
 * unmount when far — mobile drivers cap live GL contexts (~8), and six
 * always-mounted canvases get the oldest evicted (black vortex, dead fog).
 * The margin is wide enough that mount/unmount always happens off-screen.
 */
export function useNearViewport(ref, margin = '120%') {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return near
}
