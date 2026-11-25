// Trò "Đếm đồ vật": bé chạm từng quả táo, giọng đọc đếm "một, hai, ba…",
// đếm xong thì chọn đúng số. Mức dễ 1–5 quả, mức khó 1–10 quả.
//
// Âm thanh: counting-intro, counting-ask, number-1 … number-10, common-great, common-retry.

import { useEffect, useState } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { GameTop } from '../shared/GameTop'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS, randInt, shuffle } from '../shared/util'

type Apple = { x: number; y: number }
type Round = { apples: Apple[]; choices: number[] }
type Phase = 'count' | 'answer' | 'celebrate'

const COLS = 4
const ROWS = 3
const CELL_W = 70
const CELL_H = 78

function makeRound(level: Level, previous?: number): Round {
  const max = level === 'easy' ? 5 : 10
  let count = randInt(1, max)
  if (count === previous) count = (count % max) + 1
  const cells = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i)).slice(0, count)
  const apples = cells.map((c) => ({
    x: 45 + (c % COLS) * CELL_W + randInt(-3, 3),
    y: 50 + Math.floor(c / COLS) * CELL_H + randInt(-3, 3),
  }))
  const others = shuffle(Array.from({ length: max }, (_, i) => i + 1).filter((n) => n !== count))
  const choices = shuffle([count, ...others.slice(0, 2)])
  return { apples, choices }
}

function AppleShape({ x, y, number }: Apple & { number?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -26 Q4 -36 12 -38" stroke="#6d4c41" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="10" cy="-30" rx="9" ry="5" fill="#66bb6a" transform="rotate(-25 10 -30)" />
      <path
        d="M0 -22 C-14 -32 -32 -22 -30 0 C-28 20 -14 30 0 24 C14 30 28 20 30 0 C32 -22 14 -32 0 -22 Z"
        fill={number ? '#c62828' : '#e53935'}
      />
      <ellipse cx="-12" cy="-8" rx="6" ry="9" fill="#fff" opacity="0.35" />
      {number && (
        <>
          <circle cx="0" cy="2" r="15" fill="#fff" />
          <text x="0" y="9" textAnchor="middle" fontSize="20" fontWeight="800" fill="#3e2723">
            {number}
          </text>
        </>
      )}
    </g>
  )
}

export function CountingGame() {
  const { lang, t } = useLanguage()
  const [level, setLevel] = useLevel('counting')
  const [round, setRound] = useState(() => makeRound(level))
  const [tapped, setTapped] = useState<number[]>([]) // thứ tự các quả đã chạm
  const [phase, setPhase] = useState<Phase>('count')
  const [wrong, setWrong] = useState<number | null>(null)
  const [message, setMessage] = useState<'intro' | 'ask' | 'retry' | 'great'>('intro')

  // Đọc lời mở đầu mỗi lượt mới.
  useEffect(() => {
    playLine(lang, 'counting-intro')
  }, [round, lang])

  const newRound = (lv: Level) => {
    setRound((r) => makeRound(lv, r.apples.length))
    setTapped([])
    setPhase('count')
    setWrong(null)
    setMessage('intro')
  }

  const tapApple = (i: number) => {
    if (phase !== 'count' || tapped.includes(i)) return
    const next = [...tapped, i]
    setTapped(next)
    playLine(lang, `number-${next.length}`)
    if (next.length === round.apples.length) {
      setPhase('answer')
      window.setTimeout(() => {
        setMessage('ask')
        playLine(lang, 'counting-ask')
      }, 900)
    }
  }

  const answer = (n: number) => {
    if (phase !== 'answer') return
    if (n !== round.apples.length) {
      setWrong(n)
      setMessage('retry')
      playLine(lang, 'common-retry')
      window.setTimeout(() => setWrong(null), 600)
      return
    }
    setPhase('celebrate')
    setMessage('great')
    playLine(lang, 'common-great')
    window.setTimeout(() => newRound(level), CELEBRATE_MS)
  }

  const replay = () => {
    if (phase === 'count') {
      setMessage('intro')
      playLine(lang, 'counting-intro')
    } else {
      setMessage('ask')
      playLine(lang, 'counting-ask')
    }
  }

  const changeLevel = (lv: Level) => {
    if (lv === level || phase === 'celebrate') return
    setLevel(lv)
    newRound(lv)
  }

  const text =
    message === 'intro'
      ? t.counting.intro
      : message === 'ask'
        ? t.counting.ask
        : message === 'retry'
          ? `${t.common.retry} ${t.counting.ask}`
          : t.common.great

  return (
    <div className="g-game">
      <GameTop text={text} onReplay={replay} level={level} onLevel={changeLevel} />
      <svg className="g-scene" viewBox="0 0 300 260" preserveAspectRatio="xMidYMid meet">
        <rect x="-200" y="-100" width="700" height="460" fill="#fff3e0" />
        {round.apples.map((a, i) => {
          const order = tapped.indexOf(i)
          return (
            <g
              key={i}
              className={`g-tap${phase === 'celebrate' ? ' g-bounce' : ''}`}
              onClick={() => tapApple(i)}
              role="button"
              aria-label={order >= 0 ? String(order + 1) : 'apple'}
            >
              <circle cx={a.x} cy={a.y} r="34" fill="transparent" />
              <AppleShape x={a.x} y={a.y} number={order >= 0 ? order + 1 : undefined} />
            </g>
          )
        })}
      </svg>
      <div className="g-answers">
        {phase !== 'count' &&
          round.choices.map((n) => (
            <button
              key={n}
              type="button"
              className={`g-answer${wrong === n ? ' g-shake' : ''}${phase === 'celebrate' && n === round.apples.length ? ' g-bounce' : ''}`}
              onClick={() => answer(n)}
            >
              {n}
            </button>
          ))}
      </div>
    </div>
  )
}
