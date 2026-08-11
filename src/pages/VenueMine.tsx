import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { VenueApi } from '../api'
import { VenuePhoto } from '../components/VenuePhoto'
import { VenueGridSkeleton } from './Venues'
import { Alert, Button, Card, Empty, PageHeader } from '../components/ui'
import { IconArrowRight, IconBuilding, IconPin, IconPlus } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import type { Venue } from '../api/types'

/** Məkan sahibinin öz məkanları — idarəetmə üçün giriş nöqtəsi */
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

  return (
    <div>
      <PageHeader
        eyebrow="Klub idarəetməsi"
        title="Məkanım"
        subtitle="Məkan məlumatlarını yenilə, şəkil yüklə və turnir aç"
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <VenueGridSkeleton count={2} />
      ) : venues.length === 0 ? (
        <Empty
          icon={<IconBuilding size={20} />}
          title="Hələ məkanınız yoxdur"
          hint="Məkan sahibi hesabı ilə qeydiyyatdan keçin — sonra buradan idarə edə bilərsiniz."
          action={
            <Link to="/venues/register">
              <Button icon={<IconPlus size={16} />}>Məkan qeydiyyatı</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {venues.map((v) => (
            <Link key={v.id} to={`/venues/${v.id}`} className="group">
              <Card padded={false} interactive className="h-full overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <VenuePhoto
                    src={v.photoUrls[0]}
                    alt={v.name}
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-4">
                  <h2 className="truncate font-display text-base font-semibold text-ink-900">
                    {v.name}
                  </h2>
                  {v.address && (
                    <p className="mt-1 flex items-center gap-1 truncate text-sm text-ink-500">
                      <IconPin size={14} className="shrink-0 text-ink-400" />
                      {v.address}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-felt-700">
                    İdarə et
                    <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
