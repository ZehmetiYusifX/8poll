import { api } from './client'
import type {
  AuthResponse, Challenge, CreateChallengeRequest, GameType, LeaderboardEntry, League,
  LoginRequest, Match, Player, PlayerSummary, RegisterRequest, ReportMatchRequest,
  Venue, VenueRegisterRequest, UpdateVenueRequest,
  Tournament, TournamentDetail, CreateTournamentRequest, ReportResultRequest,
  GalleryAlbum, GalleryImage, UpdateGalleryImageRequest,
  Coach, CoachRegisterRequest, UpdateCoachRequest,
  CoachingLevel, LessonFormat, LessonPackage, LessonOrder,
  CreateLessonPackageRequest, UpdateLessonPackageRequest,
  CreateLessonOrderRequest, RespondOrderRequest,
  FriendRequest, PlayerWithFriendStatus,
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
  /** gameType verilsə, reytinq/səviyyə həmin intizama görə qayıdır */
  list: (q?: string, gameType?: GameType) =>
    api
      .get<PlayerSummary[]>('/players', {
        params: { ...(q ? { q } : {}), ...(gameType ? { gameType } : {}) },
      })
      .then((r) => r.data),
  get: (id: number) => api.get<Player>(`/players/${id}`).then((r) => r.data),
  matches: (id: number, gameType?: GameType) =>
    api
      .get<Match[]>(`/players/${id}/matches`, { params: gameType ? { gameType } : {} })
      .then((r) => r.data),
  updateMe: (body: { fullName?: string; bio?: string; avatarColor?: string }) =>
    api.put<Player>('/players/me', body).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post<Player>('/players/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  removeAvatar: () => api.delete<Player>('/players/me/avatar').then((r) => r.data),
}

// --- Qalereya (qonaq üçün açıq) ---
export const GalleryApi = {
  albums: () => api.get<GalleryAlbum[]>('/gallery').then((r) => r.data),
  byTournament: (tournamentId: number) =>
    api.get<GalleryImage[]>(`/gallery/tournaments/${tournamentId}`).then((r) => r.data),
}

// --- Admin paneli (yalnız ADMIN rolu) ---
export const AdminGalleryApi = {
  /** Gizlədilmiş şəkillər də daxil, ən yenisi əvvəldə */
  list: () => api.get<GalleryImage[]>('/admin/gallery').then((r) => r.data),
  upload: (file: File, meta: { title?: string; caption?: string; tournamentId?: number | null }) => {
    const fd = new FormData()
    fd.append('file', file)
    if (meta.title) fd.append('title', meta.title)
    if (meta.caption) fd.append('caption', meta.caption)
    if (meta.tournamentId != null) fd.append('tournamentId', String(meta.tournamentId))
    return api
      .post<GalleryImage>('/admin/gallery', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  update: (id: number, body: UpdateGalleryImageRequest) =>
    api.put<GalleryImage>(`/admin/gallery/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/admin/gallery/${id}`).then((r) => r.data),
  reorder: (imageIds: number[]) =>
    api.post<void>('/admin/gallery/reorder', { imageIds }).then((r) => r.data),
}

// --- Leaderboard ---
export const LeaderboardApi = {
  /**
   * Hər intizamın öz cədvəli var. league verilməsə bütün liqalar,
   * playerClass yalnız professional liqada nəzərə alınır.
   */
  get: (opts: { gameType?: GameType; league?: League; playerClass?: string; limit?: number } = {}) =>
    api
      .get<LeaderboardEntry[]>('/leaderboard', {
        params: {
          limit: opts.limit ?? 50,
          ...(opts.gameType ? { gameType: opts.gameType } : {}),
          ...(opts.league ? { league: opts.league } : {}),
          ...(opts.playerClass ? { playerClass: opts.playerClass } : {}),
        },
      })
      .then((r) => r.data),
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

// --- Coaches (məşqçilər) ---
export const CoachApi = {
  register: (body: CoachRegisterRequest) =>
    api.post<AuthResponse>('/coaches/register', body).then((r) => r.data),
  list: (opts: { q?: string; gameType?: GameType; venueId?: number } = {}) =>
    api
      .get<Coach[]>('/coaches', {
        params: {
          ...(opts.q ? { q: opts.q } : {}),
          ...(opts.gameType ? { gameType: opts.gameType } : {}),
          ...(opts.venueId ? { venueId: opts.venueId } : {}),
        },
      })
      .then((r) => r.data),
  get: (id: number) => api.get<Coach>(`/coaches/${id}`).then((r) => r.data),
  /** Öz məşqçi profili — COACH olmayanda 403 qaytarır */
  me: () => api.get<Coach>('/coaches/me').then((r) => r.data),
  updateMe: (body: UpdateCoachRequest) =>
    api.put<Coach>('/coaches/me', body).then((r) => r.data),
  packages: (id: number) =>
    api.get<LessonPackage[]>(`/coaches/${id}/packages`).then((r) => r.data),
}

// --- Akademiya (dərs paketləri və sifarişlər) ---
export const AcademyApi = {
  packages: (
    opts: {
      q?: string
      gameType?: GameType
      level?: CoachingLevel
      format?: LessonFormat
      venueId?: number
      maxPrice?: number
    } = {},
  ) =>
    api
      .get<LessonPackage[]>('/academy/packages', {
        params: {
          ...(opts.q ? { q: opts.q } : {}),
          ...(opts.gameType ? { gameType: opts.gameType } : {}),
          ...(opts.level ? { level: opts.level } : {}),
          ...(opts.format ? { format: opts.format } : {}),
          ...(opts.venueId ? { venueId: opts.venueId } : {}),
          ...(opts.maxPrice ? { maxPrice: opts.maxPrice } : {}),
        },
      })
      .then((r) => r.data),
  getPackage: (id: number) =>
    api.get<LessonPackage>(`/academy/packages/${id}`).then((r) => r.data),
  /** Məşqçi paneli — deaktiv paketlər də daxil */
  myPackages: () => api.get<LessonPackage[]>('/academy/packages/mine').then((r) => r.data),
  createPackage: (body: CreateLessonPackageRequest) =>
    api.post<LessonPackage>('/academy/packages', body).then((r) => r.data),
  updatePackage: (id: number, body: UpdateLessonPackageRequest) =>
    api.put<LessonPackage>(`/academy/packages/${id}`, body).then((r) => r.data),
  /** Paket silinmir, satışdan çıxarılır — mövcud sifarişlər qorunur */
  deactivatePackage: (id: number) =>
    api.delete<LessonPackage>(`/academy/packages/${id}`).then((r) => r.data),

  createOrder: (body: CreateLessonOrderRequest) =>
    api.post<LessonOrder>('/academy/orders', body).then((r) => r.data),
  myOrders: () => api.get<LessonOrder[]>('/academy/orders/mine').then((r) => r.data),
  receivedOrders: () => api.get<LessonOrder[]>('/academy/orders/received').then((r) => r.data),
  accept: (id: number, body?: RespondOrderRequest) =>
    api.post<LessonOrder>(`/academy/orders/${id}/accept`, body ?? {}).then((r) => r.data),
  decline: (id: number, body?: RespondOrderRequest) =>
    api.post<LessonOrder>(`/academy/orders/${id}/decline`, body ?? {}).then((r) => r.data),
  markPaid: (id: number) =>
    api.post<LessonOrder>(`/academy/orders/${id}/paid`).then((r) => r.data),
  complete: (id: number) =>
    api.post<LessonOrder>(`/academy/orders/${id}/complete`).then((r) => r.data),
  cancel: (id: number) =>
    api.post<LessonOrder>(`/academy/orders/${id}/cancel`).then((r) => r.data),
}

// --- Dostlar ---
export const FriendApi = {
  list: () => api.get<PlayerSummary[]>('/friends').then((r) => r.data),
  incoming: () => api.get<FriendRequest[]>('/friends/requests/incoming').then((r) => r.data),
  outgoing: () => api.get<FriendRequest[]>('/friends/requests/outgoing').then((r) => r.data),
  send: (receiverId: number) =>
    api.post<FriendRequest>('/friends/requests', { receiverId }).then((r) => r.data),
  accept: (id: number) => api.post<FriendRequest>(`/friends/requests/${id}/accept`).then((r) => r.data),
  decline: (id: number) => api.post<FriendRequest>(`/friends/requests/${id}/decline`).then((r) => r.data),
  remove: (playerId: number) => api.delete<void>(`/friends/${playerId}`).then((r) => r.data),
  suggestions: () => api.get<PlayerSummary[]>('/friends/suggestions').then((r) => r.data),
  search: (q?: string) =>
    api.get<PlayerWithFriendStatus[]>('/friends/search', { params: q ? { q } : {} }).then((r) => r.data),
}

// --- Admin təsdiqləri (yalnız ADMIN rolu) ---
export const AdminApprovalApi = {
  pendingCoaches: () => api.get<Coach[]>('/admin/approvals/coaches').then((r) => r.data),
  pendingVenues: () => api.get<Venue[]>('/admin/approvals/venues').then((r) => r.data),
  approveCoach: (id: number) => api.post<Coach>(`/admin/approvals/coaches/${id}/approve`).then((r) => r.data),
  rejectCoach: (id: number) => api.post<Coach>(`/admin/approvals/coaches/${id}/reject`).then((r) => r.data),
  approveVenue: (id: number) => api.post<Venue>(`/admin/approvals/venues/${id}/approve`).then((r) => r.data),
  rejectVenue: (id: number) => api.post<Venue>(`/admin/approvals/venues/${id}/reject`).then((r) => r.data),
}

// --- Matches ---
export const MatchApi = {
  report: (body: ReportMatchRequest) =>
    api.post<Match>('/matches', body).then((r) => r.data),
  confirm: (id: number) => api.post<Match>(`/matches/${id}/confirm`).then((r) => r.data),
  reject: (id: number) => api.post<Match>(`/matches/${id}/reject`).then((r) => r.data),
  mine: (gameType?: GameType) =>
    api.get<Match[]>('/matches/mine', { params: gameType ? { gameType } : {} }).then((r) => r.data),
  pending: () => api.get<Match[]>('/matches/pending').then((r) => r.data),
  recent: (limit = 20, gameType?: GameType) =>
    api
      .get<Match[]>('/matches/recent', { params: { limit, ...(gameType ? { gameType } : {}) } })
      .then((r) => r.data),
}
