import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LeaderboardApi } from '../api'
import { Avatar } from '../components/Avatar'
import { TierBadge } from '../components/TierBadge'
import { Alert, Card, Empty, Input, ListSkeleton, PageHeader, Segmented, cx } from '../components/ui'
import { IconSearch, IconTrophy, IconUsers } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { appCopy } from '../i18n/app'
import {
  DEFAULT_GAME_TYPE,
  GAME_TYPES,
  GAME_TYPE_LABEL,
  GAME_TYPE_SHORT,
  LEAGUE_FILTER_LABEL,
  type LeagueFilter,
} from '../constants/gameTypes'
import type { GameType, LeaderboardEntry } from '../api/types'

/**
 * İlk üç yer üçün medal rəngləri. Tünd səthdə metal parıltısı açıq mətnlə
 * verilir: fon metalın çox zəif çaları, mətn və halqa isə metalın özü.
 */
const MEDAL_STYLE: Record<number, { ring: string; text: string; bg: string }> = {
  1: { ring: 'ring-[#d7b56d]', text: 'text-[#e8cd8a]', bg: 'bg-[#d7b56d]/12' },
  2: { ring: 'ring-[#9aa3a8]', text: 'text-[#cfd6da]', bg: 'bg-[#9aa3a8]/12' },
  3: { ring: 'ring-[#b0703d]', text: 'text-[#d9a074]', bg: 'bg-[#b0703d]/14' },
}

export function Leaderboard() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const copy = appCopy[language].leaderboard
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [gameType, setGameType] = useState<GameType>(DEFAULT_GAME_TYPE)
  const [league, setLeague] = useState<LeagueFilter>('ALL')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Hər intizamın və liqanın öz cədvəli var — filtr dəyişəndə serverdən
  // yenidən çəkilir, çünki sıralama backend-də hesablanır.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    LeaderboardApi.get({
      gameType,
      league: league === 'ALL' ? undefined : league,
      limit: 100,
    })
      .then((data) => {
        if (!cancelled) setEntries(data)
      })
      .catch((e) => {
        if (!cancelled) setError(extractErrorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [gameType, league])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.player.fullName.toLowerCase().includes(q) || e.player.username.toLowerCase().includes(q),
    )
  }, [entries, query])

  const myEntry = user ? entries.find((e) => e.player.id === user.id) : undefined

  return (
    <div>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle(GAME_TYPE_LABEL[language][gameType])}
        actions={
          myEntry && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rail bg-card px-3.5 py-2 shadow-xs">
              <span className="text-xs text-ink-500">{copy.yourPlace}</span>
              <span className="font-display text-lg font-semibold tabular-nums text-felt-300">
                {myEntry.rank}.
              </span>
              <span className="text-xs tabular-nums text-ink-400">/ {entries.length}</span>
            </div>
          )
        }
      />

      {/* Filtrlər boş nəticədə də görünməlidir — əks halda oyunçu boş
          tabdan geri qayıda bilməz. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Segmented
          label={copy.gameTypeLabel}
          value={gameType}
          onChange={setGameType}
          items={GAME_TYPES.map((t) => ({ value: t, label: GAME_TYPE_SHORT[language][t] }))}
        />
        <Segmented
          label={copy.leagueLabel}
          value={league}
          onChange={setLeague}
          items={(['ALL', 'AMATEUR', 'PROFESSIONAL'] as LeagueFilter[]).map((l) => ({
            value: l,
            label: LEAGUE_FILTER_LABEL[language][l],
          }))}
        />
      </div>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={8} />
      ) : entries.length === 0 ? (
        <Empty
          icon={<IconTrophy size={20} />}
          title={
            league === 'ALL'
              ? copy.emptyAll(GAME_TYPE_LABEL[language][gameType])
              : copy.emptyLeague(GAME_TYPE_LABEL[language][gameType], LEAGUE_FILTER_LABEL[language][league].toLowerCase())
          }
          hint={copy.emptyHint}
        />
      ) : (
        <>
          <div className="mb-4 max-w-sm">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              icon={<IconSearch size={16} />}
              aria-label={copy.searchLabel}
            />
          </div>

          {filtered.length === 0 ? (
            <Empty icon={<IconUsers size={20} />} title={copy.noSearchResults(query)} />
          ) : (
            <Card padded={false} className="overflow-hidden">
              {/* Sütun başlıqları — yalnız geniş ekranlarda */}
              <div className="hidden items-center gap-4 border-b border-rail bg-cream px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 sm:flex">
                <span className="w-9 text-center">{copy.colRank}</span>
                <span className="flex-1">{copy.colPlayer}</span>
                <span className="w-28 text-center">{copy.colWL}</span>
                <span className="w-16 text-center">{copy.colGames}</span>
                <span className="w-20 text-right">{copy.colRating}</span>
              </div>

              <ul className="divide-y divide-rail">
                {filtered.map(({ rank, player }) => {
                  const isMe = player.id === user?.id
                  const medalStyle = MEDAL_STYLE[rank]
                  const medalLabel = copy.medal[rank]
                  return (
                    <li key={player.id}>
                      <Link
                        to={`/players/${player.id}`}
                        className={cx(
                          'flex items-center gap-3 px-3 py-3 transition-colors sm:gap-4 sm:px-4',
                          isMe ? 'bg-felt-500/12 hover:bg-felt-500/16' : 'hover:bg-cream',
                        )}
                      >
                        <span
                          className={cx(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold tabular-nums',
                            medalStyle
                              ? `${medalStyle.bg} ${medalStyle.text} ring-2 ${medalStyle.ring}`
                              : 'bg-gold-400/8 text-ink-500',
                          )}
                          title={medalLabel}
                        >
                          {rank}
                        </span>

                        <Avatar name={player.fullName} color={player.avatarColor} src={player.avatarUrl} size={40} />

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-semibold text-ink-900">
                              {player.fullName}
                            </span>
                            <TierBadge tier={player.tier} className="shrink-0" />
                            {isMe && (
                              <span className="shrink-0 rounded-full bg-felt-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ivory">
                                {copy.you}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-ink-400">
                            @{player.username}
                            <span className="sm:hidden">
                              {' · '}
                              {copy.wlShort(player.wins, player.losses)} · {copy.gamesShort(player.gamesPlayed)}
                            </span>
                          </span>
                        </span>

                        <span className="hidden w-28 items-center justify-center gap-1.5 text-sm tabular-nums sm:flex">
                          <span className="font-semibold text-felt-300">{player.wins}</span>
                          <span className="text-ink-300">/</span>
                          <span className="font-semibold text-clay-300">{player.losses}</span>
                        </span>

                        <span className="hidden w-16 text-center text-sm tabular-nums text-ink-500 sm:block">
                          {player.gamesPlayed}
                        </span>

                        <span className="w-16 text-right sm:w-20">
                          <span className="font-display text-lg font-semibold tabular-nums text-ink-900">
                            {player.rating}
                          </span>
                          <span className="ml-1 text-[11px] text-ink-400">{copy.points}</span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
