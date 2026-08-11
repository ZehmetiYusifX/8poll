// Kicik formatlama komekcileri

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Avatar ucun ada gore sabit reng.
 * Palitra isti/toxunmus tonlardan ibaretdir — kagiz-mahud dizayni ile uzlassin
 * ve krem ustunde ag metn oxunsun deye hamisi kifayet qeder tunddur.
 */
export const AVATAR_COLORS = [
  '#1c4d37', // mahud yasili
  '#8a6239', // qoz agaci
  '#932b21', // gil qirmizisi
  '#3d5a6d', // polad mavisi
  '#5b4b8a', // slive
  '#0f6b6b', // dəniz yasili
  '#97620d', // bal sarisi
  '#7a3b52', // sərab
  '#3f5b2e', // zeytun
  '#a1543a', // mis
]

export function fallbackColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek']

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** Tarix + saat — turnir baslangici kimi vaxt vacib olan yerler ucun */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(iso)}, ${hh}:${mm}`
}

export function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'indicə'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} dəq əvvəl`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} saat əvvəl`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'dünən'
  if (day < 30) return `${day} gün əvvəl`
  return formatDate(iso)
}

/** Gelecek tarixe qeder qalan vaxt — turnir basliyinda istifade olunur */
export function timeUntil(iso: string | null): string | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null
  const hr = Math.floor(diff / 3_600_000)
  if (hr < 1) return `${Math.max(1, Math.floor(diff / 60_000))} dəq sonra`
  if (hr < 24) return `${hr} saat sonra`
  return `${Math.floor(hr / 24)} gün sonra`
}

export function signed(n: number | null | undefined): string {
  if (n == null) return '—'
  return n > 0 ? `+${n}` : `${n}`
}
