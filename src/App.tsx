import { useState } from 'react'
import { GameScreen } from './components/GameScreen'
import { HomeScreen } from './components/HomeScreen'
import type { GameId } from './games/registry'
import { LanguageProvider } from './i18n/LanguageContext'

export default function App() {
  const [gameId, setGameId] = useState<GameId | null>(null)

  return (
    <LanguageProvider>
      {gameId ? (
        <GameScreen id={gameId} onBack={() => setGameId(null)} />
      ) : (
        <HomeScreen onOpen={setGameId} />
      )}
    </LanguageProvider>
  )
}
