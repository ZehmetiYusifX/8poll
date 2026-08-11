interface Props {
  values: number[]
  width?: number
  height?: number
  className?: string
  /** Xəttin rəngi — verilməzsə son dəyişikliyin istiqamətinə görə seçilir */
  tone?: 'win' | 'loss' | 'neutral'
}

/**
 * Kitabxanasız kiçik reytinq qrafiki.
 * 2-dən az nöqtə olduqda heç nə göstərmir — yalançı "trend" yaratmasın.
 */
export function Sparkline({ values, width = 132, height = 38, className = '', tone }: Props) {
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = 3

  const x = (i: number) => (i / (values.length - 1)) * (width - pad * 2) + pad
  const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2)

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(values.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`

  const direction = tone ?? (values[values.length - 1] >= values[0] ? 'win' : 'loss')
  const stroke =
    direction === 'win'
      ? 'var(--color-felt-400)'
      : direction === 'loss'
        ? 'var(--color-clay-500)'
        : 'var(--color-ink-400)'

  const gradientId = `spark-${direction}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={`Reytinq gedişatı: ${values[0]} → ${values[values.length - 1]}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="2.75" fill={stroke} />
    </svg>
  )
}
