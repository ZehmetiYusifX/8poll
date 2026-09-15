import type { ReactNode } from 'react'
import { BrandLink, BrandLogo, SLOGAN } from './Brand'
import { IconCheck } from './icons'
import { GoldRule } from './ui'

/**
 * Giriş / qeydiyyat səhifələrinin ümumi karkası.
 * Böyük ekranlarda solda klub atmosferli təqdimat paneli, sağda forma.
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
          <BrandLink size={32} className="mb-8 block lg:hidden" />

          <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-0.01em] text-ink-950">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
          <GoldRule className="my-6" />

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

/**
 * Brendbukun foto istiqaməti: aşağı işıqlı klub zalı, kənarlar qaranlıq,
 * fokus masadadır. Mətn oxunsun deyə şəklin üstünə tünd qradient qoyulur.
 */
function MarketingPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-felt-950 p-12 text-ivory lg:flex">
      <img
        src="/brand/club-room.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.76) 45%, rgba(14,42,26,0.5) 100%)',
        }}
      />

      <div className="relative">
        <BrandLink size={40} />
      </div>

      <div className="relative max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
          {SLOGAN}
        </p>
        <p className="mt-4 font-display text-[36px] font-bold leading-[1.1] tracking-[-0.02em]">
          Hər partiya
          <br />
          reytinqə yazılır.
        </p>
        <ul className="mt-8 space-y-3.5">
          {HIGHLIGHTS.map((text) => (
            <li key={text} className="flex items-start gap-3 text-[15px] leading-snug text-ink-800">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
                <IconCheck size={13} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-end justify-between gap-6">
        <p className="text-xs text-ink-500">Bilyard reytinq və turnir platforması</p>
        <BrandLogo size={30} wordmark={false} className="opacity-90" />
      </div>

      {/* Sağ kənarda qızıl rail */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[2px]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, #3a2c15 0%, #866731 20%, #d7b56d 50%, #866731 80%, #3a2c15 100%)',
        }}
      />
    </aside>
  )
}
