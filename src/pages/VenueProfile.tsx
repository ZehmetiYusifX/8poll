import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { VenueApi, TournamentApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { VenuePhoto } from '../components/VenuePhoto'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { TournamentCard } from '../components/TournamentCard'
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  ErrorText,
  Field,
  Input,
  PageHeader,
  SectionHeader,
  Select,
  Skeleton,
  Textarea,
  cx,
} from '../components/ui'
import {
  IconImage,
  IconMedal,
  IconPencil,
  IconPhone,
  IconPin,
  IconPlus,
  IconTrash,
  IconX,
} from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage, mediaUrl } from '../api/client'
import { DEFAULT_GAME_TYPE, GAME_TYPES, GAME_TYPE_LABEL } from '../constants/gameTypes'
import type { GameType, Venue, Tournament } from '../api/types'

export function VenueProfile() {
  const { id } = useParams()
  const venueId = Number(id)
  const { user } = useAuth()
  const toast = useToast()

  const [venue, setVenue] = useState<Venue | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [photoToRemove, setPhotoToRemove] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const [v, allT] = await Promise.all([VenueApi.get(venueId), TournamentApi.list()])
      setVenue(v)
      setTournaments(allT.filter((t) => t.venue.id === venueId))
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [venueId])

  useEffect(() => {
    load()
  }, [load])

  const isOwner = !!venue && user?.id === venue.owner.id

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      setVenue(await VenueApi.uploadPhoto(venueId, file))
      toast.success('Şəkil yükləndi')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const removePhoto = async (url: string) => {
    try {
      setVenue(await VenueApi.removePhoto(venueId, url))
      toast.success('Şəkil silindi')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  if (loading) return <VenueSkeleton />
  if (!venue) return <Empty title="Məkan tapılmadı" hint={error || 'Bu məkan mövcud deyil.'} />

  const photos = venue.photoUrls
  const active = tournaments.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')

  return (
    <div className="space-y-7">
      {error && <Alert tone="error">{error}</Alert>}

      {/* ── Qalereya ─────────────────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => photos[0] && setLightbox(0)}
          disabled={!photos[0]}
          className="relative h-56 overflow-hidden rounded-xl sm:col-span-2 sm:h-72 disabled:cursor-default"
        >
          <VenuePhoto src={photos[0]} alt={venue.name} />
          {photos.length > 0 && (
            <span className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
          )}
        </button>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {[1, 2].map((i) => {
            const url = photos[i]
            return (
              <div key={i} className="group relative h-28 overflow-hidden rounded-xl sm:h-[8.75rem]">
                {url ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setLightbox(i)}
                      className="block h-full w-full"
                      aria-label={`${venue.name} — şəkil ${i + 1}`}
                    >
                      <VenuePhoto src={url} alt="" />
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setPhotoToRemove(url)}
                        aria-label="Şəkli sil"
                        className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 p-1.5 text-ivory opacity-0 backdrop-blur-sm transition-opacity hover:bg-clay-700 focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </>
                ) : isOwner ? (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                    className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-rail-strong bg-cream text-ink-400 transition-colors hover:border-felt-500/40 hover:bg-felt-500/12 hover:text-felt-300"
                  >
                    <IconImage size={20} />
                    <span className="text-xs font-medium">Şəkil əlavə et</span>
                  </button>
                ) : (
                  <div className="h-full w-full rounded-xl bg-gold-400/12/60" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {photos.length > 3 && (
        <div className="flex flex-wrap gap-2">
          {photos.slice(3).map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setLightbox(i + 3)}
              className="h-16 w-24 overflow-hidden rounded-lg"
            >
              <VenuePhoto src={url} alt="" />
            </button>
          ))}
        </div>
      )}

      {/* ── Başlıq ───────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Bilyard klubu"
        title={venue.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {venue.address && (
              <span className="inline-flex items-center gap-1.5">
                <IconPin size={15} className="text-ink-400" />
                {venue.address}
              </span>
            )}
            {venue.phone && (
              <a
                href={`tel:${venue.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-1.5 text-felt-300 underline-offset-4 hover:underline"
              >
                <IconPhone size={15} />
                {venue.phone}
              </a>
            )}
          </span>
        }
        actions={
          isOwner && (
            <>
              <input ref={fileInput} type="file" accept="image/*" hidden onChange={onUpload} />
              <Button
                variant="secondary"
                icon={<IconImage size={16} />}
                loading={uploading}
                onClick={() => fileInput.current?.click()}
              >
                Şəkil yüklə
              </Button>
              <Button variant="secondary" icon={<IconPencil size={16} />} onClick={() => setEditOpen(true)}>
                Redaktə et
              </Button>
              <Button icon={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
                Turnir aç
              </Button>
            </>
          )
        }
      />

      {venue.description && (
        <Card>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
            {venue.description}
          </p>
        </Card>
      )}

      {/* ── Turnirlər ────────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Turnirlər"
          count={tournaments.length}
          action={
            active.length > 0 && <Badge tone="green">{active.length} aktiv</Badge>
          }
        />
        {tournaments.length === 0 ? (
          <Empty
            icon={<IconMedal size={20} />}
            title="Bu məkanda turnir yoxdur"
            hint={isOwner ? 'İlk turniri açın və oyunçuları toplayın.' : 'Turnir açıldıqda burada görünəcək.'}
            action={
              isOwner ? (
                <Button icon={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
                  Turnir aç
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} hideVenue />
            ))}
          </div>
        )}
      </section>

      {/* ── Dialoqlar ────────────────────────────────────────── */}
      {lightbox != null && photos[lightbox] && (
        <Lightbox
          photos={photos}
          index={lightbox}
          name={venue.name}
          onChange={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}

      <ConfirmDialog
        open={!!photoToRemove}
        title="Şəkli silmək?"
        description="Bu şəkil məkan qalereyasından həmişəlik silinəcək."
        confirmLabel="Sil"
        onConfirm={async () => {
          if (photoToRemove) await removePhoto(photoToRemove)
        }}
        onClose={() => setPhotoToRemove(null)}
      />

      {isOwner && editOpen && (
        <EditVenueModal
          venue={venue}
          onClose={() => setEditOpen(false)}
          onSaved={(v) => {
            setVenue(v)
            setEditOpen(false)
            toast.success('Məkan yeniləndi')
          }}
        />
      )}

      {isOwner && createOpen && (
        <CreateTournamentModal
          venueId={venueId}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false)
            load()
            toast.success('Turnir yaradıldı')
          }}
        />
      )}
    </div>
  )
}

/* ── Şəkil baxışı ───────────────────────────────────────────── */

function Lightbox({
  photos,
  index,
  name,
  onChange,
  onClose,
}: {
  photos: string[]
  index: number
  name: string
  onChange: (i: number) => void
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % photos.length)
      if (e.key === 'ArrowLeft') onChange((index - 1 + photos.length) % photos.length)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [index, photos.length, onChange, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} şəkilləri`}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Bağla"
        className="absolute right-4 top-4 rounded-lg p-2 text-ivory/70 transition-colors hover:bg-white/10 hover:text-ivory"
      >
        <IconX size={22} />
      </button>

      <img
        src={mediaUrl(photos[index])}
        alt={`${name} — ${index + 1}`}
        className="max-h-[80dvh] max-w-full rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <div className="mt-4 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              aria-label={`Şəkil ${i + 1}`}
              className={cx(
                'h-1.5 rounded-full transition-all duration-200',
                i === index ? 'w-6 bg-cream' : 'w-1.5 bg-cream/35 hover:bg-cream/60',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function VenueSkeleton() {
  return (
    <div className="space-y-7">
      <div className="grid gap-2 sm:grid-cols-3">
        <Skeleton className="h-56 rounded-xl sm:col-span-2 sm:h-72" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          <Skeleton className="h-28 rounded-xl sm:h-[8.75rem]" />
          <Skeleton className="h-28 rounded-xl sm:h-[8.75rem]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  )
}

/* ── Məkan redaktəsi ────────────────────────────────────────── */

function EditVenueModal({
  venue,
  onClose,
  onSaved,
}: {
  venue: Venue
  onClose: () => void
  onSaved: (v: Venue) => void
}) {
  const [form, setForm] = useState({
    name: venue.name,
    address: venue.address ?? '',
    description: venue.description ?? '',
    phone: venue.phone ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (form.name.trim().length < 3) return setError('Məkan adı ən azı 3 simvol olmalıdır')
    setLoading(true)
    setError('')
    try {
      onSaved(
        await VenueApi.update(venue.id, {
          name: form.name.trim(),
          address: form.address.trim(),
          description: form.description.trim(),
          phone: form.phone.trim(),
        }),
      )
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Məkanı redaktə et">
      <div className="space-y-4">
        <Field label="Ad">
          <Input value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Ünvan" optional>
          <Input value={form.address} onChange={set('address')} />
        </Field>
        <Field label="Telefon" optional>
          <Input type="tel" value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Təsvir" optional hint="Masaların sayı, iş saatları, xidmətlər">
          <Textarea rows={4} maxLength={1000} value={form.description} onChange={set('description')} />
        </Field>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" block onClick={onClose} disabled={loading}>
            Ləğv et
          </Button>
          <Button block loading={loading} onClick={submit}>
            Yadda saxla
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Turnir yaratma ─────────────────────────────────────────── */

const BRACKET_SIZES = [4, 8, 16, 32]

function CreateTournamentModal({
  venueId,
  onClose,
  onCreated,
}: {
  venueId: number
  onClose: () => void
  onCreated: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    startAt: '',
    maxParticipants: 8,
    gameType: DEFAULT_GAME_TYPE as GameType,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (form.name.trim().length < 2) return setError('Turnir adı daxil edin')
    setLoading(true)
    setError('')
    try {
      await TournamentApi.create({
        name: form.name.trim(),
        venueId,
        gameType: form.gameType,
        description: form.description.trim() || undefined,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
        maxParticipants: form.maxParticipants,
      })
      onCreated()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Yeni turnir" description="Qeydiyyat açıq olacaq — oyunçular özləri qoşulacaq.">
      <div className="space-y-4">
        <Field label="Turnir adı">
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Yay Kuboku"
            autoFocus
          />
        </Field>

        <Field label="Oyun növü" hint="Seed sıralaması bu intizamın reytinqinə görə qurulacaq">
          <Select
            value={form.gameType}
            onChange={(e) => setForm((f) => ({ ...f, gameType: e.target.value as GameType }))}
          >
            {GAME_TYPES.map((t) => (
              <option key={t} value={t}>
                {GAME_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Təsvir" optional>
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Format, mükafat fondu, qaydalar..."
          />
        </Field>

        <Field label="Başlama tarixi" optional>
          <Input
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
          />
        </Field>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
            İştirakçı sayı
          </p>
          <div className="grid grid-cols-4 gap-2">
            {BRACKET_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm((f) => ({ ...f, maxParticipants: n }))}
                aria-pressed={form.maxParticipants === n}
                className={cx(
                  'rounded-lg border py-2 text-sm font-semibold tabular-nums transition-colors',
                  form.maxParticipants === n
                    ? 'border-felt-600 bg-felt-500/12 text-felt-300'
                    : 'border-rail-strong bg-cream text-ink-600 hover:border-gold-400/40',
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            Turniri başlatdıqda cədvəl avtomatik qurulacaq.
          </p>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" block onClick={onClose} disabled={loading}>
            Ləğv et
          </Button>
          <Button block loading={loading} onClick={submit}>
            Yarat
          </Button>
        </div>
      </div>
    </Modal>
  )
}
