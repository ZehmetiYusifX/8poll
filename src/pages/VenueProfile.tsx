import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { VenueApi, TournamentApi } from '../api'
import { useAuth } from '../context/AuthContext'
import {
  Button, Card, PageLoader, Empty, Field, Input, Textarea, ErrorText, Badge, Spinner,
} from '../components/ui'
import { Modal } from '../components/Modal'
import { extractErrorMessage } from '../api/client'
import { formatDate } from '../utils/format'
import type { Venue, Tournament, TournamentStatus } from '../api/types'

const statusMeta: Record<TournamentStatus, { text: string; tone: 'green' | 'yellow' | 'blue' | 'neutral' }> = {
  REGISTRATION: { text: 'Qeydiyyat açıq', tone: 'green' },
  ONGOING: { text: 'Davam edir', tone: 'yellow' },
  COMPLETED: { text: 'Bitdi', tone: 'blue' },
  CANCELLED: { text: 'Ləğv edildi', tone: 'neutral' },
}

export function VenueProfile() {
  const { id } = useParams()
  const venueId = Number(id)
  const { user } = useAuth()

  const [venue, setVenue] = useState<Venue | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const [v, allT] = await Promise.all([VenueApi.get(venueId), TournamentApi.list()])
      setVenue(v)
      setTournaments(allT.filter((t) => t.venue.id === venueId))
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
    setError('')
    try {
      const updated = await VenueApi.uploadPhoto(venueId, file)
      setVenue(updated)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const onRemovePhoto = async (url: string) => {
    try {
      const updated = await VenueApi.removePhoto(venueId, url)
      setVenue(updated)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (loading) return <PageLoader />
  if (!venue) return <Empty title="Məkan tapılmadı" />

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* Şəkil qalereyası */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="sm:col-span-2 h-64 overflow-hidden rounded-xl bg-wood-100">
          {venue.photoUrls[0] ? (
            <img src={venue.photoUrls[0]} alt={venue.name} className="h-64 w-full object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center text-6xl text-wood-300">🎱</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {venue.photoUrls.slice(1, 3).map((url) => (
            <div key={url} className="group relative h-[124px] overflow-hidden rounded-xl bg-wood-100">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {isOwner && (
                <button
                  onClick={() => onRemovePhoto(url)}
                  className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  Sil
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Başlıq + sahib idarəetməsi */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{venue.name}</h1>
          {venue.address && <div className="mt-1 text-sm text-ink-500">📍 {venue.address}</div>}
          {venue.phone && <div className="text-sm text-ink-500">📞 {venue.phone}</div>}
        </div>
        {isOwner && (
          <div className="flex flex-wrap gap-2">
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={onUpload} />
            <Button variant="secondary" disabled={uploading} onClick={() => fileInput.current?.click()}>
              {uploading ? <Spinner /> : 'Şəkil yüklə'}
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>Redaktə et</Button>
            <Button onClick={() => setCreateOpen(true)}>Turnir aç</Button>
          </div>
        )}
      </div>

      {venue.description && (
        <Card>
          <p className="whitespace-pre-line text-sm text-ink-700">{venue.description}</p>
        </Card>
      )}

      {/* Turnirlər */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Turnirlər</h2>
        {tournaments.length === 0 ? (
          <Empty title="Bu məkanda turnir yoxdur" hint={isOwner ? '“Turnir aç” ilə ilk turniri yaradın.' : undefined} />
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => {
              const st = statusMeta[t.status]
              return (
                <Link key={t.id} to={`/tournaments/${t.id}`}>
                  <Card className="flex items-center justify-between transition hover:shadow-md">
                    <div>
                      <div className="font-semibold text-ink-900">{t.name}</div>
                      <div className="mt-0.5 text-xs text-ink-500">
                        {t.participantCount}/{t.maxParticipants} iştirakçı
                        {t.startAt && ` · ${formatDate(t.startAt)}`}
                      </div>
                    </div>
                    <Badge tone={st.tone}>{st.text}</Badge>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {isOwner && editOpen && (
        <EditVenueModal venue={venue} onClose={() => setEditOpen(false)} onSaved={(v) => { setVenue(v); setEditOpen(false) }} />
      )}
      {isOwner && createOpen && (
        <CreateTournamentModal venueId={venueId} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load() }} />
      )}
    </div>
  )
}

function EditVenueModal({ venue, onClose, onSaved }: { venue: Venue; onClose: () => void; onSaved: (v: Venue) => void }) {
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
    setLoading(true)
    setError('')
    try {
      const updated = await VenueApi.update(venue.id, {
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
      })
      onSaved(updated)
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Məkanı redaktə et">
      <div className="space-y-4">
        <Field label="Ad"><Input value={form.name} onChange={set('name')} /></Field>
        <Field label="Ünvan"><Input value={form.address} onChange={set('address')} /></Field>
        <Field label="Təsvir"><Textarea rows={3} value={form.description} onChange={set('description')} /></Field>
        <Field label="Telefon"><Input value={form.phone} onChange={set('phone')} /></Field>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Ləğv et</Button>
          <Button className="flex-1" onClick={submit} disabled={loading}>{loading ? 'Saxlanılır...' : 'Saxla'}</Button>
        </div>
      </div>
    </Modal>
  )
}

function CreateTournamentModal({ venueId, onClose, onCreated }: { venueId: number; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', startAt: '', maxParticipants: '8' })
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
        description: form.description.trim() || undefined,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
        maxParticipants: Number(form.maxParticipants) || 8,
      })
      onCreated()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Yeni turnir">
      <div className="space-y-4">
        <Field label="Turnir adı">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Yay Kuboku" autoFocus />
        </Field>
        <Field label="Təsvir">
          <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Başlama tarixi">
            <Input type="datetime-local" value={form.startAt} onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))} />
          </Field>
          <Field label="Maks. iştirakçı">
            <Input type="number" min={2} value={form.maxParticipants} onChange={(e) => setForm((f) => ({ ...f, maxParticipants: e.target.value }))} />
          </Field>
        </div>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Ləğv et</Button>
          <Button className="flex-1" onClick={submit} disabled={loading}>{loading ? 'Yaradılır...' : 'Yarat'}</Button>
        </div>
      </div>
    </Modal>
  )
}
