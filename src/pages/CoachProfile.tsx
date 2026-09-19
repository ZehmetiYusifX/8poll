import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CoachApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { TierBadge } from '../components/TierBadge'
import { PackageCard, PackageGridSkeleton } from '../components/academy'
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  GoldRule,
  PageLoader,
  SectionHeader,
  Stat,
} from '../components/ui'
import { IconAcademy, IconArrowRight, IconPencil, IconPhone, IconPin } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import { GAME_TYPE_LABEL } from '../constants/gameTypes'
import type { Coach, LessonPackage } from '../api/types'

export function CoachProfile() {
  const { id } = useParams()
  const coachId = Number(id)
  const { user } = useAuth()

  const [coach, setCoach] = useState<Coach | null>(null)
  const [packages, setPackages] = useState<LessonPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([CoachApi.get(coachId), CoachApi.packages(coachId)])
      setCoach(c)
      setPackages(p)
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [coachId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <PageLoader />
  if (!coach) return <Alert tone="error">{error || 'Məşqçi tapılmadı'}</Alert>

  const isSelf = user?.id === coach.player.id
  const p = coach.player

  return (
    <div>
      <Link
        to="/coaches"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 transition-colors hover:text-ink-900"
      >
        <IconArrowRight size={15} className="rotate-180" />
        Məşqçilər
      </Link>

      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar name={p.fullName} color={p.avatarColor} src={p.avatarUrl} size={72} />
            <div className="min-w-0">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-300">
                Məşqçi
              </div>
              <h1 className="font-display text-[26px] leading-tight font-semibold text-ink-950 sm:text-[30px]">
                {p.fullName}
              </h1>
              {coach.headline && <p className="mt-1 text-sm text-ink-500">{coach.headline}</p>}

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <TierBadge tier={p.tier} />
                {coach.experienceYears != null && (
                  <Badge tone="gold" className="tabular-nums">
                    {coach.experienceYears} il təcrübə
                  </Badge>
                )}
                {coach.gameTypes.map((g) => (
                  <Badge key={g}>{GAME_TYPE_LABEL[g]}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            {isSelf && (
              <Link to="/coaches/panel">
                <Button variant="secondary" icon={<IconPencil size={16} />}>
                  Panelim
                </Button>
              </Link>
            )}
            <Link to={`/players/${p.id}`}>
              <Button variant="ghost">Oyunçu profili</Button>
            </Link>
          </div>
        </div>
        <GoldRule className="mt-4" />
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div>
          {coach.about && (
            <>
              <SectionHeader title="Haqqında" />
              <Card>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">
                  {coach.about}
                </p>
              </Card>
            </>
          )}

          <SectionHeader title="Dərs paketləri" count={packages.length} className="mt-7" />
          {packages.length === 0 ? (
            <Empty
              icon={<IconAcademy size={20} />}
              title="Hazırda aktiv paket yoxdur"
              hint={
                isSelf
                  ? 'Panelinizdən ilk paketi yaradın — vitrində dərhal görünəcək.'
                  : 'Məşqçi yeni paket yerləşdirdikdə burada görünəcək.'
              }
              action={
                isSelf ? (
                  <Link to="/coaches/panel">
                    <Button>Paket yarat</Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <div className="grid grid-cols-3 gap-2">
              <Stat value={p.rating} label="Reytinq" tone="accent" />
              <Stat value={p.gamesPlayed} label="Maç" />
              <Stat value={p.wins} label="Qələbə" tone="win" />
            </div>
            <p className="mt-3 border-t border-rail pt-3 text-xs leading-relaxed text-ink-400">
              Məşqçinin öz oyun statistikası — platformada qeyd olunmuş maçlardan gəlir.
            </p>
          </Card>

          {(coach.venue || coach.phone || coach.certifications) && (
            <Card className="space-y-3 text-sm">
              {coach.venue && (
                <Link
                  to={`/venues/${coach.venue.id}`}
                  className="flex items-center gap-2 text-ink-700 transition-colors hover:text-felt-300"
                >
                  <IconPin size={16} className="shrink-0 text-ink-400" />
                  <span className="min-w-0 truncate">{coach.venue.name}</span>
                </Link>
              )}
              {coach.phone && (
                <a
                  href={`tel:${coach.phone}`}
                  className="flex items-center gap-2 text-ink-700 transition-colors hover:text-felt-300"
                >
                  <IconPhone size={16} className="shrink-0 text-ink-400" />
                  <span className="tabular-nums">{coach.phone}</span>
                </a>
              )}
              {coach.certifications && (
                <p className="border-t border-rail pt-3 text-xs leading-relaxed text-ink-500">
                  {coach.certifications}
                </p>
              )}
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
