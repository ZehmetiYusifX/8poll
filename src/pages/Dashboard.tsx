import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { Button, Card, Empty, PageLoader, Badge } from '../components/ui'
import { MatchRow } from '../components/MatchRow'
import { ReportMatchModal } from '../components/ReportMatchModal'
import { ChallengeApi, MatchApi } from '../api'
import { extractErrorMessage } from '../api/client'
import type { Challenge, Match } from '../api/types'
import { timeAgo } from '../utils/format'

export function Dashboard() {
  const { user, refresh } = useAuth()
  const [pending, setPending] = useState<Match[]>([])
  const [incoming, setIncoming] = useState<Challenge[]>([])
  const [mine, setMine] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [p, inc, m] = await Promise.all([
        MatchApi.pending(),
        ChallengeApi.incoming(),
        MatchApi.mine(),
      ])
      setPending(p)
      setIncoming(inc.filter((c) => c.status === 'PENDING'))
      setMine(m)
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const afterAction = async () => {
    await Promise.all([load(), refresh()])
  }

  const confirmMatch = async (id: number, ok: boolean) => {
    setBusyId(id)
    try {
      if (ok) await MatchApi.confirm(id)
      else await MatchApi.reject(id)
      await afterAction()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  const respondChallenge = async (id: number, ok: boolean) => {
    setBusyId(id)
    try {
      if (ok) await ChallengeApi.accept(id)
      else await ChallengeApi.decline(id)
      await load()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  if (!user) return null
  if (loading) return <PageLoader />

  const confirmedMine = mine.filter((m) => m.status === 'CONFIRMED').slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Hero / stat kartı */}
      <Card className="relative overflow-hidden border-l-4 border-l-felt-700">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user.fullName} color={user.avatarColor} size={64} />
            <div>
              <p className="text-sm text-ink-500">Salam,</p>
              <h1 className="text-2xl font-bold text-ink-900">{user.fullName}</h1>
              <p className="text-sm text-ink-500">@{user.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center sm:gap-5">
            <Stat value={user.rating} label="Reytinq" accent />
            <Stat value={user.wins} label="Qələbə" />
            <Stat value={user.losses} label="Məğlub" />
            <Stat value={`${user.winRate}%`} label="Qazanma" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => setReport(true)}>+ Nəticə daxil et</Button>
          <Link to="/players">
            <Button variant="secondary">Oyunçu tap</Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="ghost">Reytinq cədvəli →</Button>
          </Link>
        </div>
      </Card>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Təsdiq gözləyən maçlar */}
      {pending.length > 0 && (
        <section>
          <SectionTitle>Təsdiqinizi gözləyən nəticələr <Badge tone="yellow">{pending.length}</Badge></SectionTitle>
          <div className="space-y-3">
            {pending.map((m) => (
              <Card key={m.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={m.reporter.fullName} color={m.reporter.avatarColor} size={40} />
                  <div className="text-sm">
                    <p className="text-ink-900">
                      <b>{m.reporter.fullName}</b> nəticə daxil etdi
                    </p>
                    <p className="text-ink-500">
                      {m.reporter.username} {m.reporterScore} : {m.opponentScore} {m.opponent.username}
                      <span className="ml-2 text-ink-400">{timeAgo(m.createdAt)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="success" disabled={busyId === m.id} onClick={() => confirmMatch(m.id, true)}>
                    Təsdiqlə
                  </Button>
                  <Button variant="danger" disabled={busyId === m.id} onClick={() => confirmMatch(m.id, false)}>
                    Rədd et
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Gələn dəvətlər */}
      {incoming.length > 0 && (
        <section>
          <SectionTitle>Yeni dəvətlər <Badge tone="green">{incoming.length}</Badge></SectionTitle>
          <div className="space-y-3">
            {incoming.map((c) => (
              <Card key={c.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={c.challenger.fullName} color={c.challenger.avatarColor} size={40} />
                  <div className="text-sm">
                    <p className="text-ink-900"><b>{c.challenger.fullName}</b> sizi dəvət etdi</p>
                    {c.message && <p className="text-ink-500">“{c.message}”</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="success" disabled={busyId === c.id} onClick={() => respondChallenge(c.id, true)}>
                    Qəbul et
                  </Button>
                  <Button variant="secondary" disabled={busyId === c.id} onClick={() => respondChallenge(c.id, false)}>
                    İmtina
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Son maçlar */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle>Son maçlarınız</SectionTitle>
          <Link to="/matches" className="text-sm text-felt-700 hover:text-felt-800">Hamısı →</Link>
        </div>
        {confirmedMine.length === 0 ? (
          <Empty title="Hələ təsdiqlənmiş maç yoxdur" hint="İlk nəticənizi daxil edin və reytinq toplamağa başlayın." />
        ) : (
          <div className="space-y-2.5">
            {confirmedMine.map((m) => (
              <MatchRow key={m.id} match={m} viewerId={user.id} />
            ))}
          </div>
        )}
      </section>

      <ReportMatchModal open={report} onClose={() => setReport(false)} onDone={afterAction} />
    </div>
  )
}

function Stat({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-2xl font-black tabular-nums ${accent ? 'text-felt-700' : 'text-ink-900'}`}>{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink-900">{children}</h2>
}
