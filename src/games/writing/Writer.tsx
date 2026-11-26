// Khung viết một chữ: hoạt ảnh hướng dẫn từng nét theo thứ tự, rồi bé tô theo bằng ngón tay.
//
// Tô theo: mỗi nét được lấy mẫu thành các điểm cách nhau 1 đơn vị. Bé phải đặt tay gần điểm đang
// tô dở (lúc đầu là chấm đặt bút có số thứ tự), rồi kéo theo hướng viết; nét chỉ tiến lên khi ngón
// tay ở gần đường nét, và chỉ tiến tới trong một khoảng ngắn phía trước (nên đi ngược hay nhảy cóc
// không được tính). Nhấc tay giữa chừng thì phần đã tô vẫn giữ, bé tô tiếp từ đó.

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { svgPoint } from '../shared/util'
import type { Level } from '../shared/useLevel'
import { RuledLines } from './GlyphArt'
import { glyphBox, type Glyph, type GlyphKind } from './glyphs'

type Pt = { x: number; y: number }
export type Phase = 'watch' | 'trace' | 'done'

const STEP = 1 // khoảng cách giữa các điểm mẫu (đơn vị)
const SPEED = 40 // tốc độ hoạt ảnh (đơn vị / giây)
const PAUSE_MS = 450 // nghỉ giữa hai nét
const LOOKAHEAD = 10 // mỗi lần di tay chỉ tiến tối đa chừng này đơn vị
const DOT_LEN = 3 // nét ngắn hơn thì là dấu chấm: chỉ cần chạm

const TOLERANCE: Record<Level, number> = { easy: 9, medium: 7, hard: 5.5 }
const GUIDE_OPACITY: Record<Level, number> = { easy: 1, medium: 0.45, hard: 0 }

const INK = '#1e63c6'
const GUIDE = '#78909c'
// Chữ mẫu vẽ bằng nét đứt như vở tô chữ: gạch dài 2,6 đơn vị, cách 2,4 (1 li = 10 đơn vị).
const GUIDE_DASH = '2.6 2.4'
const PEN = '#fb8c00'

function sample(path: SVGPathElement): Pt[] {
  const len = path.getTotalLength()
  const n = Math.max(1, Math.round(len / STEP))
  return Array.from({ length: n + 1 }, (_, i) => {
    const p = path.getPointAtLength((len * i) / n)
    return { x: p.x, y: p.y }
  })
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)

type Props = {
  glyph: Glyph
  kind: GlyphKind
  level: Level
  phase: Phase
  onWatched: () => void
  onDone: () => void
  onMiss: () => void
}

export function Writer({ glyph, kind, level, phase, onWatched, onDone, onMiss }: Props) {
  const box = glyphBox(glyph, kind, 0, true)
  const measureRefs = useRef<(SVGPathElement | null)[]>([])
  const svgRef = useRef<SVGSVGElement>(null)
  const [samples, setSamples] = useState<Pt[][]>([])
  // Tiến độ tô của từng nét: số điểm mẫu đã đi qua.
  const [progress, setProgress] = useState<number[]>(() => glyph.strokes.map(() => 0))
  // Hoạt ảnh: nét đang vẽ và độ dài đã vẽ của nét đó.
  const [anim, setAnim] = useState<{ stroke: number; len: number } | null>(null)
  const drawing = useRef(false)
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Mỗi chữ (và mỗi lần xem lại) là một Writer mới (khác key), nên chỉ cần đo một lần.
  useLayoutEffect(() => {
    setSamples(glyph.strokes.map((_, i) => sample(measureRefs.current[i]!)))
  }, [glyph])

  const lengths = samples.map((s) => (s.length - 1) * STEP)

  // Hoạt ảnh hướng dẫn.
  useEffect(() => {
    if (phase !== 'watch' || samples.length === 0) return
    let raf = 0
    let timer = 0
    let stroke = 0
    let t0 = 0
    const speed = reduced ? SPEED * 3 : SPEED
    const frame = (now: number) => {
      if (!t0) t0 = now
      const len = Math.min(lengths[stroke], ((now - t0) / 1000) * speed)
      setAnim({ stroke, len })
      if (len < lengths[stroke]) {
        raf = requestAnimationFrame(frame)
        return
      }
      stroke++
      t0 = 0
      timer = window.setTimeout(
        () => {
          if (stroke < samples.length) raf = requestAnimationFrame(frame)
          else {
            setAnim(null)
            onWatched()
          }
        },
        stroke < samples.length ? PAUSE_MS : PAUSE_MS * 1.5,
      )
    }
    timer = window.setTimeout(() => (raf = requestAnimationFrame(frame)), 400)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      setAnim(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, samples])

  const current = progress.findIndex((p, i) => samples[i] && p < samples[i].length - 1)
  const tol = TOLERANCE[level]

  const finishStroke = (next: number[]) => {
    setProgress(next)
    if (next.every((p, i) => p >= samples[i].length - 1)) {
      drawing.current = false
      onDone()
    }
  }

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (phase !== 'trace' || current < 0 || !svgRef.current) return
    const f = svgPoint(svgRef.current, e.clientX, e.clientY)
    const pts = samples[current]
    if (dist(f, pts[progress[current]]) > tol * 1.6) {
      onMiss()
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    if (lengths[current] < DOT_LEN) {
      finishStroke(progress.map((p, i) => (i === current ? pts.length - 1 : p)))
      return
    }
    drawing.current = true
  }

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawing.current || current < 0 || !svgRef.current) return
    const f = svgPoint(svgRef.current, e.clientX, e.clientY)
    const pts = samples[current]
    let k = progress[current]
    const limit = Math.min(pts.length - 1, k + Math.round(LOOKAHEAD / STEP))
    let best = k
    for (let j = k + 1; j <= limit; j++) if (dist(f, pts[j]) < tol) best = j
    if (best === k) return
    k = best
    // Gần hết nét thì coi như xong (đỡ phải kéo tới đúng điểm cuối).
    if (pts.length - 1 - k <= 2) k = pts.length - 1
    const next = progress.map((p, i) => (i === current ? k : p))
    if (k === pts.length - 1) {
      drawing.current = false
      finishStroke(next)
    } else setProgress(next)
  }

  const up = () => {
    drawing.current = false
  }

  const showAll = phase === 'done'
  const startPt = current >= 0 && samples[current] ? samples[current][progress[current]] : null

  return (
    <svg
      ref={svgRef}
      className="w-canvas"
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="img"
      aria-label={glyph.char}
    >
      <RuledLines {...box} kind={kind} />
      {/* Đường dẫn để đo độ dài, không hiện. */}
      {glyph.strokes.map((d, i) => (
        <path key={`m${i}`} ref={(el) => void (measureRefs.current[i] = el)} d={d} fill="none" stroke="none" />
      ))}
      {/* Chữ mẫu nét đứt để tô theo (lúc xem hướng dẫn luôn hiện). Dấu chấm (i, j) vẽ thành chấm tròn. */}
      <g opacity={phase === 'watch' ? 1 : GUIDE_OPACITY[level]}>
        {glyph.strokes.map((d, i) =>
          (lengths[i] ?? DOT_LEN) < DOT_LEN ? (
            <circle key={`g${i}`} cx={samples[i][0].x} cy={samples[i][0].y} r="1.6" fill={GUIDE} />
          ) : (
            <path
              key={`g${i}`}
              d={d}
              fill="none"
              stroke={GUIDE}
              strokeWidth="1.4"
              strokeDasharray={GUIDE_DASH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ),
        )}
      </g>
      {/* Mực: hoạt ảnh hoặc phần bé đã tô. */}
      {glyph.strokes.map((d, i) => {
        const len = lengths[i] ?? 0
        const shown = showAll
          ? len
          : phase === 'watch'
            ? anim
              ? i < anim.stroke
                ? len
                : i === anim.stroke
                  ? anim.len
                  : 0
              : 0
            : (progress[i] ?? 0) * STEP
        if (shown <= 0 && len >= DOT_LEN) return null
        const isDot = len < DOT_LEN
        if (isDot && shown <= 0 && !(phase === 'watch' && anim && i === anim.stroke)) return null
        return (
          <path
            key={`i${i}`}
            d={d}
            fill="none"
            stroke={INK}
            strokeWidth={isDot ? 4.5 : 3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={isDot ? undefined : `${shown} 9999`}
          />
        )
      })}
      {/* Bút chì trong hoạt ảnh. */}
      {phase === 'watch' && anim && samples[anim.stroke] && (
        (() => {
          const p = samples[anim.stroke][Math.min(samples[anim.stroke].length - 1, Math.round(anim.len / STEP))]
          return (
            <g transform={`translate(${p.x} ${p.y})`} pointerEvents="none">
              <circle r="4" fill={PEN} stroke="#fff" strokeWidth="1.2" />
            </g>
          )
        })()
      )}
      {/* Số thứ tự nét ở điểm đặt bút (lúc xem: mọi nét; lúc tô: nét đang tô). */}
      {phase === 'watch' &&
        samples.map((s, i) => (
          <StartDot key={`s${i}`} p={s[0]} n={i + 1} dim={!!anim && i > anim.stroke} />
        ))}
      {phase === 'trace' && startPt && current >= 0 && (
        <>
          <StartDot p={startPt} n={current + 1} pulse />
          {progress[current] === 0 && <Arrow pts={samples[current]} />}
        </>
      )}
    </svg>
  )
}

function StartDot({ p, n, pulse, dim }: { p: Pt; n: number; pulse?: boolean; dim?: boolean }) {
  return (
    <g transform={`translate(${p.x} ${p.y})`} pointerEvents="none" opacity={dim ? 0.5 : 1}>
      {pulse && <circle className="w-pulse" r="6" fill={PEN} opacity="0.35" />}
      <circle r="3.6" fill={PEN} stroke="#fff" strokeWidth="0.8" />
      <text y="1.5" fontSize="4.4" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="sans-serif">
        {n}
      </text>
    </g>
  )
}

/** Mũi tên nhỏ chỉ hướng viết ở đầu nét. */
function Arrow({ pts }: { pts: Pt[] }) {
  if (pts.length < 8) return null
  const a = pts[Math.min(pts.length - 1, 7)]
  const b = pts[Math.min(pts.length - 1, 4)]
  const ang = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI
  return (
    <g transform={`translate(${a.x} ${a.y}) rotate(${ang})`} pointerEvents="none">
      <path d="M-3,-2.6 L1.6,0 L-3,2.6" fill="none" stroke={PEN} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}
