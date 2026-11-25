import { useState } from 'react'
import { GameScreen } from './components/GameScreen'
import { HomeScreen, type HomeTab } from './components/HomeScreen'
import type { GameId } from './games/registry'
import { LanguageProvider } from './i18n/LanguageContext'
import { loadValue, saveValue } from './lib/storage'
import { ArtDefs } from './stories/art/kit'
import { StoryScreen } from './stories/StoryScreen'

type View = { kind: 'game'; id: GameId } | { kind: 'story'; id: string } | null

export default function App() {
  const [view, setView] = useState<View>(null)
  const [tab, setTab] = useState<HomeTab>(() => loadValue<HomeTab>('home-tab', 'stories'))
  const back = () => setView(null)

  const changeTab = (next: HomeTab) => {
    setTab(next)
    saveValue('home-tab', next)
  }

  return (
    <LanguageProvider>
      <ArtDefs />
      {view?.kind === 'game' ? (
        <GameScreen id={view.id} onBack={back} />
      ) : view?.kind === 'story' ? (
        <StoryScreen id={view.id} onBack={back} />
      ) : (
        <HomeScreen
          tab={tab}
          onTab={changeTab}
          onOpenGame={(id) => setView({ kind: 'game', id })}
          onOpenStory={(id) => setView({ kind: 'story', id })}
        />
      )}
    </LanguageProvider>
  )
}
