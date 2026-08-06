import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LeaderboardApi } from '../api'
import { Avatar } from '../components/Avatar'
import { Card, PageLoader, Empty } from '../components/ui'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { LeaderboardEntry } from '../api/types'

export function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    LeaderboardApi.get(100)
      .then(setEntries)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const medal = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Reytinq cədvəli</h1>
        <p className="text-sm text-ink-500">Elo reytinqinə görə ən yaxşı oyunçular</p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {entries.length === 0 ? (
        <Empty title="Hələ oyunçu yoxdur" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-white/5">
            {entries.map(({ rank, player }) => {
              const isMe = player.id === user?.id
              return (
                <Link
                  key={player.id}
                  to={`/players/${player.id}`}
                  className={`flex items-center gap-4 px-4 py-3 transition hover:bg-wood-100/60 ${
                    isMe ? 'bg-felt-100' : ''
                  }`}
                >
                  <div className="w-8 shrink-0 text-center text-lg font-bold tabular-nums text-ink-500">
                    {medal(rank) ?? rank}
                  </div>
                  <Avatar name={player.fullName} color={player.avatarColor} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-ink-900">{player.fullName}</span>
                      {isMe && <span className="text-xs text-felt-700">(siz)</span>}
                    </div>
                    <div className="text-xs text-ink-500">
                      @{player.username} · {player.wins}Q / {player.losses}M · {player.gamesPlayed} oyun
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black tabular-nums text-felt-700">{player.rating}</div>
                    <div className="text-xs text-ink-400">xal</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
