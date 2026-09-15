import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PlayerApi } from '../api'
import { Avatar } from '../components/Avatar'
import { Modal } from '../components/Modal'
import { MatchRow } from '../components/MatchRow'
import { Sparkline } from '../components/Sparkline'
import { ChallengeModal } from '../components/ChallengeModal'
import { ReportMatchModal } from '../components/ReportMatchModal'
import {
  Button,
  Card,
  Empty,
  ErrorText,
  Field,
  Input,
  ListSkeleton,
  Segmented,
  SectionHeader,
  Skeleton,
  Textarea,
  cx,
} from '../components/ui'
import { IconPencil, IconPlus, IconSwords, IconTable } from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { AVATAR_COLORS, formatDate } from '../utils/format'
import type { Match, Player } from '../api/types'

type Filter = 'all' | 'wins' | 'losses'

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>()
  const playerId = Number(id)
  const { user, refresh, setUser } = useAuth()

  const [player, setPlayer] = useState<Player | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [challenge, setChallenge] = useState(false)
  const [report, setReport] = useState(false)
  const [edit, setEdit] = useState(false)

  const isMe = user?.id === playerId

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, m] = await Promise.all([PlayerApi.get(playerId), PlayerApi.matches(playerId)])
      setPlayer(p)
      setMatches(m)
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [playerId])

  useEffect(() => {
    if (!Number.isNaN(playerId)) load()
  }, [playerId, load])

  const confirmed = useMemo(() => matches.filter((m) => m.status === 'CONFIRMED'), [matches])

  /** Bu oyunçunun reytinq gedişatı */
  const history = useMemo(() => {
    if (!player) return []
    return confirmed
      .slice()
      .sort((a, b) => Date.parse(a.confirmedAt ?? '') - Date.parse(b.confirmedAt ?? ''))
      .map((m) => (m.reporter.id === player.id ? m.reporterRatingAfter : m.opponentRatingAfter))
      .filter((v): v is number => v != null)
      .slice(-20)
  }, [confirmed, player])

  /** Baxan istifadəçi ilə qarşılıqlı hesab */
  const headToHead = useMemo(() => {
    if (!user || !player || isMe) return null
    const games = confirmed.filter(
      (m) => m.reporter.id === user.id || m.opponent.id === user.id,
    )
    if (games.length === 0) return null
    const mine = games.filter((m) => m.winnerId === user.id).length
    const theirs = games.filter((m) => m.winnerId === player.id).length
    return { mine, theirs, total: games.length }
  }, [confirmed, user, player, isMe])

  const visible = useMemo(() => {
    if (!player) return []
    if (filter === 'wins') return confirmed.filter((m) => m.winnerId === player.id)
    if (filter === 'losses')
      return confirmed.filter((m) => m.winnerId != null && m.winnerId !== player.id)
    return confirmed
  }, [confirmed, filter, player])

  if (loading) return <ProfileSkeleton />
  if (error || !player) {
    return <Empty title="Oyunçu tapılmadı" hint={error || 'Bu profil mövcud deyil və ya silinib.'} />
  }

  return (
    <div className="space-y-7">
      <Card padded={false} className="overflow-hidden">
        <div
          className="flex flex-col gap-5 bg-felt-900 px-5 py-6 text-ivory sm:flex-row sm:items-center sm:justify-between sm:px-6"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 4px)',
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar name={player.fullName} color={player.avatarColor} size={68} ring="gold" />
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-semibold leading-tight">
                {player.fullName}
              </h1>
              <p className="text-sm text-felt-200/80">@{player.username}</p>
              <p className="mt-1 text-xs text-felt-200/60">
                Qoşulub: {formatDate(player.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-end gap-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.1em] text-felt-200/70">Reytinq</div>
              <div className="font-display text-4xl font-bold leading-none tabular-nums text-gold-200">
                {player.rating}
              </div>
            </div>
            {history.length > 1 && <Sparkline values={history} className="hidden sm:block" />}
          </div>
        </div>

        <dl className="grid grid-cols-2 divide-x divide-y divide-rail border-b border-rail bg-card sm:grid-cols-4 sm:divide-y-0">
          <ProfileStat label="Oyun" value={player.gamesPlayed} />
          <ProfileStat label="Qələbə" value={player.wins} tone="win" />
          <ProfileStat label="Məğlubiyyət" value={player.losses} tone="loss" />
          <ProfileStat label="Qazanma faizi" value={`${player.winRate}%`} />
        </dl>

        <div className="flex flex-wrap items-center gap-2 bg-cream px-5 py-3">
          {isMe ? (
            <Button variant="secondary" icon={<IconPencil size={16} />} onClick={() => setEdit(true)}>
              Profili redaktə et
            </Button>
          ) : (
            <>
              <Button icon={<IconSwords size={16} />} onClick={() => setChallenge(true)}>
                Dəvət göndər
              </Button>
              <Button variant="secondary" icon={<IconPlus size={16} />} onClick={() => setReport(true)}>
                Nəticə daxil et
              </Button>
            </>
          )}

          {headToHead && (
            <div className="ml-auto flex items-center gap-2 text-sm text-ink-500">
              <span className="text-xs uppercase tracking-wide text-ink-400">Sizinlə</span>
              <span className="font-display text-base font-semibold tabular-nums">
                <span className="text-felt-300">{headToHead.mine}</span>
                <span className="mx-1 text-ink-300">–</span>
                <span className="text-clay-300">{headToHead.theirs}</span>
              </span>
            </div>
          )}
        </div>
      </Card>

      {player.bio && (
        <Card>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{player.bio}</p>
        </Card>
      )}

      <section>
        <SectionHeader
          title="Maç tarixçəsi"
          count={confirmed.length}
          action={
            confirmed.length > 0 && (
              <Segmented
                value={filter}
                onChange={setFilter}
                label="Maç filtri"
                items={[
                  { value: 'all', label: 'Hamısı' },
                  { value: 'wins', label: 'Qələbə' },
                  { value: 'losses', label: 'Məğlub' },
                ]}
              />
            )
          }
        />

        {visible.length === 0 ? (
          <Empty
            icon={<IconTable size={20} />}
            title={
              confirmed.length === 0
                ? 'Təsdiqlənmiş maç yoxdur'
                : filter === 'wins'
                  ? 'Qələbə yoxdur'
                  : 'Məğlubiyyət yoxdur'
            }
            hint={
              confirmed.length === 0 && !isMe
                ? 'Bu oyunçunu dəvət edin və ilk maçı siz oynayın.'
                : undefined
            }
          />
        ) : (
          <div className="space-y-2.5">
            {visible.map((m) => (
              <MatchRow key={m.id} match={m} viewerId={player.id} />
            ))}
          </div>
        )}
      </section>

      {!isMe && (
        <>
          <ChallengeModal opponent={player} open={challenge} onClose={() => setChallenge(false)} />
          <ReportMatchModal
            open={report}
            opponent={player}
            onClose={() => setReport(false)}
            onDone={() => {
              load()
              refresh()
            }}
          />
        </>
      )}

      {isMe && (
        <EditProfileModal
          player={player}
          open={edit}
          onClose={() => setEdit(false)}
          onSaved={(p) => {
            setPlayer(p)
            setUser(p)
            load()
          }}
        />
      )}
    </div>
  )
}

function ProfileStat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number | string
  tone?: 'default' | 'win' | 'loss'
}) {
  return (
    <div className="px-3 py-4 text-center">
      <dd
        className={cx(
          'font-display text-xl font-semibold tabular-nums',
          tone === 'win' && 'text-felt-300',
          tone === 'loss' && 'text-clay-300',
          tone === 'default' && 'text-ink-900',
        )}
      >
        {value}
      </dd>
      <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.07em] text-ink-400">
        {label}
      </dt>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-7">
      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center gap-4 bg-felt-900 px-6 py-6">
          <Skeleton className="h-[68px] w-[68px] rounded-full opacity-25" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 opacity-25" />
            <Skeleton className="h-4 w-24 opacity-25" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-px bg-rail">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-card px-3 py-5">
              <Skeleton className="mx-auto h-6 w-12" />
            </div>
          ))}
        </div>
      </Card>
      <ListSkeleton rows={4} />
    </div>
  )
}

/* ── Profil redaktəsi ───────────────────────────────────────── */

const BIO_LIMIT = 300

function EditProfileModal({
  player,
  open,
  onClose,
  onSaved,
}: {
  player: Player
  open: boolean
  onClose: () => void
  onSaved: (p: Player) => void
}) {
  const toast = useToast()
  const [fullName, setFullName] = useState(player.fullName)
  const [bio, setBio] = useState(player.bio ?? '')
  const [color, setColor] = useState(player.avatarColor ?? AVATAR_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Modal hər açılışda cari dəyərlərlə başlasın
  useEffect(() => {
    if (!open) return
    setFullName(player.fullName)
    setBio(player.bio ?? '')
    setColor(player.avatarColor ?? AVATAR_COLORS[0])
    setError('')
  }, [open, player])

  const save = async () => {
    if (fullName.trim().length < 2) return setError('Ad ən azı 2 simvol olmalıdır')
    setLoading(true)
    setError('')
    try {
      const updated = await PlayerApi.updateMe({
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatarColor: color,
      })
      onSaved(updated)
      toast.success('Profil yeniləndi')
      onClose()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Profili redaktə et">
      <div className="space-y-4">
        <div className="flex items-center gap-3.5 rounded-lg border border-rail bg-cream p-3">
          <Avatar name={fullName || player.fullName} color={color} size={48} />
          <div className="min-w-0 text-sm">
            <div className="truncate font-semibold text-ink-900">{fullName || player.fullName}</div>
            <div className="text-ink-400">@{player.username}</div>
          </div>
        </div>

        <Field label="Ad Soyad">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
        </Field>

        <Field label="Haqqında" optional hint={`${bio.length}/${BIO_LIMIT} simvol`}>
          <Textarea
            rows={3}
            maxLength={BIO_LIMIT}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Oyun tərziniz, sevimli klubunuz..."
          />
        </Field>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
            Avatar rəngi
          </p>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Rəng ${c}`}
                aria-pressed={color === c}
                className={cx(
                  'h-8 w-8 rounded-full transition-transform duration-150 hover:scale-110',
                  color === c && 'ring-2 ring-gold-400 ring-offset-2 ring-offset-card',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" block onClick={onClose} disabled={loading}>
            Ləğv et
          </Button>
          <Button block onClick={save} loading={loading}>
            Yadda saxla
          </Button>
        </div>
      </div>
    </Modal>
  )
}
