import type { GameType, League, Tier } from '../api/types'

/** İntizamların göstərilmə sırası — hər yerdə eyni olsun deyə bir mərkəzdən gəlir */
export const GAME_TYPES: GameType[] = ['EIGHT_BALL', 'RUSSIAN_PYRAMID', 'SNOOKER']

export const GAME_TYPE_LABEL: Record<GameType, string> = {
  EIGHT_BALL: '8 Top',
  RUSSIAN_PYRAMID: 'Rus piramidası',
  SNOOKER: 'Snooker',
}

/** Dar ekranlarda və tablarda istifadə olunan qısa ad */
export const GAME_TYPE_SHORT: Record<GameType, string> = {
  EIGHT_BALL: '8 Top',
  RUSSIAN_PYRAMID: 'Piramida',
  SNOOKER: 'Snooker',
}

export const DEFAULT_GAME_TYPE: GameType = 'EIGHT_BALL'

export const TIER_LABEL: Record<Tier, string> = {
  AMATEUR: 'Həvəskar',
  PRO_C: 'Pro C',
  PRO_B: 'Pro B',
  PRO_A: 'Pro A',
}

export const LEAGUE_LABEL: Record<League, string> = {
  AMATEUR: 'Həvəskar',
  PROFESSIONAL: 'Professional',
}

/** Reytinq cədvəlindəki liqa filtri üçün dəyərlər */
export type LeagueFilter = 'ALL' | League

export const LEAGUE_FILTER_LABEL: Record<LeagueFilter, string> = {
  ALL: 'Hamısı',
  AMATEUR: 'Həvəskar',
  PROFESSIONAL: 'Professional',
}
