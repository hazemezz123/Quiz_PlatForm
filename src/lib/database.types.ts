// Supabase database types — manually defined to match schema.sql
// These can be regenerated via: supabase gen types typescript --project-id <id>

export type CategoryId =
  | 'AI Programming'
  | 'AI Fundamental'
  | 'Digital Circuit'
  | 'Human Rights'
  | 'Operating System'
  | 'English'
  | 'Negotiations'

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string
          category: CategoryId
          sheet: string | null
          type: 'mcq' | 'truefalse'
          question: string
          options: string[] // jsonb stored as string[] in app
          answer: number
          explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          category: CategoryId
          sheet?: string | null
          type: 'mcq' | 'truefalse'
          question: string
          options: string[]
          answer: number
          explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: CategoryId
          sheet?: string | null
          type?: 'mcq' | 'truefalse'
          question?: string
          options?: string[]
          answer?: number
          explanation?: string
          created_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          user_name: string
          score: number
          total_questions: number
          percentage: number
          category: CategoryId | null
          sheet: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_name: string
          score: number
          total_questions: number
          percentage: number
          category?: CategoryId | null
          sheet?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_name?: string
          score?: number
          total_questions?: number
          percentage?: number
          category?: CategoryId | null
          sheet?: string | null
          created_at?: string
        }
      }
      sheets: {
        Row: {
          name: string
          category: CategoryId
          created_at: string
        }
        Insert: {
          name: string
          category: CategoryId
          created_at?: string
        }
        Update: {
          name?: string
          category?: CategoryId
          created_at?: string
        }
      }
    }
  }
}
