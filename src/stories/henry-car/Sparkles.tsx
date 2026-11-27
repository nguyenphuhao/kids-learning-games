// Lớp hiệu ứng phủ cả màn hình (không chặn chạm): đốm sáng bay lơ lửng, chạm vào đâu rắc sao ở đó.
// Máy bật "giảm chuyển động" thì không vẽ gì.

import { useEffect, useRef } from 'react'

const COLORS = ['#5DCAA5', '#AFA9EC', '#FAC775', '#ED93B1', '#85B7EB']

type Dot = { x: number; y: number; r: number; v: number; c: string; p: number }
type Spark = { x: number; y: number; vx: number; vy: number; l: number; r: number; c: string }

export function Sparkles() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const cx = cv?.getContext('2d')
    if (!cv || !cx || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let W = 0
    let H = 0
    const size = () => {
      const d = Math.min(2, devicePixelRatio || 1)
      W = innerWidth
      H = innerHeight
      cv.width = W * d
      cv.height = H * d
      cx.setTransform(d, 0, 0, d, 0, 0)
    }
    size()
    addEventListener('resize', size)

    const dots: Dot[] = Array.from({ length: 22 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 2 + Math.random() * 5,
      v: 0.15 + Math.random() * 0.35,
      c: COLORS[i % 5],
      p: Math.random() * 6.28,
    }))
    let sparks: Spark[] = []

    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.('.hc-panel')) return
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * 6.28
        const s = 1 + Math.random() * 3
        sparks.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, l: 1, r: 3 + Math.random() * 4, c: COLORS[i % 5] })
      }
    }
    document.addEventListener('pointerdown', onDown)

    const star = (x: number, y: number, r: number) => {
      cx.beginPath()
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        const rr = i % 2 ? r * 0.4 : r
        cx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
      }
      cx.closePath()
      cx.fill()
    }

    let raf = 0
    const tick = (t: number) => {
      cx.clearRect(0, 0, W, H)
      for (const b of dots) {
        b.y -= b.v
        b.x += Math.sin(t / 1400 + b.p) * 0.25
        if (b.y < -10) {
          b.y = H + 10
          b.x = Math.random() * W
        }
        cx.globalAlpha = 0.1 + 0.1 * Math.sin(t / 900 + b.p)
        cx.fillStyle = b.c
        cx.beginPath()
        cx.arc(b.x, b.y, b.r, 0, 6.28)
        cx.fill()
      }
      for (const s of sparks) {
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.06
        s.l -= 0.02
        cx.globalAlpha = Math.max(0, s.l)
        cx.fillStyle = s.c
        star(s.x, s.y, s.r)
      }
      sparks = sparks.filter((s) => s.l > 0)
      cx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', size)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return <canvas ref={ref} className="hc-fx" aria-hidden="true" />
}
