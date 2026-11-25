// Trò "Nhiều hay ít": hai giỏ cam, bé chạm vào giỏ đúng.
// Mức dễ: chỉ hỏi "nhiều hơn", hai giỏ chênh nhau ít nhất 3 quả (1–6 quả).
// Mức khó: hỏi "nhiều hơn" hoặc "ít hơn", chênh nhau ít nhất 1 quả (1–9 quả).
//
// Âm thanh: compare-more, compare-less, common-great, common-retry.

import { useEffect, useState } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { GameTop } from '../shared/GameTop'
import { FinishScreen, StarBar } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS, pick, randInt } from '../shared/util'

type Ask = 'more' | 'less'
type Round = { counts: [number, number]; ask: Ask }

function makeRound(level: Level): Round {
  const max = level === 'easy' ? 6 : 9
  const minGap = level === 'easy' ? 3 : 1
  let a = randInt(1, max)
  let b = randInt(1, max)
  while (Math.abs(a - b) < minGap) {
    a = randInt(1, max)
    b = randInt(1, max)
  }
  const ask: Ask = level === 'easy' ? 'more' : pick(['more', 'less'])
  return { counts: [a, b], ask }
}

function Basket({ x, count }: { x: number; count: number }) {
  // Cam xếp thành 3 cột, chồng từ dưới lên.
  const oranges = Array.from({ length: count }, (_, i) => ({
    cx: x - 26 + (i % 3) * 26,
    cy: 186 - Math.floor(i / 3) * 24,
  }))
  return (
    <g>
      {oranges.map((o, i) => (
        <g key={i}>
          <circle cx={o.cx} cy={o.cy} r="12" fill="#fb8c00" />
          <circle cx={o.cx - 4} cy={o.cy - 4} r="3" fill="#fff" opacity="0.4" />
          <ellipse cx={o.cx + 3} cy={o.cy - 12} rx="4" ry="2" fill="#43a047" />
        </g>
      ))}
      <path d={`M${x - 58} 196 L${x + 58} 196 L${x + 46} 250 L${x - 46} 250 Z`} fill="#8d6e63" />
      <path d={`M${x - 52} 212 L${x + 52} 212 M${x - 49} 228 L${x + 49} 228`} stroke="#6d4c41" strokeWidth="3" />
    </g>
  )
}

export function CompareGame({ id, onExit }: GameProps) {
  const session = useSession(id)
  const { lang, t } = useLanguage()
  const [level, setLevel] = useLevel('compare')
  const [round, setRound] = useState(() => makeRound(level))
  const [wrong, setWrong] = useState<number | null>(null)
  const [won, setWon] = useState<number | null>(null)
  const [retry, setRetry] = useState(false)

  const key = `compare-${round.ask}`
  useEffect(() => {
    playLine(lang, key)
  }, [round, key, lang])

  const [a, b] = round.counts
  const correct = round.ask === 'more' ? (a > b ? 0 : 1) : a < b ? 0 : 1

  const newRound = (lv: Level) => {
    setRound(makeRound(lv))
    setWon(null)
    setWrong(null)
    setRetry(false)
  }

  const tap = (i: number) => {
    if (won !== null) return
    if (i !== correct) {
      setWrong(i)
      setRetry(true)
      playLine(lang, 'common-retry')
      window.setTimeout(() => setWrong(null), 600)
      return
    }
    setWon(i)
    playLine(lang, 'common-great')
    const done = session.win()
    window.setTimeout(() => (done ? session.finish() : newRound(level)), CELEBRATE_MS)
  }

  const changeLevel = (lv: Level) => {
    if (lv === level || won !== null) return
    setLevel(lv)
    session.restart()
    newRound(lv)
  }

  const ask = t.compare[round.ask]
  const text = won !== null ? t.common.great : retry ? `${t.common.retry} ${ask}` : ask

  return (
    <div className="g-game">
      <GameTop
        text={text}
        onReplay={() => {
          setRetry(false)
          playLine(lang, key)
        }}
        level={level}
        onLevel={changeLevel}
      />
      <StarBar stars={session.stars} />
      <svg className="g-scene" viewBox="0 0 300 270" preserveAspectRatio="xMidYMid meet">
        <rect x="-200" y="-100" width="700" height="470" fill="#e3f2fd" />
        <rect x="-200" y="250" width="700" height="120" fill="#a5d6a7" />
        {[0, 1].map((i) => (
          <g
            key={i}
            className={`g-tap${wrong === i ? ' g-shake' : ''}${won === i ? ' g-bounce' : ''}`}
            onClick={() => tap(i)}
            role="button"
            aria-label={String(round.counts[i])}
          >
            <rect x={i * 150 + 5} y="20" width="140" height="240" rx="20" fill="transparent" />
            <Basket x={i * 150 + 75} count={round.counts[i]} />
          </g>
        ))}
      </svg>
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
