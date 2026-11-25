import { useLanguage } from '../i18n/useLanguage'

export function GamePlaceholder() {
  const { t } = useLanguage()
  return <p className="placeholder">{t.comingSoon}</p>
}
