import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FriendApi } from '../api'
import { Avatar } from '../components/Avatar'
import { ActionCard } from '../components/ActionCard'
import { ChallengeModal } from '../components/ChallengeModal'
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  ListSkeleton,
  PageHeader,
  Segmented,
} from '../components/ui'
import { IconCheck, IconSearch, IconSwords, IconUsers, IconX } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import { useToast } from '../components/Toast'
import { TierBadge } from '../components/TierBadge'
import { DEFAULT_GAME_TYPE } from '../constants/gameTypes'
import { timeAgo } from '../utils/format'
import type { FriendRequest, PlayerSummary, PlayerWithFriendStatus } from '../api/types'

type Tab = 'friends' | 'requests' | 'discover'

export function Friends() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('friends')

  const [friends, setFriends] = useState<PlayerSummary[]>([])
  const [incoming, setIncoming] = useState<FriendRequest[]>([])
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([])
  const [suggestions, setSuggestions] = useState<PlayerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [challengeTarget, setChallengeTarget] = useState<PlayerSummary | null>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlayerWithFriendStatus[]>([])
  const [searching, setSearching] = useState(false)

  const load = useCallback(async () => {
    try {
      const [f, inc, out, sug] = await Promise.all([
        FriendApi.list(),
        FriendApi.incoming(),
        FriendApi.outgoing(),
        FriendApi.suggestions(),
      ])
      setFriends(f)
      setIncoming(inc)
      setOutgoing(out)
      setSuggestions(sug)
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

  // Axtarış: yazılan kimi serverdən nəticə çəkilir — dostluq statusu backend-də hesablanır
  useEffect(() => {
    if (tab !== 'discover') return
    let cancelled = false
    setSearching(true)
    const timer = setTimeout(() => {
      FriendApi.search(query || undefined)
        .then((r) => !cancelled && setResults(r))
        .catch((e) => !cancelled && setError(extractErrorMessage(e)))
        .finally(() => !cancelled && setSearching(false))
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [tab, query])

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

  const sendRequest = async (playerId: number) => {
    setBusyId(playerId)
    try {
      await FriendApi.send(playerId)
      toast.success('Dostluq sorğusu göndərildi')
      setResults((prev) =>
        prev.map((r) => (r.player.id === playerId ? { ...r, friendStatus: 'PENDING_SENT' } : r)),
      )
      setSuggestions((prev) => prev.filter((p) => p.id !== playerId))
      const out = await FriendApi.outgoing()
      setOutgoing(out)
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  const removeFriend = (playerId: number) =>
    act(playerId, () => FriendApi.remove(playerId), 'Dostluq silindi')

  const pendingIncoming = incoming.length

  const discoverList = useMemo<PlayerWithFriendStatus[]>(() => {
    if (query.trim()) return results
    // Axtarış boşdursa "Tövsiyələr"i (dostların dostları) göstər
    return suggestions.map((p) => ({ player: p, friendStatus: 'NONE' as const }))
  }, [query, results, suggestions])

  return (
    <div>
      <PageHeader
        title="Dostlar"
        subtitle="Dostlarınızı idarə edin, dostlarınızdan yeni oyunçu tapın"
      />

      <Segmented
        className="mb-5"
        label="Bölmə"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'friends', label: 'Dostlarım' },
          { value: 'requests', label: 'Sorğular', count: pendingIncoming },
          { value: 'discover', label: 'Yeni tap' },
        ]}
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <Empty
            icon={<IconUsers size={20} />}
            title="Hələ dostunuz yoxdur"
            hint={'"Yeni tap" bölməsindən axtarıb dostluq sorğusu göndərin.'}
            action={<Button onClick={() => setTab('discover')} icon={<IconSearch size={16} />}>Yeni tap</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {friends.map((p) => (
              <FriendCard
                key={p.id}
                player={p}
                busy={busyId === p.id}
                onChallenge={() => setChallengeTarget(p)}
                onRemove={() => removeFriend(p.id)}
              />
            ))}
          </div>
        )
      ) : tab === 'requests' ? (
        incoming.length === 0 && outgoing.length === 0 ? (
          <Empty
            icon={<IconUsers size={20} />}
            title="Gözləyən sorğu yoxdur"
            hint="Göndərdiyiniz və sizə gələn dostluq sorğuları burada görünəcək."
          />
        ) : (
          <div className="space-y-6">
            {incoming.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-ink-700">Gələn sorğular</h2>
                <div className="space-y-3">
                  {incoming.map((r) => (
                    <ActionCard
                      key={r.id}
                      tone="challenge"
                      avatar={
                        <Avatar
                          name={r.sender.fullName}
                          color={r.sender.avatarColor}
                          src={r.sender.avatarUrl}
                          size={44}
                        />
                      }
                      title={
                        <Link
                          to={`/players/${r.sender.id}`}
                          className="font-semibold text-ink-900 transition-colors hover:text-felt-300"
                        >
                          {r.sender.fullName}
                        </Link>
                      }
                      meta={
                        <>
                          <span>@{r.sender.username}</span>
                          <span aria-hidden>·</span>
                          <span>{timeAgo(r.createdAt)}</span>
                        </>
                      }
                      actions={
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            icon={<IconCheck size={15} />}
                            loading={busyId === r.id}
                            onClick={() => act(r.id, () => FriendApi.accept(r.id), 'Dost əlavə edildi')}
                          >
                            Qəbul et
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<IconX size={15} />}
                            disabled={busyId === r.id}
                            onClick={() => act(r.id, () => FriendApi.decline(r.id), 'Sorğu rədd edildi')}
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

            {outgoing.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-ink-700">Göndərilən sorğular</h2>
                <div className="space-y-3">
                  {outgoing.map((r) => (
                    <ActionCard
                      key={r.id}
                      tone="neutral"
                      avatar={
                        <Avatar
                          name={r.receiver.fullName}
                          color={r.receiver.avatarColor}
                          src={r.receiver.avatarUrl}
                          size={44}
                        />
                      }
                      title={
                        <Link
                          to={`/players/${r.receiver.id}`}
                          className="font-semibold text-ink-900 transition-colors hover:text-felt-300"
                        >
                          {r.receiver.fullName}
                        </Link>
                      }
                      meta={
                        <>
                          <span>@{r.receiver.username}</span>
                          <span aria-hidden>·</span>
                          <span>{timeAgo(r.createdAt)}</span>
                        </>
                      }
                      actions={
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyId === r.receiver.id}
                          onClick={() => act(r.receiver.id, () => FriendApi.remove(r.receiver.id), 'Sorğu ləğv edildi')}
                        >
                          Ləğv et
                        </Button>
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      ) : (
        <div>
          <div className="mb-5 w-full sm:max-w-xs">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ad və ya istifadəçi adı..."
              icon={<IconSearch size={16} />}
              aria-label="Oyunçu axtar"
            />
          </div>

          {!query.trim() && (
            <p className="mb-4 text-sm text-ink-500">
              Tövsiyələr — dostlarınızın dostları
            </p>
          )}

          {searching ? (
            <ListSkeleton rows={4} />
          ) : discoverList.length === 0 ? (
            <Empty
              icon={<IconUsers size={20} />}
              title={query ? `"${query}" üzrə oyunçu tapılmadı` : 'Hələ tövsiyə yoxdur'}
              hint={query ? undefined : 'Dostlarınız çoxaldıqca burada yeni oyunçular görünəcək.'}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {discoverList.map((r) => (
                <DiscoverCard
                  key={r.player.id}
                  entry={r}
                  busy={busyId === r.player.id}
                  onAdd={() => sendRequest(r.player.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {challengeTarget && (
        <ChallengeModal
          opponent={challengeTarget}
          open
          defaultGameType={DEFAULT_GAME_TYPE}
          onClose={() => setChallengeTarget(null)}
        />
      )}
    </div>
  )
}

function FriendCard({
  player,
  busy,
  onChallenge,
  onRemove,
}: {
  player: PlayerSummary
  busy: boolean
  onChallenge: () => void
  onRemove: () => void
}) {
  return (
    <Card padded={false} interactive className="p-4">
      <div className="flex items-start gap-3">
        <Link to={`/players/${player.id}`} tabIndex={-1} aria-hidden>
          <Avatar name={player.fullName} color={player.avatarColor} src={player.avatarUrl} size={46} />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/players/${player.id}`}
            className="flex items-center gap-2 truncate font-semibold text-ink-900 transition-colors hover:text-felt-300"
          >
            <span className="truncate">{player.fullName}</span>
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="truncate text-xs text-ink-400">@{player.username}</span>
            <TierBadge tier={player.tier} className="shrink-0" />
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-display text-lg font-semibold leading-none tabular-nums text-felt-300">
            {player.rating}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-400">xal</div>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2">
        <Button variant="secondary" size="sm" block icon={<IconSwords size={15} />} onClick={onChallenge}>
          Dəvət göndər
        </Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={onRemove}>
          Sil
        </Button>
      </div>
    </Card>
  )
}

function DiscoverCard({
  entry,
  busy,
  onAdd,
}: {
  entry: PlayerWithFriendStatus
  busy: boolean
  onAdd: () => void
}) {
  const { player, friendStatus } = entry

  return (
    <Card padded={false} className="p-4">
      <div className="flex items-start gap-3">
        <Link to={`/players/${player.id}`} tabIndex={-1} aria-hidden>
          <Avatar name={player.fullName} color={player.avatarColor} src={player.avatarUrl} size={46} />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/players/${player.id}`}
            className="truncate font-semibold text-ink-900 transition-colors hover:text-felt-300"
          >
            {player.fullName}
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="truncate text-xs text-ink-400">@{player.username}</span>
            <TierBadge tier={player.tier} className="shrink-0" />
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-display text-lg font-semibold leading-none tabular-nums text-felt-300">
            {player.rating}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-400">xal</div>
        </div>
      </div>

      <div className="mt-3.5">
        {friendStatus === 'FRIENDS' ? (
          <Button variant="secondary" size="sm" block disabled>
            Artıq dostsunuz
          </Button>
        ) : friendStatus === 'PENDING_SENT' ? (
          <Button variant="ghost" size="sm" block disabled>
            Sorğu göndərilib
          </Button>
        ) : friendStatus === 'PENDING_RECEIVED' ? (
          <Button variant="secondary" size="sm" block disabled>
            Sizə sorğu göndərib — Sorğular bölməsinə keçin
          </Button>
        ) : (
          <Button size="sm" block loading={busy} icon={<IconUsers size={15} />} onClick={onAdd}>
            Dost əlavə et
          </Button>
        )}
      </div>
    </Card>
  )
}
