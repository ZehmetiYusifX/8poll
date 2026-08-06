import { api } from './client'
import type {
  AuthResponse, Challenge, CreateChallengeRequest, LeaderboardEntry,
  LoginRequest, Match, Player, PlayerSummary, RegisterRequest, ReportMatchRequest,
  Venue, VenueRegisterRequest, UpdateVenueRequest,
  Tournament, TournamentDetail, CreateTournamentRequest, ReportResultRequest,
} from './types'

// --- Auth ---
export const AuthApi = {
  register: (body: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  login: (body: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  me: () => api.get<Player>('/auth/me').then((r) => r.data),
}

// --- Players ---
export const PlayerApi = {
  list: (q?: string) =>
    api.get<PlayerSummary[]>('/players', { params: q ? { q } : {} }).then((r) => r.data),
  get: (id: number) => api.get<Player>(`/players/${id}`).then((r) => r.data),
  matches: (id: number) => api.get<Match[]>(`/players/${id}/matches`).then((r) => r.data),
  updateMe: (body: { fullName?: string; bio?: string; avatarColor?: string }) =>
    api.put<Player>('/players/me', body).then((r) => r.data),
}

// --- Leaderboard ---
export const LeaderboardApi = {
  get: (limit = 50) =>
    api.get<LeaderboardEntry[]>('/leaderboard', { params: { limit } }).then((r) => r.data),
}

// --- Challenges ---
export const ChallengeApi = {
  create: (body: CreateChallengeRequest) =>
    api.post<Challenge>('/challenges', body).then((r) => r.data),
  incoming: () => api.get<Challenge[]>('/challenges/incoming').then((r) => r.data),
  outgoing: () => api.get<Challenge[]>('/challenges/outgoing').then((r) => r.data),
  accept: (id: number) => api.post<Challenge>(`/challenges/${id}/accept`).then((r) => r.data),
  decline: (id: number) => api.post<Challenge>(`/challenges/${id}/decline`).then((r) => r.data),
  cancel: (id: number) => api.post<Challenge>(`/challenges/${id}/cancel`).then((r) => r.data),
}

// --- Venues (məkanlar) ---
export const VenueApi = {
  register: (body: VenueRegisterRequest) =>
    api.post<AuthResponse>('/venues/register', body).then((r) => r.data),
  list: (q?: string) =>
    api.get<Venue[]>('/venues', { params: q ? { q } : {} }).then((r) => r.data),
  get: (id: number) => api.get<Venue>(`/venues/${id}`).then((r) => r.data),
  mine: () => api.get<Venue[]>('/venues/mine').then((r) => r.data),
  update: (id: number, body: UpdateVenueRequest) =>
    api.put<Venue>(`/venues/${id}`, body).then((r) => r.data),
  uploadPhoto: (id: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post<Venue>(`/venues/${id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  removePhoto: (id: number, url: string) =>
    api.delete<Venue>(`/venues/${id}/photos`, { params: { url } }).then((r) => r.data),
}

// --- Tournaments (turnirlər) ---
export const TournamentApi = {
  list: () => api.get<Tournament[]>('/tournaments').then((r) => r.data),
  get: (id: number) => api.get<TournamentDetail>(`/tournaments/${id}`).then((r) => r.data),
  create: (body: CreateTournamentRequest) =>
    api.post<Tournament>('/tournaments', body).then((r) => r.data),
  join: (id: number) => api.post<void>(`/tournaments/${id}/join`).then((r) => r.data),
  leave: (id: number) => api.post<void>(`/tournaments/${id}/leave`).then((r) => r.data),
  start: (id: number) =>
    api.post<TournamentDetail>(`/tournaments/${id}/start`).then((r) => r.data),
  reportResult: (id: number, matchId: number, body: ReportResultRequest) =>
    api.post<TournamentDetail>(`/tournaments/${id}/matches/${matchId}/result`, body).then((r) => r.data),
}

// --- Matches ---
export const MatchApi = {
  report: (body: ReportMatchRequest) =>
    api.post<Match>('/matches', body).then((r) => r.data),
  confirm: (id: number) => api.post<Match>(`/matches/${id}/confirm`).then((r) => r.data),
  reject: (id: number) => api.post<Match>(`/matches/${id}/reject`).then((r) => r.data),
  mine: () => api.get<Match[]>('/matches/mine').then((r) => r.data),
  pending: () => api.get<Match[]>('/matches/pending').then((r) => r.data),
  recent: (limit = 20) =>
    api.get<Match[]>('/matches/recent', { params: { limit } }).then((r) => r.data),
}
