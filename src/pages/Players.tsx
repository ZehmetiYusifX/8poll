import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayerApi } from '../api'
import { Avatar } from '../components/Avatar'
import { ChallengeModal } from '../components/ChallengeModal'
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  ListSkeleton,
  PageHeader,
  Segmented,
} from '../components/ui'
import { IconSearch, IconSwords, IconUsers } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { PlayerSummary } from '../api/types'

type SortKey = 'rating' | 'games' | 'name'

const SORTS = [
  { value: 'rating' as const, label: 'Reytinq' },
  { value: 'games' as const, label: 'Aktivlik' },
  { value: 'name' as const, label: 'Ad' },
]

export function Players() {
  const { user } = useAuth()
  const [players, setPlayers] = useState<PlayerSummary[]>([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('rating')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [challengeTarget, setChallengeTarget] = useState<PlayerSummary | null>(null)

  useEffect(() => {
    PlayerApi.list()
      .then(setPlayers)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? players.filter(
          (p) => p.username.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q),
        )
      : players

    const sorted = [...list]
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'games') sorted.sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    else sorted.sort((a, b) => a.fullName.localeCompare(b.fullName, 'az'))
    return sorted
  }, [players, query, sort])

  return (
    <div>
      <PageHeader
        title="Oyunçular"
        subtitle="Rəqib tap, dəvət göndər və reytinq qazan"
        actions={
          !loading && (
            <span className="text-sm tabular-nums text-ink-400">
              {filtered.length} oyunçu
            </span>
          )
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad və ya istifadəçi adı..."
            icon={<IconSearch size={16} />}
            aria-label="Oyunçu axtar"
          />
        </div>
        <Segmented items={SORTS} value={sort} onChange={setSort} label="Sıralama" className="self-start" />
      </div>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <Empty
          icon={<IconUsers size={20} />}
          title={query ? `"${query}" üzrə oyunçu tapılmadı` : 'Hələ oyunçu yoxdur'}
          hint={query ? 'Axtarışı dəyişib yenidən yoxlayın.' : undefined}
          action={query ? <Button variant="secondary" onClick={() => setQuery('')}>Axtarışı təmizlə</Button> : undefined}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              isMe={p.id === user?.id}
              onChallenge={() => setChallengeTarget(p)}
            />
          ))}
        </div>
      )}

      {challengeTarget && (
        <ChallengeModal
          opponent={challengeTarget}
          open
          onClose={() => setChallengeTarget(null)}
        />
      )}
    </div>
  )
}

function PlayerCard({
  player,
  isMe,
  onChallenge,
}: {
  player: PlayerSummary
  isMe: boolean
  onChallenge: () => void
}) {
  const total = player.wins + player.losses
  const winPct = total > 0 ? Math.round((player.wins / total) * 100) : 0

  return (
    <Card padded={false} interactive className="p-4">
      <div className="flex items-start gap-3">
        <Link to={`/players/${player.id}`} tabIndex={-1} aria-hidden>
          <Avatar name={player.fullName} color={player.avatarColor} size={46} />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/players/${player.id}`}
            className="flex items-center gap-2 truncate font-semibold text-ink-900 transition-colors hover:text-felt-300"
          >
            <span className="truncate">{player.fullName}</span>
            {isMe && (
              <span className="shrink-0 rounded-full bg-felt-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ivory">
                Siz
              </span>
            )}
          </Link>
          <div className="truncate text-xs text-ink-400">@{player.username}</div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-display text-lg font-semibold leading-none tabular-nums text-felt-300">
            {player.rating}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-400">xal</div>
        </div>
      </div>

      {/* Qələbə/məğlubiyyət nisbəti */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[11px] text-ink-400">
          <span>
            <b className="font-semibold text-felt-300">{player.wins}</b> qələbə ·{' '}
            <b className="font-semibold text-clay-300">{player.losses}</b> məğlub
          </span>
          <span className="tabular-nums">{total > 0 ? `${winPct}%` : '—'}</span>
        </div>
        <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-rail">
          {total > 0 ? (
            <>
              <span className="bg-felt-500" style={{ width: `${winPct}%` }} />
              <span className="flex-1 bg-clay-500" />
            </>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      </div>

      {!isMe && (
        <Button
          variant="secondary"
          size="sm"
          block
          className="mt-3.5"
          icon={<IconSwords size={15} />}
          onClick={onChallenge}
        >
          Dəvət göndər
        </Button>
      )}
    </Card>
  )
}
