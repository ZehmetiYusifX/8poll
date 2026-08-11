import type { ReactNode } from 'react'
import { cx } from './ui'

export type ActionTone = 'confirm' | 'challenge' | 'neutral'

const accent: Record<ActionTone, string> = {
  confirm: 'bg-honey-600',
  challenge: 'bg-felt-500',
  neutral: 'bg-rail-strong',
}

const badgeBg: Record<ActionTone, string> = {
  confirm: 'bg-honey-600',
  challenge: 'bg-felt-600',
  neutral: 'bg-ink-400',
}

/**
 * Cavab gözləyən element üçün ortaq kart: sol kənarda rəngli zolaq,
 * solda avatar (üstündə kiçik nişan), sağda əməliyyat düymələri.
 */
export function ActionCard({
  avatar,
  badge,
  title,
  meta,
  note,
  actions,
  tone = 'neutral',
}: {
  avatar: ReactNode
  /** Avatarın küncündəki kiçik ikon */
  badge?: ReactNode
  title: ReactNode
  meta?: ReactNode
  note?: string | null
  actions?: ReactNode
  tone?: ActionTone
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-rail bg-card p-4 shadow-xs">
      <span aria-hidden className={cx('absolute inset-y-0 left-0 w-1', accent[tone])} />

      <div className="flex flex-col gap-3.5 pl-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="relative shrink-0">
            {avatar}
            {badge && (
              <span
                className={cx(
                  'absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full text-cream ring-2 ring-card',
                  badgeBg[tone],
                )}
              >
                {badge}
              </span>
            )}
          </span>

          <div className="min-w-0">
            <div className="text-sm text-ink-800">{title}</div>
            {meta && (
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-400">
                {meta}
              </div>
            )}
            {note && (
              <p className="mt-2 border-l-2 border-rail-strong pl-2.5 text-sm italic text-ink-600">
                {note}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[3.25rem] sm:pl-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
