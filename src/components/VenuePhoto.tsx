import { mediaUrl } from '../api/client'
import { EloabfMark } from './icons'
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
        className={cx('h-full w-full bg-gold-400/12 object-cover', rounded, className)}
      />
    )
  }

  return (
    <div
      className={cx(
        'felt-weave flex h-full w-full items-center justify-center bg-felt-900',
        rounded,
        className,
      )}
      aria-hidden
    >
      <EloabfMark size={40} plate={false} className="opacity-45" />
    </div>
  )
}
