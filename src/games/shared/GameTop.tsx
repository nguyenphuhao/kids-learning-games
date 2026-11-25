// Thanh trên cùng của màn chơi: câu yêu cầu (chạm để nghe lại) và nút chọn mức dễ/khó.

import { useLanguage } from '../../i18n/useLanguage'
import { LEVELS, type Level } from './useLevel'
import './game.css'

type Props = {
  text: string
  onReplay: () => void
  level: Level
  onLevel: (level: Level) => void
}

export function GameTop({ text, onReplay, level, onLevel }: Props) {
  const { t } = useLanguage()
  return (
    <div className="g-top">
      <button type="button" className="g-prompt" onClick={onReplay} aria-label={t.common.replay} aria-live="polite">
        <span className="g-speaker" aria-hidden="true">🔊</span>
        <span>{text}</span>
      </button>
      <div className="g-levels" role="group" aria-label={t.common.level}>
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            className={l === level ? 'active' : ''}
            aria-pressed={l === level}
            onClick={() => onLevel(l)}
          >
            {t.common[l]}
          </button>
        ))}
      </div>
    </div>
  )
}
