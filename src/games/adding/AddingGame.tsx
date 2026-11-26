// Trò "Phép cộng bằng hình": hai đĩa táo, ở giữa có dấu cộng, dưới là phép tính "2 + 1 = ?".
// Bé chạm đếm hết táo, đếm nối tiếp từ đĩa trái sang đĩa phải (giọng đọc số theo từng lần chạm),
// rồi chọn đáp án trong 3 nút số. Đúng thì giọng đọc cả phép tính: "Hai cộng một bằng ba".
// Dễ: tổng ≤ 5, Vừa: tổng ≤ 7 (phải chạm đếm hết mới hiện nút số).
// Khó: tổng ≤ 10, nút số hiện ngay (vẫn chạm đếm được).
//
// Âm thanh: adding-intro, adding-ask, math-plus, math-equals, number-1 … number-10,
// common-retry, common-finish.

import { useEffect, useRef, useState } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { GameTop } from '../shared/GameTop'
import { FinishScreen, StarBar } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { randInt, shuffle } from '../shared/util'

type Round = { a: number; b: number; choices: number[] }
type Phase = 'count' | 'answer' | 'celebrate'
type Apple = { x: number; y: number; plate: 0 | 1 }

const MAX_TOTAL: Record<Level, number> = { easy: 5, medium: 7, hard: 10 }

// Toạ độ trong viewBox 0 0 300 260.
const PLATE_X = [72, 228]
const PLATE_Y = 112
// Cỡ táo: đĩa có tối đa 6 quả (2 hàng) thì táo to; 7–9 quả (3 hàng) thì nhỏ lại cho vừa đĩa.
const SIZE_BIG = { cell: 36, scale: 0.56 }
const SIZE_SMALL = { cell: 31, scale: 0.47 }
type Size = typeof SIZE_BIG

function makeRound(level: Level, previous?: Round): Round {
  const max = MAX_TOTAL[level]
  let a = 1
  let b = 1
  // Không lặp lại đúng phép tính của câu trước.
  do {
    const sum = randInt(2, max)
    a = randInt(1, sum - 1)
    b = sum - a
  } while (previous && previous.a === a && previous.b === b)
  const sum = a + b
  const others = shuffle(Array.from({ length: max }, (_, i) => i + 1).filter((n) => n !== sum))
  return { a, b, choices: shuffle([sum, ...others.slice(0, 2)]) }
}

/** Xếp `count` quả táo thành lưới tối đa 3 cột quanh tâm đĩa. */
function layoutPlate(count: number, plate: 0 | 1, cell: number): Apple[] {
  const cols = Math.min(count, 3)
  const rows = Math.ceil(count / 3)
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / 3)
    const inRow = row === rows - 1 ? count - row * 3 : cols
    const col = i % 3
    return {
      x: PLATE_X[plate] + (col - (inRow - 1) / 2) * cell,
      // Hình táo có cuống phía trên nên dời xuống một chút cho cân giữa đĩa.
      y: PLATE_Y + 4 + (row - (rows - 1) / 2) * cell,
      plate,
    }
  })
}

function AppleShape({ x, y, scale, number }: { x: number; y: number; scale: number; number?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 -26 Q4 -36 12 -38" stroke="#6d4c41" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="10" cy="-30" rx="9" ry="5" fill="#66bb6a" transform="rotate(-25 10 -30)" />
      <path
        d="M0 -22 C-14 -32 -32 -22 -30 0 C-28 20 -14 30 0 24 C14 30 28 20 30 0 C32 -22 14 -32 0 -22 Z"
        fill={number ? '#c62828' : '#e53935'}
      />
      <ellipse cx="-12" cy="-8" rx="6" ry="9" fill="#fff" opacity="0.35" />
      {number && (
        <>
          <circle cx="0" cy="2" r="17" fill="#fff" />
          <text x="0" y="11" textAnchor="middle" fontSize="26" fontWeight="800" fill="#3e2723">
            {number}
          </text>
        </>
      )}
    </g>
  )
}

function Plate({ x, active }: { x: number; active: boolean }) {
  return (
    <g>
      <ellipse cx={x} cy={PLATE_Y + 6} rx="68" ry="62" fill="#ffffff" stroke={active ? '#ffb300' : '#e0d6cc'} strokeWidth={active ? 5 : 3} />
      <ellipse cx={x} cy={PLATE_Y + 6} rx="54" ry="48" fill="none" stroke="#f1e9e0" strokeWidth="2" />
    </g>
  )
}

export function AddingGame({ id, onExit }: GameProps) {
  const session = useSession(id)
  const { lang, t } = useLanguage()
  const [level, setLevel] = useLevel('adding')
  const [round, setRound] = useState(() => makeRound(level))
  const [tapped, setTapped] = useState<number[]>([]) // chỉ số các quả đã chạm, theo thứ tự đếm
  const [phase, setPhase] = useState<Phase>(level === 'hard' ? 'answer' : 'count')
  const [wrong, setWrong] = useState<number | null>(null)
  const [nudge, setNudge] = useState(false) // chạm đĩa phải khi chưa đếm xong đĩa trái
  const [message, setMessage] = useState<'intro' | 'ask' | 'retry' | 'great'>(level === 'hard' ? 'ask' : 'intro')
  // Mỗi câu mới tăng số này, để chuỗi đọc phép tính của câu cũ không chạy tiếp.
  const token = useRef(0)

  const size: Size = Math.max(round.a, round.b) > 6 ? SIZE_SMALL : SIZE_BIG
  const apples = [...layoutPlate(round.a, 0, size.cell), ...layoutPlate(round.b, 1, size.cell)]
  const sum = round.a + round.b

  // Đọc lời mở đầu mỗi câu mới.
  useEffect(() => {
    playLine(lang, level === 'hard' ? 'adding-ask' : 'adding-intro')
  }, [round, lang, level])

  useEffect(() => () => void token.current++, [])

  const newRound = (lv: Level) => {
    token.current++
    setRound((r) => makeRound(lv, r))
    setTapped([])
    setPhase(lv === 'hard' ? 'answer' : 'count')
    setWrong(null)
    setNudge(false)
    setMessage(lv === 'hard' ? 'ask' : 'intro')
  }

  const tapApple = (i: number) => {
    if (phase === 'celebrate' || tapped.includes(i)) return
    // Đếm đĩa trái trước rồi mới tới đĩa phải.
    if (apples[i].plate === 1 && tapped.length < round.a) {
      setNudge(true)
      window.setTimeout(() => setNudge(false), 600)
      return
    }
    const next = [...tapped, i]
    setTapped(next)
    playLine(lang, `number-${next.length}`)
    if (next.length === sum && phase === 'count') {
      setPhase('answer')
      window.setTimeout(() => {
        setMessage('ask')
        playLine(lang, 'adding-ask')
      }, 900)
    }
  }

  /** Đọc "a cộng b bằng tổng", xong thì sang câu mới (hoặc màn hoàn thành). */
  const readEquation = (done: boolean) => {
    const my = ++token.current
    const lines = [`number-${round.a}`, 'math-plus', `number-${round.b}`, 'math-equals', `number-${sum}`]
    const step = (i: number) => {
      if (my !== token.current) return
      if (i >= lines.length) {
        window.setTimeout(() => {
          if (my !== token.current) return
          if (done) session.finish()
          else newRound(level)
        }, 700)
        return
      }
      playLine(lang, lines[i], () => step(i + 1))
    }
    step(0)
  }

  const answer = (n: number) => {
    if (phase !== 'answer') return
    if (n !== sum) {
      setWrong(n)
      setMessage('retry')
      playLine(lang, 'common-retry')
      window.setTimeout(() => setWrong(null), 600)
      return
    }
    setPhase('celebrate')
    setMessage('great')
    readEquation(session.win())
  }

  const replay = () => {
    if (phase === 'celebrate') return
    if (phase === 'count') {
      setMessage('intro')
      playLine(lang, 'adding-intro')
    } else {
      setMessage('ask')
      playLine(lang, 'adding-ask')
    }
  }

  const changeLevel = (lv: Level) => {
    if (lv === level || phase === 'celebrate') return
    setLevel(lv)
    session.restart()
    newRound(lv)
  }

  const text =
    message === 'intro'
      ? t.adding.intro
      : message === 'ask'
        ? t.adding.ask
        : message === 'retry'
          ? `${t.common.retry} ${t.adding.ask}`
          : t.common.great

  const leftActive = phase === 'count' && tapped.length < round.a
  const rightActive = phase === 'count' && tapped.length >= round.a

  return (
    <div className="g-game">
      <GameTop text={text} onReplay={replay} level={level} onLevel={changeLevel} />
      <StarBar stars={session.stars} />
      <svg className="g-scene" viewBox="0 0 300 260" preserveAspectRatio="xMidYMid meet">
        <rect x="-200" y="-100" width="700" height="460" fill="#fff3e0" />
        <Plate x={PLATE_X[0]} active={leftActive} />
        <g className={nudge ? 'g-shake' : undefined}>
          <Plate x={PLATE_X[1]} active={rightActive} />
        </g>
        {/* Dấu cộng giữa hai đĩa */}
        <g transform={`translate(150 ${PLATE_Y + 6})`}>
          <circle r="13" fill="#ffb300" />
          <path d="M-7 0 H7 M0 -7 V7" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </g>
        {apples.map((ap, i) => {
          const order = tapped.indexOf(i)
          return (
            <g
              key={`${round.a}-${round.b}-${i}`}
              className={`g-tap${phase === 'celebrate' ? ' g-bounce' : ''}`}
              onClick={() => tapApple(i)}
              role="button"
              aria-label={order >= 0 ? String(order + 1) : 'apple'}
            >
              <circle cx={ap.x} cy={ap.y} r={size.cell / 2} fill="transparent" />
              <AppleShape x={ap.x} y={ap.y} scale={size.scale} number={order >= 0 ? order + 1 : undefined} />
            </g>
          )
        })}
        {/* Phép tính */}
        <text x="150" y="226" textAnchor="middle" fontSize="34" fontWeight="800" fill="#5d4037">
          {round.a} + {round.b} = <tspan fill={phase === 'celebrate' ? '#2e7d32' : '#ff7043'}>{phase === 'celebrate' ? sum : '?'}</tspan>
        </text>
      </svg>
      <div className="g-answers">
        {phase !== 'count' &&
          round.choices.map((n) => (
            <button
              key={n}
              type="button"
              className={`g-answer${wrong === n ? ' g-shake' : ''}${phase === 'celebrate' && n === sum ? ' g-bounce' : ''}`}
              onClick={() => answer(n)}
            >
              {n}
            </button>
          ))}
      </div>
      {session.finished && (
        <FinishScreen
          onReplay={() => {
            session.restart()
            newRound(level)
          }}
          onExit={onExit}
        />
      )}
    </div>
  )
}
