import { useEffect, useState, type ReactNode } from 'react'
import { isMusicOn, setMusicOn, startMusic, stopAudio } from '../audio/audio'
import { useLanguage } from '../i18n/useLanguage'

/** Khung màn chơi / màn đọc truyện: nút quay lại, tên, nút nhạc nền. */
export function PlayScreen({ title, color, onBack, children }: { title: string; color: string; onBack: () => void; children: ReactNode }) {
  const { t } = useLanguage()
  const [music, setMusic] = useState(isMusicOn)

  // Nhạc nền chạy khi vào màn (bé vừa chạm nên trình duyệt cho phép phát).
  useEffect(() => {
    startMusic()
    return stopAudio
  }, [])

  const toggleMusic = () => {
    setMusicOn(!music)
    setMusic(!music)
  }

  return (
    <main className="game-screen" style={{ background: color }}>
      <header className="game-header">
        <button type="button" className="back-button" onClick={onBack} aria-label={t.back}>
          ←
        </button>
        <h2>{title}</h2>
        <button
          type="button"
          className={`music-button${music ? '' : ' off'}`}
          onClick={toggleMusic}
          aria-pressed={music}
          aria-label={t.music}
        >
          ♫
        </button>
      </header>
      <section className="game-body">{children}</section>
    </main>
  )
}
