import { useLanguage } from '../i18n/useLanguage'
import { LANGS } from '../i18n/strings'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={l === lang ? 'active' : ''}
          aria-pressed={l === lang}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
