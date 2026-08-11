import { initials, fallbackColor } from '../utils/format'
import { cx } from './ui'

interface Props {
  name: string
  color?: string | null
  size?: number
  /** Tünd fonlarda (header) kontrast üçün nazik halqa */
  ring?: 'none' | 'light' | 'brass'
  className?: string
}

const ringClass = {
  none: '',
  light: 'ring-2 ring-cream/85',
  brass: 'ring-2 ring-wood-300',
}

export function Avatar({ name, color, size = 40, ring = 'none', className = '' }: Props) {
  const bg = color || fallbackColor(name)
  return (
    <span
      className={cx(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
        'font-semibold leading-none tracking-tight text-white',
        ringClass[ring],
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: Math.max(10, Math.round(size * 0.38)),
      }}
      title={name}
      aria-hidden
    >
      {/* Yuxarıdan gələn incə işıq — düz rəng "yastı" görünməsin */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.12) 100%)',
        }}
      />
      <span className="relative">{initials(name)}</span>
    </span>
  )
}
