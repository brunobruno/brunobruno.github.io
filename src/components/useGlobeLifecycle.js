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
