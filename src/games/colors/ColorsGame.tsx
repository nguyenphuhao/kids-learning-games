// Trò "Tìm màu": "Chạm vào quả bóng màu đỏ!". Bóng đúng bay lên.
// Mức dễ 3 quả bóng, mức khó 5 quả.
//
// Âm thanh: colors-find-<màu>, common-great, common-retry.

import { useEffect, useState } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { GameTop } from '../shared/GameTop'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS, pick, shuffle } from '../shared/util'
import './colors.css'

const COLORS = {
  red: '#e53935',
  blue: '#1e88e5',
  yellow: '#fdd835',
  green: '#43a047',
  orange: '#fb8c00',
  purple: '#8e24aa',
} as const

type ColorName = keyof typeof COLORS
type Round = { options: ColorName[]; target: ColorName }

function makeRound(level: Level, previous?: ColorName): Round {
  const count = level === 'easy' ? 3 : 5
  const options = shuffle(Object.keys(COLORS) as ColorName[]).slice(0, count)
  const target = pick(options.filter((c) => c !== previous))
  return { options, target }
}

export function ColorsGame() {
  const { lang, t } = useLanguage()
  const [level, setLevel] = useLevel('colors')
  const [round, setRound] = useState(() => makeRound(level))
  const [wrong, setWrong] = useState<ColorName | null>(null)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState<'find' | 'retry' | 'great'>('find')

  const target = round.target
  useEffect(() => {
    playLine(lang, `colors-find-${target}`)
  }, [round, target, lang])

  const newRound = (lv: Level) => {
    setRound((r) => makeRound(lv, r.target))
    setWon(false)
    setWrong(null)
    setMessage('find')
  }

  const tap = (c: ColorName) => {
    if (won) return
    if (c !== target) {
      setWrong(c)
      setMessage('retry')
      playLine(lang, 'common-retry')
      window.setTimeout(() => setWrong(null), 600)
      return
    }
    setWon(true)
    setMessage('great')
    playLine(lang, 'common-great')
    window.setTimeout(() => newRound(level), CELEBRATE_MS)
  }

  const changeLevel = (lv: Level) => {
    if (lv === level || won) return
    setLevel(lv)
    newRound(lv)
  }

  const find = t.colors.find.replace('{color}', t.colors.names[target])
  const text = message === 'find' ? find : message === 'retry' ? `${t.common.retry} ${find}` : t.common.great

  const n = round.options.length
  const gap = 300 / n

  return (
    <div className="g-game">
      <GameTop
        text={text}
        onReplay={() => {
          setMessage('find')
          playLine(lang, `colors-find-${target}`)
        }}
        level={level}
        onLevel={changeLevel}
      />
      <svg className="g-scene" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
        <rect x="-200" y="-100" width="700" height="500" fill="#e1f5fe" />
        <ellipse cx="60" cy="50" rx="40" ry="14" fill="#fff" />
        <ellipse cx="230" cy="80" rx="46" ry="15" fill="#fff" />
        {round.options.map((c, i) => {
          const x = gap / 2 + i * gap
          const y = 150 + (i % 2) * 30
          const r = Math.min(34, gap / 2 - 6)
          const cls = [
            'balloon',
            'g-tap',
            wrong === c ? 'g-shake' : '',
            won && c === target ? 'fly' : '',
            won && c !== target ? 'fade' : '',
          ].join(' ')
          return (
            <g
              key={c}
              className={cls}
              style={{ animationDelay: `${i * 0.3}s` }}
              onClick={() => tap(c)}
              role="button"
              aria-label={t.colors.names[c]}
            >
              <rect x={x - r - 6} y={y - r * 1.25 - 6} width={2 * r + 12} height={r * 2.5 + 90} fill="transparent" />
              <path d={`M${x} ${y + r * 1.2} q -8 30 4 60 q 10 25 -4 50`} stroke="#90a4ae" strokeWidth="2" fill="none" />
              <ellipse cx={x} cy={y} rx={r} ry={r * 1.2} fill={COLORS[c]} />
              <path d={`M${x - 5} ${y + r * 1.2 + 6} L${x} ${y + r * 1.2 - 2} L${x + 5} ${y + r * 1.2 + 6} Z`} fill={COLORS[c]} />
              <ellipse cx={x - r * 0.35} cy={y - r * 0.45} rx={r * 0.18} ry={r * 0.32} fill="#fff" opacity="0.5" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
