import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GalleryApi, TournamentApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { Lightbox } from '../components/Lightbox'
import { Modal } from '../components/Modal'
import { statusMeta } from '../components/TournamentCard'
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
  Skeleton,
  buttonClass,
  cx,
} from '../components/ui'
import {
  IconCalendar,
  IconCheck,
  IconPin,
  IconTrophy,
  IconUsers,
} from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage, mediaUrl } from '../api/client'
import { formatDateTime } from '../utils/format'
import { GAME_TYPE_LABEL } from '../constants/gameTypes'
import type { TournamentDetail as TDetail, BracketMatch, GalleryImage } from '../api/types'

export function TournamentDetail() {
  const { id } = useParams()
  const tid = Number(id)
  const { user } = useAuth()
  const toast = useToast()

  const [data, setData] = useState<TDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reportMatch, setReportMatch] = useState<BracketMatch | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await TournamentApi.get(tid))
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [tid])

  useEffect(() => {
    load()
  }, [load])

  const t = data?.tournament
  const isOwner = !!t && user?.id === t.owner.id
  const isParticipant = !!data && !!user && data.participants.some((p) => p.id === user.id)

  const act = async (fn: () => Promise<unknown>, message: string) => {
    setBusy(true)
    try {
      await fn()
      toast.success(message)
      await load()
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const totalRounds = useMemo(
    () => (data ? data.bracket.reduce((m, b) => Math.max(m, b.round), 0) : 0),
    [data],
  )

  const rounds = useMemo(() => {
    if (!data) return []
    return Array.from({ length: totalRounds }, (_, i) =>
      data.bracket.filter((b) => b.round === i + 1).sort((a, b) => a.position - b.position),
    )
  }, [data, totalRounds])

  const roundName = (r: number) => {
    if (r === totalRounds) return 'Final'
    if (r === totalRounds - 1) return 'Yarımfinal'
    if (r === totalRounds - 2) return 'Çərəkfinal'
    return `${r}. raund`
  }

  if (loading) return <DetailSkeleton />
  if (!t || !data) return <Empty title="Turnir tapılmadı" hint={error || 'Bu turnir mövcud deyil.'} />

  const st = statusMeta[t.status]
  const fillPct = Math.min(100, Math.round((data.participants.length / t.maxParticipants) * 100))
  const canStart = data.participants.length >= 2

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to={`/venues/${t.venue.id}`} className="inline-flex items-center gap-1 hover:underline">
            <IconPin size={12} />
            {t.venue.name}
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            {t.name}
            <Badge tone={st.tone}>{st.text}</Badge>
            {/* Seed sıralaması bu intizamın reytinqinə görə qurulub */}
            <Badge tone="neutral">{GAME_TYPE_LABEL[t.gameType]}</Badge>
          </span>
        }
        subtitle={
          t.startAt ? (
            <span className="inline-flex items-center gap-1.5">
              <IconCalendar size={15} className="text-ink-400" />
              {formatDateTime(t.startAt)}
            </span>
          ) : undefined
        }
        actions={
          <>
            {/* Qonaq turniri görə bilir, qoşulmaq üçün hesab lazımdır */}
            {t.status === 'REGISTRATION' && !user && (
              <Link
                to="/login"
                state={{ from: `/tournaments/${tid}` }}
                className={buttonClass('primary', 'md')}
              >
                <IconUsers size={16} />
                Qoşulmaq üçün daxil olun
              </Link>
            )}
            {t.status === 'REGISTRATION' && !!user && !isOwner && (
              isParticipant ? (
                <Button
                  variant="secondary"
                  loading={busy}
                  onClick={() => act(() => TournamentApi.leave(tid), 'Turnirdən ayrıldınız')}
                >
                  Ayrıl
                </Button>
              ) : (
                <Button
                  loading={busy}
                  icon={<IconUsers size={16} />}
                  onClick={() => act(() => TournamentApi.join(tid), 'Turnirə qoşuldunuz')}
                >
                  Qoşul
                </Button>
              )
            )}
            {t.status === 'REGISTRATION' && isOwner && (
              <Button
                loading={busy}
                disabled={!canStart}
                title={canStart ? undefined : 'Ən azı 2 iştirakçı lazımdır'}
                onClick={() => act(() => TournamentApi.start(tid), 'Turnir başladı')}
              >
                Turniri başlat
              </Button>
            )}
          </>
        }
      />

      {t.description && (
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-ink-600">{t.description}</p>
      )}

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {t.status === 'COMPLETED' && t.winner && (
        <Card className="surface-gold mb-6 flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400 text-felt-950">
            <IconTrophy size={24} />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-300">
              Turnir qalibi
            </div>
            <Link
              to={`/players/${t.winner.id}`}
              className="font-display text-xl font-semibold text-ink-950 hover:text-felt-300"
            >
              {t.winner.fullName}
            </Link>
          </div>
        </Card>
      )}

      {t.status === 'REGISTRATION' ? (
        <section>
          <SectionHeader title="İştirakçılar" />

          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-ink-500">
              <span>Qeydiyyat</span>
              <span className="font-semibold tabular-nums text-ink-700">
                {data.participants.length}
                <span className="font-normal text-ink-400">/{t.maxParticipants}</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-rail">
              <div
                className="h-full rounded-full bg-felt-500 transition-[width] duration-500"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {data.participants.length === 0 ? (
            <Empty
              icon={<IconUsers size={20} />}
              title="Hələ iştirakçı yoxdur"
              hint="İlk qoşulan siz olun — cədvəldəki yerinizi tutun."
            />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {[...data.participants]
                .sort((a, b) => b.rating - a.rating)
                .map((p, i) => (
                  <li key={p.id}>
                    <Link
                      to={`/players/${p.id}`}
                      className={cx(
                        'flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs transition-colors',
                        p.id === user?.id
                          ? 'border-felt-500/40 bg-felt-500/12'
                          : 'border-rail hover:border-rail-strong',
                      )}
                    >
                      <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-ink-400">
                        {i + 1}
                      </span>
                      <Avatar name={p.fullName} color={p.avatarColor} src={p.avatarUrl} size={38} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-900">
                          {p.fullName}
                        </span>
                        <span className="block truncate text-xs text-ink-400">@{p.username}</span>
                      </span>
                      <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-felt-300">
                        {p.rating}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </section>
      ) : (
        <section>
          <SectionHeader title="Turnir cədvəli" />
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
            {rounds.map((matches, i) => (
              <div
                key={i}
                className={cx(
                  'flex min-w-[15rem] flex-1 flex-col',
                  i < rounds.length - 1 && 'border-r border-dashed border-rail pr-4',
                )}
              >
                <div className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-300">
                  {roundName(i + 1)}
                </div>
                <div className="flex flex-1 flex-col justify-around gap-3">
                  {matches.map((m) => (
                    <BracketCard
                      key={m.id}
                      match={m}
                      viewerId={user?.id}
                      canReport={isOwner && t.status === 'ONGOING' && m.status === 'READY'}
                      onReport={() => setReportMatch(m)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <TournamentPhotos tournamentId={tid} />

      {reportMatch && (
        <ReportBracketModal
          tid={tid}
          match={reportMatch}
          onClose={() => setReportMatch(null)}
          onDone={(updated) => {
            setData(updated)
            setReportMatch(null)
            toast.success('Nəticə qeydə alındı')
          }}
        />
      )}
    </div>
  )
}

/* ── Turnir şəkilləri ───────────────────────────────────────── */

/**
 * Turnirin qalereya albomu. Şəkil yoxdursa heç nə göstərmir —
 * əksər turnirlərin şəkli olmayacaq, boş bölmə səhifəni uzadardı.
 */
function TournamentPhotos({ tournamentId }: { tournamentId: number }) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    GalleryApi.byTournament(tournamentId)
      .then((data) => active && setImages(data))
      .catch(() => {
        /* şəkillər əlavə məzmundur — xəta səhifəni pozmasın */
      })
    return () => {
      active = false
    }
  }, [tournamentId])

  if (images.length === 0) return null

  return (
    <section>
      <SectionHeader
        title="Şəkillər"
        count={images.length}
        action={
          <Link
            to="/gallery"
            className="text-sm font-medium text-felt-300 transition-colors hover:text-felt-200"
          >
            Qalereya
          </Link>
        }
      />

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-rail bg-felt-900 transition-colors hover:border-gold-400/50"
          >
            <img
              src={mediaUrl(image.url)}
              alt={image.title ?? ''}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      <Lightbox
        images={images}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
      />
    </section>
  )
}

/* ── Cədvəl kartı ───────────────────────────────────────────── */

function BracketCard({
  match,
  viewerId,
  canReport,
  onReport,
}: {
  match: BracketMatch
  viewerId?: number
  canReport: boolean
  onReport: () => void
}) {
  const decided = match.winnerId != null
  const isBye =
    match.round === 1 && (!match.player1 || !match.player2) && (match.player1 || match.player2) != null

  const row = (player: BracketMatch['player1'], score: number | null) => {
    const isWinner = decided && player?.id === match.winnerId
    const isMe = player?.id != null && player.id === viewerId

    return (
      <div
        className={cx(
          'flex items-center gap-2 px-3 py-2',
          isWinner && 'bg-felt-500/12',
          !player && 'text-ink-300',
        )}
      >
        {player ? (
          <>
            <Avatar name={player.fullName} color={player.avatarColor} src={player.avatarUrl} size={22} />
            <span
              className={cx(
                'min-w-0 flex-1 truncate text-sm',
                isWinner ? 'font-semibold text-ink-900' : 'text-ink-600',
              )}
            >
              {player.fullName}
              {isMe && <span className="ml-1 text-[10px] font-bold uppercase text-felt-400">siz</span>}
            </span>
            {isWinner && <IconCheck size={13} className="shrink-0 text-felt-400" />}
          </>
        ) : (
          <span className="flex-1 truncate text-sm italic">{isBye ? 'Bay' : 'Gözlənilir'}</span>
        )}
        <span
          className={cx(
            'w-4 shrink-0 text-right text-sm tabular-nums',
            isWinner ? 'font-bold text-ink-900' : 'text-ink-400',
          )}
        >
          {score ?? '–'}
        </span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className={cx(
          'overflow-hidden rounded-lg border bg-card shadow-xs',
          match.status === 'READY' ? 'border-honey-500/30' : 'border-rail',
        )}
      >
        <div className="divide-y divide-rail">
          {row(match.player1, match.player1Score)}
          {row(match.player2, match.player2Score)}
        </div>

        {canReport && (
          <div className="border-t border-rail bg-cream p-1.5">
            <Button variant="secondary" size="sm" block onClick={onReport}>
              Nəticə daxil et
            </Button>
          </div>
        )}
      </div>

      {match.status === 'READY' && !canReport && (
        <span className="absolute -top-1.5 left-2 rounded-full bg-honey-600 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-white">
          Hazır
        </span>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/* ── Cədvəl nəticəsi ────────────────────────────────────────── */

function ReportBracketModal({
  tid,
  match,
  onClose,
  onDone,
}: {
  tid: number
  match: BracketMatch
  onClose: () => void
  onDone: (updated: TDetail) => void
}) {
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const p1 = Number(s1)
    const p2 = Number(s2)
    if (s1 === '' || s2 === '' || Number.isNaN(p1) || Number.isNaN(p2)) {
      return setError('Hər iki hesabı daxil edin')
    }
    if (p1 === p2) return setError('Turnir maçında heç-heçə ola bilməz')

    setLoading(true)
    setError('')
    try {
      onDone(await TournamentApi.reportResult(tid, match.id, { player1Score: p1, player2Score: p2 }))
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Nəticə daxil et" description="Qalib növbəti mərhələyə keçəcək.">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={match.player1?.fullName ?? 'Oyunçu 1'}>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              className="text-center font-display text-lg"
              autoFocus
            />
          </Field>
          <Field label={match.player2?.fullName ?? 'Oyunçu 2'}>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              className="text-center font-display text-lg"
            />
          </Field>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2">
          <Button variant="secondary" block onClick={onClose} disabled={loading}>
            Ləğv et
          </Button>
          <Button block loading={loading} onClick={submit}>
            Təsdiqlə
          </Button>
        </div>
      </div>
    </Modal>
  )
}
