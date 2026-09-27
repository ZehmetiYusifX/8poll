import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Language = 'az' | 'en' | 'ru'

const STORAGE_KEY = 'eloabf-language'
const LEGACY_STORAGE_KEY = 'eloabf-landing-language'

function initialLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
  if (saved === 'az' || saved === 'en' || saved === 'ru') return saved

  const browserLanguage = navigator.language.toLowerCase()
  if (browserLanguage.startsWith('ru')) return 'ru'
  if (browserLanguage.startsWith('en')) return 'en'
  return 'az'
}

interface LanguageValue {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const value = useMemo<LanguageValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        localStorage.setItem(STORAGE_KEY, nextLanguage)
        setLanguageState(nextLanguage)
      },
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
