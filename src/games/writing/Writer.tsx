// Khung viết một chữ: hoạt ảnh hướng dẫn từng nét theo thứ tự, rồi bé tự viết theo.
//
// Bé viết: mực hiện đúng đường ngón tay / bút của bé (không tự bám vào nét mẫu). Nhấc tay xong một
// nét thì chấm nét đó so với nét mẫu (lấy mẫu mỗi 1 đơn vị):
//   - đặt bút gần điểm đầu nét và kết thúc gần điểm cuối nét;
//   - đi đúng chiều và đi hết nét: dò dọc nét mẫu, mỗi điểm bé viết chỉ được tiến tới tối đa
//     LOOKAHEAD đơn vị (nên đi ngược, nhảy cóc hay bỏ đoạn đều không qua);
//   - không lệch: hầu hết điểm bé viết nằm trong khoảng cho phép quanh nét mẫu, không điểm nào quá xa.
// Đạt thì giữ nguyên nét bé viết và sang nét sau; không đạt thì nét đó mờ đi rồi biến mất, bé viết lại.
// Khoảng lệch cho phép tuỳ mức chơi (Dễ rộng, Khó hẹp).

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
const LOOKAHEAD = 10 // mỗi điểm bé viết chỉ được tiến dọc nét mẫu tối đa chừng này đơn vị
const DOT_LEN = 3 // nét ngắn hơn thì là dấu chấm: chỉ cần chạm đúng chỗ
const OFF_RATIO = 0.08 // tối đa 8% điểm bé viết được lệch quá khoảng cho phép
const FAIL_MS = 700 // nét sai mờ đi trong chừng này rồi biến mất

// Khoảng lệch cho phép quanh nét mẫu (đơn vị; 1 li = 10).
const TOLERANCE: Record<Level, number> = { easy: 8, medium: 6, hard: 4.5 }
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

/** Chèn thêm điểm để hai điểm liền nhau cách nhau không quá STEP (tay di nhanh thì điểm thưa). */
function densify(pts: Pt[]): Pt[] {
  const out: Pt[] = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const n = Math.ceil(dist(a, b) / STEP)
    for (let k = 1; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n })
  }
  return out
}

/** Nét bé viết (`drawn`) có khớp nét mẫu (`guide`, các điểm cách nhau STEP) không. */
function strokeMatches(drawn: Pt[], guide: Pt[], tol: number): boolean {
  if (drawn.length === 0) return false
  const last = guide.length - 1
  // Dấu chấm: chỉ cần chạm gần đúng chỗ, không kéo đi xa.
  if (last * STEP < DOT_LEN) return drawn.every((p) => dist(p, guide[0]) <= tol * 1.5)
  if (dist(drawn[0], guide[0]) > tol * 1.5) return false
  if (dist(drawn[drawn.length - 1], guide[last]) > tol * 1.5) return false
  const pts = densify(drawn)
  let k = 0
  let off = 0
  for (const p of pts) {
    // Đi dọc nét mẫu theo chiều viết: tiến tới điểm xa nhất (trong LOOKAHEAD) còn nằm trong khoảng cho phép.
    const limit = Math.min(last, k + Math.round(LOOKAHEAD / STEP))
    for (let j = limit; j > k; j--) {
      if (dist(p, guide[j]) <= tol) {
        k = j
        break
      }
    }
    // Lệch khỏi nét mẫu (so với điểm gần nhất trên cả nét).
    let near = Infinity
    for (const g of guide) near = Math.min(near, dist(p, g))
    if (near > tol * 2.2) return false
    if (near > tol) off++
  }
  return last - k <= Math.round(3 / STEP) && off <= pts.length * OFF_RATIO
}

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
  // Nét bé đã viết đạt (giữ nguyên đường tay của bé), nét đang viết, và nét vừa viết sai (đang mờ đi).
  const [inks, setInks] = useState<Pt[][]>([])
  const [live, setLive] = useState<Pt[] | null>(null)
  const [failed, setFailed] = useState<Pt[] | null>(null)
  const pointer = useRef<number | null>(null)
  const failTimer = useRef(0)
  // Hoạt ảnh: nét đang vẽ và độ dài đã vẽ của nét đó.
  const [anim, setAnim] = useState<{ stroke: number; len: number } | null>(null)
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

  useEffect(() => () => clearTimeout(failTimer.current), [])

  const current = phase === 'trace' && inks.length < samples.length ? inks.length : -1
  const tol = TOLERANCE[level]

  const point = (e: PointerEvent<SVGSVGElement>) => svgPoint(svgRef.current!, e.clientX, e.clientY)

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (current < 0 || !svgRef.current || pointer.current !== null) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointer.current = e.pointerId
    setFailed(null)
    setLive([point(e)])
  }

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerId !== pointer.current || !svgRef.current) return
    // Bút / ngón tay di nhanh: lấy cả các điểm trình duyệt gộp lại để nét mượt và đúng.
    const evs = e.nativeEvent.getCoalescedEvents?.() ?? []
    const added = evs.length > 0 ? evs.map((c) => svgPoint(svgRef.current!, c.clientX, c.clientY)) : [point(e)]
    setLive((l) => (l ? [...l, ...added] : l))
  }

  const up = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerId !== pointer.current) return
    pointer.current = null
    const drawn = live ?? []
    setLive(null)
    if (current < 0 || drawn.length === 0) return
    if (strokeMatches(drawn, samples[current], tol)) {
      const next = [...inks, drawn]
      setInks(next)
      if (next.length === samples.length) onDone()
    } else {
      setFailed(drawn)
      clearTimeout(failTimer.current)
      failTimer.current = window.setTimeout(() => setFailed(null), FAIL_MS)
      onMiss()
    }
  }

  const startPt = current >= 0 && samples[current] ? samples[current][0] : null

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
      {/* Mực của hoạt ảnh hướng dẫn. */}
      {phase === 'watch' &&
        anim &&
        glyph.strokes.map((d, i) => {
          if (i > anim.stroke) return null
          const len = lengths[i] ?? 0
          if (len < DOT_LEN)
            return <circle key={`a${i}`} cx={samples[i][0].x} cy={samples[i][0].y} r="2.3" fill={INK} />
          return (
            <path
              key={`a${i}`}
              d={d}
              fill="none"
              stroke={INK}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${i < anim.stroke ? len : anim.len} 9999`}
            />
          )
        })}
      {/* Mực bé viết: các nét đạt, nét đang viết, nét vừa sai (mờ đi). */}
      {phase !== 'watch' && inks.map((pts, i) => <Ink key={`k${i}`} pts={pts} />)}
      {live && <Ink pts={live} />}
      {failed && <Ink pts={failed} className="w-fail" />}
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
          <StartDot p={startPt} n={current + 1} pulse={!live} />
          {!live && <Arrow pts={samples[current]} />}
        </>
      )}
    </svg>
  )
}

/** Một nét bé viết, vẽ đúng theo các điểm tay đi qua (chạm một chỗ thì là chấm tròn). */
function Ink({ pts, className }: { pts: Pt[]; className?: string }) {
  const tap = pts.every((p) => dist(p, pts[0]) < 1)
  if (tap) return <circle className={className} cx={pts[0].x} cy={pts[0].y} r="2.3" fill={INK} pointerEvents="none" />
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  return (
    <path
      className={className}
      d={d}
      fill="none"
      stroke={INK}
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="none"
    />
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
