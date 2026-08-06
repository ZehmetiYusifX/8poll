import { initials, fallbackColor } from '../utils/format'

interface Props {
  name: string
  color?: string | null
  size?: number
  className?: string
}

export function Avatar({ name, color, size = 40, className = '' }: Props) {
  const bg = color || fallbackColor(name)
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-inner ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.4 }}
      title={name}
    >
      {initials(name)}
    </div>
  )
}
