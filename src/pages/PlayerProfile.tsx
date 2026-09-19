import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
  buttonClass,
  cx,
} from '../components/ui'
import { IconPencil, IconPlus, IconSwords, IconTable } from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { AVATAR_COLORS, formatDate } from '../utils/format'
import { TierBadge } from '../components/TierBadge'
import { DEFAULT_GAME_TYPE, GAME_TYPES, GAME_TYPE_LABEL } from '../constants/gameTypes'
import type { GameType, Match, Player } from '../api/types'

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
  /** Maç tarixçəsi və reytinq qrafiki bu intizama görə süzülür */
  const [discipline, setDiscipline] = useState<GameType>(DEFAULT_GAME_TYPE)
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

  // Ən çox oynanılan intizamı başlanğıc seçim kimi götür — profilə girən
  // adam ilk olaraq oyunçunun əsas intizamını görsün.
  useEffect(() => {
    if (!player || player.ratings.length === 0) return
    const main = player.ratings.reduce((a, b) => (b.gamesPlayed > a.gamesPlayed ? b : a))
    if (main.gamesPlayed > 0) setDiscipline(main.gameType)
  }, [player])

  const confirmed = useMemo(
    () => matches.filter((m) => m.status === 'CONFIRMED' && m.gameType === discipline),
    [matches, discipline],
  )

  /**
   * Seçilmiş intizam üzrə reytinq gedişatı. İntizamlar arası qarışıq əyri
   * mənasız olardı — hər intizamın öz Elo hovuzu var.
   */
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
            <Avatar name={player.fullName} color={player.avatarColor} src={player.avatarUrl} size={68} ring="gold" />
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
              <div className="text-[11px] uppercase tracking-[0.1em] text-felt-200/70">
                Ən yaxşı reytinq
              </div>
              <div className="font-display text-4xl font-bold leading-none tabular-nums text-gold-200">
                {player.rating}
              </div>
            </div>
            {history.length > 1 && <Sparkline values={history} className="hidden sm:block" />}
          </div>
        </div>

        {/* İntizamlar üzrə bölgü — profilin əsas cədvəli.
            Hər intizamın öz reytinqi, statistikası və liqası var. */}
        <div className="border-b border-rail bg-card">
          <div className="hidden items-center gap-4 border-b border-rail bg-cream px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 sm:flex">
            <span className="flex-1">İntizam</span>
            <span className="w-24">Liqa</span>
            <span className="w-24 text-center">Q / M</span>
            <span className="w-14 text-center">Oyun</span>
            <span className="w-12 text-center">%</span>
            <span className="w-20 text-right">Reytinq</span>
          </div>
          <ul className="divide-y divide-rail">
            {GAME_TYPES.map((type) => {
              const r = player.ratings.find((x) => x.gameType === type)
              const active = type === discipline
              return (
                <li key={type}>
                  <button
                    type="button"
                    onClick={() => setDiscipline(type)}
                    aria-pressed={active}
                    className={cx(
                      'flex w-full items-center gap-4 px-5 py-3 text-left transition-colors',
                      active ? 'bg-felt-500/10' : 'hover:bg-cream',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={cx(
                          'block truncate text-sm',
                          active ? 'font-semibold text-ink-900' : 'text-ink-700',
                        )}
                      >
                        {GAME_TYPE_LABEL[type]}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-ink-400 sm:hidden">
                        <TierBadge tier={r?.tier} />
                        <span>
                          {r ? `${r.wins}Q / ${r.losses}M · ${r.gamesPlayed} oyun` : 'Oyun yoxdur'}
                        </span>
                      </span>
                    </span>

                    <span className="hidden w-24 sm:block">
                      <TierBadge tier={r?.tier} />
                    </span>

                    <span className="hidden w-24 items-center justify-center gap-1.5 text-sm tabular-nums sm:flex">
                      <span className="font-semibold text-felt-300">{r?.wins ?? 0}</span>
                      <span className="text-ink-300">/</span>
                      <span className="font-semibold text-clay-300">{r?.losses ?? 0}</span>
                    </span>

                    <span className="hidden w-14 text-center text-sm tabular-nums text-ink-500 sm:block">
                      {r?.gamesPlayed ?? 0}
                    </span>

                    <span className="hidden w-12 text-center text-sm tabular-nums text-ink-500 sm:block">
                      {r?.winRate ?? 0}%
                    </span>

                    <span className="w-20 text-right font-display text-lg font-semibold tabular-nums text-ink-900">
                      {r?.rating ?? '—'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-cream px-5 py-3">
          {!user ? (
            // Qonaq profilə baxa bilir, amma dəvət/nəticə üçün hesab lazımdır
            <>
              <Link
                to="/login"
                state={{ from: `/players/${playerId}` }}
                className={buttonClass('primary', 'md')}
              >
                <IconSwords size={16} />
                Dəvət göndərmək üçün daxil olun
              </Link>
              <Link to="/register" className={buttonClass('ghost', 'md')}>
                Qeydiyyat
              </Link>
            </>
          ) : isMe ? (
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
          title={`Maç tarixçəsi — ${GAME_TYPE_LABEL[discipline]}`}
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
                ? `${GAME_TYPE_LABEL[discipline]} üzrə təsdiqlənmiş maç yoxdur`
                : filter === 'wins'
                  ? 'Qələbə yoxdur'
                  : 'Məğlubiyyət yoxdur'
            }
            hint={
              confirmed.length === 0
                ? isMe
                  ? 'Yuxarıdakı cədvəldən başqa intizam seçin və ya bu intizamda ilk maçınızı oynayın.'
                  : 'Bu oyunçunu bu intizamda dəvət edin və ilk maçı siz oynayın.'
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
          <ChallengeModal
            opponent={player}
            open={challenge}
            defaultGameType={discipline}
            onClose={() => setChallenge(false)}
          />
          <ReportMatchModal
            open={report}
            opponent={player}
            defaultGameType={discipline}
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
  const [avatarUrl, setAvatarUrl] = useState(player.avatarUrl)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Modal hər açılışda cari dəyərlərlə başlasın
  useEffect(() => {
    if (!open) return
    setFullName(player.fullName)
    setBio(player.bio ?? '')
    setColor(player.avatarColor ?? AVATAR_COLORS[0])
    setAvatarUrl(player.avatarUrl)
    setError('')
  }, [open, player])

  /*
   * Şəkil ayrıca endpoint-ə gedir və dərhal yadda saxlanılır — "Yadda saxla"
   * düyməsini gözləmir. Multipart sorğunu mətn sahələri ilə eyni tranzaksiyaya
   * salmaq lazımsız mürəkkəblik yaradardı.
   */
  const pickPhoto = async (file: File | undefined) => {
    if (!file) return
    setPhotoBusy(true)
    setError('')
    try {
      const updated = await PlayerApi.uploadAvatar(file)
      setAvatarUrl(updated.avatarUrl)
      onSaved(updated)
      toast.success('Profil şəkli yeniləndi')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setPhotoBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removePhoto = async () => {
    setPhotoBusy(true)
    setError('')
    try {
      const updated = await PlayerApi.removeAvatar()
      setAvatarUrl(null)
      onSaved(updated)
      toast.success('Profil şəkli silindi')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setPhotoBusy(false)
    }
  }

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
          <Avatar name={fullName || player.fullName} color={color} src={avatarUrl} size={48} />
          <div className="min-w-0 flex-1 text-sm">
            <div className="truncate font-semibold text-ink-900">{fullName || player.fullName}</div>
            <div className="text-ink-400">@{player.username}</div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => pickPhoto(e.target.files?.[0])}
          />
          <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              className="font-semibold text-felt-300 transition-colors hover:text-felt-200 disabled:opacity-50"
            >
              {photoBusy ? 'Gözləyin…' : avatarUrl ? 'Şəkli dəyiş' : 'Şəkil yüklə'}
            </button>
            {avatarUrl && !photoBusy && (
              <button
                type="button"
                onClick={removePhoto}
                className="text-ink-400 transition-colors hover:text-clay-300"
              >
                Sil
              </button>
            )}
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
            {avatarUrl && (
              <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-400">
                — şəkil silinsə istifadə olunacaq
              </span>
            )}
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
