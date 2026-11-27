import { useLanguage } from '../i18n/useLanguage'
import { GAMES, type GameId } from '../games/registry'
import { trophyCount } from '../games/shared/session'
import { BOOKS } from '../stories/books'
import { STORY_DATA } from '../stories/data'
import { endingsBadge } from '../stories/endings'
import { HenryCarCover } from '../stories/henry-car/Cover'
import { StoryCover } from '../stories/StoryCover'
import { LanguageToggle } from './LanguageToggle'

export type HomeTab = 'stories' | 'games'

export function HomeScreen({
  tab,
  onTab,
  onOpenGame,
  onOpenStory,
}: {
  tab: HomeTab
  onTab: (tab: HomeTab) => void
  onOpenGame: (id: GameId) => void
  onOpenStory: (id: string) => void
}) {
  const { lang, t } = useLanguage()
  return (
    <main className="home">
      <header className="home-header">
        <h1 className="home-title">
          <img src="/logo.svg" alt="" width="48" height="48" />
          {t.appTitle}
        </h1>
        <LanguageToggle />
      </header>

      <nav className="home-tabs" role="tablist">
        {(['stories', 'games'] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`home-tab${tab === id ? ' active' : ''}`}
            onClick={() => onTab(id)}
          >
            <span aria-hidden="true">{id === 'stories' ? '📖' : '🎮'}</span> {t.tabs[id]}
          </button>
        ))}
      </nav>

      {tab === 'stories' ? (
        <div className="story-grid" role="tabpanel">
          {STORY_DATA.map((s) => {
            const badge = endingsBadge(s)
            return (
              <button key={s.id} type="button" className="story-card" style={{ background: s.color }} onClick={() => onOpenStory(s.id)}>
                <span className="story-cover">
                  <StoryCover story={s} />
                </span>
                <span className="story-card-title">{s.title[lang]}</span>
                {badge && <span className="game-trophies">{badge}</span>}
              </button>
            )
          })}
          {/* Truyện kể thẳng chỉ có tiếng Việt: chỉ hiện khi chọn tiếng Việt. */}
          {lang === 'vi' &&
            BOOKS.map((b) => (
              <button key={b.id} type="button" className="story-card" style={{ background: b.color }} onClick={() => onOpenStory(b.id)}>
                <span className="story-cover">
                  <HenryCarCover />
                </span>
                <span className="story-card-title">{b.title}</span>
              </button>
            ))}
        </div>
      ) : (
        <div className="game-grid" role="tabpanel">
          {GAMES.map((g) => (
            <button key={g.id} type="button" className="game-tile" style={{ background: g.color }} onClick={() => onOpenGame(g.id)}>
              <span className="game-icon">{g.icon}</span>
              <span className="game-name">{t.games[g.id]}</span>
              {trophyCount(g.id) > 0 && (
                <span className="game-trophies" aria-label={`${t.common.trophies}: ${trophyCount(g.id)}`}>
                  🏆 × {trophyCount(g.id)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </main>
  )
}
