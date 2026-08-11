import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Alert, Button, ErrorText, Field, Select, cx } from './ui'
import { Avatar } from './Avatar'
import { IconCheck, IconMinus, IconPlus } from './icons'
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
  const [myScore, setMyScore] = useState(0)
  const [theirScore, setTheirScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setOpponentId(opponent?.id)
  }, [opponent])

  useEffect(() => {
    if (!open || opponent) return
    PlayerApi.list()
      .then((list) => setPlayers(list.filter((p) => p.id !== user?.id)))
      .catch(() => {})
  }, [open, opponent, user?.id])

  const selected = opponent ?? players.find((p) => p.id === opponentId)
  const opponentName = selected?.fullName ?? 'Rəqib'

  const submit = async () => {
    setError('')
    if (!opponentId) return setError('Rəqib seçin')
    if (myScore === theirScore) return setError('Bilyardda heç-heçə olmur — qalib hesab daxil edin')

    setLoading(true)
    try {
      await MatchApi.report({ opponentId, myScore, opponentScore: theirScore, challengeId })
      setDone(true)
      onDone?.()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    setMyScore(0)
    setTheirScore(0)
    setError('')
    setDone(false)
    if (!opponent) setOpponentId(undefined)
    onClose()
  }

  const iWon = myScore > theirScore

  return (
    <Modal
      open={open}
      onClose={close}
      title="Nəticə daxil et"
      description={done ? undefined : 'Rəqibiniz təsdiqlədikdən sonra reytinqlər yenilənəcək.'}
    >
      {done ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-felt-200 bg-felt-50 p-5 text-center">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-felt-600 text-cream">
              <IconCheck size={22} />
            </span>
            <p className="font-medium text-felt-800">Nəticə qeydə alındı</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-felt-700/80">
              <b>{opponentName}</b> təsdiqlədikdən sonra hər ikinizin Elo reytinqi yenilənəcək.
            </p>
          </div>
          <Button variant="secondary" block onClick={close}>
            Bağla
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {!opponent && (
            <Field label="Rəqib">
              <Select
                value={opponentId ?? ''}
                onChange={(e) => setOpponentId(Number(e.target.value) || undefined)}
              >
                <option value="">Oyunçu seçin...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (@{p.username}) · {p.rating} xal
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {/* Hesab girişi */}
          <div className="rounded-xl border border-rail bg-cream p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-3">
              <ScoreColumn
                name={user?.fullName ?? 'Siz'}
                sublabel="Siz"
                color={user?.avatarColor}
                value={myScore}
                onChange={setMyScore}
                winning={myScore !== theirScore && iWon}
              />
              <div className="flex h-[46px] items-center font-display text-2xl text-ink-300">:</div>
              <ScoreColumn
                name={selected?.fullName ?? 'Rəqib'}
                sublabel={selected ? `@${selected.username}` : 'seçilməyib'}
                color={selected?.avatarColor}
                value={theirScore}
                onChange={setTheirScore}
                winning={myScore !== theirScore && !iWon}
              />
            </div>

            {myScore !== theirScore && selected && (
              <p className="mt-3.5 border-t border-rail pt-3 text-center text-sm text-ink-500">
                Qalib:{' '}
                <b className="font-semibold text-felt-700">
                  {iWon ? user?.fullName : selected.fullName}
                </b>
              </p>
            )}
          </div>

          {myScore === theirScore && myScore > 0 && (
            <Alert tone="info">Bilyardda heç-heçə olmur — qalibin hesabını daxil edin.</Alert>
          )}

          <ErrorText>{error}</ErrorText>

          <div className="flex gap-2">
            <Button variant="secondary" block onClick={close} disabled={loading}>
              Ləğv et
            </Button>
            <Button
              block
              loading={loading}
              disabled={!opponentId || myScore === theirScore}
              onClick={submit}
            >
              Təqdim et
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

const MAX_SCORE = 99

/** Bir tərəfin hesabı — böyük rəqəm və + / − düymələri */
function ScoreColumn({
  name,
  sublabel,
  color,
  value,
  onChange,
  winning,
}: {
  name: string
  sublabel: string
  color?: string | null
  value: number
  onChange: (v: number) => void
  winning: boolean
}) {
  const clamp = (v: number) => Math.min(MAX_SCORE, Math.max(0, v))

  return (
    <div className="min-w-0 text-center">
      <div className="mb-2 flex flex-col items-center gap-1.5">
        <Avatar name={name} color={color} size={36} ring={winning ? 'brass' : 'none'} />
        <div className="min-w-0 max-w-full">
          <div className="truncate text-xs font-semibold text-ink-800">{name}</div>
          <div className="truncate text-[11px] text-ink-400">{sublabel}</div>
        </div>
      </div>

      <div
        className={cx(
          'flex items-center justify-between gap-1 rounded-lg border bg-card p-1 transition-colors',
          winning ? 'border-felt-300' : 'border-rail-strong',
        )}
      >
        <StepButton label="Azalt" onClick={() => onChange(clamp(value - 1))} disabled={value === 0}>
          <IconMinus size={14} />
        </StepButton>

        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_SCORE}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
          onFocus={(e) => e.target.select()}
          aria-label={`${name} hesabı`}
          className={cx(
            'w-full min-w-0 border-0 bg-transparent text-center font-display text-2xl font-semibold tabular-nums outline-none',
            winning ? 'text-felt-700' : 'text-ink-800',
          )}
        />

        <StepButton
          label="Artır"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= MAX_SCORE}
        >
          <IconPlus size={13} />
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-wood-100 hover:text-ink-900 disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
