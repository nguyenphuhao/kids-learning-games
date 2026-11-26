import { useLanguage } from '../i18n/useLanguage'
import { GAMES, type GameId } from '../games/registry'
import { PlayScreen } from './PlayScreen'

export function GameScreen({ id, onBack }: { id: GameId; onBack: () => void }) {
  const { t } = useLanguage()
  const game = GAMES.find((g) => g.id === id)!
  const Game = game.component
  return (
    <PlayScreen title={t.games[id]} color={game.color} page={{ kind: 'game', id }} onBack={onBack}>
      <Game id={id} onExit={onBack} />
    </PlayScreen>
  )
}
