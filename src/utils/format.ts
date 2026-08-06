// Kicik formatlama komekcileri

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function fallbackColor(seed: string): string {
  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316', '#14b8a6', '#eab308', '#ec4899']
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek']

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'indi'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} deq evvel`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} saat evvel`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} gun evvel`
  return formatDate(iso)
}

export function signed(n: number | null | undefined): string {
  if (n == null) return '—'
  return n > 0 ? `+${n}` : `${n}`
}
