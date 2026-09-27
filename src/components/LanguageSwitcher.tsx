import type { Language } from '../context/LanguageContext'
import { languageOptions } from '../i18n/landing'
import { cx } from './ui'

export function LanguageSwitcher({
  language,
  setLanguage,
  label,
}: {
  language: Language
  setLanguage: (language: Language) => void
  label: string
}) {
  return (
    <div
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-50 flex rounded-full border border-gold-400/30 bg-felt-950/95 p-1 shadow-xl backdrop-blur-md md:bottom-6 md:right-6"
      role="group"
      aria-label={label}
    >
      {languageOptions.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLanguage(option.code)}
          aria-pressed={language === option.code}
          title={option.name}
          className={cx(
            'min-w-10 rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] transition-colors',
            language === option.code
              ? 'bg-gold-400 text-felt-950'
              : 'text-felt-100/75 hover:bg-white/10 hover:text-ivory',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
