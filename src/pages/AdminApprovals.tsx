import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminApprovalApi } from '../api'
import { extractErrorMessage } from '../api/client'
import type { Coach, Venue } from '../api/types'
import { Avatar } from '../components/Avatar'
import { ActionCard } from '../components/ActionCard'
import { useToast } from '../components/Toast'
import { Alert, Button, Empty, ListSkeleton, PageHeader, Segmented } from '../components/ui'
import { IconBuilding, IconCheck, IconUsers, IconX } from '../components/icons'

type Tab = 'coaches' | 'venues'

/**
 * Admin: yeni qeydiyyatdan keçmiş məşqçi/məkan hesablarının təsdiqi.
 *
 * Təsdiqlənməyən hesablar bazarda (akademiya vitrini, məkan siyahısı) görünmür,
 * amma sahib öz panelinə giriş edə bilir (bax CoachPanel/VenueMine pending banner).
 */
export function AdminApprovals() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('coaches')
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const [c, v] = await Promise.all([AdminApprovalApi.pendingCoaches(), AdminApprovalApi.pendingVenues()])
      setCoaches(c)
      setVenues(v)
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const decide = async (
    id: number,
    fn: () => Promise<unknown>,
    message: string,
    removeFrom: 'coaches' | 'venues',
  ) => {
    setBusyId(id)
    try {
      await fn()
      toast.success(message)
      if (removeFrom === 'coaches') setCoaches((prev) => prev.filter((c) => c.id !== id))
      else setVenues((prev) => prev.filter((v) => v.id !== id))
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Təsdiq gözləyənlər"
        eyebrow="Admin"
        subtitle="Yeni məşqçi və məkan qeydiyyatlarını nəzərdən keçirin"
      />

      <Segmented
        className="mb-5"
        label="Bölmə"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'coaches', label: 'Məşqçilər', count: coaches.length },
          { value: 'venues', label: 'Məkanlar', count: venues.length },
        ]}
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : tab === 'coaches' ? (
        coaches.length === 0 ? (
          <Empty icon={<IconUsers size={20} />} title="Təsdiq gözləyən məşqçi yoxdur" />
        ) : (
          <div className="space-y-3">
            {coaches.map((c) => (
              <ActionCard
                key={c.id}
                tone="neutral"
                avatar={
                  <Avatar
                    name={c.player.fullName}
                    color={c.player.avatarColor}
                    src={c.player.avatarUrl}
                    size={44}
                  />
                }
                title={
                  <Link
                    to={`/coaches/${c.id}`}
                    className="font-semibold text-ink-900 transition-colors hover:text-felt-300"
                  >
                    {c.player.fullName}
                  </Link>
                }
                meta={
                  <>
                    <span>@{c.player.username}</span>
                    {c.headline && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{c.headline}</span>
                      </>
                    )}
                  </>
                }
                actions={
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      icon={<IconCheck size={15} />}
                      loading={busyId === c.id}
                      onClick={() =>
                        decide(c.id, () => AdminApprovalApi.approveCoach(c.id), 'Məşqçi təsdiqləndi', 'coaches')
                      }
                    >
                      Təsdiqlə
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<IconX size={15} />}
                      disabled={busyId === c.id}
                      onClick={() =>
                        decide(c.id, () => AdminApprovalApi.rejectCoach(c.id), 'Məşqçi rədd edildi', 'coaches')
                      }
                    >
                      Rədd et
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        )
      ) : venues.length === 0 ? (
        <Empty icon={<IconBuilding size={20} />} title="Təsdiq gözləyən məkan yoxdur" />
      ) : (
        <div className="space-y-3">
          {venues.map((v) => (
            <ActionCard
              key={v.id}
              tone="neutral"
              avatar={
                <Avatar name={v.name} color={v.owner.avatarColor} src={null} size={44} />
              }
              title={
                <Link
                  to={`/venues/${v.id}`}
                  className="font-semibold text-ink-900 transition-colors hover:text-felt-300"
                >
                  {v.name}
                </Link>
              }
              meta={
                <>
                  <span>Sahib: @{v.owner.username}</span>
                  {v.address && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{v.address}</span>
                    </>
                  )}
                </>
              }
              actions={
                <>
                  <Button
                    variant="success"
                    size="sm"
                    icon={<IconCheck size={15} />}
                    loading={busyId === v.id}
                    onClick={() =>
                      decide(v.id, () => AdminApprovalApi.approveVenue(v.id), 'Məkan təsdiqləndi', 'venues')
                    }
                  >
                    Təsdiqlə
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<IconX size={15} />}
                    disabled={busyId === v.id}
                    onClick={() =>
                      decide(v.id, () => AdminApprovalApi.rejectVenue(v.id), 'Məkan rədd edildi', 'venues')
                    }
                  >
                    Rədd et
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
