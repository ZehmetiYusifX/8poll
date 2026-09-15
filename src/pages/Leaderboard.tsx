import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LeaderboardApi } from '../api'
import { Avatar } from '../components/Avatar'
import { Alert, Card, Empty, Input, ListSkeleton, PageHeader, cx } from '../components/ui'
import { IconSearch, IconTrophy, IconUsers } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { LeaderboardEntry } from '../api/types'

/**
 * İlk üç yer üçün medal rəngləri. Tünd səthdə metal parıltısı açıq mətnlə
 * verilir: fon metalın çox zəif çaları, mətn və halqa isə metalın özü.
 */
const MEDAL: Record<number, { ring: string; text: string; bg: string; label: string }> = {
  1: { ring: 'ring-[#d7b56d]', text: 'text-[#e8cd8a]', bg: 'bg-[#d7b56d]/12', label: 'Qızıl' },
  2: { ring: 'ring-[#9aa3a8]', text: 'text-[#cfd6da]', bg: 'bg-[#9aa3a8]/12', label: 'Gümüş' },
  3: { ring: 'ring-[#b0703d]', text: 'text-[#d9a074]', bg: 'bg-[#b0703d]/14', label: 'Bronz' },
}

export function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    LeaderboardApi.get(100)
      .then(setEntries)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

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
        eyebrow="Elo reytinqi"
        title="Reytinq cədvəli"
        subtitle="Təsdiqlənmiş maçlar əsasında hesablanan sıralama"
        actions={
          myEntry && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rail bg-card px-3.5 py-2 shadow-xs">
              <span className="text-xs text-ink-500">Sizin yeriniz</span>
              <span className="font-display text-lg font-semibold tabular-nums text-felt-300">
                {myEntry.rank}.
              </span>
              <span className="text-xs tabular-nums text-ink-400">/ {entries.length}</span>
            </div>
          )
        }
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={8} />
      ) : entries.length === 0 ? (
        <Empty
          icon={<IconTrophy size={20} />}
          title="Cədvəl hələ boşdur"
          hint="İlk təsdiqlənmiş maçdan sonra sıralama formalaşacaq."
        />
      ) : (
        <>
          <div className="mb-4 max-w-sm">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Oyunçu axtar..."
              icon={<IconSearch size={16} />}
              aria-label="Oyunçu axtar"
            />
          </div>

          {filtered.length === 0 ? (
            <Empty icon={<IconUsers size={20} />} title={`"${query}" üzrə oyunçu tapılmadı`} />
          ) : (
            <Card padded={false} className="overflow-hidden">
              {/* Sütun başlıqları — yalnız geniş ekranlarda */}
              <div className="hidden items-center gap-4 border-b border-rail bg-cream px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 sm:flex">
                <span className="w-9 text-center">Yer</span>
                <span className="flex-1">Oyunçu</span>
                <span className="w-28 text-center">Q / M</span>
                <span className="w-16 text-center">Oyun</span>
                <span className="w-20 text-right">Reytinq</span>
              </div>

              <ul className="divide-y divide-rail">
                {filtered.map(({ rank, player }) => {
                  const isMe = player.id === user?.id
                  const medal = MEDAL[rank]
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
                            medal
                              ? `${medal.bg} ${medal.text} ring-2 ${medal.ring}`
                              : 'bg-gold-400/8 text-ink-500',
                          )}
                          title={medal?.label}
                        >
                          {rank}
                        </span>

                        <Avatar name={player.fullName} color={player.avatarColor} size={40} />

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-semibold text-ink-900">
                              {player.fullName}
                            </span>
                            {isMe && (
                              <span className="shrink-0 rounded-full bg-felt-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ivory">
                                Siz
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-ink-400">
                            @{player.username}
                            <span className="sm:hidden">
                              {' · '}
                              {player.wins}Q / {player.losses}M · {player.gamesPlayed} oyun
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
                          <span className="ml-1 text-[11px] text-ink-400">xal</span>
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
