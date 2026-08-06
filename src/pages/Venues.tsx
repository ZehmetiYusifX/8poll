import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { VenueApi } from '../api'
import { Card, Input, PageLoader, Empty, Button } from '../components/ui'
import { extractErrorMessage } from '../api/client'
import type { Venue } from '../api/types'

export function Venues() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    VenueApi.list()
      .then(setVenues)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return venues
    return venues.filter(
      (v) => v.name.toLowerCase().includes(q) || (v.address ?? '').toLowerCase().includes(q),
    )
  }, [venues, query])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Məkanlar</h1>
          <p className="text-sm text-ink-500">Bilyard klubları və turnir məkanları</p>
        </div>
        <Link to="/venues/register">
          <Button variant="secondary">Məkan əlavə et</Button>
        </Link>
      </div>

      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ad və ya ünvan ilə axtar..." />

      {error && <p className="text-sm text-red-700">{error}</p>}

      {filtered.length === 0 ? (
        <Empty title="Məkan tapılmadı" hint="İlk məkanı siz əlavə edin." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((v) => (
            <Link key={v.id} to={`/venues/${v.id}`}>
              <Card className="overflow-hidden !p-0 transition hover:shadow-md">
                <div className="h-40 w-full bg-wood-100">
                  {v.photoUrls[0] ? (
                    <img src={v.photoUrls[0]} alt={v.name} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-4xl text-wood-300">🎱</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-ink-900">{v.name}</div>
                  {v.address && <div className="mt-0.5 text-sm text-ink-500">📍 {v.address}</div>}
                  {v.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink-500">{v.description}</p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
