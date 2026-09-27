import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Button, ErrorText, Field, Select, Textarea } from './ui'
import { Avatar } from './Avatar'
import { IconCheck, IconSwords } from './icons'
import { ChallengeApi, VenueApi } from '../api'
import { extractErrorMessage } from '../api/client'
import { DEFAULT_GAME_TYPE, GAME_TYPES, GAME_TYPE_LABEL } from '../constants/gameTypes'
import { useLanguage } from '../context/LanguageContext'
import { appCopy } from '../i18n/app'
import type { GameType, PlayerSummary, Player, Venue } from '../api/types'

interface Props {
  opponent: PlayerSummary | Player
  open: boolean
  onClose: () => void
  onDone?: () => void
  /** Əvvəlcədən seçilmiş intizam (məs. profildə baxılan intizam) */
  defaultGameType?: GameType
}

const MESSAGE_LIMIT = 300

export function ChallengeModal({ opponent, open, onClose, onDone, defaultGameType }: Props) {
  const { language } = useLanguage()
  const copy = appCopy[language].challengeModal
  const [message, setMessage] = useState('')
  const [venueId, setVenueId] = useState('')
  const [gameType, setGameType] = useState<GameType>(defaultGameType ?? DEFAULT_GAME_TYPE)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    setGameType(defaultGameType ?? DEFAULT_GAME_TYPE)
    VenueApi.list().then(setVenues).catch(() => setVenues([]))
  }, [open, defaultGameType])

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      await ChallengeApi.create({
        opponentId: opponent.id,
        gameType,
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
    <Modal open={open} onClose={close} title={copy.title}>
      <div className="mb-5 flex items-center gap-3.5 rounded-xl border border-rail bg-cream p-3.5">
        <Avatar name={opponent.fullName} color={opponent.avatarColor} src={opponent.avatarUrl} size={46} />
        <div className="min-w-0">
          <div className="truncate font-semibold text-ink-900">{opponent.fullName}</div>
          <div className="truncate text-sm text-ink-500">
            @{opponent.username} · <span className="tabular-nums">{opponent.rating} {copy.points}</span>
          </div>
        </div>
      </div>

      {done ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-felt-500/30 bg-felt-500/12 p-5 text-center">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-felt-600 text-ivory">
              <IconCheck size={22} />
            </span>
            <p className="font-medium text-felt-300">{copy.sentTitle}</p>
            <p className="mt-1 text-sm text-felt-300/80">{copy.sentHint(opponent.username)}</p>
          </div>
          <Button variant="secondary" block onClick={close}>
            {copy.close}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label={copy.gameTypeLabel} hint={copy.gameTypeHint}>
            <Select value={gameType} onChange={(e) => setGameType(e.target.value as GameType)}>
              {GAME_TYPES.map((t) => (
                <option key={t} value={t}>
                  {GAME_TYPE_LABEL[language][t]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={copy.venueLabel} optional hint={copy.venueHint}>
            <Select value={venueId} onChange={(e) => setVenueId(e.target.value)}>
              <option value="">{copy.venueUnselected}</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.address ? ` — ${v.address}` : ''}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={copy.messageLabel} optional hint={copy.messageHint(message.length, MESSAGE_LIMIT)}>
            <Textarea
              rows={3}
              maxLength={MESSAGE_LIMIT}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={copy.messagePlaceholder}
            />
          </Field>

          <div className="flex flex-wrap gap-1.5">
            {copy.quickMessages.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMessage(m)}
                className="rounded-full border border-rail-strong bg-cream px-2.5 py-1 text-xs text-ink-600 transition-colors hover:border-felt-500/40 hover:bg-felt-500/12 hover:text-felt-300"
              >
                {m}
              </button>
            ))}
          </div>

          <ErrorText>{error}</ErrorText>

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" block onClick={close} disabled={loading}>
              {copy.cancel}
            </Button>
            <Button block loading={loading} icon={<IconSwords size={16} />} onClick={submit}>
              {copy.send}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
