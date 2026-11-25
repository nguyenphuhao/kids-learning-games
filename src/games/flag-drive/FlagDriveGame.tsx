// Trò "Lái xe tìm cờ": đường có ngã rẽ, cuối mỗi nhánh có một lá cờ.
// Game đọc (và hiện chữ) tên nước. Bé đặt ngón tay lên xe và kéo xe chạy theo đường
// tới lá cờ đúng. Xe chỉ chạy trên đường. Bé cũng có thể chạm thẳng vào lá cờ,
// khi đó xe tự chạy tới.
//
// Âm thanh (public/audio/<vi|en>/): flags-find-<CODE>, flags-great, flags-retry.

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { loadValue, saveValue } from '../../lib/storage'
import { svgPoint } from '../shared/util'
import { flagSrc, makeRound, type Country, type Round } from './countries'
import './flagDrive.css'

type Phase = 'drive' | 'auto' | 'celebrate'
type Point = { x: number; y: number }
type CarPose = Point & { angle: number }
/** Vị trí xe: seg = -1 là đoạn đường thẳng phía dưới, seg = i là nhánh thứ i; t từ 0 đến 1. */
type CarPos = { seg: number; t: number }

// Khung cảnh: viewBox 0 0 300 400, xe chạy từ dưới lên.
const START: Point = { x: 150, y: 355 }
const FORK: Point = { x: 150, y: 262 }
const CONTROL: Point = { x: 150, y: 150 }
const BRANCH_END_Y = 112
const FLAG_SIZE = 64
const CAR_W = 34
const CAR_H = 63

const GRAB_RADIUS = 60 // chạm trong khoảng này quanh xe là "cầm" được xe
const MAX_JUMP = 70 // xe không nhảy cóc quá xa một lần
const ARRIVE_T = 0.93 // kéo tới đây là coi như tới lá cờ
const SAMPLES = 40
const CELEBRATE_MS = 1600

const START_POS: CarPos = { seg: -1, t: 0 }

function branchXs(count: number): number[] {
  return count === 2 ? [80, 220] : [50, 150, 250]
}

function bezier(p2: Point, t: number): CarPose {
  const p0 = FORK
  const p1 = CONTROL
  const u = 1 - t
  const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x
  const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
  const dx = 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x)
  const dy = 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90 }
}

function poseOf(pos: CarPos, xs: number[]): CarPose {
  if (pos.seg < 0) return { x: START.x, y: START.y + (FORK.y - START.y) * pos.t, angle: 0 }
  return bezier({ x: xs[pos.seg], y: BRANCH_END_Y }, pos.t)
}

/** Điểm trên đường gần ngón tay nhất mà xe được phép tới từ vị trí hiện tại. */
function nearestOnRoad(p: Point, current: CarPos, xs: number[]): CarPos | null {
  const candidates: CarPos[] = []
  const onTrunk = current.seg < 0
  if (onTrunk || current.t < 0.15) {
    const t = Math.max(0, Math.min(1, (START.y - p.y) / (START.y - FORK.y)))
    candidates.push({ seg: -1, t })
  }
  xs.forEach((_, i) => {
    const allowed = onTrunk ? current.t > 0.85 : current.seg === i || current.t < 0.15
    if (!allowed) return
    let best = 0
    let bestD = Infinity
    for (let k = 0; k <= SAMPLES; k++) {
      const q = poseOf({ seg: i, t: k / SAMPLES }, xs)
      const d = Math.hypot(q.x - p.x, q.y - p.y)
      if (d < bestD) {
        bestD = d
        best = k / SAMPLES
      }
    }
    candidates.push({ seg: i, t: best })
  })
  const here = poseOf(current, xs)
  let chosen: CarPos | null = null
  let chosenD = Infinity
  for (const c of candidates) {
    const q = poseOf(c, xs)
    if (Math.hypot(q.x - here.x, q.y - here.y) > MAX_JUMP) continue
    const d = Math.hypot(q.x - p.x, q.y - p.y)
    if (d < chosenD) {
      chosenD = d
      chosen = c
    }
  }
  return chosen
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

const fill = (template: string, name: string) => template.replace('{name}', name)

export function FlagDriveGame() {
  const { lang, t } = useLanguage()
  const [choices, setChoices] = useState<2 | 3>(() => loadValue<2 | 3>('flags-choices', 2))
  const [round, setRound] = useState<Round>(() => makeRound(choices))
  const [phase, setPhase] = useState<Phase>('drive')
  const [pos, setPos] = useState<CarPos>(START_POS)
  const [dragging, setDragging] = useState(false)
  const [chosen, setChosen] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const [message, setMessage] = useState<'find' | 'retry' | 'great'>('find')
  const [collected, setCollected] = useState<Country[]>([])
  const frame = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const xs = branchXs(round.options.length)
  const target = round.target.code

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current)
  }, [])

  // Mỗi lượt mới: đọc yêu cầu.
  useEffect(() => {
    playLine(lang, `flags-find-${target}`)
  }, [target, lang])

  const sayFind = () => {
    setMessage('find')
    playLine(lang, `flags-find-${target}`)
  }

  /** Cho xe tự chạy trên một đoạn đường từ t = from đến t = to. */
  const run = useCallback((seg: number, from: number, to: number, done: () => void) => {
    const ms = 250 + Math.abs(to - from) * 1100
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms)
      setPos({ seg, t: from + (to - from) * ease(p) })
      if (p < 1) frame.current = requestAnimationFrame(tick)
      else done()
    }
    frame.current = requestAnimationFrame(tick)
  }, [])

  const nextRound = useCallback((count: 2 | 3) => {
    setRound((prev) => makeRound(count, prev.target.code))
    setPos(START_POS)
    setChosen(null)
    setWrong(null)
    setMessage('find')
    setPhase('drive')
  }, [])

  const wrongFlag = (i: number) => {
    setWrong(i)
    setMessage('retry')
    playLine(lang, 'flags-retry')
    window.setTimeout(() => setWrong(null), 600)
  }

  /** Xe đã tới lá cờ cuối nhánh i. */
  const arrive = (i: number, at: CarPos) => {
    setDragging(false)
    if (round.options[i].code !== target) {
      // Sai: lá cờ lắc, xe lùi về ngã rẽ để bé chọn lại.
      wrongFlag(i)
      setPhase('auto')
      run(i, at.t, 0, () => setPhase('drive'))
      return
    }
    setPos({ seg: i, t: 1 })
    setChosen(i)
    setPhase('celebrate')
    setMessage('great')
    playLine(lang, 'flags-great')
    setCollected((list) => [...list, round.options[i]].slice(-12))
    window.setTimeout(() => nextRound(choices), CELEBRATE_MS)
  }

  // Chạm thẳng vào lá cờ: sai thì lá cờ lắc, đúng thì xe tự chạy tới.
  const tapFlag = (i: number) => {
    if (phase !== 'drive' || dragging) return
    if (round.options[i].code !== target) {
      wrongFlag(i)
      return
    }
    setPhase('auto')
    const toBranch = () => run(i, 0, 1, () => arrive(i, { seg: i, t: 1 }))
    if (pos.seg < 0) run(-1, pos.t, 1, toBranch)
    else if (pos.seg === i) run(i, pos.t, 1, () => arrive(i, { seg: i, t: 1 }))
    else run(pos.seg, pos.t, 0, toBranch)
  }

  // Kéo xe bằng ngón tay.
  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (phase !== 'drive' || !svgRef.current) return
    const p = svgPoint(svgRef.current, e.clientX, e.clientY)
    const car = poseOf(pos, xs)
    if (Math.hypot(p.x - car.x, p.y - car.y) > GRAB_RADIUS) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging || phase !== 'drive' || !svgRef.current) return
    const p = svgPoint(svgRef.current, e.clientX, e.clientY)
    const next = nearestOnRoad(p, pos, xs)
    if (!next) return
    if (next.seg >= 0 && next.t >= ARRIVE_T) {
      arrive(next.seg, next)
      return
    }
    setPos(next)
  }

  const onUp = () => setDragging(false)

  const changeChoices = (count: 2 | 3) => {
    if (count === choices || phase !== 'drive') return
    setChoices(count)
    saveValue('flags-choices', count)
    nextRound(count)
  }

  const prompt =
    message === 'find'
      ? fill(t.flagDrive.find, round.target.name[lang])
      : message === 'retry'
        ? `${t.flagDrive.retry} ${fill(t.flagDrive.find, round.target.name[lang])}`
        : t.flagDrive.great

  const roadPath = (x: number) =>
    `M ${FORK.x} ${FORK.y} Q ${CONTROL.x} ${CONTROL.y} ${x} ${BRANCH_END_Y}`

  const car = poseOf(pos, xs)
  const atStart = phase === 'drive' && pos.seg < 0 && pos.t === 0 && !dragging

  return (
    <div className="flag-drive">
      <div className="fd-top">
        <button type="button" className="fd-prompt" onClick={sayFind} aria-label={t.flagDrive.replay} aria-live="polite">
          <span className="fd-speaker" aria-hidden="true">🔊</span>
          <span>{prompt}</span>
        </button>
        <div className="fd-choices" role="group" aria-label={t.flagDrive.choices}>
          {([2, 3] as const).map((n) => (
            <button
              key={n}
              type="button"
              className={n === choices ? 'active' : ''}
              aria-pressed={n === choices}
              onClick={() => changeChoices(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        className="fd-scene"
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <rect x="-200" y="-100" width="700" height="600" fill="#9ccc65" />

        {/* Đường: thân chính + các nhánh */}
        <g fill="none" strokeLinecap="round" pointerEvents="none">
          <path d={`M ${START.x} 460 L ${FORK.x} ${FORK.y}`} stroke="#616161" strokeWidth="46" />
          {xs.map((x) => (
            <path key={`r${x}`} d={roadPath(x)} stroke="#616161" strokeWidth="40" />
          ))}
          <path d={`M ${START.x} 460 L ${FORK.x} ${FORK.y}`} stroke="#fff" strokeWidth="3" strokeDasharray="12 12" />
          {xs.map((x) => (
            <path key={`d${x}`} d={roadPath(x)} stroke="#fff" strokeWidth="3" strokeDasharray="10 12" />
          ))}
        </g>

        {/* Lá cờ cuối mỗi nhánh */}
        {round.options.map((c, i) => {
          const x = xs[i]
          const cls = ['fd-flag', wrong === i ? 'shake' : '', chosen === i && phase === 'celebrate' ? 'won' : ''].join(' ')
          return (
            <g key={c.code} className={cls} onClick={() => tapFlag(i)} role="button" aria-label={c.name[lang]}>
              <rect x={x - 45} y={10} width={90} height={84} fill="transparent" />
              <rect x={x - 2} y={40} width={4} height={BRANCH_END_Y - 40} fill="#5d4037" pointerEvents="none" />
              <g className="fd-flag-art" style={{ transformOrigin: `${x}px 50px` }}>
                <rect x={x - FLAG_SIZE / 2 - 4} y={14} width={FLAG_SIZE + 8} height={FLAG_SIZE + 8} rx={10} fill="#fff" />
                <image href={flagSrc(c.code)} x={x - FLAG_SIZE / 2} y={18} width={FLAG_SIZE} height={FLAG_SIZE} />
              </g>
            </g>
          )
        })}

        {/* Vòng sáng gợi ý bé đặt tay lên xe */}
        {atStart && <circle className="fd-hint" cx={car.x} cy={car.y} r="40" pointerEvents="none" />}

        <g className={dragging ? 'fd-car grabbed' : 'fd-car'} pointerEvents="none">
          <image
            href="/assets/kenney/racing-pack/car_red_1.png"
            x={-CAR_W / 2}
            y={-CAR_H / 2}
            width={CAR_W}
            height={CAR_H}
            transform={`translate(${car.x} ${car.y}) rotate(${car.angle})`}
          />
        </g>
      </svg>

      <div className="fd-collected" aria-hidden={collected.length === 0}>
        {collected.map((c, i) => (
          <img key={`${c.code}-${i}`} src={flagSrc(c.code)} alt={c.name[lang]} />
        ))}
      </div>
    </div>
  )
}
