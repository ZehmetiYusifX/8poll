import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { MatchApi } from '../api'
import { Avatar } from '../components/Avatar'
import { ActionCard } from '../components/ActionCard'
import { MatchRow } from '../components/MatchRow'
import { ReportMatchModal } from '../components/ReportMatchModal'
import {
  Alert,
  Button,
  Card,
  Empty,
  ListSkeleton,
  PageHeader,
  SectionHeader,
  Segmented,
} from '../components/ui'
import { IconCheck, IconPin, IconPlus, IconTable, IconX } from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage } from '../api/client'
import { timeAgo } from '../utils/format'
import type { Match } from '../api/types'

type Filter = 'all' | 'wins' | 'losses' | 'open'

export function Matches() {
  const { user, refresh } = useAuth()
  const toast = useToast()

  const [mine, setMine] = useState<Match[]>([])
  const [pending, setPending] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [report, setReport] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const load = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([MatchApi.mine(), MatchApi.pending()])
      setMine(m)
      setPending(p)
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const confirmMatch = async (id: number, ok: boolean) => {
    setBusyId(id)
    try {
      if (ok) await MatchApi.confirm(id)
      else await MatchApi.reject(id)
      toast.success(ok ? 'Nəticə təsdiqləndi' : 'Nəticə rədd edildi')
      await Promise.all([load(), refresh()])
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  /** Ümumi statistika — cari istifadəçinin baxış bucağından */
  const summary = useMemo(() => {
    if (!user) return { wins: 0, losses: 0, delta: 0 }
    const confirmed = mine.filter((m) => m.status === 'CONFIRMED')
    const delta = confirmed.reduce((sum, m) => {
      const change = m.reporter.id === user.id ? m.reporterRatingChange : m.opponentRatingChange
      return sum + (change ?? 0)
    }, 0)
    return {
      wins: confirmed.filter((m) => m.winnerId === user.id).length,
      losses: confirmed.filter((m) => m.winnerId != null && m.winnerId !== user.id).length,
      delta,
    }
  }, [mine, user])

  const visible = useMemo(() => {
    if (!user) return []
    if (filter === 'open') return mine.filter((m) => m.status === 'PENDING')
    if (filter === 'wins') return mine.filter((m) => m.status === 'CONFIRMED' && m.winnerId === user.id)
    if (filter === 'losses')
      return mine.filter(
        (m) => m.status === 'CONFIRMED' && m.winnerId != null && m.winnerId !== user.id,
      )
    return mine
  }, [mine, filter, user])

  if (!user) return null

  const openCount = mine.filter((m) => m.status === 'PENDING').length

  return (
    <div>
      <PageHeader
        title="Maçlarım"
        subtitle="Nəticələr, təsdiqlər və reytinq dəyişiklikləri"
        actions={
          <Button icon={<IconPlus size={16} />} onClick={() => setReport(true)}>
            Nəticə daxil et
          </Button>
        }
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={6} />
      ) : (
        <div className="space-y-8">
          {/* ── Təsdiq gözləyənlər ──────────────────────────── */}
          {pending.length > 0 && (
            <section>
              <SectionHeader title="Təsdiqinizi gözləyir" count={pending.length} />
              <div className="space-y-3">
                {pending.map((m) => (
                  <ActionCard
                    key={m.id}
                    tone="confirm"
                    badge={<IconCheck size={10} />}
                    avatar={
                      <Avatar name={m.reporter.fullName} color={m.reporter.avatarColor} src={m.reporter.avatarUrl} size={42} />
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
              </div>
            </section>
          )}

          {/* ── Xülasə ─────────────────────────────────────── */}
          {mine.length > 0 && (
            <Card padded={false}>
              <dl className="grid grid-cols-3 divide-x divide-rail">
                <SummaryCell label="Qələbə" value={summary.wins} className="text-felt-300" />
                <SummaryCell label="Məğlubiyyət" value={summary.losses} className="text-clay-300" />
                <SummaryCell
                  label="Ümumi reytinq"
                  value={`${summary.delta > 0 ? '+' : ''}${summary.delta}`}
                  className={summary.delta >= 0 ? 'text-felt-300' : 'text-clay-300'}
                />
              </dl>
            </Card>
          )}

          {/* ── Tarixçə ────────────────────────────────────── */}
          <section>
            <SectionHeader
              title="Tarixçə"
              action={
                mine.length > 0 && (
                  <Segmented
                    value={filter}
                    onChange={setFilter}
                    label="Maç filtri"
                    items={[
                      { value: 'all', label: 'Hamısı' },
                      { value: 'wins', label: 'Qələbə' },
                      { value: 'losses', label: 'Məğlub' },
                      { value: 'open', label: 'Açıq', count: openCount },
                    ]}
                  />
                )
              }
            />

            {visible.length === 0 ? (
              <Empty
                icon={<IconTable size={20} />}
                title={mine.length === 0 ? 'Hələ maçınız yoxdur' : 'Bu filtrə uyğun maç yoxdur'}
                hint={
                  mine.length === 0
                    ? 'Rəqib seçin, oynayın və nəticəni buradan qeyd edin.'
                    : undefined
                }
                action={
                  mine.length === 0 ? (
                    <Button icon={<IconPlus size={16} />} onClick={() => setReport(true)}>
                      Nəticə daxil et
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-2.5">
                {visible.map((m) => (
                  <MatchRow key={m.id} match={m} viewerId={user.id} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ReportMatchModal
        open={report}
        onClose={() => setReport(false)}
        onDone={() => {
          load()
          refresh()
        }}
      />
    </div>
  )
}

function SummaryCell({
  label,
  value,
  className = '',
}: {
  label: string
  value: number | string
  className?: string
}) {
  return (
    <div className="px-3 py-4 text-center">
      <dd className={`font-display text-2xl font-semibold tabular-nums ${className}`}>{value}</dd>
      <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.07em] text-ink-400">
        {label}
      </dt>
    </div>
  )
}
