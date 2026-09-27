import type { BadgeTone } from '../components/ui'
import type { CoachingLevel, LessonFormat, LessonOrderStatus } from '../api/types'
import type { Language } from '../context/LanguageContext'

/** Səviyyələrin göstərilmə sırası — filtrlərdə və seçimlərdə eyni olsun deyə */
export const COACHING_LEVELS: CoachingLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export const LEVEL_LABEL: Record<Language, Record<CoachingLevel, string>> = {
  az: { BEGINNER: 'Başlanğıc', INTERMEDIATE: 'Orta', ADVANCED: 'Peşəkar' },
  en: { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' },
  ru: { BEGINNER: 'Начальный', INTERMEDIATE: 'Средний', ADVANCED: 'Продвинутый' },
}

export const LESSON_FORMATS: LessonFormat[] = ['INDIVIDUAL', 'GROUP']

export const FORMAT_LABEL: Record<Language, Record<LessonFormat, string>> = {
  az: { INDIVIDUAL: 'Fərdi', GROUP: 'Qrup' },
  en: { INDIVIDUAL: 'Individual', GROUP: 'Group' },
  ru: { INDIVIDUAL: 'Индивидуально', GROUP: 'Группа' },
}

export const ORDER_STATUS_LABEL: Record<Language, Record<LessonOrderStatus, string>> = {
  az: {
    PENDING: 'Gözləyir', ACCEPTED: 'Qəbul edildi', DECLINED: 'İmtina edildi',
    CANCELLED: 'Ləğv edildi', PAID: 'Ödənildi', COMPLETED: 'Tamamlandı',
  },
  en: {
    PENDING: 'Pending', ACCEPTED: 'Accepted', DECLINED: 'Declined',
    CANCELLED: 'Cancelled', PAID: 'Paid', COMPLETED: 'Completed',
  },
  ru: {
    PENDING: 'Ожидает', ACCEPTED: 'Принято', DECLINED: 'Отклонено',
    CANCELLED: 'Отменено', PAID: 'Оплачено', COMPLETED: 'Завершено',
  },
}

/** Status rəngləri mövcud `Badge` tone-larından götürülür — yeni rəng əlavə edilmir */
export const ORDER_STATUS_TONE: Record<LessonOrderStatus, BadgeTone> = {
  PENDING: 'yellow',
  ACCEPTED: 'blue',
  DECLINED: 'red',
  CANCELLED: 'neutral',
  PAID: 'gold',
  COMPLETED: 'green',
}

/** Sifariş hələ canlıdır — ləğv/irəliləmə düymələri yalnız bu hallarda görünür */
export function isActiveOrder(status: LessonOrderStatus): boolean {
  return status === 'PENDING' || status === 'ACCEPTED' || status === 'PAID'
}

export const DEFAULT_LEVEL: CoachingLevel = 'BEGINNER'
export const DEFAULT_FORMAT: LessonFormat = 'INDIVIDUAL'

/** Valyuta AZN-dir və dəyişmir; kəsr yalnız qəpik olduqda göstərilir */
export function formatPrice(value: number): string {
  const n = Number(value) || 0
  const text = Number.isInteger(n) ? String(n) : n.toFixed(2)
  return `${text} ₼`
}
