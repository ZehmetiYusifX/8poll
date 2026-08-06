import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TournamentApi } from '../api'
import { Card, PageLoader, Empty, Badge } from '../components/ui'
import { extractErrorMessage } from '../api/client'
import { formatDate } from '../utils/format'
import type { Tournament, TournamentStatus } from '../api/types'

const statusMeta: Record<TournamentStatus, { text: string; tone: 'green' | 'yellow' | 'blue' | 'neutral' }> = {
  REGISTRATION: { text: 'Qeydiyyat açıq', tone: 'green' },
  ONGOING: { text: 'Davam edir', tone: 'yellow' },
  COMPLETED: { text: 'Bitdi', tone: 'blue' },
  CANCELLED: { text: 'Ləğv edildi', tone: 'neutral' },
}

export function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    TournamentApi.list()
      .then(setTournaments)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Turnirlər</h1>
        <p className="text-sm text-ink-500">Məkanların təşkil etdiyi turnirlər — qoşul və mübarizə apar</p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {tournaments.length === 0 ? (
        <Empty title="Hələ turnir yoxdur" hint="Məkanlar turnir açdıqca burada görünəcək." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tournaments.map((t) => {
            const st = statusMeta[t.status]
            return (
              <Link key={t.id} to={`/tournaments/${t.id}`}>
                <Card className="transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-ink-900">{t.name}</div>
                    <Badge tone={st.tone}>{st.text}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-ink-500">📍 {t.venue.name}</div>
                  <div className="mt-2 text-xs text-ink-500">
                    {t.participantCount}/{t.maxParticipants} iştirakçı
                    {t.startAt && ` · ${formatDate(t.startAt)}`}
                  </div>
                  {t.status === 'COMPLETED' && t.winner && (
                    <div className="mt-2 text-sm font-medium text-felt-700">🏆 Qalib: {t.winner.fullName}</div>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
