import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChallengeApi } from '../api'
import { Avatar } from '../components/Avatar'
import { Button, Card, PageLoader, Empty, Badge } from '../components/ui'
import { ReportMatchModal } from '../components/ReportMatchModal'
import { extractErrorMessage } from '../api/client'
import { timeAgo } from '../utils/format'
import type { Challenge, ChallengeStatus, PlayerSummary } from '../api/types'

const statusLabel: Record<ChallengeStatus, { text: string; tone: 'green' | 'red' | 'yellow' | 'neutral' | 'blue' }> = {
  PENDING: { text: 'Gözləyir', tone: 'yellow' },
  ACCEPTED: { text: 'Qəbul edildi', tone: 'green' },
  DECLINED: { text: 'İmtina', tone: 'red' },
  CANCELLED: { text: 'Ləğv edildi', tone: 'neutral' },
  COMPLETED: { text: 'Tamamlandı', tone: 'blue' },
}

export function Challenges() {
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [incoming, setIncoming] = useState<Challenge[]>([])
  const [outgoing, setOutgoing] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [reportFor, setReportFor] = useState<{ opponent: PlayerSummary; challengeId: number } | null>(null)

  const load = useCallback(async () => {
    try {
      const [inc, out] = await Promise.all([ChallengeApi.incoming(), ChallengeApi.outgoing()])
      setIncoming(inc)
      setOutgoing(out)
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const act = async (fn: () => Promise<unknown>, id: number) => {
    setBusyId(id)
    setError('')
    try {
      await fn()
      await load()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <PageLoader />

  const list = tab === 'incoming' ? incoming : outgoing
  const pendingIncoming = incoming.filter((c) => c.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Dəvətlər</h1>
        <p className="text-sm text-ink-500">Gələn və göndərdiyiniz dəvətlər</p>
      </div>

      <div className="inline-flex rounded-lg border border-wood-200 bg-cream p-1">
        <TabBtn active={tab === 'incoming'} onClick={() => setTab('incoming')}>
          Gələn {pendingIncoming > 0 && <Badge tone="green">{pendingIncoming}</Badge>}
        </TabBtn>
        <TabBtn active={tab === 'outgoing'} onClick={() => setTab('outgoing')}>
          Göndərilən
        </TabBtn>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {list.length === 0 ? (
        <Empty
          title={tab === 'incoming' ? 'Gələn dəvət yoxdur' : 'Göndərilmiş dəvət yoxdur'}
          hint={tab === 'outgoing' ? 'Oyunçular səhifəsindən rəqib dəvət edin.' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const other = tab === 'incoming' ? c.challenger : c.opponent
            const st = statusLabel[c.status]
            return (
              <Card key={c.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Link to={`/players/${other.id}`}>
                    <Avatar name={other.fullName} color={other.avatarColor} size={44} />
                  </Link>
                  <div className="text-sm">
                    <Link to={`/players/${other.id}`} className="font-semibold text-ink-900 hover:text-felt-700">
                      {other.fullName}
                    </Link>
                    <div className="text-xs text-ink-500">
                      @{other.username} · {other.rating} xal · {timeAgo(c.createdAt)}
                    </div>
                    {c.venue && (
                      <div className="mt-1 text-xs text-felt-700">📍 {c.venue.name}</div>
                    )}
                    {c.message && <p className="mt-1 text-sm text-ink-500">“{c.message}”</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {c.status === 'PENDING' && tab === 'incoming' && (
                    <>
                      <Button variant="success" disabled={busyId === c.id} onClick={() => act(() => ChallengeApi.accept(c.id), c.id)}>
                        Qəbul et
                      </Button>
                      <Button variant="secondary" disabled={busyId === c.id} onClick={() => act(() => ChallengeApi.decline(c.id), c.id)}>
                        İmtina
                      </Button>
                    </>
                  )}
                  {c.status === 'PENDING' && tab === 'outgoing' && (
                    <>
                      <Badge tone={st.tone}>{st.text}</Badge>
                      <Button variant="ghost" disabled={busyId === c.id} onClick={() => act(() => ChallengeApi.cancel(c.id), c.id)}>
                        Ləğv et
                      </Button>
                    </>
                  )}
                  {c.status === 'ACCEPTED' && (
                    <>
                      <Badge tone="green">Qəbul edildi</Badge>
                      <Button onClick={() => setReportFor({ opponent: other, challengeId: c.id })}>
                        Nəticə daxil et
                      </Button>
                    </>
                  )}
                  {c.status !== 'PENDING' && c.status !== 'ACCEPTED' && <Badge tone={st.tone}>{st.text}</Badge>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {reportFor && (
        <ReportMatchModal
          open={!!reportFor}
          opponent={reportFor.opponent}
          challengeId={reportFor.challengeId}
          onClose={() => setReportFor(null)}
          onDone={load}
        />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-felt-700 text-cream' : 'text-ink-600 hover:text-ink-900'
      }`}
    >
      {children}
    </button>
  )
}
