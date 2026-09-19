import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CoachApi } from '../api'
import { Avatar } from '../components/Avatar'
import { AcademyTabs } from '../components/academy'
import { Alert, Badge, Button, Card, Empty, Input, ListSkeleton, PageHeader } from '../components/ui'
import { IconAcademy, IconPin, IconPlus, IconSearch } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import { GAME_TYPE_LABEL } from '../constants/gameTypes'
import type { Coach } from '../api/types'

export function Coaches() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    CoachApi.list()
      .then(setCoaches)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return coaches
    return coaches.filter(
      (c) =>
        c.player.fullName.toLowerCase().includes(q) ||
        c.player.username.toLowerCase().includes(q) ||
        (c.headline ?? '').toLowerCase().includes(q),
    )
  }, [coaches, query])

  return (
    <div>
      <PageHeader
        eyebrow="Akademiya"
        title="Məşqçilər"
        subtitle="Təcrübəsi və nəticəsi görünən məşqçilər"
        actions={
          <Link to="/coaches/register">
            <Button variant="secondary" icon={<IconPlus size={16} />}>
              Məşqçi hesabı aç
            </Button>
          </Link>
        }
      />

      <AcademyTabs value="coaches" />

      <div className="mb-5 max-w-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad və ya ixtisas ilə axtar..."
          icon={<IconSearch size={16} />}
          aria-label="Məşqçi axtar"
        />
      </div>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <Empty
          icon={<IconAcademy size={20} />}
          title={query ? `"${query}" üzrə məşqçi tapılmadı` : 'Hələ məşqçi yoxdur'}
          hint={
            query
              ? 'Axtarışı dəyişib yenidən yoxlayın.'
              : 'Dərs verirsinizsə, məşqçi hesabı açıb ilk paketinizi yerləşdirin.'
          }
          action={
            !query ? (
              <Link to="/coaches/register">
                <Button icon={<IconPlus size={16} />}>Məşqçi hesabı aç</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((c) => (
            <Link key={c.id} to={`/coaches/${c.id}`}>
              <Card interactive className="flex h-full items-start gap-3.5">
                <Avatar
                  name={c.player.fullName}
                  color={c.player.avatarColor}
                  src={c.player.avatarUrl}
                  size={52}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="truncate font-display text-base font-semibold text-ink-900">
                      {c.player.fullName}
                    </h2>
                    {c.experienceYears != null && (
                      <Badge tone="gold" className="shrink-0 tabular-nums">
                        {c.experienceYears} il təcrübə
                      </Badge>
                    )}
                  </div>
                  {c.headline && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{c.headline}</p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-400">
                    <span className="text-ink-500">
                      {c.gameTypes.map((g) => GAME_TYPE_LABEL[g]).join(' · ')}
                    </span>
                    {c.venue && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-0.5 text-felt-300">
                          <IconPin size={12} />
                          {c.venue.name}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-xs font-medium tabular-nums text-ink-500">
                    {c.packageCount > 0 ? `${c.packageCount} dərs paketi` : 'Paket hazırlanır'}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
