import { useEffect, useRef } from 'react'

const PALETTE = ['#c6ff3f', '#19c3e6', '#ff3fa4', '#ffe600', '#f3eee4']

/**
 * A canvas flow field: particles follow a slowly rotating vector field and
 * leave fading light trails. The cursor bends the field toward itself.
 */
export default function FlowField({ density = 260, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d', { alpha: false })
    const dpr = 1
    let w, h, particles, raf
    const mouse = { x: -9999, y: -9999, active: false }
    let t = 0

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#07070b'
      ctx.fillRect(0, 0, w, h)
      particles = Array.from({ length: density }, spawn)
    }

    const spawn = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      px: 0,
      py: 0,
      life: 60 + Math.random() * 160,
      color: PALETTE[(Math.random() * PALETTE.length) | 0],
      speed: 0.8 + Math.random() * 1.6,
    })

    const field = (x, y) => {
      // layered sines approximate curl noise cheaply
      const s = 0.0022
      let a =
        Math.sin(x * s + t * 0.6) * Math.cos(y * s * 1.3 - t * 0.4) * Math.PI +
        Math.sin((x + y) * s * 0.5 + t * 0.2) * 1.4
      if (mouse.active) {
        const dx = mouse.x - x
        const dy = mouse.y - y
        const d2 = dx * dx + dy * dy
        if (d2 < 220 * 220) {
          const pull = 1 - Math.sqrt(d2) / 220
          a = a * (1 - pull) + (Math.atan2(dy, dx) + Math.PI / 2) * pull
        }
      }
      return a
    }

    const step = () => {
      t += 0.004
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(7, 7, 11, 0.08)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineWidth = 1.2
      for (const p of particles) {
        p.px = p.x
        p.py = p.y
        const a = field(p.x, p.y)
        p.x += Math.cos(a) * p.speed
        p.y += Math.sin(a) * p.speed
        p.life -= 1
        if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          Object.assign(p, spawn())
          continue
        }
        ctx.strokeStyle = p.color
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.moveTo(p.px, p.py)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(step)
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.active = true
    }
    const onLeave = () => (mouse.active = false)

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(step)
      } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })

    resize()
    io.observe(canvas)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [density])

  return <canvas ref={ref} className={className} aria-hidden />
}
