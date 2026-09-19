import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AcademyApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { Modal } from '../components/Modal'
import { PackageMeta } from '../components/academy'
import {
  Alert,
  Badge,
  Button,
  Card,
  ErrorText,
  Field,
  PageLoader,
  SectionHeader,
  Stat,
  Textarea,
} from '../components/ui'
import { IconAcademy, IconArrowRight, IconPencil, IconPhone, IconPin } from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage } from '../api/client'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, formatPrice, isActiveOrder } from '../constants/academy'
import type { LessonOrder, LessonPackage } from '../api/types'

export function PackageDetail() {
  const { id } = useParams()
  const packageId = Number(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [pkg, setPkg] = useState<LessonPackage | null>(null)
  const [myOrder, setMyOrder] = useState<LessonOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [orderOpen, setOrderOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    try {
      const p = await AcademyApi.getPackage(packageId)
      setPkg(p)
      // Təkrar sifarişin qarşısı backend-dədir; burada sadəcə düyməni dəyişirik
      if (user) {
        const orders = await AcademyApi.myOrders()
        setMyOrder(orders.find((o) => o.lessonPackage.id === packageId && isActiveOrder(o.status)) ?? null)
      }
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [packageId, user])

  useEffect(() => {
    load()
  }, [load])

  const isOwner = !!pkg && user?.id === pkg.coach.player.id

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSending(true)
    try {
      await AcademyApi.createOrder({ packageId, message: message.trim() || undefined })
      setOrderOpen(false)
      setMessage('')
      toast.success('Sifariş göndərildi — məşqçi cavab verəcək')
      navigate('/academy/mine')
    } catch (err) {
      setFormError(extractErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (loading) return <PageLoader />
  if (!pkg) return <Alert tone="error">{error || 'Paket tapılmadı'}</Alert>

  const perLesson = pkg.lessonCount > 0 ? pkg.price / pkg.lessonCount : pkg.price

  return (
    <div>
      <Link
        to="/academy"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 transition-colors hover:text-ink-900"
      >
        <IconArrowRight size={15} className="rotate-180" />
        Dərs paketləri
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {!pkg.active && <Badge tone="neutral">Satışda deyil</Badge>}
            {pkg.studentCount > 0 && (
              <Badge tone="green">{pkg.studentCount} şagird</Badge>
            )}
          </div>
          <h1 className="font-display text-[26px] leading-tight font-semibold text-ink-950 sm:text-[30px]">
            {pkg.title}
          </h1>
          <PackageMeta pkg={pkg} className="mt-2.5" />
          <div className="rule-gold mt-4 h-px w-full" aria-hidden />

          {pkg.description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink-600">
              {pkg.description}
            </p>
          )}

          <SectionHeader title="Paketin tərkibi" className="mt-7" />
          <Card>
            <div className="grid grid-cols-3 gap-3">
              <Stat value={pkg.lessonCount} label="Dərs" />
              <Stat value={`${pkg.lessonMinutes} dəq`} label="Hər dərs" />
              <Stat
                value={pkg.format === 'GROUP' ? `${pkg.groupSize ?? '—'} nəfər` : '1:1'}
                label={pkg.format === 'GROUP' ? 'Qrup' : 'Format'}
              />
            </div>
          </Card>

          {pkg.venue && (
            <>
              <SectionHeader title="Dərs yeri" className="mt-7" />
              <Link to={`/venues/${pkg.venue.id}`}>
                <Card interactive className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-ink-800">
                    <IconPin size={16} className="shrink-0 text-ink-400" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{pkg.venue.name}</span>
                      {pkg.venue.address && (
                        <span className="block truncate text-xs text-ink-400">{pkg.venue.address}</span>
                      )}
                    </span>
                  </span>
                  <IconArrowRight size={16} className="shrink-0 text-ink-400" />
                </Card>
              </Link>
            </>
          )}
        </div>

        {/* Sağ sütun: qiymət və hərəkət — mobil ekranda məzmunun altına düşür */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="space-y-4">
            <div>
              <div className="font-display text-3xl font-semibold tabular-nums text-gold-300">
                {formatPrice(pkg.price)}
              </div>
              <p className="mt-1 text-xs text-ink-400">
                Dərs başına təxminən {formatPrice(Math.round(perLesson))}
              </p>
            </div>

            <div className="border-t border-rail pt-4">
              <Link
                to={`/coaches/${pkg.coach.id}`}
                className="flex items-center gap-2.5 transition-colors hover:text-ink-950"
              >
                <Avatar
                  name={pkg.coach.player.fullName}
                  color={pkg.coach.player.avatarColor}
                  src={pkg.coach.player.avatarUrl}
                  size={40}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink-900">
                    {pkg.coach.player.fullName}
                  </span>
                  <span className="block truncate text-xs text-ink-400">
                    {pkg.coach.headline ?? 'Məşqçi'}
                  </span>
                </span>
              </Link>
            </div>

            <div className="border-t border-rail pt-4">
              {isOwner ? (
                <Link to="/coaches/panel">
                  <Button variant="secondary" block icon={<IconPencil size={16} />}>
                    Paneldə redaktə et
                  </Button>
                </Link>
              ) : myOrder ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-sm text-ink-600">
                    <span>Sifarişiniz</span>
                    <Badge tone={ORDER_STATUS_TONE[myOrder.status]}>
                      {ORDER_STATUS_LABEL[myOrder.status]}
                    </Badge>
                  </div>
                  <Link to="/academy/mine">
                    <Button variant="secondary" block>
                      Kurslarıma bax
                    </Button>
                  </Link>
                </div>
              ) : !pkg.active ? (
                <Alert tone="info">Bu paket hazırda satışda deyil.</Alert>
              ) : (
                <Button
                  block
                  size="lg"
                  icon={<IconAcademy size={17} />}
                  onClick={() =>
                    user ? setOrderOpen(true) : navigate('/login', { state: { from: `/academy/${packageId}` } })
                  }
                >
                  Sifariş et
                </Button>
              )}
              <p className="mt-3 text-xs leading-relaxed text-ink-400">
                Ödəniş onlayn alınmır. Məşqçi sifarişi qəbul etdikdən sonra ödənişi klubda
                nağd və ya köçürmə ilə edirsiniz.
              </p>
            </div>

            {pkg.coach.player.gamesPlayed > 0 && (
              <div className="grid grid-cols-2 gap-3 border-t border-rail pt-4">
                <Stat value={pkg.coach.player.rating} label="Məşqçi reytinqi" tone="accent" />
                <Stat value={pkg.coach.player.gamesPlayed} label="Maç" />
              </div>
            )}
          </Card>
        </aside>
      </div>

      <Modal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        title="Sifarişi təsdiqlə"
        description={`${pkg.title} — ${formatPrice(pkg.price)}`}
      >
        <form onSubmit={submitOrder} className="space-y-4">
          <Alert tone="info">
            Sifariş məşqçiyə göndərilir. O qəbul etdikdən sonra ödəniş və dərs vaxtı
            barədə sizinlə əlaqə saxlayacaq.
          </Alert>

          <Field label="Məşqçiyə qeyd" optional hint="Səviyyəniz, uyğun vaxtlar, məqsədiniz">
            <Textarea
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Həftə içi axşamlar uyğundur, əsasən qol vurma texnikası üzərində işləmək istəyirəm."
            />
          </Field>

          <p className="flex items-center gap-1.5 text-xs text-ink-400">
            <IconPhone size={13} />
            Məşqçinin əlaqə nömrəsi profilində göstərilir.
          </p>

          <ErrorText>{formError}</ErrorText>

          <div className="flex gap-2">
            <Button variant="secondary" block onClick={() => setOrderOpen(false)} disabled={sending}>
              Ləğv et
            </Button>
            <Button type="submit" block loading={sending}>
              Sifarişi göndər
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
