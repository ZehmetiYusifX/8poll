import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChallengeApi } from '../api'
import { Avatar } from '../components/Avatar'
import { ActionCard } from '../components/ActionCard'
import { ReportMatchModal } from '../components/ReportMatchModal'
import {
  Alert,
  Badge,
  Button,
  Empty,
  ListSkeleton,
  PageHeader,
  Segmented,
} from '../components/ui'
import type { BadgeTone } from '../components/ui'
import { IconCheck, IconPin, IconPlus, IconSwords, IconUsers, IconX } from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage } from '../api/client'
import { timeAgo } from '../utils/format'
import type { Challenge, ChallengeStatus, PlayerSummary } from '../api/types'

const STATUS: Record<ChallengeStatus, { text: string; tone: BadgeTone }> = {
  PENDING: { text: 'Cavab gözləyir', tone: 'yellow' },
  ACCEPTED: { text: 'Qəbul edildi', tone: 'green' },
  DECLINED: { text: 'İmtina edildi', tone: 'red' },
  CANCELLED: { text: 'Ləğv edildi', tone: 'neutral' },
  COMPLETED: { text: 'Tamamlandı', tone: 'blue' },
}

type Tab = 'incoming' | 'outgoing'

export function Challenges() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('incoming')
  const [incoming, setIncoming] = useState<Challenge[]>([])
  const [outgoing, setOutgoing] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [reportFor, setReportFor] = useState<{ opponent: PlayerSummary; challengeId: number } | null>(
    null,
  )

  const load = useCallback(async () => {
    try {
      const [inc, out] = await Promise.all([ChallengeApi.incoming(), ChallengeApi.outgoing()])
      setIncoming(inc)
      setOutgoing(out)
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

  const act = async (id: number, fn: () => Promise<unknown>, message: string) => {
    setBusyId(id)
    try {
      await fn()
      toast.success(message)
      await load()
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  const list = tab === 'incoming' ? incoming : outgoing
  const pendingIncoming = incoming.filter((c) => c.status === 'PENDING').length

  return (
    <div>
      <PageHeader
        title="Dəvətlər"
        subtitle="Sizə gələn və göndərdiyiniz oyun dəvətləri"
        actions={
          <Link to="/players">
            <Button variant="secondary" icon={<IconUsers size={16} />}>
              Rəqib tap
            </Button>
          </Link>
        }
      />

      <Segmented
        className="mb-5"
        label="Dəvət növü"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'incoming', label: 'Gələn', count: pendingIncoming },
          { value: 'outgoing', label: 'Göndərilən' },
        ]}
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : list.length === 0 ? (
        <Empty
          icon={<IconSwords size={20} />}
          title={tab === 'incoming' ? 'Gələn dəvət yoxdur' : 'Göndərilmiş dəvət yoxdur'}
          hint={
            tab === 'incoming'
              ? 'Kimsə sizi oyuna dəvət etdikdə burada görünəcək.'
              : 'Oyunçular səhifəsindən rəqib seçib dəvət göndərin.'
          }
          action={
            tab === 'outgoing' ? (
              <Link to="/players">
                <Button icon={<IconUsers size={16} />}>Oyunçulara bax</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const other = tab === 'incoming' ? c.challenger : c.opponent
            const status = STATUS[c.status]
            const isPending = c.status === 'PENDING'
            const busy = busyId === c.id

            return (
              <ActionCard
                key={c.id}
                tone={isPending ? 'challenge' : 'neutral'}
                badge={isPending ? <IconSwords size={10} /> : undefined}
                avatar={
                  <Link to={`/players/${other.id}`} tabIndex={-1} aria-hidden>
                    <Avatar name={other.fullName} color={other.avatarColor} size={44} />
                  </Link>
                }
                title={
                  <Link
                    to={`/players/${other.id}`}
                    className="font-semibold text-ink-900 transition-colors hover:text-felt-300"
                  >
                    {other.fullName}
                  </Link>
                }
                meta={
                  <>
                    <span>@{other.username}</span>
                    <span aria-hidden>·</span>
                    <span className="tabular-nums">{other.rating} xal</span>
                    <span aria-hidden>·</span>
                    <span>{timeAgo(c.createdAt)}</span>
                    {c.venue && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-0.5 text-felt-300">
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
                    {isPending && tab === 'incoming' ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          icon={<IconCheck size={15} />}
                          loading={busy}
                          onClick={() => act(c.id, () => ChallengeApi.accept(c.id), 'Dəvət qəbul edildi')}
                        >
                          Qəbul et
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<IconX size={15} />}
                          disabled={busy}
                          onClick={() => act(c.id, () => ChallengeApi.decline(c.id), 'Dəvətdən imtina edildi')}
                        >
                          İmtina
                        </Button>
                      </>
                    ) : isPending ? (
                      <>
                        <Badge tone={status.tone}>{status.text}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => act(c.id, () => ChallengeApi.cancel(c.id), 'Dəvət ləğv edildi')}
                        >
                          Ləğv et
                        </Button>
                      </>
                    ) : c.status === 'ACCEPTED' ? (
                      <>
                        <Badge tone="green">{status.text}</Badge>
                        <Button
                          size="sm"
                          icon={<IconPlus size={15} />}
                          onClick={() => setReportFor({ opponent: other, challengeId: c.id })}
                        >
                          Nəticə daxil et
                        </Button>
                      </>
                    ) : (
                      <Badge tone={status.tone}>{status.text}</Badge>
                    )}
                  </>
                }
              />
            )
          })}
        </div>
      )}

      {reportFor && (
        <ReportMatchModal
          open
          opponent={reportFor.opponent}
          challengeId={reportFor.challengeId}
          onClose={() => setReportFor(null)}
          onDone={load}
        />
      )}
    </div>
  )
}
