import { useEffect, useState } from 'react'
import { isMusicOn, setMusicOn, startMusic, stopAudio } from '../audio/audio'
import { useLanguage } from '../i18n/useLanguage'
import { GAMES, type GameId } from '../games/registry'

export function GameScreen({ id, onBack }: { id: GameId; onBack: () => void }) {
  const { t } = useLanguage()
  const game = GAMES.find((g) => g.id === id)!
  const Game = game.component
  const [music, setMusic] = useState(isMusicOn)

  // Nhạc nền chạy khi vào màn chơi (bé vừa chạm nên trình duyệt cho phép phát).
  useEffect(() => {
    startMusic()
    return stopAudio
  }, [])

  const toggleMusic = () => {
    setMusicOn(!music)
    setMusic(!music)
  }

  return (
    <main className="game-screen" style={{ background: game.color }}>
      <header className="game-header">
        <button type="button" className="back-button" onClick={onBack} aria-label={t.back}>
          ←
        </button>
        <h2>{t.games[id]}</h2>
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
      <section className="game-body">
        <Game id={id} onExit={onBack} />
      </section>
    </main>
  )
}
