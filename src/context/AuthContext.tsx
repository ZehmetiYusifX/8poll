import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Player, LoginRequest, RegisterRequest } from '../api/types'
import { AuthApi } from '../api'
import { getToken, setToken } from '../api/client'

interface AuthState {
  user: Player | null
  loading: boolean
  login: (body: LoginRequest) => Promise<void>
  register: (body: RegisterRequest) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
  setUser: (u: Player) => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUserState(null)
      setLoading(false)
      return
    }
    try {
      const me = await AuthApi.me()
      setUserState(me)
    } catch {
      setToken(null)
      setUserState(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const login = async (body: LoginRequest) => {
    const res = await AuthApi.login(body)
    setToken(res.token)
    setUserState(res.player)
  }

  const register = async (body: RegisterRequest) => {
    const res = await AuthApi.register(body)
    setToken(res.token)
    setUserState(res.player)
  }

  const logout = () => {
    setToken(null)
    setUserState(null)
  }

  const value: AuthState = {
    user,
    loading,
    login,
    register,
    logout,
    refresh: loadMe,
    setUser: setUserState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider daxilinde istifade edilmelidir')
  return ctx
}
