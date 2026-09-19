// Backend DTO-larinin TypeScript qarsiliqlari

export type ChallengeStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED'

export type MatchStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

export type ChallengeDirection = 'INCOMING' | 'OUTGOING'

export type Role = 'PLAYER' | 'VENUE_OWNER' | 'COACH' | 'ADMIN'

/** Bilyard intizamları — hər birinin öz müstəqil reytinqi var */
export type GameType = 'EIGHT_BALL' | 'RUSSIAN_PYRAMID' | 'SNOOKER'

export type League = 'AMATEUR' | 'PROFESSIONAL'

/** Liqa + klass bir dəyərdə: A ən üstün professional klassdır */
export type Tier = 'AMATEUR' | 'PRO_C' | 'PRO_B' | 'PRO_A'

/** Bir oyunçunun bir intizam üzrə reytinqi və statistikası */
export interface PlayerRating {
  gameType: GameType
  gameTypeLabel: string
  rating: number
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  winRate: number
  tier: Tier
  league: League
  /** 'A' | 'B' | 'C'; həvəskar liqada null */
  playerClass: string | null
}

export type TournamentStatus = 'REGISTRATION' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export type BracketMatchStatus = 'PENDING' | 'READY' | 'COMPLETED'

/**
 * rating/gamesPlayed/... sahələri bütün intizamların aqreqatıdır:
 * rating = ən yaxşı intizamın reytinqi, qalanları cəmdir.
 * İntizam üzrə detallar `ratings` massivindədir.
 */
export interface Player {
  id: number
  username: string
  fullName: string
  email: string
  bio: string | null
  avatarColor: string | null
  /** Yüklənmiş profil şəkli; null olduqda baş hərflər göstərilir */
  avatarUrl: string | null
  role: Role
  rating: number
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  winRate: number
  ratings: PlayerRating[]
  createdAt: string
}

/**
 * İntizam kontekstində (reytinq cədvəli, oyunçu siyahısı) rating/tier həmin
 * intizama aiddir. Kontekst olmayan yerlərdə (maç, dəvət sətirləri) rating
 * aqreqatdır və tier null olur.
 */
export interface PlayerSummary {
  id: number
  username: string
  fullName: string
  avatarColor: string | null
  avatarUrl: string | null
  rating: number
  gamesPlayed: number
  wins: number
  losses: number
  tier: Tier | null
  league: League | null
  playerClass: string | null
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
  gameType: GameType
  gameTypeLabel: string
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
  gameType: GameType
  gameTypeLabel: string
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
  gameType: GameType
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
  gameType: GameType
  gameTypeLabel: string
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
  gameType: GameType
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
  gameType: GameType
  myScore: number
  opponentScore: number
  challengeId?: number | null
}

// --- Qalereya ---

/** Turnirə bağlanmamış şəkillərin toplandığı albomun sabit açarı */
export const GENERAL_ALBUM_KEY = 'general'

export interface GalleryImage {
  id: number
  url: string
  title: string | null
  caption: string | null
  tournamentId: number | null
  tournamentName: string | null
  sortOrder: number
  visible: boolean
  cover: boolean
  createdAt: string
}

/** Bir turnirin albomu, ya da turnirsiz şəkillərin "Ümumi" yığımı */
export interface GalleryAlbum {
  key: string
  tournamentId: number | null
  name: string
  venueName: string | null
  tournamentStartAt: string | null
  coverUrl: string | null
  imageCount: number
  images: GalleryImage[]
}

export interface UpdateGalleryImageRequest {
  title?: string | null
  caption?: string | null
  tournamentId?: number | null
  sortOrder?: number | null
  visible?: boolean | null
  cover?: boolean | null
}

// --- Akademiya ---

export type CoachingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type LessonFormat = 'INDIVIDUAL' | 'GROUP'

export type LessonOrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'PAID'
  | 'COMPLETED'

/** Sifariş sətri kimin gözü ilə görünür: şagirdin göndərdiyi, yoxsa məşqçiyə gələn */
export type OrderDirection = 'INCOMING' | 'OUTGOING'

/** Siyahı və paket kartlarında göstərilən yüngül məşqçi məlumatı */
export interface CoachSummary {
  id: number
  player: PlayerSummary
  headline: string | null
  experienceYears: number | null
  venue: VenueSummary | null
  gameTypes: GameType[]
}

export interface Coach {
  id: number
  player: PlayerSummary
  headline: string | null
  about: string | null
  experienceYears: number | null
  certifications: string | null
  phone: string | null
  venue: VenueSummary | null
  gameTypes: GameType[]
  gameTypeLabels: string[]
  packageCount: number
  active: boolean
  createdAt: string
}

export interface LessonPackage {
  id: number
  coach: CoachSummary
  title: string
  description: string | null
  gameType: GameType
  gameTypeLabel: string
  level: CoachingLevel
  levelLabel: string
  format: LessonFormat
  formatLabel: string
  lessonCount: number
  lessonMinutes: number
  /** Yalnız GROUP formatında dolur */
  groupSize: number | null
  price: number
  venue: VenueSummary | null
  /** Aktiv sifarişlərin sayı — «neçə şagird» göstəricisi */
  studentCount: number
  active: boolean
  createdAt: string
}

export interface LessonOrder {
  id: number
  lessonPackage: LessonPackage
  student: PlayerSummary
  /** Sifariş anındakı şərtlər — paket sonra dəyişsə də bunlar dəyişmir */
  price: number
  lessonCount: number
  status: LessonOrderStatus
  statusLabel: string
  message: string | null
  coachNote: string | null
  direction: OrderDirection
  createdAt: string
  respondedAt: string | null
  paidAt: string | null
  completedAt: string | null
}

export interface CoachRegisterRequest {
  username: string
  email: string
  password: string
  fullName: string
  headline?: string
  about?: string
  experienceYears?: number | null
  certifications?: string
  phone?: string
  venueId?: number | null
  gameTypes?: GameType[]
}

export interface UpdateCoachRequest {
  fullName?: string
  headline?: string
  about?: string
  experienceYears?: number | null
  certifications?: string
  phone?: string
  venueId?: number | null
  gameTypes?: GameType[]
  active?: boolean | null
}

export interface CreateLessonPackageRequest {
  title: string
  description?: string
  gameType: GameType
  level: CoachingLevel
  format: LessonFormat
  lessonCount: number
  lessonMinutes: number
  groupSize?: number | null
  price: number
  venueId?: number | null
}

export interface UpdateLessonPackageRequest {
  title?: string
  description?: string
  gameType?: GameType | null
  level?: CoachingLevel | null
  format?: LessonFormat | null
  lessonCount?: number | null
  lessonMinutes?: number | null
  groupSize?: number | null
  price?: number | null
  venueId?: number | null
  active?: boolean | null
}

export interface CreateLessonOrderRequest {
  packageId: number
  message?: string
}

export interface RespondOrderRequest {
  coachNote?: string
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
}
