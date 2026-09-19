import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BootLoader } from './ui'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <BootLoader />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

/**
 * Yalnız ADMIN roluna açıq səhifə.
 *
 * Qoruma əsasən backend-dədir (`/api/admin/**` ADMIN tələb edir) — bu yalnız
 * naviqasiya gigiyenasıdır: admin olmayanı boş səhifəyə aparmaq əvəzinə geri göndərir.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <BootLoader />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

/**
 * Yalnız COACH roluna açıq səhifə — məşqçi paneli.
 *
 * `AdminRoute` kimi bu da naviqasiya gigiyenasıdır: əsl qoruma backend-dədir
 * (paket/sifariş əməliyyatlarında sahiblik service qatında yoxlanılır).
 * Məşqçi olmayan istifadəçi panel əvəzinə vitrinə göndərilir.
 */
export function CoachRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <BootLoader />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user.role !== 'COACH') return <Navigate to="/academy" replace />
  return <>{children}</>
}
