import { useEffect } from 'react'
import { stopAudio } from '../audio/audio'
import { useLanguage } from '../i18n/useLanguage'
import { GAMES, type GameId } from '../games/registry'

export function GameScreen({ id, onBack }: { id: GameId; onBack: () => void }) {
  const { t } = useLanguage()
  const game = GAMES.find((g) => g.id === id)!
  const Game = game.component

  useEffect(() => stopAudio, [])

  return (
    <main className="game-screen" style={{ background: game.color }}>
      <header className="game-header">
        <button type="button" className="back-button" onClick={onBack} aria-label={t.back}>
          ←
        </button>
        <h2>{t.games[id]}</h2>
      </header>
      <section className="game-body">
        <Game />
      </section>
    </main>
  )
}
