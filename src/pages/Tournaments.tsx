import { useEffect, useMemo, useState } from 'react'
import { TournamentApi } from '../api'
import { TournamentCard } from '../components/TournamentCard'
import { Alert, Empty, PageHeader, Segmented, Skeleton } from '../components/ui'
import { IconMedal } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import type { Tournament } from '../api/types'

type Filter = 'active' | 'open' | 'done' | 'all'

export function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filter, setFilter] = useState<Filter>('active')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    TournamentApi.list()
      .then(setTournaments)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(
    () => ({
      open: tournaments.filter((t) => t.status === 'REGISTRATION').length,
      active: tournaments.filter((t) => t.status === 'REGISTRATION' || t.status === 'ONGOING').length,
    }),
    [tournaments],
  )

  const visible = useMemo(() => {
    const list =
      filter === 'open'
        ? tournaments.filter((t) => t.status === 'REGISTRATION')
        : filter === 'done'
          ? tournaments.filter((t) => t.status === 'COMPLETED')
          : filter === 'active'
            ? tournaments.filter((t) => t.status === 'REGISTRATION' || t.status === 'ONGOING')
            : tournaments

    // Yaxın başlayanlar önə, tarixi olmayanlar sona
    return [...list].sort((a, b) => {
      if (!a.startAt) return 1
      if (!b.startAt) return -1
      return Date.parse(a.startAt) - Date.parse(b.startAt)
    })
  }, [tournaments, filter])

  return (
    <div>
      <PageHeader
        title="Turnirlər"
        subtitle="Klubların təşkil etdiyi turnirlərə qoşul və cədvəldə irəlilə"
      />

      {tournaments.length > 0 && (
        <Segmented
          className="mb-5"
          label="Turnir filtri"
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'active', label: 'Aktiv', count: counts.active },
            { value: 'open', label: 'Qeydiyyat', count: counts.open },
            { value: 'done', label: 'Bitmiş' },
            { value: 'all', label: 'Hamısı' },
          ]}
        />
      )}

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-rail bg-card p-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Empty
          icon={<IconMedal size={20} />}
          title={
            tournaments.length === 0 ? 'Hələ turnir yoxdur' : 'Bu filtrə uyğun turnir yoxdur'
          }
          hint={
            tournaments.length === 0
              ? 'Klublar turnir açdıqca burada görünəcək.'
              : 'Başqa filtri yoxlayın.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  )
}
