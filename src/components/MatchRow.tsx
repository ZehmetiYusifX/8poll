import { Link } from 'react-router-dom'
import { Avatar } from './Avatar'
import { Badge, cx } from './ui'
import { IconArrowDown, IconArrowUp, IconPin } from './icons'
import { signed, timeAgo } from '../utils/format'
import type { Match } from '../api/types'

interface Props {
  match: Match
  viewerId: number
  /** Rəqibin adının yanında məkanı da göstər */
  showVenue?: boolean
}

type Outcome = 'win' | 'loss' | 'draw'

const accent: Record<Outcome, string> = {
  win: 'bg-felt-600',
  loss: 'bg-clay-600',
  draw: 'bg-honey-600',
}

/**
 * Bir maçı verilmiş oyunçunun (viewerId) baxış bucağından göstərir.
 * Sol kənardakı rəngli zolaq nəticəni bir baxışda oxunaqlı edir.
 */
export function MatchRow({ match, viewerId, showVenue = true }: Props) {
  const iAmReporter = match.reporter.id === viewerId
  const me = iAmReporter ? match.reporter : match.opponent
  const other = iAmReporter ? match.opponent : match.reporter
  const myScore = iAmReporter ? match.reporterScore : match.opponentScore
  const otherScore = iAmReporter ? match.opponentScore : match.reporterScore
  const myChange = iAmReporter ? match.reporterRatingChange : match.opponentRatingChange

  const outcome: Outcome =
    match.winnerId == null ? 'draw' : match.winnerId === me.id ? 'win' : 'loss'

  const settled = match.status === 'CONFIRMED'

  return (
    <div className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-rail bg-card py-3 pl-4 pr-3.5 shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-rail-strong hover:shadow-sm">
      <span
        aria-hidden
        className={cx(
          'absolute inset-y-0 left-0 w-1',
          settled ? accent[outcome] : 'bg-rail-strong',
        )}
      />

      <Link to={`/players/${other.id}`} className="shrink-0" tabIndex={-1} aria-hidden>
        <Avatar name={other.fullName} color={other.avatarColor} size={40} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/players/${other.id}`}
          className="block truncate font-medium text-ink-900 transition-colors hover:text-felt-700"
        >
          {other.fullName}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-400">
          <span className="truncate">@{other.username}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(match.confirmedAt ?? match.createdAt)}</span>
          {showVenue && match.venue && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-0.5 truncate">
                <IconPin size={12} />
                {match.venue.name}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div
          className={cx(
            'font-display text-lg font-semibold tabular-nums',
            settled && outcome === 'win' && 'text-felt-700',
            settled && outcome === 'loss' && 'text-clay-700',
            (!settled || outcome === 'draw') && 'text-ink-700',
          )}
        >
          {myScore}
          <span className="mx-0.5 font-normal text-ink-300">–</span>
          {otherScore}
        </div>

        {settled ? (
          myChange != null ? (
            <RatingDelta value={myChange} />
          ) : null
        ) : match.status === 'PENDING' ? (
          <Badge tone="yellow">Gözləyir</Badge>
        ) : (
          <Badge tone="neutral">Rədd edilib</Badge>
        )}
      </div>
    </div>
  )
}

/** Reytinq dəyişikliyi — ox + rəqəm */
export function RatingDelta({ value, className = '' }: { value: number; className?: string }) {
  const up = value >= 0
  return (
    <span
      className={cx(
        'inline-flex min-w-[3.25rem] items-center justify-center gap-0.5 rounded-md px-1.5 py-1',
        'text-xs font-bold tabular-nums',
        up ? 'bg-felt-50 text-felt-700' : 'bg-clay-50 text-clay-700',
        className,
      )}
      title={`Reytinq dəyişikliyi: ${signed(value)}`}
    >
      {up ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
      {Math.abs(value)}
    </span>
  )
}
