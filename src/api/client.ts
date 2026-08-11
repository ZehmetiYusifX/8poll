import axios from 'axios'

const TOKEN_KEY = '8poll_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// VITE_API_URL verilmese, Vite proxy vasitesile /api istifade olunur
const baseURL = import.meta.env.VITE_API_URL ?? '/api'

export const api = axios.create({ baseURL })

// Her sorguya JWT elave et
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Backend-in xeta mesajini istifadeciye uygun sekilde cixar
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (err.response?.status === 401) return 'Sessiya bitib, yenidən daxil olun'
    if (err.response?.status === 403) return 'Bu əməliyyat üçün icazəniz yoxdur'
    if (err.code === 'ERR_NETWORK') return 'Server ilə əlaqə yoxdur. Backend işləyirmi?'
    return err.message
  }
  return 'Naməlum xəta baş verdi'
}
