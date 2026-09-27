import type { GameType, League, Tier } from '../api/types'
import type { Language } from '../context/LanguageContext'

/** İntizamların göstərilmə sırası — hər yerdə eyni olsun deyə bir mərkəzdən gəlir */
export const GAME_TYPES: GameType[] = ['EIGHT_BALL', 'RUSSIAN_PYRAMID', 'SNOOKER']

export const GAME_TYPE_LABEL: Record<Language, Record<GameType, string>> = {
  az: { EIGHT_BALL: '8 Top', RUSSIAN_PYRAMID: 'Rus piramidası', SNOOKER: 'Snooker' },
  en: { EIGHT_BALL: '8-Ball', RUSSIAN_PYRAMID: 'Russian pyramid', SNOOKER: 'Snooker' },
  ru: { EIGHT_BALL: 'Пул 8', RUSSIAN_PYRAMID: 'Русская пирамида', SNOOKER: 'Снукер' },
}

/** Dar ekranlarda və tablarda istifadə olunan qısa ad */
export const GAME_TYPE_SHORT: Record<Language, Record<GameType, string>> = {
  az: { EIGHT_BALL: '8 Top', RUSSIAN_PYRAMID: 'Piramida', SNOOKER: 'Snooker' },
  en: { EIGHT_BALL: '8-Ball', RUSSIAN_PYRAMID: 'Pyramid', SNOOKER: 'Snooker' },
  ru: { EIGHT_BALL: 'Пул 8', RUSSIAN_PYRAMID: 'Пирамида', SNOOKER: 'Снукер' },
}

export const DEFAULT_GAME_TYPE: GameType = 'EIGHT_BALL'

export const TIER_LABEL: Record<Language, Record<Tier, string>> = {
  az: { AMATEUR: 'Həvəskar', PRO_C: 'Pro C', PRO_B: 'Pro B', PRO_A: 'Pro A' },
  en: { AMATEUR: 'Amateur', PRO_C: 'Pro C', PRO_B: 'Pro B', PRO_A: 'Pro A' },
  ru: { AMATEUR: 'Любитель', PRO_C: 'Про C', PRO_B: 'Про B', PRO_A: 'Про A' },
}

export const LEAGUE_LABEL: Record<Language, Record<League, string>> = {
  az: { AMATEUR: 'Həvəskar', PROFESSIONAL: 'Professional' },
  en: { AMATEUR: 'Amateur', PROFESSIONAL: 'Professional' },
  ru: { AMATEUR: 'Любитель', PROFESSIONAL: 'Профессионал' },
}

/** Reytinq cədvəlindəki liqa filtri üçün dəyərlər */
export type LeagueFilter = 'ALL' | League

export const LEAGUE_FILTER_LABEL: Record<Language, Record<LeagueFilter, string>> = {
  az: { ALL: 'Hamısı', AMATEUR: 'Həvəskar', PROFESSIONAL: 'Professional' },
  en: { ALL: 'All', AMATEUR: 'Amateur', PROFESSIONAL: 'Professional' },
  ru: { ALL: 'Все', AMATEUR: 'Любитель', PROFESSIONAL: 'Профессионал' },
}
