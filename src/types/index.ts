export type QuestionType = 'mcq' | 'truefalse'

export interface Question {
  id: string
  category: string
  sheet?: string
  type: QuestionType
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface Score {
  id: string
  user_name: string
  score: number
  total_questions: number
  percentage: number
  category: string | null
  sheet: string | null
  created_at: string
}

export interface QuizState {
  userName: string
  currentCategory: string | null
  questions: Question[]
  answers: Record<string, number>
  score: number | null
}
