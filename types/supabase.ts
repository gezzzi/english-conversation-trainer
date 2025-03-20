export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_progress: {
        Row: {
          id: string
          user_id: string
          total_messages: number
          correct_sentences: number
          vocabulary_learned: number
          last_practiced: string | null
          streak: number
          level: number
          experience: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_messages?: number
          correct_sentences?: number
          vocabulary_learned?: number
          last_practiced?: string | null
          streak?: number
          level?: number
          experience?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_messages?: number
          correct_sentences?: number
          vocabulary_learned?: number
          last_practiced?: string | null
          streak?: number
          level?: number
          experience?: number
          created_at?: string
          updated_at?: string
        }
      }
      vocabulary: {
        Row: {
          id: string
          user_id: string
          word: string
          translation: string
          example: string
          mastered: boolean
          last_reviewed: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          translation: string
          example?: string
          mastered?: boolean
          last_reviewed?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          translation?: string
          example?: string
          mastered?: boolean
          last_reviewed?: string | null
          created_at?: string
        }
      }
      user_messages: {
        Row: {
          id: string
          user_id: string
          content: string
          type: string
          translation: string | null
          correction: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          type: string
          translation?: string | null
          correction?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          type?: string
          translation?: string | null
          correction?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 