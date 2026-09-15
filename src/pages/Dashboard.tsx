import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { Sparkline } from '../components/Sparkline'
import { ActionCard } from '../components/ActionCard'
import { MatchRow } from '../components/MatchRow'
import { ReportMatchModal } from '../components/ReportMatchModal'
import {
  Alert,
  Button,
  Card,
  Empty,
  ListSkeleton,
  SectionHeader,
  Skeleton,
  buttonClass,
  cx,
} from '../components/ui'
import {
  IconArrowRight,
  IconCheck,
  IconPin,
  IconPlus,
  IconSwords,
  IconTable,
  IconTrophy,
  IconUsers,
  IconX,
} from '../components/icons'
import { useToast } from '../components/Toast'
import { ChallengeApi, LeaderboardApi, MatchApi } from '../api'
import { extractErrorMessage } from '../api/client'
import type { Challenge, Match } from '../api/types'
import { timeAgo } from '../utils/format'

export function Dashboard() {
  const { user, refresh } = useAuth()
  const toast = useToast()

  const [pending, setPending] = useState<Match[]>([])
  const [incoming, setIncoming] = useState<Challenge[]>([])
  const [mine, setMine] = useState<Match[]>([])
  const [rank, setRank] = useState<{ place: number; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    try {
      const [p, inc, m, board] = await Promise.all([
        MatchApi.pending(),
        ChallengeApi.incoming(),
        MatchApi.mine(),
        LeaderboardApi.get(200).catch(() => []),
      ])
      setPending(p)
      setIncoming(inc.filter((c) => c.status === 'PENDING'))
      setMine(m)
      const entry = board.find((e) => e.player.id === user.id)
      setRank(entry ? { place: entry.rank, total: board.length } : null)
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const afterAction = async () => {
    await Promise.all([load(), refresh()])
  }

  /** Təsdiqlənmiş maçlardan reytinq tarixçəsi — kiçik qrafik üçün */
  const history = useMemo(() => {
    if (!user) return []
    return mine
      .filter((m) => m.status === 'CONFIRMED' && m.confirmedAt)
      .slice()
      .sort((a, b) => Date.parse(a.confirmedAt!) - Date.parse(b.confirmedAt!))
      .map((m) => (m.reporter.id === user.id ? m.reporterRatingAfter : m.opponentRatingAfter))
      .filter((v): v is number => v != null)
      .slice(-15)
  }, [mine, user])

  /** Son 5 nəticə — forma zolağı */
  const form = useMemo(() => {
    if (!user) return []
    return mine
      .filter((m) => m.status === 'CONFIRMED')
      .slice(0, 5)
      .map((m) => (m.winnerId == null ? 'draw' : m.winnerId === user.id ? 'win' : 'loss'))
      .reverse()
  }, [mine, user])

  const confirmMatch = async (id: number, ok: boolean) => {
    setBusyId(id)
    try {
      if (ok) await MatchApi.confirm(id)
      else await MatchApi.reject(id)
      toast.success(ok ? 'Nəticə təsdiqləndi, reytinqlər yeniləndi' : 'Nəticə rədd edildi')
      await afterAction()
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  const respondChallenge = async (id: number, ok: boolean) => {
    setBusyId(id)
    try {
      if (ok) await ChallengeApi.accept(id)
      else await ChallengeApi.decline(id)
      toast.success(ok ? 'Dəvət qəbul edildi' : 'Dəvətdən imtina edildi')
      await load()
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  if (!user) return null

  const recent = mine.filter((m) => m.status === 'CONFIRMED').slice(0, 6)
  const todoCount = pending.length + incoming.length

  return (
    <div className="space-y-8">
      {/* ── Oyunçu kartı ─────────────────────────────────────── */}
      <Card padded={false} className="overflow-hidden">
        {/*
          Oyunçu kartı brendbukun "premium klub" kadrıdır: arxa planda aşağı
          işıqlı masa fotosu, üstündə tünd qradient ki, mətn oxunaqlı qalsın.
        */}
        <div className="felt-weave relative flex flex-col gap-5 bg-felt-950 px-5 py-5 text-ivory sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <img
            src="/brand/table-lamp.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-right opacity-55"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.82) 40%, rgba(14,42,26,0.62) 100%)',
            }}
          />

          <div className="relative flex items-center gap-4">
            <Avatar name={user.fullName} color={user.avatarColor} size={60} ring="gold" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.12em] text-felt-200/70">Xoş gəldiniz</p>
              <h1 className="truncate font-display text-2xl font-semibold leading-tight">
                {user.fullName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-felt-200/80">
                <span>@{user.username}</span>
                {loading ? (
                  <Skeleton className="h-4 w-16 opacity-30" />
                ) : (
                  rank && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 px-2 py-0.5 font-semibold text-gold-200">
                      <IconTrophy size={11} />
                      {rank.place}. yer / {rank.total}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="relative flex items-end gap-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.1em] text-felt-200/70">Reytinq</div>
              <div className="font-display text-4xl font-bold leading-none tabular-nums text-gold-400">
                {user.rating}
              </div>
              {form.length > 0 && (
                <div className="mt-2 flex gap-1" title="Son nəticələr (köhnədən yeniyə)">
                  {form.map((r, i) => (
                    <span
                      key={i}
                      className={cx(
                        'h-1.5 w-5 rounded-full',
                        r === 'win' ? 'bg-felt-400' : r === 'loss' ? 'bg-clay-500' : 'bg-honey-600',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            {history.length > 1 && <Sparkline values={history} className="hidden sm:block" />}
          </div>
        </div>

        <dl className="grid grid-cols-4 divide-x divide-rail border-b border-rail bg-card">
          <HeroStat label="Oyun" value={user.gamesPlayed} />
          <HeroStat label="Qələbə" value={user.wins} tone="win" />
          <HeroStat label="Məğlub" value={user.losses} tone="loss" />
          <HeroStat label="Qazanma" value={`${user.winRate}%`} />
        </dl>

        <div className="flex flex-wrap gap-2 bg-cream px-5 py-3">
          <Button icon={<IconPlus size={16} />} onClick={() => setReport(true)}>
            Nəticə daxil et
          </Button>
          <Link to="/players" className={buttonClass('secondary', 'md')}>
            <IconUsers size={16} />
            Rəqib tap
          </Link>
          <Link to="/leaderboard" className={buttonClass('ghost', 'md', 'ml-auto')}>
            Reytinq cədvəli
            <IconArrowRight size={16} />
          </Link>
        </div>
      </Card>

      {error && <Alert tone="error">{error}</Alert>}

      {/* ── Sizdən gözlənilir ────────────────────────────────── */}
      {loading ? (
        <ListSkeleton rows={3} />
      ) : (
        todoCount > 0 && (
          <section>
            <SectionHeader title="Sizdən gözlənilir" count={todoCount} />
            <div className="space-y-3">
              {pending.map((m) => (
                <ActionCard
                  key={`m${m.id}`}
                  tone="confirm"
                  badge={<IconCheck size={10} />}
                  avatar={
                    <Avatar name={m.reporter.fullName} color={m.reporter.avatarColor} size={42} />
                  }
                  title={
                    <>
                      <b className="font-semibold">{m.reporter.fullName}</b> nəticə daxil etdi
                    </>
                  }
                  meta={
                    <>
                      <span className="font-semibold tabular-nums text-ink-700">
                        {m.reporterScore} – {m.opponentScore}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{timeAgo(m.createdAt)}</span>
                      {m.venue && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-0.5">
                            <IconPin size={12} />
                            {m.venue.name}
                          </span>
                        </>
                      )}
                    </>
                  }
                  actions={
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        icon={<IconCheck size={15} />}
                        loading={busyId === m.id}
                        onClick={() => confirmMatch(m.id, true)}
                      >
                        Təsdiqlə
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<IconX size={15} />}
                        disabled={busyId === m.id}
                        onClick={() => confirmMatch(m.id, false)}
                      >
                        Rədd et
                      </Button>
                    </>
                  }
                />
              ))}

              {incoming.map((c) => (
                <ActionCard
                  key={`c${c.id}`}
                  tone="challenge"
                  badge={<IconSwords size={10} />}
                  avatar={
                    <Avatar name={c.challenger.fullName} color={c.challenger.avatarColor} size={42} />
                  }
                  title={
                    <>
                      <b className="font-semibold">{c.challenger.fullName}</b> sizi oyuna dəvət etdi
                    </>
                  }
                  meta={
                    <>
                      <span>@{c.challenger.username}</span>
                      <span aria-hidden>·</span>
                      <span>{timeAgo(c.createdAt)}</span>
                      {c.venue && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-0.5">
                            <IconPin size={12} />
                            {c.venue.name}
                          </span>
                        </>
                      )}
                    </>
                  }
                  note={c.message}
                  actions={
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        icon={<IconCheck size={15} />}
                        loading={busyId === c.id}
                        onClick={() => respondChallenge(c.id, true)}
                      >
                        Qəbul et
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busyId === c.id}
                        onClick={() => respondChallenge(c.id, false)}
                      >
                        İmtina
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          </section>
        )
      )}

      {/* ── Son maçlar ───────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Son maçlarınız"
          action={
            recent.length > 0 && (
              <Link
                to="/matches"
                className="inline-flex items-center gap-1 text-sm font-medium text-felt-300 underline-offset-4 hover:underline"
              >
                Hamısı
                <IconArrowRight size={15} />
              </Link>
            )
          }
        />
        {loading ? (
          <ListSkeleton rows={4} />
        ) : recent.length === 0 ? (
          <Empty
            icon={<IconTable size={20} />}
            title="Hələ təsdiqlənmiş maçınız yoxdur"
            hint="İlk nəticənizi daxil edin — rəqibiniz təsdiqlədikdən sonra Elo reytinqiniz hesablanacaq."
            action={
              <Button icon={<IconPlus size={16} />} onClick={() => setReport(true)}>
                Nəticə daxil et
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {recent.map((m) => (
              <MatchRow key={m.id} match={m} viewerId={user.id} />
            ))}
          </div>
        )}
      </section>

      <ReportMatchModal open={report} onClose={() => setReport(false)} onDone={afterAction} />
    </div>
  )
}

function HeroStat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number | string
  tone?: 'default' | 'win' | 'loss'
}) {
  return (
    <div className="px-2 py-3.5 text-center">
      <dd
        className={cx(
          'font-display text-xl font-semibold tabular-nums sm:text-2xl',
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
