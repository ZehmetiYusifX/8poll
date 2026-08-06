// Backend DTO-larinin TypeScript qarsiliqlari

export type ChallengeStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED'

export type MatchStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

export type ChallengeDirection = 'INCOMING' | 'OUTGOING'

export type Role = 'PLAYER' | 'VENUE_OWNER'

export type TournamentStatus = 'REGISTRATION' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export type BracketMatchStatus = 'PENDING' | 'READY' | 'COMPLETED'

export interface Player {
  id: number
  username: string
  fullName: string
  email: string
  bio: string | null
  avatarColor: string | null
  role: Role
  rating: number
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  winRate: number
  createdAt: string
}

export interface PlayerSummary {
  id: number
  username: string
  fullName: string
  avatarColor: string | null
  rating: number
  gamesPlayed: number
  wins: number
  losses: number
}

export interface LeaderboardEntry {
  rank: number
  player: PlayerSummary
}

export interface VenueSummary {
  id: number
  name: string
  address: string | null
  coverUrl: string | null
}

export interface Venue {
  id: number
  name: string
  address: string | null
  description: string | null
  phone: string | null
  owner: PlayerSummary
  photoUrls: string[]
  createdAt: string
}

export interface Challenge {
  id: number
  challenger: PlayerSummary
  opponent: PlayerSummary
  venue: VenueSummary | null
  message: string | null
  status: ChallengeStatus
  direction: ChallengeDirection
  createdAt: string
  respondedAt: string | null
}

export interface Match {
  id: number
  reporter: PlayerSummary
  opponent: PlayerSummary
  venue: VenueSummary | null
  reporterScore: number
  opponentScore: number
  winnerId: number | null
  status: MatchStatus
  reporterRatingChange: number | null
  opponentRatingChange: number | null
  reporterRatingAfter: number | null
  opponentRatingAfter: number | null
  createdAt: string
  confirmedAt: string | null
}

export interface AuthResponse {
  token: string
  player: Player
}

export interface RegisterRequest {
  username: string
  email: string
  fullName?: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface CreateChallengeRequest {
  opponentId: number
  message?: string
  venueId?: number | null
}

// --- Venues ---
export interface VenueRegisterRequest {
  username: string
  email: string
  password: string
  venueName: string
  address?: string
  description?: string
  phone?: string
}

export interface UpdateVenueRequest {
  name?: string
  address?: string
  description?: string
  phone?: string
}

// --- Tournaments ---
export interface Tournament {
  id: number
  name: string
  description: string | null
  venue: VenueSummary
  owner: PlayerSummary
  startAt: string | null
  maxParticipants: number
  participantCount: number
  status: TournamentStatus
  winner: PlayerSummary | null
  createdAt: string
}

export interface BracketMatch {
  id: number
  round: number
  position: number
  player1: PlayerSummary | null
  player2: PlayerSummary | null
  player1Score: number | null
  player2Score: number | null
  winnerId: number | null
  status: BracketMatchStatus
  nextMatchId: number | null
}

export interface TournamentDetail {
  tournament: Tournament
  participants: PlayerSummary[]
  bracket: BracketMatch[]
}

export interface CreateTournamentRequest {
  name: string
  venueId: number
  description?: string
  startAt?: string | null
  maxParticipants?: number
}

export interface ReportResultRequest {
  player1Score: number
  player2Score: number
}

export interface ReportMatchRequest {
  opponentId: number
  myScore: number
  opponentScore: number
  challengeId?: number | null
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
}
