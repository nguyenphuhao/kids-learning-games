import { useEffect } from 'react'
import { preloadLines } from '../audio/audio'
import { PlayScreen } from '../components/PlayScreen'
import { useLanguage } from '../i18n/useLanguage'
import { STORY_DATA } from './data'
import { HENRY_CAR } from './books'
import { HenryCarScreen } from './henry-car/HenryCarScreen'
import { StoryPlayer } from './StoryPlayer'

export function StoryScreen({ id, onBack }: { id: string; onBack: () => void }) {
  // Truyện kể thẳng (books.ts) có trình đọc riêng.
  if (id === HENRY_CAR.id) return <HenryCarScreen onBack={onBack} />
  return <InteractiveStoryScreen id={id} onBack={onBack} />
}

function InteractiveStoryScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const { lang } = useLanguage()
  const story = STORY_DATA.find((s) => s.id === id)!

  // Tải trước mọi đoạn của truyện này để chuyển đoạn không bị trễ.
  useEffect(() => {
    const keys = Object.values(story.nodes).map((n) => `story-${story.id}-${n.audio}`)
    preloadLines(lang, [...keys, `story-${story.id}-outro`])
  }, [lang, story])

  return (
    <PlayScreen title={story.title[lang]} color={story.color} page={{ kind: 'story', id: story.id }} onBack={onBack}>
      <StoryPlayer key={story.id} story={story} onExit={onBack} />
    </PlayScreen>
  )
}
