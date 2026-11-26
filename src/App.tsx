import { useEffect, useState } from 'react'
import { GameScreen } from './components/GameScreen'
import { HomeScreen, type HomeTab } from './components/HomeScreen'
import { useLanguage } from './i18n/useLanguage'
import { LanguageProvider } from './i18n/LanguageContext'
import { loadValue, saveValue } from './lib/storage'
import { pageFromPath, pageMeta, pagePath, type Page } from './seo/pages'
import { ArtDefs } from './stories/art/kit'
import { StoryScreen } from './stories/StoryScreen'

export default function App() {
  return (
    <LanguageProvider>
      <Router />
    </LanguageProvider>
  )
}

/** Mỗi trò chơi / truyện có link riêng (/games/<id>, /stories/<id>) để chia sẻ được. */
function Router() {
  const { lang } = useLanguage()
  const [view, setView] = useState<Page>(() => pageFromPath(location.pathname))
  const [tab, setTab] = useState<HomeTab>(() => loadValue<HomeTab>('home-tab', 'stories'))

  // Nút quay lại của trình duyệt.
  useEffect(() => {
    const onPop = () => setView(pageFromPath(location.pathname))
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  // Link lạ (ví dụ /games/abc) thì đổi về trang chủ.
  useEffect(() => {
    if (location.pathname !== pagePath(view)) history.replaceState(null, '', pagePath(view))
  }, [view])

  useEffect(() => {
    document.title = pageMeta(view, lang).title
  }, [view, lang])

  const open = (next: Page) => {
    history.pushState(null, '', pagePath(next))
    setView(next)
  }
  const back = () => open(null)

  const changeTab = (next: HomeTab) => {
    setTab(next)
    saveValue('home-tab', next)
  }

  return (
    <>
      <ArtDefs />
      {view?.kind === 'game' ? (
        <GameScreen id={view.id} onBack={back} />
      ) : view?.kind === 'story' ? (
        <StoryScreen id={view.id} onBack={back} />
      ) : (
        <HomeScreen
          tab={tab}
          onTab={changeTab}
          onOpenGame={(id) => open({ kind: 'game', id })}
          onOpenStory={(id) => open({ kind: 'story', id })}
        />
      )}
    </>
  )
}
