import { Link } from 'react-router-dom'
import { Badge, Card, cx } from './ui'
import type { BadgeTone } from './ui'
import { IconCalendar, IconPin, IconTable, IconTrophy, IconUsers } from './icons'
import { GAME_TYPE_LABEL } from '../constants/gameTypes'
import type { GameType, Tournament, TournamentStatus } from '../api/types'
import type { LandingLanguage } from '../context/LandingLanguageContext'
import { localeByLanguage } from '../i18n/landing'

export const statusMeta: Record<TournamentStatus, { text: string; tone: BadgeTone; bar: string }> = {
  REGISTRATION: { text: 'Qeydiyyat açıq', tone: 'green', bar: 'bg-felt-500' },
  ONGOING: { text: 'Davam edir', tone: 'yellow', bar: 'bg-honey-600' },
  COMPLETED: { text: 'Bitdi', tone: 'blue', bar: 'bg-steel-700' },
  CANCELLED: { text: 'Ləğv edildi', tone: 'neutral', bar: 'bg-rail-strong' },
}

const localizedText: Record<LandingLanguage, {
  status: Record<TournamentStatus, string>
  participants: string
  winner: string
  games: Record<GameType, string>
}> = {
  az: {
    status: { REGISTRATION: 'Qeydiyyat açıq', ONGOING: 'Davam edir', COMPLETED: 'Bitdi', CANCELLED: 'Ləğv edildi' },
    participants: 'İştirakçılar',
    winner: 'Qalib',
    games: GAME_TYPE_LABEL,
  },
  en: {
    status: { REGISTRATION: 'Registration open', ONGOING: 'In progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' },
    participants: 'Participants',
    winner: 'Winner',
    games: { EIGHT_BALL: '8-ball', RUSSIAN_PYRAMID: 'Russian pyramid', SNOOKER: 'Snooker' },
  },
  ru: {
    status: { REGISTRATION: 'Регистрация открыта', ONGOING: 'Идёт', COMPLETED: 'Завершён', CANCELLED: 'Отменён' },
    participants: 'Участники',
    winner: 'Победитель',
    games: { EIGHT_BALL: 'Пул-8', RUSSIAN_PYRAMID: 'Русская пирамида', SNOOKER: 'Снукер' },
  },
}

export function TournamentCard({
  tournament: t,
  hideVenue = false,
  language = 'az',
}: {
  tournament: Tournament
  hideVenue?: boolean
  language?: LandingLanguage
}) {
  const labels = localizedText[language]
  const st = { ...statusMeta[t.status], text: labels.status[t.status] }
  const fillPct = Math.min(100, Math.round((t.participantCount / t.maxParticipants) * 100))
  const soon = t.status === 'REGISTRATION' ? localizedTimeUntil(t.startAt, language) : null

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
          {/* Turnirin intizamı — seed sıralaması bu reytinqə görə qurulur */}
          <span className="inline-flex items-center gap-1">
            <IconTable size={13} className="text-ink-400" />
            {labels.games[t.gameType]}
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
              {localizedDate(t.startAt, language)}
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

function localizedDate(iso: string | null, language: LandingLanguage): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(localeByLanguage[language], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function localizedTimeUntil(iso: string | null, language: LandingLanguage): string | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null

  const formatter = new Intl.RelativeTimeFormat(localeByLanguage[language], { numeric: 'always' })
  const minutes = Math.max(1, Math.floor(diff / 60_000))
  if (minutes < 60) return formatter.format(minutes, 'minute')
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return formatter.format(hours, 'hour')
  return formatter.format(Math.floor(hours / 24), 'day')
}
