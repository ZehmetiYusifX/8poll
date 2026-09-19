import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AcademyApi } from '../api'
import { Avatar } from '../components/Avatar'
import { ActionCard } from '../components/ActionCard'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  Alert,
  Badge,
  Button,
  Empty,
  ListSkeleton,
  PageHeader,
  Segmented,
} from '../components/ui'
import { IconAcademy, IconClock, IconPin } from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage } from '../api/client'
import { timeAgo } from '../utils/format'
import { GAME_TYPE_LABEL } from '../constants/gameTypes'
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  formatPrice,
  isActiveOrder,
} from '../constants/academy'
import type { LessonOrder } from '../api/types'

type Tab = 'active' | 'archive'

/** Şagirdin sifarişləri — «Kurslarım» */
export function MyCourses() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('active')
  const [orders, setOrders] = useState<LessonOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toCancel, setToCancel] = useState<LessonOrder | null>(null)

  const load = useCallback(async () => {
    try {
      setOrders(await AcademyApi.myOrders())
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

  const active = useMemo(() => orders.filter((o) => isActiveOrder(o.status)), [orders])
  const archive = useMemo(() => orders.filter((o) => !isActiveOrder(o.status)), [orders])
  const list = tab === 'active' ? active : archive

  const cancel = async (order: LessonOrder) => {
    try {
      await AcademyApi.cancel(order.id)
      toast.success('Sifariş ləğv edildi')
      await load()
    } catch (e) {
      toast.error(extractErrorMessage(e))
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Akademiya"
        title="Kurslarım"
        subtitle="Sifariş etdiyiniz dərs paketləri və onların vəziyyəti"
        actions={
          <Link to="/academy">
            <Button variant="secondary" icon={<IconAcademy size={16} />}>
              Paketlərə bax
            </Button>
          </Link>
        }
      />

      <Segmented
        className="mb-5"
        label="Sifariş vəziyyəti"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'active', label: 'Aktiv', count: active.length },
          { value: 'archive', label: 'Arxiv' },
        ]}
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : list.length === 0 ? (
        <Empty
          icon={<IconAcademy size={20} />}
          title={tab === 'active' ? 'Aktiv sifarişiniz yoxdur' : 'Arxiv boşdur'}
          hint={
            tab === 'active'
              ? 'Akademiyadan dərs paketi seçib sifariş göndərin.'
              : 'Tamamlanmış və ləğv olunmuş sifarişlər burada saxlanılır.'
          }
          action={
            tab === 'active' ? (
              <Link to="/academy">
                <Button>Dərs paketlərinə bax</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((o) => {
            const coach = o.lessonPackage.coach
            const canCancel = o.status === 'PENDING' || o.status === 'ACCEPTED'

            return (
              <ActionCard
                key={o.id}
                tone={o.status === 'PENDING' ? 'confirm' : 'neutral'}
                avatar={
                  <Avatar
                    name={coach.player.fullName}
                    color={coach.player.avatarColor}
                    src={coach.player.avatarUrl}
                    size={44}
                  />
                }
                title={
                  <Link
                    to={`/academy/${o.lessonPackage.id}`}
                    className="font-semibold text-ink-900 transition-colors hover:text-felt-300"
                  >
                    {o.lessonPackage.title}
                  </Link>
                }
                meta={
                  <>
                    <Link to={`/coaches/${coach.id}`} className="hover:text-ink-700">
                      {coach.player.fullName}
                    </Link>
                    <span aria-hidden>·</span>
                    <span className="text-ink-500">{GAME_TYPE_LABEL[o.lessonPackage.gameType]}</span>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-0.5 tabular-nums">
                      <IconClock size={12} />
                      {o.lessonCount} dərs
                    </span>
                    <span aria-hidden>·</span>
                    <span className="font-semibold tabular-nums text-gold-300">
                      {formatPrice(o.price)}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{timeAgo(o.createdAt)}</span>
                    {o.lessonPackage.venue && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-0.5 text-felt-300">
                          <IconPin size={12} />
                          {o.lessonPackage.venue.name}
                        </span>
                      </>
                    )}
                  </>
                }
                note={o.coachNote}
                actions={
                  <>
                    <Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                    {canCancel && (
                      <Button variant="ghost" size="sm" onClick={() => setToCancel(o)}>
                        Ləğv et
                      </Button>
                    )}
                  </>
                }
              />
            )
          })}
        </div>
      )}

      {/* Ödəniş və dərs razılaşması məşqçi ilə şifahi olduğu üçün ləğv təsdiq istəyir */}
      <ConfirmDialog
        open={!!toCancel}
        title="Sifarişi ləğv edək?"
        description={
          toCancel
            ? `"${toCancel.lessonPackage.title}" paketi üzrə sifarişiniz ləğv olunacaq. Yenidən sifariş verə bilərsiniz.`
            : ''
        }
        confirmLabel="Bəli, ləğv et"
        onConfirm={() => (toCancel ? cancel(toCancel) : undefined)}
        onClose={() => setToCancel(null)}
      />
    </div>
  )
}
