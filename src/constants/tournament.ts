import type {
  Discipline,
  GameType,
  ParticipantGender,
  TournamentCategory,
  TournamentFormat,
} from '../api/types'
import type { Language } from '../context/LanguageContext'

/**
 * Hər intizamın alt növləri. Sıra burada göstərilən sıradır — serverdəki
 * `Discipline` enum-u ilə eyni olmalıdır.
 *
 * Qeyd: alt növ reytinqə təsir etmir. Elo valideyn `GameType` üzrə yığılır,
 * alt növ isə turnirin hansı qaydalarla keçirildiyini bildirir.
 */
export const DISCIPLINES_BY_GAME: Record<GameType, Discipline[]> = {
  EIGHT_BALL: ['POOL_8_BALL', 'POOL_9_BALL', 'POOL_10_BALL', 'POOL_14_1'],
  RUSSIAN_PYRAMID: [
    'PYRAMID_FREE',
    'PYRAMID_COMBINED',
    'PYRAMID_DYNAMIC',
    'PYRAMID_CLASSIC',
    'PYRAMID_MOSCOW',
  ],
  SNOOKER: ['SNOOKER_15_RED', 'SNOOKER_10_RED', 'SNOOKER_6_RED'],
}

/** İstifadəçi seçim etməzsə götürülən alt növ — serverdəki `defaultFor` ilə eyni */
export const DEFAULT_DISCIPLINE: Record<GameType, Discipline> = {
  EIGHT_BALL: 'POOL_8_BALL',
  RUSSIAN_PYRAMID: 'PYRAMID_FREE',
  SNOOKER: 'SNOOKER_15_RED',
}

export const DISCIPLINE_LABEL: Record<Language, Record<Discipline, string>> = {
  az: {
    POOL_8_BALL: '8 Top',
    POOL_9_BALL: '9 Top',
    POOL_10_BALL: '10 Top',
    POOL_14_1: '14.1 (düz pul)',
    PYRAMID_FREE: 'Sərbəst piramida',
    PYRAMID_COMBINED: 'Kombinə piramida',
    PYRAMID_DYNAMIC: 'Dinamik piramida',
    PYRAMID_CLASSIC: 'Klassik piramida',
    PYRAMID_MOSCOW: 'Moskva piramidası',
    SNOOKER_15_RED: 'Snooker (15 qırmızı)',
    SNOOKER_10_RED: 'Snooker (10 qırmızı)',
    SNOOKER_6_RED: 'Snooker (6 qırmızı)',
  },
  en: {
    POOL_8_BALL: '8-Ball',
    POOL_9_BALL: '9-Ball',
    POOL_10_BALL: '10-Ball',
    POOL_14_1: '14.1 straight pool',
    PYRAMID_FREE: 'Free pyramid',
    PYRAMID_COMBINED: 'Combined pyramid',
    PYRAMID_DYNAMIC: 'Dynamic pyramid',
    PYRAMID_CLASSIC: 'Classic pyramid',
    PYRAMID_MOSCOW: 'Moscow pyramid',
    SNOOKER_15_RED: 'Snooker (15 red)',
    SNOOKER_10_RED: 'Snooker (10 red)',
    SNOOKER_6_RED: 'Snooker (6 red)',
  },
  ru: {
    POOL_8_BALL: 'Пул 8',
    POOL_9_BALL: 'Пул 9',
    POOL_10_BALL: 'Пул 10',
    POOL_14_1: 'Пул 14.1',
    PYRAMID_FREE: 'Свободная пирамида',
    PYRAMID_COMBINED: 'Комбинированная пирамида',
    PYRAMID_DYNAMIC: 'Динамичная пирамида',
    PYRAMID_CLASSIC: 'Классическая пирамида',
    PYRAMID_MOSCOW: 'Московская пирамида',
    SNOOKER_15_RED: 'Снукер (15 красных)',
    SNOOKER_10_RED: 'Снукер (10 красных)',
    SNOOKER_6_RED: 'Снукер (6 красных)',
  },
}

export const TOURNAMENT_FORMATS: TournamentFormat[] = [
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'GROUP_PLAYOFF',
]

export const FORMAT_LABEL: Record<Language, Record<TournamentFormat, string>> = {
  az: {
    SINGLE_ELIMINATION: 'Tək çıxma',
    DOUBLE_ELIMINATION: 'İki çıxma',
    GROUP_PLAYOFF: 'Qrup + pley-off',
  },
  en: {
    SINGLE_ELIMINATION: 'Single elimination',
    DOUBLE_ELIMINATION: 'Double elimination',
    GROUP_PLAYOFF: 'Groups + playoff',
  },
  ru: {
    SINGLE_ELIMINATION: 'На вылет',
    DOUBLE_ELIMINATION: 'Двойной вылет',
    GROUP_PLAYOFF: 'Группы + плей-офф',
  },
}

/** Format kartlarında göstərilən bir cümləlik izah */
export const FORMAT_HINT: Record<Language, Record<TournamentFormat, string>> = {
  az: {
    SINGLE_ELIMINATION: 'Bir məğlubiyyət — turnirdən çıxır. Ən sürətli format.',
    DOUBLE_ELIMINATION: 'İkinci şans var: ilk məğlubiyyət aşağı şəbəkəyə salır.',
    GROUP_PLAYOFF: 'Əvvəl qruplarda hamı ilə, sonra yuxarı yerlər pley-offda.',
  },
  en: {
    SINGLE_ELIMINATION: 'One loss and you are out. The fastest format.',
    DOUBLE_ELIMINATION: 'A second chance: the first loss drops you to the lower bracket.',
    GROUP_PLAYOFF: 'Round robin groups first, then the top seeds meet in a playoff.',
  },
  ru: {
    SINGLE_ELIMINATION: 'Одно поражение — и вы выбываете. Самый быстрый формат.',
    DOUBLE_ELIMINATION: 'Второй шанс: первое поражение переводит в нижнюю сетку.',
    GROUP_PLAYOFF: 'Сначала круговые группы, затем лучшие выходят в плей-офф.',
  },
}

export const TOURNAMENT_CATEGORIES: TournamentCategory[] = [
  'CLUB',
  'COMMERCIAL',
  'REGIONAL',
  'NATIONAL',
  'INTERNATIONAL',
]

export const CATEGORY_LABEL: Record<Language, Record<TournamentCategory, string>> = {
  az: {
    CLUB: 'Klub',
    COMMERCIAL: 'Kommersiya',
    REGIONAL: 'Regional',
    NATIONAL: 'Ölkə çempionatı',
    INTERNATIONAL: 'Beynəlxalq',
  },
  en: {
    CLUB: 'Club',
    COMMERCIAL: 'Commercial',
    REGIONAL: 'Regional',
    NATIONAL: 'National',
    INTERNATIONAL: 'International',
  },
  ru: {
    CLUB: 'Клубный',
    COMMERCIAL: 'Коммерческий',
    REGIONAL: 'Региональный',
    NATIONAL: 'Чемпионат страны',
    INTERNATIONAL: 'Международный',
  },
}

export const PARTICIPANT_GENDERS: ParticipantGender[] = ['ANY', 'MALE', 'FEMALE']

export const GENDER_LABEL: Record<Language, Record<ParticipantGender, string>> = {
  az: { ANY: 'Hamı', MALE: 'Kişilər', FEMALE: 'Qadınlar' },
  en: { ANY: 'Open', MALE: 'Men', FEMALE: 'Women' },
  ru: { ANY: 'Открытый', MALE: 'Мужчины', FEMALE: 'Женщины' },
}

/** Şəbəkə ölçüləri — serverdə iştirakçı sayı 2-nin qüvvəti olmasa bye paylanır */
export const BRACKET_SIZES = [4, 8, 16, 32, 64]

/** Race-to üçün tez seçim variantları */
export const RACE_TO_PRESETS = [3, 4, 5, 7, 9]
