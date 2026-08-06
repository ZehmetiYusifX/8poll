import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { VenueApi } from '../api'
import { Card, PageLoader, Empty } from '../components/ui'
import { extractErrorMessage } from '../api/client'
import type { Venue } from '../api/types'

/** Məkan sahibinin öz məkanları - idarəetmə üçün giriş nöqtəsi */
export function VenueMine() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    VenueApi.mine()
      .then(setVenues)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Məkanım</h1>
        <p className="text-sm text-ink-500">Məkanı idarə et, şəkil yüklə, turnir aç</p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {venues.length === 0 ? (
        <Empty title="Məkanınız yoxdur" hint="Məkan sahibi hesabı ilə daxil olun." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {venues.map((v) => (
            <Link key={v.id} to={`/venues/${v.id}`}>
              <Card className="overflow-hidden !p-0 transition hover:shadow-md">
                <div className="h-36 w-full bg-wood-100">
                  {v.photoUrls[0] ? (
                    <img src={v.photoUrls[0]} alt={v.name} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center text-4xl text-wood-300">🎱</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-ink-900">{v.name}</div>
                  {v.address && <div className="mt-0.5 text-sm text-ink-500">📍 {v.address}</div>}
                  <div className="mt-2 text-sm font-medium text-felt-700">İdarə et →</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
