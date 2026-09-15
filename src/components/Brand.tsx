import { Link } from 'react-router-dom'
import { EloabfMark } from './icons'
import { cx } from './ui'

/** Brendbukdakı slogan — başlıq və marketinq panellərində işlədilir */
export const SLOGAN = 'Dəqiq zərbə. Ölçülmüş qələbə.'

/**
 * Eloabf loqosu: nişan + söz-marka.
 * Söz-marka brendbukdakı kimi Montserrat ilə, sıx hərf aralığında yazılır.
 */
export function BrandLogo({
  size = 30,
  wordmark = true,
  className = '',
}: {
  size?: number
  wordmark?: boolean
  className?: string
}) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <EloabfMark size={size} />
      {wordmark && (
        <span
          className="font-display font-extrabold leading-none tracking-[-0.02em] text-ink-950"
          style={{ fontSize: size * 0.72 }}
        >
          Eloabf
        </span>
      )}
    </span>
  )
}

/** Ana səhifəyə aparan klik oluna bilən loqo */
export function BrandLink({
  size = 30,
  wordmark = true,
  className = '',
}: {
  size?: number
  wordmark?: boolean
  className?: string
}) {
  return (
    <Link
      to="/"
      aria-label="Eloabf — ana səhifə"
      className={cx('shrink-0 rounded-lg transition-opacity hover:opacity-85', className)}
    >
      <BrandLogo size={size} wordmark={wordmark} />
    </Link>
  )
}
