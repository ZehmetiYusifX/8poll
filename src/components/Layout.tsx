import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChallengeApi, MatchApi } from '../api'
import { Avatar } from './Avatar'
import { BrandLink } from './Brand'
import { Count, buttonClass, cx } from './ui'
import { useLanguage } from '../context/LanguageContext'
import { landingCopy } from '../i18n/landing'
import { LanguageSwitcher } from './LanguageSwitcher'
import {
  IconAcademy,
  IconBuilding,
  IconChevronDown,
  EloabfMark,
  IconHome,
  IconImage,
  IconLogout,
  IconMedal,
  IconSwords,
  IconTable,
  IconTrophy,
  IconUsers,
} from './icons'

type CounterKey = 'challenges' | 'matches'

interface NavItem {
  to: string
  label: string
  short?: string
  icon: (p: { size?: number }) => ReactNode
  end?: boolean
  counter?: CounterKey
  /** Mobil alt paneldə göstərilsin */
  primary?: boolean
}

const POLL_MS = 30_000

export function Layout() {
  const { user, logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const landingText = landingCopy[language]
  const shell = landingText.shell

  const [counts, setCounts] = useState({ challenges: 0, matches: 0 })
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const publicNav: NavItem[] = [
    { to: '/leaderboard', label: shell.ranking, icon: IconTrophy, primary: true },
    { to: '/tournaments', label: shell.tournaments, short: shell.tournamentShort, icon: IconMedal },
    { to: '/academy', label: shell.academy, short: shell.lessonShort, icon: IconAcademy },
    { to: '/venues', label: shell.venues, short: shell.venueShort, icon: IconBuilding },
    { to: '/gallery', label: shell.gallery, short: shell.photoShort, icon: IconImage },
  ]

  const memberNav: NavItem[] = [
    { to: '/friends', label: shell.players, short: shell.playerShort, icon: IconUsers, primary: true },
    { to: '/challenges', label: shell.challenges, short: shell.challengeShort, icon: IconSwords, counter: 'challenges', primary: true },
    { to: '/matches', label: shell.matches, short: shell.matchesShort, icon: IconTable, counter: 'matches', primary: true },
  ]

  const home: NavItem = user
    ? { to: '/dashboard', label: shell.dashboard, short: shell.dashboard, icon: IconHome, end: true, primary: true }
    : { to: '/', label: shell.home, short: shell.homeShort, icon: IconHome, end: true, primary: true }

  const navItems: NavItem[] = user
    ? [
        home,
        ...publicNav,
        ...memberNav,
        ...(user.role === 'VENUE_OWNER' ? [{ to: '/venues/mine', label: shell.myVenue, icon: IconBuilding }] : []),
        ...(user.role === 'COACH'
          ? [
              { to: '/coaches/panel', label: shell.coachPanel, icon: IconAcademy },
              { to: '/academy/mine', label: shell.courses, icon: IconAcademy },
            ]
          : []),
      ]
    : // Qonaqda üzvə aid bölmə yoxdur, ona görə açıq bölmələr alt panelə sığır
      [home, ...publicNav.map((i) => ({ ...i, primary: true }))]

  // Gələn dəvət / təsdiq gözləyən maç sayğacları
  useEffect(() => {
    if (!user) return
    let active = true

    const load = async () => {
      try {
        const [incoming, pending] = await Promise.all([ChallengeApi.incoming(), MatchApi.pending()])
        if (!active) return
        setCounts({
          challenges: incoming.filter((c) => c.status === 'PENDING').length,
          matches: pending.length,
        })
      } catch {
        /* sayğaclar kritik deyil — səssiz keçirik */
      }
    }

    load()
    const id = setInterval(load, POLL_MS)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [user, location.pathname])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // İstifadəçi menyusunu kənara klik və Escape ilə bağla
  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => setMenuOpen(false), [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const countOf = (key?: CounterKey) => (key ? counts[key] : 0)
  const primaryItems = navItems.filter((i) => i.primary)
  const secondaryItems = navItems.filter((i) => !i.primary)

  return (
    <div className="flex min-h-dvh flex-col">
      <LanguageSwitcher language={language} setLanguage={setLanguage} label={landingText.languageLabel} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        {shell.skip}
      </a>

      {/*
        Başlıq klub zalının tavanı kimi işləyir: mahud yaşılı səth və
        yuxarıdan düşən zəif spot işığı. Altındakı qızıl xətt masanın railıdır.
      */}
      <header className="felt-weave sticky top-0 z-40 bg-felt-950 pt-[env(safe-area-inset-top)] shadow-lg">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 150% at 50% -35%, rgba(215,181,109,0.13) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-1 px-4">
          <BrandLink to={home.to} />

          <nav aria-label={shell.nav} className="ml-6 hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cx(
                    'relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-black/30 text-ivory edge-light'
                      : 'text-felt-100/70 hover:bg-white/6 hover:text-ivory',
                  )
                }
              >
                {item.label}
                <Count value={countOf(item.counter)} className="bg-gold-400 text-felt-950" />
              </NavLink>
            ))}
          </nav>

          {!user && (
            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/login"
                className={buttonClass('ghost', 'sm', 'text-felt-100/80 hover:bg-white/10 hover:text-ivory')}
              >
                {shell.login}
              </Link>
              <Link to="/register" className={buttonClass('gold', 'sm')}>
                {shell.register}
              </Link>
            </div>
          )}

          {user && (
            <div ref={menuRef} className="relative ml-auto">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`${user.username} — ${shell.accountMenu}`}
                className={cx(
                  'flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors duration-150 sm:pr-3',
                  menuOpen ? 'bg-white/10' : 'hover:bg-white/6',
                )}
              >
                <Avatar name={user.fullName} color={user.avatarColor} src={user.avatarUrl} size={32} ring="light" />
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-[13px] font-semibold text-ivory">{user.username}</span>
                  {/* Reytinq qızıl rənglə — brendbukda "Winner Gold" nəticə rəngidir */}
                  <span className="block text-[11px] font-semibold tabular-nums text-gold-400">
                    {user.rating} {shell.points}
                  </span>
                </span>
                <IconChevronDown
                  size={16}
                  className={cx('text-felt-200/70 transition-transform duration-200', menuOpen && 'rotate-180')}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-60 overflow-hidden rounded-xl border border-rail bg-card shadow-xl animate-pop"
                >
                  <Link
                    to={`/players/${user.id}`}
                    role="menuitem"
                    className="flex items-center gap-3 border-b border-rail px-3.5 py-3 transition-colors hover:bg-cream"
                  >
                    <Avatar name={user.fullName} color={user.avatarColor} src={user.avatarUrl} size={38} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-900">
                        {user.fullName}
                      </span>
                      <span className="block truncate text-xs text-ink-500">{shell.viewProfile}</span>
                    </span>
                  </Link>

                  {/* Kiçik ekranlarda alt panelə sığmayan bölmələr */}
                  <div className="py-1 md:hidden">
                    {secondaryItems.map((item) => (
                      <MenuLink key={item.to} to={item.to} icon={<item.icon size={17} />}>
                        {item.label}
                      </MenuLink>
                    ))}
                  </div>

                  {/* Admin bölməsi naviqasiya zolağını doldurmasın deyə yalnız menyudadır */}
                  {user.role === 'ADMIN' && (
                    <div className="border-t border-rail py-1">
                      <MenuLink to="/admin/gallery" icon={<IconImage size={17} />}>
                        {shell.galleryAdmin}
                      </MenuLink>
                      <MenuLink to="/admin/approvals" icon={<IconUsers size={17} />}>
                        {shell.pendingApprovals}
                      </MenuLink>
                    </div>
                  )}

                  <div className="border-t border-rail py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-clay-300 transition-colors hover:bg-clay-500/12"
                    >
                      <IconLogout size={17} />
                      {shell.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Qızıl haşiyə — bilyard masasının railı */}
        <div
          aria-hidden
          className="relative h-[2px] w-full"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #3a2c15 0%, #866731 18%, #d7b56d 50%, #866731 82%, #3a2c15 100%)',
          }}
        />

        {/* Orta ölçülü ekranlarda ikinci sıra naviqasiya */}
        <nav
          aria-label={shell.sections}
          className="no-scrollbar hidden gap-1 overflow-x-auto border-b border-rail bg-cream px-4 py-2 md:flex lg:hidden"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-felt-500/16 text-felt-300' : 'text-ink-600 hover:bg-gold-400/12',
                )
              }
            >
              {item.label}
              <Count value={countOf(item.counter)} className="bg-gold-400/30 text-gold-300" />
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-7">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-rail px-4 pb-24 pt-8 text-center md:pb-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2.5">
          <EloabfMark size={26} plate={false} />
          <p className="font-display text-[13px] font-semibold tracking-[0.02em] text-ink-700">
            Eloabf
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold-400/70">{landingText.slogan}</p>
          <p className="text-xs text-ink-400">{shell.footer}</p>
        </div>
      </footer>

      {/* Mobil alt naviqasiya */}
      <nav
        aria-label={shell.nav}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-rail bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        {/* Sütun sayı dəyişkəndir: qonaqda və üzvdə fərqli sayda bölmə görünür */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${primaryItems.length}, minmax(0, 1fr))` }}
        >
          {primaryItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  'relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-gold-400' : 'text-ink-400',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={cx(
                      'absolute top-0 h-0.5 w-10 rounded-full transition-opacity duration-200',
                      isActive ? 'bg-gold-400 opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="relative">
                    <item.icon size={21} />
                    {countOf(item.counter) > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-500 px-1 text-[10px] font-bold text-ivory ring-2 ring-card">
                        {countOf(item.counter)}
                      </span>
                    )}
                  </span>
                  {item.short ?? item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function MenuLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      to={to}
      role="menuitem"
      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-700 transition-colors hover:bg-cream hover:text-ink-900"
    >
      <span className="text-ink-400">{icon}</span>
      {children}
    </Link>
  )
}
