import { Question, Score } from '../types'

/**
 * Escape a value for safe inclusion in a CSV cell.
 * If the value contains commas, double-quotes, or newlines,
 * wrap it in double-quotes and escape any internal double-quotes.
 */
function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

/**
 * Convert an array of Questions to a CSV string.
 * Columns: category, sheet, type, question, options, answer, explanation
 */
export function questionsToCsv(questions: Question[]): string {
  const headers = ['category', 'sheet', 'type', 'question', 'options', 'answer', 'explanation']
  const headerRow = headers.join(',')

  const rows = questions.map((q) =>
    [
      escapeCsvCell(q.category),
      escapeCsvCell(q.sheet ?? ''),
      escapeCsvCell(q.type),
      escapeCsvCell(q.question),
      escapeCsvCell(JSON.stringify(q.options)), // options array → JSON string
      String(q.answer),
      escapeCsvCell(q.explanation),
    ].join(','),
  )

  return [headerRow, ...rows].join('\n')
}

/**
 * Convert an array of Scores to a CSV string.
 * Columns: user_name, score, total_questions, percentage, category, sheet, created_at
 */
export function scoresToCsv(scores: Score[]): string {
  const headers = [
    'user_name',
    'score',
    'total_questions',
    'percentage',
    'category',
    'sheet',
    'created_at',
  ]
  const headerRow = headers.join(',')

  const rows = scores.map((s) =>
    [
      escapeCsvCell(s.user_name),
      String(s.score),
      String(s.total_questions),
      String(s.percentage),
      escapeCsvCell(s.category ?? ''),
      escapeCsvCell(s.sheet ?? ''),
      escapeCsvCell(s.created_at),
    ].join(','),
  )

  return [headerRow, ...rows].join('\n')
}

/**
 * Trigger a browser download of a CSV string as a file.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
