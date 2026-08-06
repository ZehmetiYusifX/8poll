import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChallengeApi, MatchApi } from '../api'
import { Avatar } from './Avatar'

type NavItem = { to: string; label: string; end?: boolean; key?: 'challenges' | 'matches' }

const baseNav: NavItem[] = [
  { to: '/', label: 'Ana səhifə', end: true },
  { to: '/leaderboard', label: 'Reytinq' },
  { to: '/players', label: 'Oyunçular' },
  { to: '/venues', label: 'Məkanlar' },
  { to: '/tournaments', label: 'Turnirlər' },
  { to: '/challenges', label: 'Dəvətlər', key: 'challenges' },
  { to: '/matches', label: 'Maçlarım', key: 'matches' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navItems: NavItem[] = user?.role === 'VENUE_OWNER'
    ? [...baseNav, { to: '/venues/mine', label: 'Məkanım' }]
    : baseNav
  const navigate = useNavigate()
  const location = useLocation()
  const [challengeCount, setChallengeCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      try {
        const [incoming, pending] = await Promise.all([
          ChallengeApi.incoming(),
          MatchApi.pending(),
        ])
        if (!active) return
        setChallengeCount(incoming.filter((c) => c.status === 'PENDING').length)
        setMatchCount(pending.length)
      } catch {
        /* sessiz */
      }
    }
    load()
    const id = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [user, location.pathname])

  const badge = (key?: 'challenges' | 'matches') => {
    const n = key === 'challenges' ? challengeCount : key === 'matches' ? matchCount : 0
    if (!n) return null
    return (
      <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-wood-400 px-1.5 text-[11px] font-bold text-cream">
        {n}
      </span>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b-4 border-wood-600 bg-felt-800 shadow-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
          <Link to="/" className="flex items-center gap-2.5 pr-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 ring-2 ring-cream/80">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cream text-[11px] font-black text-ink-900">
                8
              </span>
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-cream">poll</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-felt-900 text-cream' : 'text-felt-100/80 hover:text-cream hover:bg-felt-700'
                  }`
                }
              >
                {item.label}
                {badge(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {user && (
              <>
                <Link
                  to={`/players/${user.id}`}
                  className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:bg-felt-700"
                >
                  <Avatar name={user.fullName} color={user.avatarColor} size={32} />
                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-semibold leading-tight text-cream">{user.username}</div>
                    <div className="text-xs leading-tight text-felt-200">{user.rating} xal</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-2.5 py-2 text-sm text-felt-100/80 transition hover:bg-felt-700 hover:text-cream"
                  title="Çıxış"
                >
                  Çıxış
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobil naviqasiya */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-felt-700 px-2 py-1.5 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-felt-900 text-cream' : 'text-felt-100/80'
                }`
              }
            >
              {item.label}
              {badge(item.key)}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="mt-8 border-t border-wood-200 py-6 text-center text-xs text-ink-400">
        8poll · Həvəskar bilyard reytinq platforması
      </footer>
    </div>
  )
}
