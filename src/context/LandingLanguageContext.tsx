import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type LandingLanguage = 'az' | 'en' | 'ru'

const STORAGE_KEY = 'eloabf-landing-language'

function initialLanguage(): LandingLanguage {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'az' || saved === 'en' || saved === 'ru') return saved

  const browserLanguage = navigator.language.toLowerCase()
  if (browserLanguage.startsWith('ru')) return 'ru'
  if (browserLanguage.startsWith('en')) return 'en'
  return 'az'
}

interface LandingLanguageValue {
  language: LandingLanguage
  setLanguage: (language: LandingLanguage) => void
}

const LandingLanguageContext = createContext<LandingLanguageValue | null>(null)

export function LandingLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LandingLanguage>(initialLanguage)

  const value = useMemo<LandingLanguageValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        localStorage.setItem(STORAGE_KEY, nextLanguage)
        setLanguageState(nextLanguage)
      },
    }),
    [language],
  )

  return <LandingLanguageContext.Provider value={value}>{children}</LandingLanguageContext.Provider>
}

export function useLandingLanguage() {
  const context = useContext(LandingLanguageContext)
  if (!context) throw new Error('useLandingLanguage must be used within LandingLanguageProvider')
  return context
}
