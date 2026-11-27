import { useEffect } from 'react'
import { preloadLines } from '../../audio/audio'
import { PlayScreen } from '../../components/PlayScreen'
import { bookAudioKey, HENRY_CAR } from '../books'
import { HenryCarBook } from './HenryCarBook'

export function HenryCarScreen({ onBack }: { onBack: () => void }) {
  // Tải trước mọi trang (truyện này chỉ có giọng tiếng Việt).
  useEffect(() => {
    preloadLines('vi', HENRY_CAR.pages.map((_, i) => bookAudioKey(HENRY_CAR, i)))
  }, [])

  return (
    <PlayScreen title={HENRY_CAR.title} color={HENRY_CAR.color} page={{ kind: 'story', id: HENRY_CAR.id }} onBack={onBack}>
      <HenryCarBook onExit={onBack} />
    </PlayScreen>
  )
}
