import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PageLoader } from './components/ui'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { VenueRegister } from './pages/VenueRegister'
import { Dashboard } from './pages/Dashboard'
import { Leaderboard } from './pages/Leaderboard'
import { Players } from './pages/Players'
import { PlayerProfile } from './pages/PlayerProfile'
import { Challenges } from './pages/Challenges'
import { Matches } from './pages/Matches'
import { Venues } from './pages/Venues'
import { VenueMine } from './pages/VenueMine'
import { VenueProfile } from './pages/VenueProfile'
import { Tournaments } from './pages/Tournaments'
import { TournamentDetail } from './pages/TournamentDetail'

/** Artıq daxil olmuş istifadəçini auth səhifələrindən yönləndirir */
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/venues/register" element={<PublicOnly><VenueRegister /></PublicOnly>} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:id" element={<PlayerProfile />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/venues/mine" element={<VenueMine />} />
        <Route path="/venues/:id" element={<VenueProfile />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
