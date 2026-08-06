import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Button, Input, ErrorText, Field, Spinner } from './ui'
import { Avatar } from './Avatar'
import { MatchApi, PlayerApi } from '../api'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { PlayerSummary, Player } from '../api/types'

interface Props {
  open: boolean
  onClose: () => void
  onDone?: () => void
  /** Əvvəlcədən seçilmiş rəqib (məs. qəbul edilmiş dəvətdən) */
  opponent?: PlayerSummary | Player
  challengeId?: number
}

export function ReportMatchModal({ open, onClose, onDone, opponent, challengeId }: Props) {
  const { user } = useAuth()
  const [players, setPlayers] = useState<PlayerSummary[]>([])
  const [opponentId, setOpponentId] = useState<number | undefined>(opponent?.id)
  const [myScore, setMyScore] = useState('')
  const [opponentScore, setOpponentScore] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setOpponentId(opponent?.id)
  }, [opponent])

  useEffect(() => {
    if (!open || opponent) return
    PlayerApi.list().then((list) => setPlayers(list.filter((p) => p.id !== user?.id))).catch(() => {})
  }, [open, opponent, user?.id])

  const submit = async () => {
    setError('')
    if (!opponentId) return setError('Rəqib seçin')
    const a = Number(myScore)
    const b = Number(opponentScore)
    if (Number.isNaN(a) || Number.isNaN(b) || a < 0 || b < 0) return setError('Hesabı düzgün daxil edin')
    if (a === b) return setError('Bilyardda heç-heçə olmur — qalib hesab daxil edin')

    setLoading(true)
    try {
      await MatchApi.report({ opponentId, myScore: a, opponentScore: b, challengeId })
      setDone(true)
      onDone?.()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    setMyScore('')
    setOpponentScore('')
    setError('')
    setDone(false)
    if (!opponent) setOpponentId(undefined)
    onClose()
  }

  const selectedName = opponent
    ? opponent.fullName
    : players.find((p) => p.id === opponentId)?.fullName ?? 'Rəqib'

  return (
    <Modal open={open} onClose={close} title="Nəticə daxil et">
      {done ? (
        <div className="space-y-4">
          <p className="rounded-lg bg-felt-100 border border-felt-200 px-3 py-3 text-sm text-felt-800">
            Nəticə qeydə alındı. <b>{selectedName}</b> təsdiqlədikdən sonra reytinqlər yenilənəcək.
          </p>
          <Button variant="secondary" className="w-full" onClick={close}>Bağla</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {opponent ? (
            <div className="flex items-center gap-3 rounded-lg bg-cream border border-wood-200/70 p-3">
              <Avatar name={opponent.fullName} color={opponent.avatarColor} size={40} />
              <div className="text-sm">
                <div className="font-semibold text-ink-900">{opponent.fullName}</div>
                <div className="text-ink-500">@{opponent.username}</div>
              </div>
            </div>
          ) : (
            <Field label="Rəqib">
              <select
                value={opponentId ?? ''}
                onChange={(e) => setOpponentId(Number(e.target.value))}
                className="w-full rounded-lg border border-wood-200 bg-cream px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-felt-600"
              >
                <option value="">Seçin...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (@{p.username}) · {p.rating}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sizin hesab">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={myScore}
                onChange={(e) => setMyScore(e.target.value)}
                placeholder="7"
              />
            </Field>
            <Field label="Rəqibin hesabı">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={opponentScore}
                onChange={(e) => setOpponentScore(e.target.value)}
                placeholder="4"
              />
            </Field>
          </div>

          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={close} disabled={loading}>
              Ləğv et
            </Button>
            <Button className="flex-1" onClick={submit} disabled={loading}>
              {loading ? <Spinner /> : 'Təqdim et'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
