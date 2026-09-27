import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from './Modal'
import { Alert, Button, Empty, ErrorText, Field, ListSkeleton, Select, cx } from './ui'
import { Avatar } from './Avatar'
import { IconCheck, IconMinus, IconPlus, IconSwords } from './icons'
import { ChallengeApi, MatchApi } from '../api'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { GAME_TYPE_LABEL } from '../constants/gameTypes'
import { timeAgo } from '../utils/format'
import { useLanguage } from '../context/LanguageContext'
import { appCopy } from '../i18n/app'
import type { Challenge, PlayerSummary } from '../api/types'

interface Props {
  open: boolean
  onClose: () => void
  onDone?: () => void
  /**
   * Konkret dəvət üzrə nəticə (Dəvətlər səhifəsi) — seçim addımı atlanır.
   * Verilmədikdə modal qəbul edilmiş dəvətlərin siyahısını özü yükləyir.
   */
  challenge?: Challenge
  /** Yalnız bu rəqiblə olan dəvətləri göstər (oyunçu profili) */
  opponentId?: number
}

/** Dəvətdə qarşı tərəf — cari istifadəçi hansı tərəfdədirsə, digəri */
function otherSide(c: Challenge): PlayerSummary {
  return c.direction === 'INCOMING' ? c.challenger : c.opponent
}

export function ReportMatchModal({ open, onClose, onDone, challenge, opponentId }: Props) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const copy = appCopy[language].reportMatchModal

  const [options, setOptions] = useState<Challenge[] | null>(null)
  const [pickedId, setPickedId] = useState<number | undefined>(challenge?.id)
  const [myScore, setMyScore] = useState(0)
  const [theirScore, setTheirScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Hazır dəvətlər — yalnız seçim lazım olduqda çəkilir
  useEffect(() => {
    if (!open || challenge) return
    setOptions(null)
    ChallengeApi.playable()
      .then((list) => {
        const relevant = opponentId
          ? list.filter((c) => otherSide(c).id === opponentId)
          : list
        setOptions(relevant)
        // Yeganə variant varsa əldə seçməyə ehtiyac yoxdur
        setPickedId(relevant.length === 1 ? relevant[0].id : undefined)
      })
      .catch((e) => {
        setOptions([])
        setError(extractErrorMessage(e))
      })
  }, [open, challenge, opponentId])

  useEffect(() => {
    if (open && challenge) setPickedId(challenge.id)
  }, [open, challenge])

  const picked = useMemo(
    () => challenge ?? options?.find((c) => c.id === pickedId),
    [challenge, options, pickedId],
  )
  const selected = picked ? otherSide(picked) : undefined
  const opponentName = selected?.fullName ?? copy.opponentFallback
  const gameType = picked?.gameType

  const submit = async () => {
    setError('')
    if (!picked || !selected) return setError(copy.selectChallenge)
    if (myScore === theirScore) return setError(copy.draw)

    setLoading(true)
    try {
      await MatchApi.report({
        opponentId: selected.id,
        gameType: picked.gameType,
        myScore,
        opponentScore: theirScore,
        challengeId: picked.id,
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
    setMyScore(0)
    setTheirScore(0)
    setError('')
    setDone(false)
    if (!challenge) setPickedId(undefined)
    onClose()
  }

  const iWon = myScore > theirScore
  const needsPick = !challenge
  const noOptions = needsPick && options !== null && options.length === 0

  return (
    <Modal
      open={open}
      onClose={close}
      title={copy.title}
      description={done ? undefined : copy.description}
    >
      {done ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-felt-500/30 bg-felt-500/12 p-5 text-center">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-felt-600 text-ivory">
              <IconCheck size={22} />
            </span>
            <p className="font-medium text-felt-300">{copy.recordedTitle}</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-felt-300/80">
              {copy.recordedHint(opponentName, gameType ? GAME_TYPE_LABEL[language][gameType] : '')}
            </p>
          </div>
          <Button variant="secondary" block onClick={close}>
            {copy.close}
          </Button>
        </div>
      ) : needsPick && options === null ? (
        <ListSkeleton rows={3} />
      ) : noOptions ? (
        <div className="space-y-4">
          <Empty
            icon={<IconSwords size={20} />}
            title={copy.emptyTitle}
            hint={opponentId ? copy.emptyHintOpponent : copy.emptyHintGeneral}
            action={
              <Link to="/challenges" onClick={close}>
                <Button variant="secondary" icon={<IconSwords size={16} />}>
                  {copy.viewChallenges}
                </Button>
              </Link>
            }
          />
          <ErrorText>{error}</ErrorText>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Rəqib də, intizam da dəvətdən gəlir — ayrıca seçilmir */}
          {needsPick && (
            <Field label={copy.gameLabel} hint={copy.gameHint}>
              <Select
                value={pickedId ?? ''}
                onChange={(e) => setPickedId(Number(e.target.value) || undefined)}
              >
                <option value="">{copy.chooseChallenge}</option>
                {options?.map((c) => {
                  const o = otherSide(c)
                  return (
                    <option key={c.id} value={c.id}>
                      {o.fullName} · {GAME_TYPE_LABEL[language][c.gameType]} · {timeAgo(c.createdAt)}
                    </option>
                  )
                })}
              </Select>
            </Field>
          )}

          {picked && (
            <dl className="divide-y divide-rail border-y border-rail text-sm">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-ink-500">{copy.gameTypeLabel}</dt>
                <dd className="font-medium text-ink-800">{GAME_TYPE_LABEL[language][picked.gameType]}</dd>
              </div>
              {picked.venue && (
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-ink-500">{copy.venueLabel}</dt>
                  <dd className="truncate font-medium text-ink-800">{picked.venue.name}</dd>
                </div>
              )}
            </dl>
          )}

          {/* Hesab girişi */}
          <div className="rounded-xl border border-rail bg-cream p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-3">
              <ScoreColumn
                name={user?.fullName ?? copy.you}
                sublabel={copy.you}
                color={user?.avatarColor}
                avatarUrl={user?.avatarUrl}
                value={myScore}
                onChange={setMyScore}
                winning={myScore !== theirScore && iWon}
                decreaseLabel={copy.decrease}
                increaseLabel={copy.increase}
                scoreLabel={copy.scoreLabel}
              />
              <div className="flex h-[46px] items-center font-display text-2xl text-ink-300">:</div>
              <ScoreColumn
                name={selected?.fullName ?? copy.opponentFallback}
                sublabel={selected ? `@${selected.username}` : copy.opponentUnselected}
                color={selected?.avatarColor}
                avatarUrl={selected?.avatarUrl}
                value={theirScore}
                onChange={setTheirScore}
                winning={myScore !== theirScore && !iWon}
                decreaseLabel={copy.decrease}
                increaseLabel={copy.increase}
                scoreLabel={copy.scoreLabel}
              />
            </div>

            {myScore !== theirScore && selected && (
              <p className="mt-3.5 border-t border-rail pt-3 text-center text-sm text-ink-500">
                {copy.winner}:{' '}
                <b className="font-semibold text-felt-300">
                  {iWon ? user?.fullName : selected.fullName}
                </b>
              </p>
            )}
          </div>

          {myScore === theirScore && myScore > 0 && (
            <Alert tone="info">{copy.drawAlert}</Alert>
          )}

          <ErrorText>{error}</ErrorText>

          <div className="flex gap-2">
            <Button variant="secondary" block onClick={close} disabled={loading}>
              {copy.cancel}
            </Button>
            <Button
              block
              loading={loading}
              disabled={!picked || myScore === theirScore}
              onClick={submit}
            >
              {copy.submit}
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
  avatarUrl,
  value,
  onChange,
  winning,
  decreaseLabel,
  increaseLabel,
  scoreLabel,
}: {
  name: string
  sublabel: string
  color?: string | null
  avatarUrl?: string | null
  value: number
  onChange: (v: number) => void
  winning: boolean
  decreaseLabel: string
  increaseLabel: string
  scoreLabel: (name: string) => string
}) {
  const clamp = (v: number) => Math.min(MAX_SCORE, Math.max(0, v))

  return (
    <div className="min-w-0 text-center">
      <div className="mb-2 flex flex-col items-center gap-1.5">
        <Avatar name={name} color={color} src={avatarUrl} size={36} ring={winning ? 'gold' : 'none'} />
        <div className="min-w-0 max-w-full">
          <div className="truncate text-xs font-semibold text-ink-800">{name}</div>
          <div className="truncate text-[11px] text-ink-400">{sublabel}</div>
        </div>
      </div>

      <div
        className={cx(
          'flex items-center justify-between gap-1 rounded-lg border bg-card p-1 transition-colors',
          winning ? 'border-felt-500/40' : 'border-rail-strong',
        )}
      >
        <StepButton label={decreaseLabel} onClick={() => onChange(clamp(value - 1))} disabled={value === 0}>
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
          aria-label={scoreLabel(name)}
          className={cx(
            'w-full min-w-0 border-0 bg-transparent text-center font-display text-2xl font-semibold tabular-nums outline-none',
            winning ? 'text-felt-300' : 'text-ink-800',
          )}
        />

        <StepButton
          label={increaseLabel}
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
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-gold-400/12 hover:text-ink-900 disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
