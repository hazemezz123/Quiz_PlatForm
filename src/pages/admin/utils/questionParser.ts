import { QuestionType } from '../../../types'
import { CategoryId } from '../../../lib/categories'

export interface ParsedQuestion {
  type: QuestionType
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface ParseResult {
  success: true
  questions: ParsedQuestion[]
}

export interface ParseError {
  success: false
  error: string
}

export type ParseOutcome = ParseResult | ParseError

export function parseJsonQuestions(jsonString: string): ParseOutcome {
  let parsed: unknown[]
  try {
    parsed = JSON.parse(jsonString)
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'JSON must be an array of question objects' }
    }
  } catch {
    return { success: false, error: 'Invalid JSON format' }
  }

  const questions: ParsedQuestion[] = []
  for (const raw of parsed) {
    const q = raw as Record<string, unknown>
    if (
      !q.type ||
      !q.question ||
      !Array.isArray(q.options) ||
      typeof q.answer !== 'number' ||
      !q.explanation
    ) {
      return {
        success: false,
        error:
          'Each question must have: type, question, options (array), answer (number), explanation',
      }
    }
    questions.push({
      type: q.type as QuestionType,
      question: String(q.question),
      options: (q.options as unknown[]).map(String),
      answer: Number(q.answer),
      explanation: String(q.explanation),
    })
  }

  return { success: true, questions }
}

export function formatQuestionsForInsert(
  parsed: ParsedQuestion[],
  sheetCategory: CategoryId,
  sheetName: string,
): Omit<import('../../../types').Question, 'id' | 'created_at'>[] {
  return parsed.map((q) => ({
    category: sheetCategory,
    sheet: sheetName,
    type: q.type,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }))
}
