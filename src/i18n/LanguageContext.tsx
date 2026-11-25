import { useEffect, useState, type ReactNode } from 'react'
import { preloadAudio } from '../audio/audio'
import { loadValue, saveValue } from '../lib/storage'
import { LanguageContext } from './context'
import { strings, type Lang } from './strings'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => loadValue<Lang>('lang', 'vi'))

  useEffect(() => {
    saveValue('lang', lang)
    document.documentElement.lang = lang
    // Tải trước toàn bộ câu thoại của ngôn ngữ này để phát ngay, không trễ.
    preloadAudio(lang)
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: strings[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}
