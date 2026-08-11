import type { SVGProps } from 'react'

/**
 * Vahid ikon dəsti — 24x24 tor, 1.75 qalınlıqlı ştrix, yuvarlaq uclar.
 * Emoji əvəzinə bunlar istifadə olunur ki, ikonlar platformadan asılı olmasın.
 *
 * Bütün ikonlar `currentColor` ilə boyanır və default 20px-dir.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

/* ── Naviqasiya ──────────────────────────────────────────────── */

export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 10.2 12 3l9 7.2" />
    <path d="M5.5 9.4V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.4" />
    <path d="M9.5 21v-6h5v6" />
  </Svg>
)

export const IconTrophy = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4.5v1.5A3.5 3.5 0 0 0 8 11" />
    <path d="M17 6h2.5v1.5A3.5 3.5 0 0 1 16 11" />
    <path d="M12 14v3" />
    <path d="M8.5 21h7l-.7-2.4a1 1 0 0 0-1-.6h-3.6a1 1 0 0 0-1 .6L8.5 21Z" />
  </Svg>
)

export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M3 20c0-3.2 2.7-5.2 6-5.2s6 2 6 5.2" />
    <path d="M16.2 5.2a3.4 3.4 0 0 1 0 6.5" />
    <path d="M17.8 14.4c2 .7 3.2 2.3 3.2 4.4" />
  </Svg>
)

export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Svg>
)

export const IconSwords = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 14.5 20 20l1-4-4-1-2.5-2.5" />
    <path d="M3 4h4l10 10-3 3L4 7V4Z" />
    <path d="M9.5 14.5 4 20l-1-4 4-1 2.5-2.5" />
    <path d="M21 4h-4l-3.5 3.5" />
  </Svg>
)

export const IconTable = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15.5" cy="10" r="1.6" />
    <path d="M2.5 9h19M2.5 15h19" opacity=".35" />
  </Svg>
)

export const IconBuilding = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21V6.2a1 1 0 0 1 .7-1l7-2.1a1 1 0 0 1 1.3 1V21" />
    <path d="M13 9h6a1 1 0 0 1 1 1v11" />
    <path d="M2.5 21h19" />
    <path d="M7.5 8.5v0M7.5 12.5v0M7.5 16.5v0M16.5 13v0M16.5 17v0" />
  </Svg>
)

/* ── Əməliyyatlar ────────────────────────────────────────────── */

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconMinus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
)

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
)

export const IconX = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
)

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Svg>
)

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
)

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 9 7 7 7-7" />
  </Svg>
)

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
)

export const IconArrowUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 19V5" />
    <path d="m6 11 6-6 6 6" />
  </Svg>
)

export const IconArrowDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="m6 13 6 6 6-6" />
  </Svg>
)

export const IconPencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m14.5 6.5 3 3" />
  </Svg>
)

export const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 8 6 12l4 4" />
    <path d="M6 12h9" />
  </Svg>
)

export const IconImage = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <circle cx="8.5" cy="9.5" r="1.6" />
    <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L16 17" />
    <path d="m14 15 1.8-1.8a2 2 0 0 1 2.8 0L20.5 15" />
  </Svg>
)

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7" />
    <path d="M6.5 7 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
  </Svg>
)

export const IconPhone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 3.5h2l1.6 4-2 1.4a11.5 11.5 0 0 0 5 5l1.4-2 4 1.6v2a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
  </Svg>
)

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17" />
    <path d="M8 3v4M16 3v4" />
  </Svg>
)

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const IconEyeOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4.5 20 20.5" />
    <path d="M9.6 9.7A3 3 0 0 0 12 15c.8 0 1.6-.3 2.1-.9" />
    <path d="M6.4 7.1C4 8.7 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1" />
    <path d="M18.6 15.3c1.9-1.6 2.9-3.3 2.9-3.3S18 5.5 12 5.5c-.9 0-1.7.1-2.5.4" />
  </Svg>
)

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <path d="M12 7.8v.01" />
  </Svg>
)

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.3 3.9 2.6 17.3a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.5V14" />
    <path d="M12 17.3v.01" />
  </Svg>
)

export const IconMedal = (p: IconProps) => (
  <Svg {...p}>
    <path d="m7 3 3 6M17 3l-3 6" />
    <circle cx="12" cy="15" r="6" />
    <path d="m12 12.4 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z" />
  </Svg>
)

export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 10a6 6 0 1 1 12 0c0 3.5 1 5 1.6 5.8a.6.6 0 0 1-.5 1H4.9a.6.6 0 0 1-.5-1C5 15 6 13.5 6 10Z" />
    <path d="M10 20a2.2 2.2 0 0 0 4 0" />
  </Svg>
)

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)

/** 8 topu — brend nişanı üçün (dolu ikon, ştrix deyil) */
export function IconEightBall({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <circle cx="12" cy="12" r="5.4" fill="var(--color-cream)" />
      <text
        x="12"
        y="15.7"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="8"
        fontWeight="700"
        fill="var(--color-ink-950)"
      >
        8
      </text>
      <ellipse cx="8.4" cy="6.6" rx="2.8" ry="1.8" fill="#fff" opacity=".22" transform="rotate(-28 8.4 6.6)" />
    </svg>
  )
}
