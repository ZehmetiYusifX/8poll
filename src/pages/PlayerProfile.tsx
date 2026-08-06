import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { PlayerApi } from '../api'
import { Avatar } from '../components/Avatar'
import { Button, Card, Empty, PageLoader, Badge, Textarea, Field, Input } from '../components/ui'
import { Modal } from '../components/Modal'
import { MatchRow } from '../components/MatchRow'
import { ChallengeModal } from '../components/ChallengeModal'
import { ReportMatchModal } from '../components/ReportMatchModal'
import { extractErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'
import type { Match, Player } from '../api/types'

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>()
  const playerId = Number(id)
  const { user, refresh, setUser } = useAuth()

  const [player, setPlayer] = useState<Player | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [playerId])

  useEffect(() => {
    if (!Number.isNaN(playerId)) load()
  }, [playerId, load])

  if (loading) return <PageLoader />
  if (error || !player) return <Empty title="Oyunçu tapılmadı" hint={error} />

  const confirmed = matches.filter((m) => m.status === 'CONFIRMED')

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-l-4 border-l-felt-700">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={player.fullName} color={player.avatarColor} size={72} />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">{player.fullName}</h1>
              <p className="text-sm text-ink-500">@{player.username}</p>
              <p className="mt-1 text-xs text-ink-400">Qoşulub: {formatDate(player.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isMe ? (
              <Button variant="secondary" onClick={() => setEdit(true)}>Profili redaktə et</Button>
            ) : (
              <>
                <Button onClick={() => setChallenge(true)}>Dəvət et</Button>
                <Button variant="secondary" onClick={() => setReport(true)}>Nəticə daxil et</Button>
              </>
            )}
          </div>
        </div>

        {player.bio && <p className="mt-4 max-w-2xl text-sm text-ink-700">{player.bio}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatBox value={player.rating} label="Reytinq" accent />
          <StatBox value={player.gamesPlayed} label="Oyun" />
          <StatBox value={player.wins} label="Qələbə" />
          <StatBox value={player.losses} label="Məğlub" />
          <StatBox value={`${player.winRate}%`} label="Qazanma faizi" />
        </div>
      </Card>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink-900">
          Maç tarixçəsi <Badge tone="neutral">{confirmed.length}</Badge>
        </h2>
        {confirmed.length === 0 ? (
          <Empty title="Təsdiqlənmiş maç yoxdur" />
        ) : (
          <div className="space-y-2.5">
            {confirmed.map((m) => (
              <MatchRow key={m.id} match={m} viewerId={player.id} />
            ))}
          </div>
        )}
      </section>

      {!isMe && (
        <>
          <ChallengeModal opponent={player} open={challenge} onClose={() => setChallenge(false)} />
          <ReportMatchModal open={report} onClose={() => setReport(false)} opponent={player} onDone={() => { load(); refresh() }} />
        </>
      )}

      {isMe && (
        <EditProfileModal
          player={player}
          open={edit}
          onClose={() => setEdit(false)}
          onSaved={(p) => { setPlayer(p); setUser(p); load() }}
        />
      )}
    </div>
  )
}

function StatBox({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-cream border border-wood-200/70 p-3 text-center">
      <div className={`text-xl font-black tabular-nums ${accent ? 'text-felt-700' : 'text-ink-900'}`}>{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  )
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#0ea5e9']

function EditProfileModal({
  player, open, onClose, onSaved,
}: {
  player: Player
  open: boolean
  onClose: () => void
  onSaved: (p: Player) => void
}) {
  const [fullName, setFullName] = useState(player.fullName)
  const [bio, setBio] = useState(player.bio ?? '')
  const [color, setColor] = useState(player.avatarColor ?? COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    setLoading(true)
    setError('')
    try {
      const updated = await PlayerApi.updateMe({ fullName: fullName.trim(), bio: bio.trim(), avatarColor: color })
      onSaved(updated)
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
        <Field label="Ad Soyad">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Haqqında">
          <Textarea rows={3} maxLength={300} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Özünüz haqqında bir neçə söz..." />
        </Field>
        <Field label="Avatar rəngi">
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full transition ${color === c ? 'ring-2 ring-ink-900 ring-offset-2 ring-offset-card' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </Field>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Ləğv et</Button>
          <Button className="flex-1" onClick={save} disabled={loading}>{loading ? 'Yadda saxlanılır...' : 'Yadda saxla'}</Button>
        </div>
      </div>
    </Modal>
  )
}
