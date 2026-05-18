export interface QuizTooltipRow {
  user_name: string
  score: number
  total_questions: number
  percentage: number
  sheet?: string | null
  category?: string | null
}

export function buildUserQuizTooltip(rows: QuizTooltipRow[]): string[]
