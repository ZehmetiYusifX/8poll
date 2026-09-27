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
import { useLanguage } from '../context/LanguageContext'
import { appCopy } from '../i18n/app'
import type { FriendRequest, PlayerSummary, PlayerWithFriendStatus } from '../api/types'

type Tab = 'friends' | 'requests' | 'discover'

export function Friends() {
  const toast = useToast()
  const { language } = useLanguage()
  const copy = appCopy[language].friends
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
      toast.success(copy.toastRequestSent)
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
    act(playerId, () => FriendApi.remove(playerId), copy.toastFriendRemoved)

  const pendingIncoming = incoming.length

  const discoverList = useMemo<PlayerWithFriendStatus[]>(() => {
    if (query.trim()) return results
    // Axtarış boşdursa "Tövsiyələr"i (dostların dostları) göstər
    return suggestions.map((p) => ({ player: p, friendStatus: 'NONE' as const }))
  }, [query, results, suggestions])

  return (
    <div>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
      />

      <Segmented
        className="mb-5"
        label={copy.sectionLabel}
        value={tab}
        onChange={setTab}
        items={[
          { value: 'friends', label: copy.tabFriends },
          { value: 'requests', label: copy.tabRequests, count: pendingIncoming },
          { value: 'discover', label: copy.tabDiscover },
        ]}
      />

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <Empty
            icon={<IconUsers size={20} />}
            title={copy.emptyFriendsTitle}
            hint={copy.emptyFriendsHint}
            action={<Button onClick={() => setTab('discover')} icon={<IconSearch size={16} />}>{copy.tabDiscover}</Button>}
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
            title={copy.emptyRequestsTitle}
            hint={copy.emptyRequestsHint}
          />
        ) : (
          <div className="space-y-6">
            {incoming.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-ink-700">{copy.incomingRequests}</h2>
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
                            onClick={() => act(r.id, () => FriendApi.accept(r.id), copy.toastFriendAdded)}
                          >
                            {copy.accept}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<IconX size={15} />}
                            disabled={busyId === r.id}
                            onClick={() => act(r.id, () => FriendApi.decline(r.id), copy.toastRequestDeclined)}
                          >
                            {copy.reject}
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
                <h2 className="mb-3 text-sm font-semibold text-ink-700">{copy.outgoingRequests}</h2>
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
                          onClick={() => act(r.receiver.id, () => FriendApi.remove(r.receiver.id), copy.toastRequestCancelled)}
                        >
                          {copy.cancel}
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
              placeholder={copy.searchPlaceholder}
              icon={<IconSearch size={16} />}
              aria-label={copy.searchLabel}
            />
          </div>

          {!query.trim() && (
            <p className="mb-4 text-sm text-ink-500">
              {copy.suggestionsHint}
            </p>
          )}

          {searching ? (
            <ListSkeleton rows={4} />
          ) : discoverList.length === 0 ? (
            <Empty
              icon={<IconUsers size={20} />}
              title={query ? copy.noSearchResults(query) : copy.emptySuggestions}
              hint={query ? undefined : copy.emptySuggestionsHint}
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
  const { language } = useLanguage()
  const copy = appCopy[language].friends
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
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-400">{copy.points}</div>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2">
        <Button variant="secondary" size="sm" block icon={<IconSwords size={15} />} onClick={onChallenge}>
          {copy.sendChallenge}
        </Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={onRemove}>
          {copy.remove}
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
  const { language } = useLanguage()
  const copy = appCopy[language].friends

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
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-400">{copy.points}</div>
        </div>
      </div>

      <div className="mt-3.5">
        {friendStatus === 'FRIENDS' ? (
          <Button variant="secondary" size="sm" block disabled>
            {copy.alreadyFriends}
          </Button>
        ) : friendStatus === 'PENDING_SENT' ? (
          <Button variant="ghost" size="sm" block disabled>
            {copy.requestSent}
          </Button>
        ) : friendStatus === 'PENDING_RECEIVED' ? (
          <Button variant="secondary" size="sm" block disabled>
            {copy.requestReceived}
          </Button>
        ) : (
          <Button size="sm" block loading={busy} icon={<IconUsers size={15} />} onClick={onAdd}>
            {copy.addFriend}
          </Button>
        )}
      </div>
    </Card>
  )
}
