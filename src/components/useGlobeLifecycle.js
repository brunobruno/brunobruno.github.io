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

// globe.gl's init camera always lands on this exact spot — a camera sitting
// here means the kapsule re-initialized underneath us (React replaying the
// mount effect re-invokes comp(domEl), which wipes the DOM and resets the
// camera), and none of our setup survived. The watchdog re-runs `reinit`
// (the section's onReady) whenever it finds the camera there, so the globe
// self-heals instead of staring at an empty hemisphere.
const INIT_POV = { lat: 10.837388887112297, lng: 1.5984081353906134, altitude: 2.5 }
export function useGlobeWatchdog(globeRef, reinit) {
  useEffect(() => {
    const id = setInterval(() => {
      const g = globeRef.current
      if (!g) return
      const pov = g.pointOfView()
      const isDefault =
        Math.abs(pov.altitude - INIT_POV.altitude) < 1e-3 &&
        Math.abs(pov.lat - INIT_POV.lat) < 0.3 &&
        Math.abs(pov.lng - INIT_POV.lng) < 0.3
      if (isDefault) reinit()
    }, 700)
    return () => clearInterval(id)
  }, [globeRef, reinit])
}
