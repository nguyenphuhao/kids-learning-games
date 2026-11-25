// Thanh sao tiến độ và màn hình hoàn thành.

import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage'
import { ROUNDS } from './session'
import { shuffle } from './util'

export function StarBar({ stars }: { stars: number }) {
  return (
    <div className="g-stars" aria-label={`${stars}/${ROUNDS}`}>
      {Array.from({ length: ROUNDS }, (_, i) => (
        <span key={i} className={i < stars ? 'on' : ''}>
          ★
        </span>
      ))}
    </div>
  )
}

const CONFETTI_COLORS = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#fb8c00']

export function FinishScreen({
  onReplay,
  onExit,
  text,
  onNext,
}: {
  onReplay: () => void
  onExit: () => void
  /** Lời khen thay cho câu mặc định (ví dụ "Xong vòng 2!"). */
  text?: string
  /** Có thì nút đầu là "Vòng tiếp" thay cho "Chơi lại". */
  onNext?: () => void
}) {
  const { t } = useLanguage()
  const [pieces] = useState(() =>
    shuffle(Array.from({ length: 36 }, (_, i) => i)).map((i) => ({
      left: (i * 97) % 100,
      delay: (i % 9) * 0.15,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })),
  )
  return (
    <div className="g-finish" role="dialog" aria-label={text ?? t.common.finish}>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="g-confetti"
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, background: p.color }}
        />
      ))}
      <svg className="g-trophy" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M30 18 H70 V40 C70 56 60 64 50 64 C40 64 30 56 30 40 Z" fill="#ffc107" />
        <path d="M30 24 H18 C18 40 26 46 32 46 M70 24 H82 C82 40 74 46 68 46" stroke="#ffc107" strokeWidth="6" fill="none" />
        <rect x="45" y="62" width="10" height="14" fill="#ffb300" />
        <rect x="34" y="76" width="32" height="10" rx="3" fill="#8d6e63" />
        <path d="M50 28 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1 Z" fill="#fff8e1" />
      </svg>
      <StarBar stars={ROUNDS} />
      <p className="g-finish-text">{text ?? t.common.finish}</p>
      <div className="g-finish-buttons">
        {onNext ? (
          <button type="button" onClick={onNext}>
            <span aria-hidden="true">▶</span> {t.common.nextRound}
          </button>
        ) : (
          <button type="button" onClick={onReplay}>
            <span aria-hidden="true">↻</span> {t.common.playAgain}
          </button>
        )}
        <button type="button" onClick={onExit}>
          <span aria-hidden="true">⌂</span> {t.common.home}
        </button>
      </div>
    </div>
  )
}
