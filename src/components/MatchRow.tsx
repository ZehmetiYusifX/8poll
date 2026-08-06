import { Link } from 'react-router-dom'
import { Avatar } from './Avatar'
import { Badge } from './ui'
import { signed, timeAgo } from '../utils/format'
import type { Match } from '../api/types'

interface Props {
  match: Match
  viewerId: number
}

/**
 * Bir maçı verilmiş oyuncunun (viewerId) baxış bucağından göstərir.
 */
export function MatchRow({ match, viewerId }: Props) {
  const iAmReporter = match.reporter.id === viewerId
  const me = iAmReporter ? match.reporter : match.opponent
  const other = iAmReporter ? match.opponent : match.reporter
  const myScore = iAmReporter ? match.reporterScore : match.opponentScore
  const otherScore = iAmReporter ? match.opponentScore : match.reporterScore
  const myChange = iAmReporter ? match.reporterRatingChange : match.opponentRatingChange

  const outcome =
    match.winnerId == null ? 'draw' : match.winnerId === me.id ? 'win' : 'loss'

  const outcomeBadge =
    outcome === 'win' ? <Badge tone="green">Qələbə</Badge>
    : outcome === 'loss' ? <Badge tone="red">Məğlubiyyət</Badge>
    : <Badge tone="yellow">Heç-heçə</Badge>

  return (
    <div className="flex items-center gap-3 rounded-xl border border-wood-200/70 bg-card px-3 py-3 shadow-sm">
      <div
        className={`h-10 w-1.5 shrink-0 rounded-full ${
          outcome === 'win' ? 'bg-felt-600' : outcome === 'loss' ? 'bg-red-600' : 'bg-amber-500'
        }`}
      />
      <Link to={`/players/${other.id}`}>
        <Avatar name={other.fullName} color={other.avatarColor} size={40} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/players/${other.id}`} className="block truncate font-medium text-ink-900 hover:text-felt-700">
          {other.fullName}
        </Link>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>@{other.username}</span>
          <span>·</span>
          <span>{timeAgo(match.confirmedAt ?? match.createdAt)}</span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold tabular-nums text-ink-900">
          {myScore}
          <span className="mx-1 text-ink-400">:</span>
          {otherScore}
        </div>
        {match.status === 'CONFIRMED' ? (
          <div className="flex items-center justify-end gap-2">
            {outcomeBadge}
            {myChange != null && (
              <span className={`text-xs font-semibold ${myChange >= 0 ? 'text-felt-700' : 'text-red-600'}`}>
                {signed(myChange)}
              </span>
            )}
          </div>
        ) : match.status === 'PENDING' ? (
          <Badge tone="yellow">Təsdiq gözləyir</Badge>
        ) : (
          <Badge tone="neutral">Rədd edilib</Badge>
        )}
      </div>
    </div>
  )
}
