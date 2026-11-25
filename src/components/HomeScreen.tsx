import { useLanguage } from '../i18n/useLanguage'
import { GAMES, type GameId } from '../games/registry'
import { LanguageToggle } from './LanguageToggle'

export function HomeScreen({ onOpen }: { onOpen: (id: GameId) => void }) {
  const { t } = useLanguage()
  return (
    <main className="home">
      <header className="home-header">
        <h1>{t.appTitle}</h1>
        <LanguageToggle />
      </header>
      <div className="game-grid">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className="game-tile"
            style={{ background: g.color }}
            onClick={() => onOpen(g.id)}
          >
            <span className="game-icon">{g.icon}</span>
            <span className="game-name">{t.games[g.id]}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
