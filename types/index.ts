// Card values for planning poker
export const CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'] as const
export type Card = typeof CARDS[number]

// Session TTL: 24 hours in milliseconds
export const SESSION_TTL = 24 * 60 * 60 * 1000

// Participant in a session
export interface Participant {
  id: string
  nickname: string
  vote: Card | null
  joinedAt: string
  isCreator: boolean
}

// Map of participants by ID
export type ParticipantsMap = Record<string, Participant>

// Vote record in history
export interface VoteRecord {
  round: number
  timestamp: string
  votes: Record<string, Card>
  revealed: boolean
}

// Session data structure
export interface Session {
  id: string
  created_at: string
  expires_at: string
  creator_id: string
  participants: ParticipantsMap
  revealed: boolean
  vote_history: VoteRecord[]
  current_round: number
}

// API Request/Response types

export interface CreateSessionRequest {
  nickname?: string
}

export interface CreateSessionResponse {
  sessionId: string
  participantId: string
  nickname: string
}

export interface JoinSessionRequest {
  nickname?: string
}

export interface JoinSessionResponse {
  participantId: string
  nickname: string
  session: Session
}

export interface VoteRequest {
  participantId: string
  vote: Card
}

export interface RevealRequest {
  participantId: string
}

export interface ResetRequest {
  participantId: string
}

// Statistics for revealed votes
export interface VoteStatistics {
  average: number | null
  min: Card | null
  max: Card | null
  consensus: boolean
  distribution: Record<Card, number>
}

// Error response
export interface ErrorResponse {
  error: string
  message: string
}

// Local storage keys
export const STORAGE_KEYS = {
  PARTICIPANT_INFO: 'scrumpoker_participant',
  SESSION_ID: 'scrumpoker_session_id',
} as const

// Participant info stored in localStorage
export interface StoredParticipantInfo {
  participantId: string
  nickname: string
  sessionId: string
}

// Presence state
export interface PresenceState {
  participantId: string
  nickname: string
  online: boolean
  lastSeen: string
}
