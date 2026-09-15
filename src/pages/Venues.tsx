import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { VenueApi } from '../api'
import { VenuePhoto } from '../components/VenuePhoto'
import { Alert, Button, Card, Empty, Input, PageHeader, Skeleton } from '../components/ui'
import { IconBuilding, IconPin, IconPlus, IconSearch } from '../components/icons'
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

  return (
    <div>
      <PageHeader
        title="Məkanlar"
        subtitle="Bilyard klubları və turnir məkanları"
        actions={
          <Link to="/venues/register">
            <Button variant="secondary" icon={<IconPlus size={16} />}>
              Məkan əlavə et
            </Button>
          </Link>
        }
      />

      <div className="mb-5 max-w-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad və ya ünvan ilə axtar..."
          icon={<IconSearch size={16} />}
          aria-label="Məkan axtar"
        />
      </div>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <VenueGridSkeleton />
      ) : filtered.length === 0 ? (
        <Empty
          icon={<IconBuilding size={20} />}
          title={query ? `"${query}" üzrə məkan tapılmadı` : 'Hələ məkan yoxdur'}
          hint={query ? 'Axtarışı dəyişib yenidən yoxlayın.' : 'İlk klubu siz qeydiyyatdan keçirin.'}
          action={
            !query ? (
              <Link to="/venues/register">
                <Button icon={<IconPlus size={16} />}>Məkan əlavə et</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <Link key={v.id} to={`/venues/${v.id}`} className="group">
              <Card padded={false} interactive className="h-full overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <VenuePhoto
                    src={v.photoUrls[0]}
                    alt={v.name}
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  {v.photoUrls.length > 1 && (
                    <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-ivory backdrop-blur-sm">
                      {v.photoUrls.length} şəkil
                    </span>
                  )}
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
                  {v.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
                      {v.description}
                    </p>
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

export function VenueGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-rail bg-card">
          <Skeleton className="h-44 rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
