// Supabase database types
import type { ParticipantsMap, VoteRecord } from './index'

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          created_at: string
          expires_at: string
          creator_id: string
          participants: ParticipantsMap
          revealed: boolean
          vote_history: VoteRecord[]
          current_round: number
        }
        Insert: {
          id: string
          created_at?: string
          expires_at: string
          creator_id: string
          participants?: ParticipantsMap
          revealed?: boolean
          vote_history?: VoteRecord[]
          current_round?: number
        }
        Update: {
          id?: string
          created_at?: string
          expires_at?: string
          creator_id?: string
          participants?: ParticipantsMap
          revealed?: boolean
          vote_history?: VoteRecord[]
          current_round?: number
        }
      }
    }
    Functions: {
      delete_expired_sessions: {
        Args: Record<string, never>
        Returns: number
      }
    }
  }
}
