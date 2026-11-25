import { createContext } from 'react'
import type { Lang, Strings } from './strings'

export type LanguageState = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Strings
}

export const LanguageContext = createContext<LanguageState | null>(null)
