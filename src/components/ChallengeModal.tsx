import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Button, Textarea, ErrorText, Field, Select } from './ui'
import { Avatar } from './Avatar'
import { ChallengeApi, VenueApi } from '../api'
import { extractErrorMessage } from '../api/client'
import type { PlayerSummary, Player, Venue } from '../api/types'

interface Props {
  opponent: PlayerSummary | Player
  open: boolean
  onClose: () => void
  onDone?: () => void
}

export function ChallengeModal({ opponent, open, onClose, onDone }: Props) {
  const [message, setMessage] = useState('')
  const [venueId, setVenueId] = useState('')
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    VenueApi.list().then(setVenues).catch(() => setVenues([]))
  }, [open])

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      await ChallengeApi.create({
        opponentId: opponent.id,
        message: message.trim() || undefined,
        venueId: venueId ? Number(venueId) : undefined,
      })
      setDone(true)
      onDone?.()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    setMessage('')
    setVenueId('')
    setError('')
    setDone(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title="Dəvət göndər">
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-cream border border-wood-200/70 p-3">
        <Avatar name={opponent.fullName} color={opponent.avatarColor} size={44} />
        <div>
          <div className="font-semibold text-ink-900">{opponent.fullName}</div>
          <div className="text-sm text-ink-500">@{opponent.username} · {opponent.rating} xal</div>
        </div>
      </div>

      {done ? (
        <div className="space-y-4">
          <p className="rounded-lg bg-felt-100 border border-felt-200 px-3 py-3 text-sm text-felt-800">
            Dəvət göndərildi! <b>{opponent.username}</b> cavab verdikdə bildiriş alacaqsınız.
          </p>
          <Button variant="secondary" className="w-full" onClick={close}>Bağla</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Məkan (istəyə bağlı)">
            <Select value={venueId} onChange={(e) => setVenueId(e.target.value)}>
              <option value="">Məkan seçilməyib</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.address ? ` — ${v.address}` : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mesaj (istəyə bağlı)">
            <Textarea
              rows={3}
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Sabah axşam bir oyun?"
            />
          </Field>
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={close} disabled={loading}>
              Ləğv et
            </Button>
            <Button className="flex-1" onClick={submit} disabled={loading}>
              {loading ? 'Göndərilir...' : 'Göndər'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
