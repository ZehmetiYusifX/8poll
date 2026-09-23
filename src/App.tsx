import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { AdminRoute, CoachRoute, ProtectedRoute } from './components/ProtectedRoute'
import { BootLoader } from './components/ui'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { VenueRegister } from './pages/VenueRegister'
import { Dashboard } from './pages/Dashboard'
import { Leaderboard } from './pages/Leaderboard'
import { Friends } from './pages/Friends'
import { PlayerProfile } from './pages/PlayerProfile'
import { Challenges } from './pages/Challenges'
import { Matches } from './pages/Matches'
import { Venues } from './pages/Venues'
import { VenueMine } from './pages/VenueMine'
import { VenueProfile } from './pages/VenueProfile'
import { Tournaments } from './pages/Tournaments'
import { TournamentDetail } from './pages/TournamentDetail'
import { Gallery } from './pages/Gallery'
import { AdminGallery } from './pages/AdminGallery'
import { AdminApprovals } from './pages/AdminApprovals'
import { Academy } from './pages/Academy'
import { PackageDetail } from './pages/PackageDetail'
import { Coaches } from './pages/Coaches'
import { CoachProfile } from './pages/CoachProfile'
import { CoachRegister } from './pages/CoachRegister'
import { CoachPanel } from './pages/CoachPanel'
import { MyCourses } from './pages/MyCourses'

/** Artıq daxil olmuş istifadəçini auth səhifələrindən yönləndirir */
function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <BootLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

/** Yalnız üzvə açıq səhifə — çərçivə daxilində qalır */
const member = (el: ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/venues/register" element={<PublicOnly><VenueRegister /></PublicOnly>} />
      <Route path="/coaches/register" element={<PublicOnly><CoachRegister /></PublicOnly>} />

      {/*
        Çərçivə həm qonaq, həm üzv üçün işləyir. Reytinq, oyunçu, məkan və
        turnir bölmələri backend-də də qonağa açıqdır — giriş tələb etmirik ki,
        platformanı görmək üçün əvvəlcə qeydiyyat şərti olmasın.
      */}
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/friends" element={member(<Friends />)} />
        <Route path="/players/:id" element={<PlayerProfile />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/venues/:id" element={<VenueProfile />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        <Route path="/gallery" element={<Gallery />} />

        {/* Akademiya vitrini backend-də də permitAll-dur — qonaq paketləri görə bilir */}
        <Route path="/academy" element={<Academy />} />
        <Route path="/academy/mine" element={member(<MyCourses />)} />
        <Route path="/academy/:id" element={<PackageDetail />} />
        <Route path="/coaches" element={<Coaches />} />
        <Route path="/coaches/panel" element={<CoachRoute><CoachPanel /></CoachRoute>} />
        <Route path="/coaches/:id" element={<CoachProfile />} />

        <Route path="/dashboard" element={member(<Dashboard />)} />
        <Route path="/challenges" element={member(<Challenges />)} />
        <Route path="/matches" element={member(<Matches />)} />
        <Route path="/venues/mine" element={member(<VenueMine />)} />

        <Route path="/admin/gallery" element={<AdminRoute><AdminGallery /></AdminRoute>} />
        <Route path="/admin/approvals" element={<AdminRoute><AdminApprovals /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
