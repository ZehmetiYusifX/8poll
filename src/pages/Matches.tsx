import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { MatchApi } from '../api'
import { Avatar } from '../components/Avatar'
import { Button, Card, PageLoader, Empty, Badge } from '../components/ui'
import { MatchRow } from '../components/MatchRow'
import { ReportMatchModal } from '../components/ReportMatchModal'
import { extractErrorMessage } from '../api/client'
import { timeAgo } from '../utils/format'
import type { Match } from '../api/types'

export function Matches() {
  const { user, refresh } = useAuth()
  const [mine, setMine] = useState<Match[]>([])
  const [pending, setPending] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [report, setReport] = useState(false)

  const load = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([MatchApi.mine(), MatchApi.pending()])
      setMine(m)
      setPending(p)
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
    setError('')
    try {
      if (ok) await MatchApi.confirm(id)
      else await MatchApi.reject(id)
      await Promise.all([load(), refresh()])
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  if (!user) return null
  if (loading) return <PageLoader />

  // Öz göndərdiyim, hələ təsdiq gözləyən nəticələr (məlumat üçün)
  const history = mine

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Maçlarım</h1>
          <p className="text-sm text-ink-500">Nəticələr və reytinq dəyişiklikləri</p>
        </div>
        <Button onClick={() => setReport(true)}>+ Nəticə</Button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink-900">
            Təsdiq gözləyir <Badge tone="yellow">{pending.length}</Badge>
          </h2>
          <div className="space-y-3">
            {pending.map((m) => (
              <Card key={m.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={m.reporter.fullName} color={m.reporter.avatarColor} size={40} />
                  <div className="text-sm">
                    <p className="text-ink-900"><b>{m.reporter.fullName}</b> nəticə daxil etdi</p>
                    <p className="text-ink-500">
                      {m.reporterScore} : {m.opponentScore} · {timeAgo(m.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="success" disabled={busyId === m.id} onClick={() => confirmMatch(m.id, true)}>Təsdiqlə</Button>
                  <Button variant="danger" disabled={busyId === m.id} onClick={() => confirmMatch(m.id, false)}>Rədd et</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Tarixçə</h2>
        {history.length === 0 ? (
          <Empty title="Hələ maç yoxdur" hint="İlk nəticənizi daxil edin." />
        ) : (
          <div className="space-y-2.5">
            {history.map((m) => (
              <MatchRow key={m.id} match={m} viewerId={user.id} />
            ))}
          </div>
        )}
      </section>

      <ReportMatchModal open={report} onClose={() => setReport(false)} onDone={() => { load(); refresh() }} />
    </div>
  )
}
