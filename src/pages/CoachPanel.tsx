import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AcademyApi, CoachApi, VenueApi } from '../api'
import { Avatar } from '../components/Avatar'
import { ActionCard } from '../components/ActionCard'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PackageCard, PackageGridSkeleton } from '../components/academy'
import {
  Alert,
  Badge,
  Button,
  Empty,
  ErrorText,
  Field,
  Input,
  ListSkeleton,
  PageHeader,
  Segmented,
  Select,
  Textarea,
} from '../components/ui'
import { IconAcademy, IconCheck, IconClock, IconPencil, IconPlus, IconX } from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage } from '../api/client'
import { timeAgo } from '../utils/format'
import { DEFAULT_GAME_TYPE, GAME_TYPES, GAME_TYPE_LABEL } from '../constants/gameTypes'
import {
  COACHING_LEVELS,
  DEFAULT_FORMAT,
  DEFAULT_LEVEL,
  FORMAT_LABEL,
  LESSON_FORMATS,
  LEVEL_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  formatPrice,
} from '../constants/academy'
import type {
  CoachingLevel,
  GameType,
  LessonFormat,
  LessonOrder,
  LessonPackage,
  Venue,
} from '../api/types'

type Tab = 'packages' | 'orders'

interface PackageForm {
  title: string
  description: string
  gameType: GameType
  level: CoachingLevel
  format: LessonFormat
  lessonCount: string
  lessonMinutes: string
  groupSize: string
  price: string
  venueId: string
}

const EMPTY_FORM: PackageForm = {
  title: '',
  description: '',
  gameType: DEFAULT_GAME_TYPE,
  level: DEFAULT_LEVEL,
  format: DEFAULT_FORMAT,
  lessonCount: '4',
  lessonMinutes: '60',
  groupSize: '',
  price: '',
  venueId: '',
}

/** Məşqçinin iş masası — paketlər və gələn sifarişlər */
export function CoachPanel() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('packages')
  const [packages, setPackages] = useState<LessonPackage[]>([])
  const [orders, setOrders] = useState<LessonOrder[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LessonPackage | null>(null)
  const [form, setForm] = useState<PackageForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [toDeactivate, setToDeactivate] = useState<LessonPackage | null>(null)
  const [respondTo, setRespondTo] = useState<{ order: LessonOrder; accept: boolean } | null>(null)
  const [note, setNote] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([AcademyApi.myPackages(), AcademyApi.receivedOrders()])
      setPackages(p)
      setOrders(o)
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    VenueApi.list().then(setVenues).catch(() => setVenues([]))
  }, [load])

  const pendingCount = useMemo(() => orders.filter((o) => o.status === 'PENDING').length, [orders])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (p: LessonPackage) => {
    setEditing(p)
    setForm({
      title: p.title,
      description: p.description ?? '',
      gameType: p.gameType,
      level: p.level,
      format: p.format,
      lessonCount: String(p.lessonCount),
      lessonMinutes: String(p.lessonMinutes),
      groupSize: p.groupSize != null ? String(p.groupSize) : '',
      price: String(p.price),
      venueId: p.venue ? String(p.venue.id) : '',
    })
    setFormError('')
    setFormOpen(true)
  }

  const set =
    <K extends keyof PackageForm>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value as PackageForm[K] }))

  const savePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (form.title.trim().length < 3) return setFormError('Başlıq ən azı 3 simvol olmalıdır')
    if (!form.price || Number(form.price) < 0) return setFormError('Qiyməti daxil edin')
    if (form.format === 'GROUP' && !form.groupSize)
      return setFormError('Qrup dərsi üçün qrupun ölçüsünü göstərin')

    const body = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      gameType: form.gameType,
      level: form.level,
      format: form.format,
      lessonCount: Number(form.lessonCount) || 1,
      lessonMinutes: Number(form.lessonMinutes) || 60,
      groupSize: form.format === 'GROUP' ? Number(form.groupSize) : null,
      price: Number(form.price),
      venueId: form.venueId ? Number(form.venueId) : null,
    }

    setSaving(true)
    try {
      if (editing) await AcademyApi.updatePackage(editing.id, body)
      else await AcademyApi.createPackage(body)
      setFormOpen(false)
      toast.success(editing ? 'Paket yeniləndi' : 'Paket yaradıldı')
      await load()
    } catch (err) {
      setFormError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const act = async (id: number, fn: () => Promise<unknown>, message: string) => {
    setBusyId(id)
    try {
      await fn()
      toast.success(message)
      await load()
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  const submitResponse = async () => {
    if (!respondTo) return
    const { order, accept } = respondTo
    const body = note.trim() ? { coachNote: note.trim() } : undefined
    setRespondTo(null)
    setNote('')
    await act(
      order.id,
      () => (accept ? AcademyApi.accept(order.id, body) : AcademyApi.decline(order.id, body)),
      accept ? 'Sifariş qəbul edildi' : 'Sifarişdən imtina edildi',
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Məşqçi paneli"
        title="Dərslərim"
        subtitle="Paketlərinizi idarə edin, gələn sifarişlərə cavab verin"
        actions={
          <>
            <Link to="/coaches">
              <Button variant="ghost">Vitrinə bax</Button>
            </Link>
            <Button icon={<IconPlus size={16} />} onClick={openCreate}>
              Yeni paket
            </Button>
          </>
        }
      />

      <Segmented
        className="mb-5"
        label="Panel bölməsi"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'packages', label: 'Paketlərim' },
          { value: 'orders', label: 'Sifarişlər', count: pendingCount },
        ]}
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {tab === 'packages' ? (
        loading ? (
          <PackageGridSkeleton count={3} />
        ) : packages.length === 0 ? (
          <Empty
            icon={<IconAcademy size={20} />}
            title="Hələ paketiniz yoxdur"
            hint="İlk paketi yaradın — dərs sayı, müddəti və qiyməti kifayətdir."
            action={<Button icon={<IconPlus size={16} />} onClick={openCreate}>Paket yarat</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {packages.map((p) => (
              <PackageCard
                key={p.id}
                pkg={p}
                footer={
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<IconPencil size={15} />}
                      onClick={() => openEdit(p)}
                    >
                      Redaktə
                    </Button>
                    {p.active ? (
                      <Button variant="ghost" size="sm" onClick={() => setToDeactivate(p)}>
                        Satışdan çıxar
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={busyId === p.id}
                        onClick={() =>
                          act(
                            p.id,
                            () => AcademyApi.updatePackage(p.id, { active: true }),
                            'Paket yenidən satışdadır',
                          )
                        }
                      >
                        Aktivləşdir
                      </Button>
                    )}
                  </>
                }
              />
            ))}
          </div>
        )
      ) : loading ? (
        <ListSkeleton rows={3} />
      ) : orders.length === 0 ? (
        <Empty
          icon={<IconAcademy size={20} />}
          title="Hələ sifariş yoxdur"
          hint="Şagird paketinizi sifariş etdikdə burada görünəcək."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const busy = busyId === o.id
            return (
              <ActionCard
                key={o.id}
                tone={o.status === 'PENDING' ? 'confirm' : 'neutral'}
                avatar={
                  <Link to={`/players/${o.student.id}`} tabIndex={-1} aria-hidden>
                    <Avatar
                      name={o.student.fullName}
                      color={o.student.avatarColor}
                      src={o.student.avatarUrl}
                      size={44}
                    />
                  </Link>
                }
                title={
                  <Link
                    to={`/players/${o.student.id}`}
                    className="font-semibold text-ink-900 transition-colors hover:text-felt-300"
                  >
                    {o.student.fullName}
                  </Link>
                }
                meta={
                  <>
                    <Link
                      to={`/academy/${o.lessonPackage.id}`}
                      className="text-ink-500 hover:text-ink-700"
                    >
                      {o.lessonPackage.title}
                    </Link>
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
                  </>
                }
                note={o.message}
                actions={
                  <>
                    <Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                    {o.status === 'PENDING' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          icon={<IconCheck size={15} />}
                          disabled={busy}
                          onClick={() => {
                            setNote('')
                            setRespondTo({ order: o, accept: true })
                          }}
                        >
                          Qəbul et
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<IconX size={15} />}
                          disabled={busy}
                          onClick={() => {
                            setNote('')
                            setRespondTo({ order: o, accept: false })
                          }}
                        >
                          İmtina
                        </Button>
                      </>
                    )}
                    {o.status === 'ACCEPTED' && (
                      <Button
                        variant="gold"
                        size="sm"
                        loading={busy}
                        onClick={() =>
                          act(o.id, () => AcademyApi.markPaid(o.id), 'Ödəniş qeyd edildi')
                        }
                      >
                        Ödəniş alındı
                      </Button>
                    )}
                    {o.status === 'PAID' && (
                      <Button
                        size="sm"
                        loading={busy}
                        onClick={() =>
                          act(o.id, () => AcademyApi.complete(o.id), 'Kurs tamamlandı')
                        }
                      >
                        Tamamlandı
                      </Button>
                    )}
                  </>
                }
              />
            )
          })}
        </div>
      )}

      {/* Paket forması — yaratma və redaktə eyni formadır */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Paketi redaktə et' : 'Yeni dərs paketi'}
        size="lg"
      >
        <form onSubmit={savePackage} className="space-y-4">
          <Field label="Başlıq">
            <Input
              value={form.title}
              onChange={set('title')}
              maxLength={120}
              placeholder="Sıfırdan başlanğıc"
              autoFocus
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="İntizam">
              <Select value={form.gameType} onChange={set('gameType')}>
                {GAME_TYPES.map((g) => (
                  <option key={g} value={g}>
                    {GAME_TYPE_LABEL[g]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Səviyyə">
              <Select value={form.level} onChange={set('level')}>
                {COACHING_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABEL[l]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Format">
              <Select value={form.format} onChange={set('format')}>
                {LESSON_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABEL[f]}
                  </option>
                ))}
              </Select>
            </Field>
            {form.format === 'GROUP' && (
              <Field label="Qrupun ölçüsü" hint="Neçə şagird">
                <Input
                  type="number"
                  min={2}
                  max={50}
                  value={form.groupSize}
                  onChange={set('groupSize')}
                  className="tabular-nums"
                  placeholder="6"
                />
              </Field>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Dərs sayı">
              <Input
                type="number"
                min={1}
                max={100}
                value={form.lessonCount}
                onChange={set('lessonCount')}
                className="tabular-nums"
              />
            </Field>
            <Field label="Dərs müddəti" hint="dəqiqə">
              <Input
                type="number"
                min={15}
                max={480}
                step={15}
                value={form.lessonMinutes}
                onChange={set('lessonMinutes')}
                className="tabular-nums"
              />
            </Field>
            <Field label="Qiymət" hint="Bütün paket, ₼">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={set('price')}
                className="tabular-nums"
                placeholder="120"
              />
            </Field>
          </div>

          {venues.length > 0 && (
            <Field label="Dərs yeri" optional>
              <Select value={form.venueId} onChange={set('venueId')}>
                <option value="">Klub seçilməyib</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Təsvir" optional hint="Nə öyrədilir, kimə uyğundur">
            <Textarea rows={3} maxLength={2000} value={form.description} onChange={set('description')} />
          </Field>

          <ErrorText>{formError}</ErrorText>

          <div className="flex gap-2">
            <Button variant="secondary" block onClick={() => setFormOpen(false)} disabled={saving}>
              Ləğv et
            </Button>
            <Button type="submit" block loading={saving}>
              {editing ? 'Yadda saxla' : 'Paketi yarat'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sifarişə cavab — qeyd şagirdin «Kurslarım» səhifəsində görünür */}
      <Modal
        open={!!respondTo}
        onClose={() => setRespondTo(null)}
        title={respondTo?.accept ? 'Sifarişi qəbul et' : 'Sifarişdən imtina'}
        description={respondTo?.order.lessonPackage.title}
      >
        <div className="space-y-4">
          <Alert tone={respondTo?.accept ? 'success' : 'info'}>
            {respondTo?.accept
              ? 'Şagird sifarişin qəbul olunduğunu görəcək. Ödəniş klubda nağd və ya köçürmə ilə alınır — alandan sonra "Ödəniş alındı" düyməsini basın.'
              : 'Şagird imtinanı görəcək və başqa paket seçə biləcək.'}
          </Alert>

          <Field
            label="Şagirdə qeyd"
            optional
            hint={respondTo?.accept ? 'Dərs vaxtı, yer, əlaqə' : 'İmtinanın səbəbi'}
          >
            <Textarea
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                respondTo?.accept
                  ? 'Çərşənbə və cümə 19:00 uyğundur. Legenda klubunda görüşürük.'
                  : 'Bu ay cədvəlim doludur, növbəti ay yazıla bilərsiniz.'
              }
            />
          </Field>

          <div className="flex gap-2">
            <Button variant="secondary" block onClick={() => setRespondTo(null)}>
              Bağla
            </Button>
            <Button
              block
              variant={respondTo?.accept ? 'success' : 'danger'}
              onClick={submitResponse}
            >
              {respondTo?.accept ? 'Qəbul et' : 'İmtina et'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Paket silinmir: mövcud sifarişlərin tarixçəsi qorunsun deyə deaktiv olunur */}
      <ConfirmDialog
        open={!!toDeactivate}
        title="Paketi satışdan çıxaraq?"
        description={
          toDeactivate
            ? `"${toDeactivate.title}" vitrində görünməyəcək. Mövcud sifarişlər saxlanılır, sonra yenidən aktivləşdirə bilərsiniz.`
            : ''
        }
        confirmLabel="Satışdan çıxar"
        onConfirm={async () => {
          if (!toDeactivate) return
          await act(
            toDeactivate.id,
            () => AcademyApi.deactivatePackage(toDeactivate.id),
            'Paket satışdan çıxarıldı',
          )
        }}
        onClose={() => setToDeactivate(null)}
      />
    </div>
  )
}
