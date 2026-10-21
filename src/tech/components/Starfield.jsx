import { useEffect, useRef } from 'react'

/**
 * Fixed full-screen canvas: three depth layers of twinkling stars, a faint
 * nebula wash, and comets that streak across every few seconds.
 *
 * It is always alive (idle twinkle + slow drift) and reacts to scroll:
 * each layer slides at its own parallax rate, and scroll velocity briefly
 * stretches stars into warp lines. Pointer movement gently tilts the field.
 */
export default function Starfield({ density = 1, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0, stars = [], comets = []
    let t = 0, lastScroll = window.scrollY, velocity = 0, nextComet = 2
    const mouse = { x: 0, y: 0 }

    const LAYERS = [
      { count: 220, size: [0.4, 1.0], depth: 0.015, alpha: 0.55 },
      { count: 120, size: [0.8, 1.6], depth: 0.04, alpha: 0.8 },
      { count: 45, size: [1.4, 2.4], depth: 0.09, alpha: 1 },
    ]
    const TINTS = ['#ffffff', '#cfe8ff', '#ffe9c4', '#c6ff3f', '#19c3e6']

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = []
      LAYERS.forEach((L, li) => {
        for (let i = 0; i < L.count * density; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: L.size[0] + Math.random() * (L.size[1] - L.size[0]),
            depth: L.depth,
            alpha: L.alpha,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 1.2,
            tint: TINTS[li === 2 && Math.random() < 0.35 ? 3 + ((Math.random() * 2) | 0) : (Math.random() * 3) | 0],
          })
        }
      })
    }

    const spawnComet = () => {
      const fromLeft = Math.random() < 0.5
      const angle = (fromLeft ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.4
      comets.push({
        x: fromLeft ? -60 : w + 60,
        y: Math.random() * h * 0.6,
        vx: Math.cos(angle) * (9 + Math.random() * 7),
        vy: Math.sin(angle) * (9 + Math.random() * 7),
        life: 1,
        len: 120 + Math.random() * 160,
        hue: Math.random() < 0.5 ? '198,255,63' : '25,195,230',
      })
    }

    const frame = () => {
      t += 0.016
      const sy = window.scrollY
      velocity += ((sy - lastScroll) - velocity) * 0.18
      lastScroll = sy
      const stretch = reduce ? 0 : Math.min(Math.abs(velocity) * 0.12, 26)

      ctx.clearRect(0, 0, w, h)

      // nebula wash: two slow breathing radial gradients
      const g1 = ctx.createRadialGradient(w * 0.2, h * 0.3 - sy * 0.02, 0, w * 0.2, h * 0.3 - sy * 0.02, w * 0.6)
      g1.addColorStop(0, `rgba(25,195,230,${0.06 + Math.sin(t * 0.3) * 0.015})`)
      g1.addColorStop(1, 'rgba(25,195,230,0)')
      const g2 = ctx.createRadialGradient(w * 0.85, h * 0.8 - sy * 0.04, 0, w * 0.85, h * 0.8 - sy * 0.04, w * 0.5)
      g2.addColorStop(0, `rgba(120,60,200,${0.07 + Math.cos(t * 0.25) * 0.02})`)
      g2.addColorStop(1, 'rgba(120,60,200,0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      // stars
      for (const s of stars) {
        const drift = reduce ? 0 : t * s.speed * 2
        const px = (((s.x + mouse.x * s.depth * 400 + drift * 0.3) % (w + 20)) + w + 20) % (w + 20) - 10
        const py = (((s.y - sy * s.depth + mouse.y * s.depth * 300) % (h + 20)) + h + 20) % (h + 20) - 10
        const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.speed * 2 + s.phase)
        ctx.globalAlpha = s.alpha * tw
        ctx.fillStyle = s.tint
        if (stretch > 1) {
          const len = stretch * s.depth * 18
          ctx.fillRect(px - s.r / 2, py - len * Math.sign(velocity), s.r, len)
        } else {
          ctx.beginPath()
          ctx.arc(px, py, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      // comets
      if (!reduce) {
        nextComet -= 0.016
        if (nextComet <= 0) {
          spawnComet()
          nextComet = 3 + Math.random() * 6
        }
        for (let i = comets.length - 1; i >= 0; i--) {
          const c = comets[i]
          c.x += c.vx
          c.y += c.vy
          c.life -= 0.006
          if (c.life <= 0 || c.x < -300 || c.x > w + 300 || c.y > h + 300) {
            comets.splice(i, 1)
            continue
          }
          const nx = c.vx / Math.hypot(c.vx, c.vy)
          const ny = c.vy / Math.hypot(c.vx, c.vy)
          const grad = ctx.createLinearGradient(c.x, c.y, c.x - nx * c.len, c.y - ny * c.len)
          grad.addColorStop(0, `rgba(255,255,255,${0.9 * c.life})`)
          grad.addColorStop(0.15, `rgba(${c.hue},${0.6 * c.life})`)
          grad.addColorStop(1, `rgba(${c.hue},0)`)
          ctx.strokeStyle = grad
          ctx.lineWidth = 2
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(c.x, c.y)
          ctx.lineTo(c.x - nx * c.len, c.y - ny * c.len)
          ctx.stroke()
          ctx.fillStyle = `rgba(255,255,255,${c.life})`
          ctx.beginPath()
          ctx.arc(c.x, c.y, 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(frame)
    }

    const onMove = (e) => {
      mouse.x = e.clientX / w - 0.5
      mouse.y = e.clientY / h - 0.5
    }
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else raf = requestAnimationFrame(frame)
    }

    resize()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [density])

  return <canvas ref={ref} className={`starfield ${className}`} aria-hidden />
}
