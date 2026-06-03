import { CategoryId } from '../lib/categories'

export type QuestionType = 'mcq' | 'truefalse'

export interface Question {
  id: string
  category: CategoryId
  sheet?: string
  type: QuestionType
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface Sheet {
  name: string
  category: CategoryId
  is_official?: boolean
  created_at?: string
  questionTypes?: QuestionType[]
}

export interface Score {
  id: string
  user_name: string
  score: number
  total_questions: number
  percentage: number
  category: CategoryId | null
  sheet: string | null
  created_at: string
}
