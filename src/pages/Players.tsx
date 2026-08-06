import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayerApi } from '../api'
import { Avatar } from '../components/Avatar'
import { Button, Card, Input, PageLoader, Empty } from '../components/ui'
import { ChallengeModal } from '../components/ChallengeModal'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { PlayerSummary } from '../api/types'

export function Players() {
  const { user } = useAuth()
  const [players, setPlayers] = useState<PlayerSummary[]>([])
  const [query, setQuery] = useState('')
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
    return [...list].sort((a, b) => b.rating - a.rating)
  }, [players, query])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Oyunçular</h1>
        <p className="text-sm text-ink-500">Rəqib tap və dəvət göndər</p>
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ad və ya istifadəçi adı ilə axtar..."
      />

      {error && <p className="text-sm text-red-700">{error}</p>}

      {filtered.length === 0 ? (
        <Empty title="Oyunçu tapılmadı" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => {
            const isMe = p.id === user?.id
            return (
              <Card key={p.id} className="flex items-center gap-3">
                <Link to={`/players/${p.id}`}>
                  <Avatar name={p.fullName} color={p.avatarColor} size={48} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/players/${p.id}`} className="block truncate font-semibold text-ink-900 hover:text-felt-700">
                    {p.fullName}
                  </Link>
                  <div className="text-xs text-ink-500">
                    @{p.username} · <span className="text-felt-700">{p.rating} xal</span> · {p.wins}Q/{p.losses}M
                  </div>
                </div>
                {!isMe && (
                  <Button variant="secondary" onClick={() => setChallengeTarget(p)}>
                    Dəvət et
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {challengeTarget && (
        <ChallengeModal
          opponent={challengeTarget}
          open={!!challengeTarget}
          onClose={() => setChallengeTarget(null)}
        />
      )}
    </div>
  )
}
