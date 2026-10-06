import { Link } from 'react-router-dom'
import { Badge, Card, cx } from './ui'
import type { BadgeTone } from './ui'
import { IconCalendar, IconPin, IconSwords, IconTable, IconTrophy, IconUsers } from './icons'
import { DISCIPLINE_LABEL, FORMAT_LABEL } from '../constants/tournament'
import type { Tournament, TournamentStatus } from '../api/types'
import type { Language } from '../context/LanguageContext'
import { useLanguage } from '../context/LanguageContext'
import { shortDate, timeUntil } from '../i18n/time'

const STATUS_BAR: Record<TournamentStatus, string> = {
  REGISTRATION: 'bg-felt-500',
  ONGOING: 'bg-honey-600',
  COMPLETED: 'bg-steel-700',
  CANCELLED: 'bg-rail-strong',
}

const STATUS_TONE: Record<TournamentStatus, BadgeTone> = {
  REGISTRATION: 'green',
  ONGOING: 'yellow',
  COMPLETED: 'blue',
  CANCELLED: 'neutral',
}

export const statusMeta: Record<Language, Record<TournamentStatus, { text: string; tone: BadgeTone; bar: string }>> = {
  az: {
    REGISTRATION: { text: 'Qeydiyyat açıq', tone: STATUS_TONE.REGISTRATION, bar: STATUS_BAR.REGISTRATION },
    ONGOING: { text: 'Davam edir', tone: STATUS_TONE.ONGOING, bar: STATUS_BAR.ONGOING },
    COMPLETED: { text: 'Bitdi', tone: STATUS_TONE.COMPLETED, bar: STATUS_BAR.COMPLETED },
    CANCELLED: { text: 'Ləğv edildi', tone: STATUS_TONE.CANCELLED, bar: STATUS_BAR.CANCELLED },
  },
  en: {
    REGISTRATION: { text: 'Registration open', tone: STATUS_TONE.REGISTRATION, bar: STATUS_BAR.REGISTRATION },
    ONGOING: { text: 'In progress', tone: STATUS_TONE.ONGOING, bar: STATUS_BAR.ONGOING },
    COMPLETED: { text: 'Completed', tone: STATUS_TONE.COMPLETED, bar: STATUS_BAR.COMPLETED },
    CANCELLED: { text: 'Cancelled', tone: STATUS_TONE.CANCELLED, bar: STATUS_BAR.CANCELLED },
  },
  ru: {
    REGISTRATION: { text: 'Регистрация открыта', tone: STATUS_TONE.REGISTRATION, bar: STATUS_BAR.REGISTRATION },
    ONGOING: { text: 'Идёт', tone: STATUS_TONE.ONGOING, bar: STATUS_BAR.ONGOING },
    COMPLETED: { text: 'Завершён', tone: STATUS_TONE.COMPLETED, bar: STATUS_BAR.COMPLETED },
    CANCELLED: { text: 'Отменён', tone: STATUS_TONE.CANCELLED, bar: STATUS_BAR.CANCELLED },
  },
}

const localizedText: Record<Language, { participants: string; winner: string }> = {
  az: { participants: 'İştirakçılar', winner: 'Qalib' },
  en: { participants: 'Participants', winner: 'Winner' },
  ru: { participants: 'Участники', winner: 'Победитель' },
}

export function TournamentCard({
  tournament: t,
  hideVenue = false,
  language,
}: {
  tournament: Tournament
  hideVenue?: boolean
  language?: Language
}) {
  const { language: contextLanguage } = useLanguage()
  const lang = language ?? contextLanguage
  const labels = localizedText[lang]
  const st = statusMeta[lang][t.status]
  const fillPct = Math.min(100, Math.round((t.participantCount / t.maxParticipants) * 100))
  const soon = t.status === 'REGISTRATION' ? timeUntil(t.startAt, lang) : null

  return (
    <Link to={`/tournaments/${t.id}`} className="group block h-full">
      <Card padded={false} interactive className="relative h-full overflow-hidden p-4 pl-5">
        <span aria-hidden className={cx('absolute inset-y-0 left-0 w-1', st.bar)} />

        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold leading-snug text-ink-900">
            {t.name}
          </h3>
          <Badge tone={st.tone} className="shrink-0">
            {st.text}
          </Badge>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          {/* Alt növ intizamı da bildirir — seed sıralaması isə valideyn
              intizamın (t.gameType) reytinqinə görə qurulur */}
          <span className="inline-flex items-center gap-1">
            <IconTable size={13} className="text-ink-400" />
            {DISCIPLINE_LABEL[lang][t.discipline]}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconSwords size={13} className="text-ink-400" />
            {FORMAT_LABEL[lang][t.format]}
          </span>
          {!hideVenue && (
            <span className="inline-flex items-center gap-1">
              <IconPin size={13} className="text-ink-400" />
              {t.venue.name}
            </span>
          )}
          {t.startAt && (
            <span className="inline-flex items-center gap-1">
              <IconCalendar size={13} className="text-ink-400" />
              {shortDate(t.startAt, lang)}
              {soon && <span className="text-felt-300">· {soon}</span>}
            </span>
          )}
        </div>

        {/* İştirakçı doluluğu */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-ink-500">
              <IconUsers size={13} className="text-ink-400" />
              {labels.participants}
            </span>
            <span className="font-semibold tabular-nums text-ink-700">
              {t.participantCount}
              <span className="font-normal text-ink-400">/{t.maxParticipants}</span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rail">
            <div
              className={cx('h-full rounded-full transition-[width] duration-500', st.bar)}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {t.status === 'COMPLETED' && t.winner && (
          <div className="mt-3.5 flex items-center gap-2 border-t border-rail pt-3 text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400/12 text-gold-300">
              <IconTrophy size={13} />
            </span>
            <span className="text-ink-500">
              {labels.winner}: <b className="font-semibold text-ink-900">{t.winner.fullName}</b>
            </span>
          </div>
        )}
      </Card>
    </Link>
  )
}
