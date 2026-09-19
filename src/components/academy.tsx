import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Avatar } from './Avatar'
import { Badge, Card, Segmented, Skeleton, cx } from './ui'
import { IconClock, IconPin, IconUsers } from './icons'
import { GAME_TYPE_LABEL } from '../constants/gameTypes'
import { FORMAT_LABEL, LEVEL_LABEL, formatPrice } from '../constants/academy'
import type { LessonPackage } from '../api/types'

/**
 * Akademiyanın iki üzü — dərs paketləri və məşqçilər — eyni bölmənin
 * hissəsidir, ona görə naviqasiyada ayrıca sətir tutmur: keçid buradandır.
 */
export function AcademyTabs({ value }: { value: 'packages' | 'coaches' }) {
  const navigate = useNavigate()
  return (
    <Segmented
      className="mb-5"
      label="Akademiya bölməsi"
      value={value}
      onChange={(v) => navigate(v === 'packages' ? '/academy' : '/coaches')}
      items={[
        { value: 'packages', label: 'Dərs paketləri' },
        { value: 'coaches', label: 'Məşqçilər' },
      ]}
    />
  )
}

/** Paketin quru faktları — kartda və detal səhifəsində eyni sırada oxunur */
export function PackageMeta({ pkg, className = '' }: { pkg: LessonPackage; className?: string }) {
  return (
    <div className={cx('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400', className)}>
      <span className="text-ink-500">{GAME_TYPE_LABEL[pkg.gameType]}</span>
      <Dot />
      <span>{LEVEL_LABEL[pkg.level]}</span>
      <Dot />
      <span className="inline-flex items-center gap-1">
        {pkg.format === 'GROUP' ? <IconUsers size={12} /> : null}
        {FORMAT_LABEL[pkg.format]}
        {pkg.format === 'GROUP' && pkg.groupSize ? ` · ${pkg.groupSize} nəfər` : ''}
      </span>
      <Dot />
      <span className="inline-flex items-center gap-1 tabular-nums">
        <IconClock size={12} />
        {pkg.lessonCount} dərs × {pkg.lessonMinutes} dəq
      </span>
    </div>
  )
}

function Dot() {
  return <span aria-hidden>·</span>
}

export function PackageCard({ pkg, footer }: { pkg: LessonPackage; footer?: ReactNode }) {
  return (
    <Card interactive={!footer} className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-display text-base font-semibold text-ink-900">
          <Link to={`/academy/${pkg.id}`} className="transition-colors hover:text-felt-300">
            {pkg.title}
          </Link>
        </h3>
        {!pkg.active && <Badge tone="neutral">Satışda deyil</Badge>}
      </div>

      <PackageMeta pkg={pkg} className="mt-2" />

      {pkg.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">{pkg.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-rail pt-3.5">
        <Link
          to={`/coaches/${pkg.coach.id}`}
          className="flex min-w-0 items-center gap-2 text-sm text-ink-600 transition-colors hover:text-ink-900"
        >
          <Avatar
            name={pkg.coach.player.fullName}
            color={pkg.coach.player.avatarColor}
            src={pkg.coach.player.avatarUrl}
            size={28}
          />
          <span className="truncate">{pkg.coach.player.fullName}</span>
        </Link>
        <span className="shrink-0 font-display text-lg font-semibold tabular-nums text-gold-300">
          {formatPrice(pkg.price)}
        </span>
      </div>

      {pkg.venue && (
        <p className="mt-2 flex items-center gap-1 truncate text-xs text-ink-400">
          <IconPin size={12} className="shrink-0" />
          {pkg.venue.name}
        </p>
      )}

      {footer && <div className="mt-4 flex flex-wrap items-center gap-2">{footer}</div>}
    </Card>
  )
}

export function PackageGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-rail bg-card p-5">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
