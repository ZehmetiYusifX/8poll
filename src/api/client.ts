import axios from 'axios'

const TOKEN_KEY = 'eloabf_token'
/* Brend dəyişikliyindən əvvəlki açar — köçürüldükdən sonra silinə bilər */
const LEGACY_TOKEN_KEY = '8poll_token'

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) return token

  // Köhnə açarla girmiş istifadəçilər rebrenddən sonra çıxış etmiş olmasın
  const legacy = localStorage.getItem(LEGACY_TOKEN_KEY)
  if (legacy) {
    localStorage.setItem(TOKEN_KEY, legacy)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  }
  return legacy
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

// VITE_API_URL verilmese, Vite proxy vasitesile /api istifade olunur
// ?? yox, || - bos setir de ("VITE_API_URL=" kimi) fallback-e dusmelidir
const baseURL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({ baseURL })

// Backend-in kok unvani: "https://host/api" -> "https://host".
// Dev-de (baseURL = "/api") bos qalir, cunki Vite proxy /uploads-u ozu yonlendirir.
const mediaOrigin = /^https?:\/\//.test(baseURL) ? baseURL.replace(/\/api\/?$/, '') : ''

/** Backend-den gelen nisbi fayl yolunu (/uploads/...) tam URL-e cevirir */
export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  return mediaOrigin + path
}

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
