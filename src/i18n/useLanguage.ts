import { useContext } from 'react'
import { LanguageContext, type LanguageState } from './context'

export function useLanguage(): LanguageState {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
