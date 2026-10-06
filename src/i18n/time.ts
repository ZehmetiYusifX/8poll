import type { Language } from '../context/LanguageContext'
import { localeByLanguage } from './landing'

/*
 * Nisbi vaxt. `Intl.RelativeTimeFormat` azərbaycanca üçün Chrome-da
 * tərcüməsiz qayıdır — "2 saat əvvəl" yerinə "-2 h", "dünən" yerinə
 * "yesterday". Ona görə azərbaycanca əl ilə yazılıb, ingilis və rus
 * dilləri isə Intl-ə buraxılır (orada nəticə düzgündür).
 */

const AZ_PAST: Record<'minute' | 'hour' | 'day', string> = {
  minute: 'dəq əvvəl',
  hour: 'saat əvvəl',
  day: 'gün əvvəl',
}

const AZ_FUTURE: Record<'minute' | 'hour' | 'day', string> = {
  minute: 'dəq sonra',
  hour: 'saat sonra',
  day: 'gün sonra',
}

function intl(language: Language, value: number, unit: Intl.RelativeTimeFormatUnit): string {
  return new Intl.RelativeTimeFormat(localeByLanguage[language], { numeric: 'auto' }).format(value, unit)
}

/*
 * Qısa ay adları da eyni problemdədir: azərbaycanca `month: 'short'`
 * Chrome-da "okt" yerinə "M10" qaytarır və tarix "2026 M10 12" kimi
 * görünür. Ona görə azərbaycanca ay adları əl ilə verilir.
 */
const AZ_MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek']

/** "12 okt 2026" — siyahılarda və kartlarda işlədilən qısa tarix */
export function shortDate(iso: string | null, language: Language): string {
  if (!iso) return '—'
  return formatDate(new Date(iso), language)
}

function formatDate(date: Date, language: Language): string {
  if (language === 'az') {
    return `${date.getDate()} ${AZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`
  }
  return new Intl.DateTimeFormat(localeByLanguage[language], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** Keçmiş an — "2 saat əvvəl". 30 gündən köhnə tarixlər təqvim tarixi kimi yazılır. */
export function relativeTime(iso: string | null, language: Language): string {
  if (!iso) return '—'

  const date = new Date(iso)
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days >= 30) return formatDate(date, language)

  if (language === 'az') {
    if (seconds < 60) return 'indicə'
    if (minutes < 60) return `${minutes} ${AZ_PAST.minute}`
    if (hours < 24) return `${hours} ${AZ_PAST.hour}`
    if (days === 1) return 'dünən'
    return `${days} ${AZ_PAST.day}`
  }

  if (seconds < 60) return intl(language, -seconds, 'second')
  if (minutes < 60) return intl(language, -minutes, 'minute')
  if (hours < 24) return intl(language, -hours, 'hour')
  return intl(language, -days, 'day')
}

/** Gələcək an — "9 gün sonra". Vaxt keçibsə `null` qayıdır. */
export function timeUntil(iso: string | null, language: Language): string | null {
  if (!iso) return null

  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null

  const minutes = Math.max(1, Math.floor(diff / 60_000))
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(hours / 24)

  if (language === 'az') {
    if (minutes < 60) return `${minutes} ${AZ_FUTURE.minute}`
    if (hours < 24) return `${hours} ${AZ_FUTURE.hour}`
    if (days === 1) return 'sabah'
    return `${days} ${AZ_FUTURE.day}`
  }

  if (minutes < 60) return intl(language, minutes, 'minute')
  if (hours < 24) return intl(language, hours, 'hour')
  return intl(language, days, 'day')
}
