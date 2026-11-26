// Trò "Tô theo nét": bé đặt ngón tay lên chú ong rồi kéo theo đường chấm tới bông hoa.
// Nét tô hiện ra theo ngón tay; ong chỉ đi tiếp khi ngón tay còn ở gần đường chấm.
// Nhấc tay giữa chừng thì ong đứng chờ, bé chạm lại vào ong để tô tiếp.
// Dễ: nét thẳng. Vừa: nét cong. Khó: nét kết hợp, phải tô sát đường hơn.
//
// Âm thanh: trace-intro, trace-start (chạm sai chỗ lúc bắt đầu), common-great.

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { GameTop } from '../shared/GameTop'
import { FinishScreen, StarBar } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS, pick, shuffle, svgPoint } from '../shared/util'
import { STROKES, TOLERANCE, type Point, type Stroke } from './strokes'
import './tracing.css'

const LOOKAHEAD = 14 // số điểm phía trước ong được xét mỗi lần ngón tay di chuyển (~42 đơn vị)
const FLOWER_COLORS = ['#ec407a', '#ab47bc', '#ff7043', '#42a5f5', '#e53935']

type Round = { stroke: Stroke; flower: string }

/** Xấp nét xáo trộn, bỏ nét đang tô, để không lặp lại cho đến khi đã dùng hết nét của mức chơi. */
function makeDeck(level: Level, skip?: Stroke): Stroke[] {
  return shuffle(STROKES[level].filter((s) => s !== skip))
}

const toD = (pts: Point[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

function Bee({ flip }: { flip: boolean }) {
  return (
    <g transform={flip ? 'scale(-1 1)' : undefined}>
      <ellipse cx="-4" cy="-16" rx="10" ry="13" fill="#e3f2fd" opacity="0.9" transform="rotate(-20 -4 -16)" />
      <ellipse cx="7" cy="-15" rx="9" ry="12" fill="#e3f2fd" opacity="0.9" transform="rotate(20 7 -15)" />
      <ellipse cx="0" cy="0" rx="20" ry="15" fill="#fdd835" stroke="#5d4037" strokeWidth="2.5" />
      <path d="M-6 -14 Q-9 0 -6 14 M4 -15 Q1 0 4 15" stroke="#5d4037" strokeWidth="5" fill="none" />
      <circle cx="13" cy="-3" r="3" fill="#3e2723" />
      <path d="M-20 0 L-27 0" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

function Flower({ color }: { color: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={14 * Math.cos((a * Math.PI) / 180)} cy={14 * Math.sin((a * Math.PI) / 180)} r="10" fill={color} />
      ))}
      <circle r="9" fill="#ffeb3b" stroke="#f9a825" strokeWidth="2" />
    </g>
  )
}

export function TracingGame({ id, onExit }: GameProps) {
  const session = useSession(id)
  const { lang, t } = useLanguage()
  const [level, setLevel] = useLevel('tracing')
  const [round, setRound] = useState<Round>(() => ({ stroke: pick(STROKES[level]), flower: pick(FLOWER_COLORS) }))
  const deck = useRef<Stroke[]>([])
  const nextRound = (lv: Level, current?: Stroke): Round => {
    if (deck.current.length === 0) deck.current = makeDeck(lv, current)
    return { stroke: deck.current.pop()!, flower: pick(FLOWER_COLORS) }
  }
  const [progress, setProgress] = useState(0) // chỉ số điểm ong đang đứng
  const [drawing, setDrawing] = useState(false)
  const [message, setMessage] = useState<'intro' | 'start' | 'great'>('intro')
  const svgRef = useRef<SVGSVGElement>(null)

  const pts = round.stroke.points
  const last = pts.length - 1
  const done = progress >= last
  const tol = TOLERANCE[level]

  useEffect(() => {
    playLine(lang, 'trace-intro')
  }, [round, lang])

  const startRound = (lv: Level, current?: Stroke) => {
    setRound(nextRound(lv, current))
    setProgress(0)
    setDrawing(false)
    setMessage('intro')
  }

  const finishStroke = () => {
    setDrawing(false)
    setMessage('great')
    playLine(lang, 'common-great')
    const end = session.win()
    window.setTimeout(() => (end ? session.finish() : startRound(level, round.stroke)), CELEBRATE_MS)
  }

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (done || session.finished || !svgRef.current) return
    const p = svgPoint(svgRef.current, e.clientX, e.clientY)
    const bee = pts[progress]
    if (Math.hypot(p.x - bee.x, p.y - bee.y) > tol + 16) {
      setMessage('start')
      playLine(lang, 'trace-start')
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrawing(true)
  }

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawing || done || !svgRef.current) return
    const p = svgPoint(svgRef.current, e.clientX, e.clientY)
    // Tìm điểm gần ngón tay nhất trong đoạn ngay phía trước ong (không cho đi tắt).
    let best = -1
    let bestDist = Infinity
    for (let i = progress; i <= Math.min(last, progress + LOOKAHEAD); i++) {
      const d = Math.hypot(p.x - pts[i].x, p.y - pts[i].y)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    if (best > progress && bestDist <= tol) {
      // Gần tới hoa thì tính là xong luôn.
      const next = last - best <= 2 ? last : best
      setProgress(next)
      if (next === last) finishStroke()
    }
  }

  const up = () => setDrawing(false)

  const changeLevel = (lv: Level) => {
    if (lv === level || done) return
    setLevel(lv)
    session.restart()
    deck.current = []
    startRound(lv)
  }

  const text = message === 'intro' ? t.tracing.intro : message === 'start' ? t.tracing.start : t.common.great
  const bee = pts[progress]
  const ahead = pts[Math.min(last, progress + 4)]
  const behind = pts[Math.max(0, progress - 4)]
  const flip = ahead.x - behind.x < -0.5
  const end = pts[last]

  return (
    <div className="g-game">
      <GameTop
        text={text}
        onReplay={() => {
          setMessage('intro')
          playLine(lang, 'trace-intro')
        }}
        level={level}
        onLevel={changeLevel}
      />
      <StarBar stars={session.stars} />
      <svg
        ref={svgRef}
        className="g-scene tr-scene"
        viewBox="0 0 300 300"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        aria-label={t.tracing.intro}
      >
        <rect x="-300" y="-300" width="900" height="900" fill="#fffde7" />
        {/* Lề rộng dọc theo đường: cho bé thấy vùng được phép tô. */}
        <path d={toD(pts)} fill="none" stroke="#fff3c4" strokeWidth={tol * 2} strokeLinecap="round" strokeLinejoin="round" />
        {/* Đường chấm. */}
        <path d={toD(pts)} fill="none" stroke="#a1887f" strokeWidth="7" strokeLinecap="round" strokeDasharray="0.1 13" />
        {/* Nét bé đã tô. */}
        {progress > 0 && (
          <path
            d={toD(pts.slice(0, progress + 1))}
            fill="none"
            stroke="#ff7043"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <g transform={`translate(${end.x} ${end.y})`}>
          {/* Hiệu ứng nảy đặt ở lớp trong: transform của CSS sẽ đè transform="translate" nếu để chung. */}
          <g className={done ? 'g-bounce' : ''}>
            <Flower color={round.flower} />
          </g>
        </g>
        <g transform={`translate(${bee.x} ${bee.y})`}>
          {!drawing && !done && <circle r="30" className="tr-hint" />}
          <g className={done ? 'g-bounce' : ''}>
            <Bee flip={flip} />
          </g>
        </g>
      </svg>
      {session.finished && (
        <FinishScreen
          onReplay={() => {
            session.restart()
            startRound(level, round.stroke)
          }}
          onExit={onExit}
        />
      )}
    </div>
  )
}
