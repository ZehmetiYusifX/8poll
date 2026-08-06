import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TournamentApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { Button, Card, PageLoader, Empty, Badge, Field, Input, ErrorText } from '../components/ui'
import { Modal } from '../components/Modal'
import { extractErrorMessage } from '../api/client'
import { formatDate } from '../utils/format'
import type { TournamentDetail as TDetail, BracketMatch, TournamentStatus } from '../api/types'

const statusMeta: Record<TournamentStatus, { text: string; tone: 'green' | 'yellow' | 'blue' | 'neutral' }> = {
  REGISTRATION: { text: 'Qeydiyyat açıq', tone: 'green' },
  ONGOING: { text: 'Davam edir', tone: 'yellow' },
  COMPLETED: { text: 'Bitdi', tone: 'blue' },
  CANCELLED: { text: 'Ləğv edildi', tone: 'neutral' },
}

export function TournamentDetail() {
  const { id } = useParams()
  const tid = Number(id)
  const { user } = useAuth()

  const [data, setData] = useState<TDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reportMatch, setReportMatch] = useState<BracketMatch | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await TournamentApi.get(tid))
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

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    try {
      await fn()
      await load()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const totalRounds = useMemo(() => {
    if (!data) return 0
    return data.bracket.reduce((m, b) => Math.max(m, b.round), 0)
  }, [data])

  const rounds = useMemo(() => {
    if (!data) return []
    const byRound: BracketMatch[][] = []
    for (let r = 1; r <= totalRounds; r++) {
      byRound.push(data.bracket.filter((b) => b.round === r).sort((a, b) => a.position - b.position))
    }
    return byRound
  }, [data, totalRounds])

  const roundName = (r: number) => {
    if (r === totalRounds) return 'Final'
    if (r === totalRounds - 1) return 'Yarımfinal'
    if (r === totalRounds - 2) return 'Çərəkfinal'
    return `${r}. raund`
  }

  if (loading) return <PageLoader />
  if (!t || !data) return <Empty title="Turnir tapılmadı" />

  const st = statusMeta[t.status]

  return (
    <div className="space-y-6">
      {/* Başlıq */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink-900">{t.name}</h1>
            <Badge tone={st.tone}>{st.text}</Badge>
          </div>
          <div className="mt-1 text-sm text-ink-500">
            <Link to={`/venues/${t.venue.id}`} className="hover:text-felt-700">📍 {t.venue.name}</Link>
            {t.startAt && ` · ${formatDate(t.startAt)}`}
          </div>
          {t.description && <p className="mt-2 max-w-2xl text-sm text-ink-600">{t.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {t.status === 'REGISTRATION' && !isOwner && (
            isParticipant ? (
              <Button variant="secondary" disabled={busy} onClick={() => act(() => TournamentApi.leave(tid))}>
                Ayrıl
              </Button>
            ) : (
              <Button disabled={busy} onClick={() => act(() => TournamentApi.join(tid))}>Qoşul</Button>
            )
          )}
          {t.status === 'REGISTRATION' && isOwner && (
            <Button disabled={busy || data.participants.length < 2} onClick={() => act(() => TournamentApi.start(tid))}>
              Turniri başlat
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {t.status === 'COMPLETED' && t.winner && (
        <Card className="flex items-center gap-3 border-felt-300 bg-felt-100">
          <span className="text-3xl">🏆</span>
          <div>
            <div className="text-xs uppercase tracking-wide text-felt-700">Turnir qalibi</div>
            <div className="text-lg font-bold text-ink-900">{t.winner.fullName}</div>
          </div>
        </Card>
      )}

      {/* Qeydiyyat mərhələsi: iştirakçı siyahısı */}
      {t.status === 'REGISTRATION' ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink-900">
            İştirakçılar <span className="text-ink-400">({data.participants.length}/{t.maxParticipants})</span>
          </h2>
          {data.participants.length === 0 ? (
            <Empty title="Hələ iştirakçı yoxdur" hint="İlk qoşulan siz olun." />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {data.participants.map((p) => (
                <Card key={p.id} className="flex items-center gap-3 !py-3">
                  <Avatar name={p.fullName} color={p.avatarColor} size={40} />
                  <div>
                    <div className="font-medium text-ink-900">{p.fullName}</div>
                    <div className="text-xs text-ink-500">@{p.username} · {p.rating} xal</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Bracket */
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink-900">Turnir cədvəli</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {rounds.map((matches, i) => (
              <div key={i} className="flex min-w-[240px] flex-col justify-around gap-4">
                <div className="text-center text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {roundName(i + 1)}
                </div>
                {matches.map((m) => (
                  <BracketCard
                    key={m.id}
                    match={m}
                    canReport={isOwner && t.status === 'ONGOING' && m.status === 'READY'}
                    onReport={() => setReportMatch(m)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {reportMatch && (
        <ReportBracketModal
          tid={tid}
          match={reportMatch}
          onClose={() => setReportMatch(null)}
          onDone={(updated) => { setData(updated); setReportMatch(null) }}
        />
      )}
    </div>
  )
}

function BracketCard({ match, canReport, onReport }: { match: BracketMatch; canReport: boolean; onReport: () => void }) {
  const row = (name: string | null, score: number | null, isWinner: boolean, bye: boolean) => (
    <div className={`flex items-center justify-between px-3 py-2 ${isWinner ? 'bg-felt-100' : ''}`}>
      <span className={`truncate text-sm ${name ? (isWinner ? 'font-semibold text-ink-900' : 'text-ink-700') : 'text-ink-400 italic'}`}>
        {name ?? (bye ? 'Bay' : '—')}
      </span>
      {score != null && <span className="ml-2 text-sm font-semibold text-ink-900">{score}</span>}
    </div>
  )

  const p1Winner = match.winnerId != null && match.player1?.id === match.winnerId
  const p2Winner = match.winnerId != null && match.player2?.id === match.winnerId
  const isBye = (!match.player1 || !match.player2) && (match.player1 != null || match.player2 != null) && match.round === 1

  return (
    <Card className="!p-0">
      <div className="divide-y divide-wood-200">
        {row(match.player1?.fullName ?? null, match.player1Score, p1Winner, isBye)}
        {row(match.player2?.fullName ?? null, match.player2Score, p2Winner, isBye)}
      </div>
      {canReport && (
        <div className="border-t border-wood-200 p-2">
          <Button variant="secondary" className="w-full !py-1.5" onClick={onReport}>Nəticə daxil et</Button>
        </div>
      )}
    </Card>
  )
}

function ReportBracketModal({ tid, match, onClose, onDone }: {
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
    if (Number.isNaN(p1) || Number.isNaN(p2)) return setError('Hesabı daxil edin')
    if (p1 === p2) return setError('Turnir maçında heçə-heçə ola bilməz')
    setLoading(true)
    setError('')
    try {
      const updated = await TournamentApi.reportResult(tid, match.id, { player1Score: p1, player2Score: p2 })
      onDone(updated)
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Nəticə daxil et">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={match.player1?.fullName ?? 'Oyunçu 1'}>
            <Input type="number" min={0} value={s1} onChange={(e) => setS1(e.target.value)} autoFocus />
          </Field>
          <Field label={match.player2?.fullName ?? 'Oyunçu 2'}>
            <Input type="number" min={0} value={s2} onChange={(e) => setS2(e.target.value)} />
          </Field>
        </div>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Ləğv et</Button>
          <Button className="flex-1" onClick={submit} disabled={loading}>{loading ? 'Yadda saxlanılır...' : 'Təsdiqlə'}</Button>
        </div>
      </div>
    </Modal>
  )
}
