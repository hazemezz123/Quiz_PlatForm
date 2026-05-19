/**
 * Compute the Levenshtein edit distance between two strings.
 * Returns the minimum number of single-character edits (insertions,
 * deletions, or substitutions) required to change `a` into `b`.
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase().trim()
  const bLower = b.toLowerCase().trim()

  const m = aLower.length
  const n = bLower.length

  // Create a (m+1) x (n+1) matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost, // substitution
      )
    }
  }

  return dp[m][n]
}

/**
 * Given the user's answer and the correct term, determine the result:
 * - "correct"  → exact match (or distance === 0)
 * - "hint"     → 1–3 spelling errors — show a hint to help the user
 * - "wrong"    → more than 3 spelling errors
 */
export type AnswerResult = 'correct' | 'hint' | 'wrong'

export interface DefinitionQuizResult {
  result: AnswerResult
  distance: number
  /** Only populated when result === 'hint' — shows the correct term with some letters revealed */
  hint: string
}

const HINT_THRESHOLD = 3

export function evaluateDefinitionAnswer(
  userAnswer: string,
  correctTerm: string,
): DefinitionQuizResult {
  const distance = levenshteinDistance(userAnswer, correctTerm)

  if (distance === 0) {
    return { result: 'correct', distance, hint: '' }
  }

  if (distance <= HINT_THRESHOLD) {
    // Build a hint: reveal some characters, hide others with underscores
    const hint = buildHint(correctTerm, distance)
    return { result: 'hint', distance, hint }
  }

  return { result: 'wrong', distance, hint: '' }
}

/**
 * Build a hint string from the correct term.
 * Strategy: reveal the first letter, last letter, and enough middle letters
 * so that (distance) characters are hidden, giving the user a fair chance.
 */
function buildHint(term: string, distance: number): string {
  if (term.length <= 2) return term // Too short to hide anything

  const chars = term.split('')
  const totalToHide = Math.min(distance, Math.floor(term.length / 2))

  // Always reveal first and last character
  const hiddenIndices: Set<number> = new Set()

  // Hide characters starting from the middle, spreading outward
  const mid = Math.floor(term.length / 2)
  for (let offset = 0; hiddenIndices.size < totalToHide; offset++) {
    // Try mid + offset, then mid - offset
    const right = mid + offset
    const left = mid - offset
    if (right > 0 && right < term.length - 1) hiddenIndices.add(right)
    if (hiddenIndices.size >= totalToHide) break
    if (left > 0 && left < term.length - 1) hiddenIndices.add(left)
  }

  // Build hint string
  const hintChars = chars.map((ch, idx) => {
    if (idx === 0 || idx === term.length - 1) return ch
    if (hiddenIndices.has(idx)) return '_'
    return ch
  })

  return hintChars.join('')
}
