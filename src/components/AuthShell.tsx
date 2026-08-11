import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconCheck, IconEightBall } from './icons'
import { BrassRule } from './ui'

/**
 * Giriş / qeydiyyat səhifələrinin ümumi karkası.
 * Böyük ekranlarda solda mahud yaşılı təqdimat paneli, sağda forma.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(28rem,34rem)]">
      <MarketingPanel />

      <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          {/* Kiçik ekranlarda brend başlıqda görünür */}
          <Link to="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
            <IconEightBall size={30} className="text-ink-950" />
            <span className="font-display text-2xl font-bold leading-none tracking-tight text-ink-950">
              poll
            </span>
          </Link>

          <h1 className="font-display text-[28px] font-semibold leading-tight text-ink-950">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
          <BrassRule className="my-6" />

          {children}

          {footer && <div className="mt-7 space-y-2.5 text-center text-sm text-ink-500">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

const HIGHLIGHTS = [
  'Hər təsdiqlənmiş oyun Elo reytinqinə yazılır',
  'Rəqib dəvət et, məkanı seç, nəticəni birlikdə təsdiqlə',
  'Klubların turnirlərinə qoşul, cədvəldə irəlilə',
]

function MarketingPanel() {
  return (
    <aside
      className="relative hidden flex-col justify-between overflow-hidden bg-felt-900 p-12 text-cream lg:flex"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 4px)',
      }}
    >
      {/* Küncdən düşən işıq */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 55% at 25% 0%, rgba(255,255,255,0.10) 0%, transparent 65%)',
        }}
      />

      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-3">
          <IconEightBall size={38} className="text-ink-950" />
          <span className="font-display text-3xl font-bold leading-none tracking-tight">poll</span>
        </Link>
      </div>

      <div className="relative max-w-md">
        <p className="font-display text-[34px] font-semibold leading-[1.15]">
          Hər partiya
          <br />
          reytinqə yazılır.
        </p>
        <ul className="mt-8 space-y-3.5">
          {HIGHLIGHTS.map((text) => (
            <li key={text} className="flex items-start gap-3 text-[15px] leading-snug text-felt-100/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wood-400/25 text-wood-200">
                <IconCheck size={13} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-end justify-between gap-6">
        <p className="text-xs text-felt-200/70">8poll · Həvəskar bilyard reytinq platforması</p>
        <BallRack />
      </div>

      {/* Sağ kənarda qoz ağacı rail */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[3px]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, #513826 0%, #8a6239 20%, #bd9663 50%, #8a6239 80%, #513826 100%)',
        }}
      />
    </aside>
  )
}

/** Dekorativ top piramidası — səhifəyə "klub" hissi verir */
function BallRack() {
  const rows = [
    [{ n: 1, c: '#c8a11e' }],
    [
      { n: 8, c: '#171b14' },
      { n: 3, c: '#932b21' },
    ],
    [
      { n: 6, c: '#0f6b6b' },
      { n: 2, c: '#3d5a6d' },
      { n: 5, c: '#a1543a' },
    ],
  ]

  return (
    <div aria-hidden className="flex shrink-0 flex-col items-center gap-1 opacity-80">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((ball) => (
            <span
              key={ball.n}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-cream shadow-sm"
              style={{
                backgroundColor: ball.c,
                boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.25), inset 0 -2px 3px rgba(0,0,0,0.3)',
              }}
            >
              <span className="flex h-3 w-3 items-center justify-center rounded-full bg-cream text-[8px] text-ink-950">
                {ball.n}
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
