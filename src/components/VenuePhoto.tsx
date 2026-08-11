import { mediaUrl } from '../api/client'
import { IconEightBall } from './icons'
import { cx } from './ui'

/**
 * Məkan şəkli — yoxdursa mahud yaşılı fon üzərində brend nişanı göstərir.
 * Boş şəkil xanası boz düzbucaqlı kimi görünməsin deyə.
 */
export function VenuePhoto({
  src,
  alt,
  className = '',
  rounded = '',
}: {
  src?: string | null
  alt: string
  className?: string
  rounded?: string
}) {
  const resolved = mediaUrl(src)

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cx('h-full w-full bg-wood-100 object-cover', rounded, className)}
      />
    )
  }

  return (
    <div
      className={cx('flex h-full w-full items-center justify-center bg-felt-800', rounded, className)}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 3px, transparent 3px 6px)',
      }}
      aria-hidden
    >
      <IconEightBall size={40} className="text-ink-950/70" />
    </div>
  )
}
