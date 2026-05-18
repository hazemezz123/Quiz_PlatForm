import assert from 'node:assert/strict'
import { buildUserQuizTooltip } from '../src/lib/leaderboardTooltip.js'

const rows = [
  { user_name: 'Ali', score: 8, total_questions: 10, percentage: 80, sheet: 'Sheet 1', category: null },
  { user_name: 'Ali', score: 5, total_questions: 10, percentage: 50, sheet: 'Sheet 2', category: null },
  { user_name: 'Ali', score: 9, total_questions: 10, percentage: 90, sheet: 'Sheet 1', category: null },
]

const tooltip = buildUserQuizTooltip(rows)

assert.deepEqual(tooltip, [
  'Sheet 1: 9/10 (90%)',
  'Sheet 2: 5/10 (50%)',
])

console.log('pass')
