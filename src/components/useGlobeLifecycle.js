import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Keeps a react-globe.gl instance healthy across view switches.
 *
 * - On unmount, pauses the render loop and force-loses the WebGL context.
 *   globe.gl only calls `renderer.dispose()`, which leaves the context alive;
 *   after a few Design/Tech/Experimental switches Chrome hits its ~16-context
 *   cap and silently kills the oldest canvases (blank globe).
 * - If the browser still drops the context, bumps `key` so the globe remounts.
 *
 * Usage: const { key, register } = useGlobeLifecycle(); call `register(globeRef.current)`
 * inside onGlobeReady and spread `key` onto <Globe />.
 */
export function useGlobeLifecycle() {
  const instance = useRef(null)
  const [key, setKey] = useState(0)

  const register = useCallback((globe) => {
    instance.current = globe
    const canvas = globe?.renderer?.()?.domElement
    if (!canvas) return
    const onLost = (e) => {
      e.preventDefault()
      instance.current = null
      setTimeout(() => setKey((k) => k + 1), 300)
    }
    canvas.addEventListener('webglcontextlost', onLost, { once: true })
  }, [])

  useEffect(
    () => () => {
      const g = instance.current
      if (!g) return
      try {
        g.pauseAnimation()
        g.renderer()?.forceContextLoss()
        g.renderer()?.dispose()
      } catch {
        /* context already gone */
      }
      instance.current = null
    },
    [],
  )

  return { key, register }
}

// globe.gl's init resets the camera via pointOfView({altitude:2.5}) — and a
// camera at altitude ~2.5 means the kapsule re-initialized underneath us
// (React replaying the mount effect re-invokes comp(domEl), which wipes the
// DOM, rebuilds controls and resets the camera), so none of our setup
// survived. Lat/lng are NOT reliable markers: the read-back goes through the
// live scene matrix and lands somewhere near (7-11, 1-3) depending on when
// the reset struck. Altitude is the invariant — every home/fly POV we use
// stays ≤ 2.3 and camera tweens never overshoot their target. The watchdog
// re-runs `reinit` (the section's onReady) on the match, so the globe
// self-heals instead of staring at an empty hemisphere.
const INIT_ALTITUDE = 2.5
export function useGlobeWatchdog(globeRef, reinit) {
  useEffect(() => {
    const id = setInterval(() => {
      const g = globeRef.current
      if (!g) return
      if (Math.abs(g.pointOfView().altitude - INIT_ALTITUDE) < 0.02) reinit()
    }, 700)
    return () => clearInterval(id)
  }, [globeRef, reinit])
}
