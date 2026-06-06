export function buildUserQuizTooltip(rows) {
  const bestByQuiz = new Map()

  for (const row of rows) {
    const quizName = row.sheet || row.category || 'Unknown quiz'
    const existing = bestByQuiz.get(quizName)

    if (
      !existing ||
      row.percentage > existing.percentage ||
      (row.percentage === existing.percentage && row.score > existing.score)
    ) {
      bestByQuiz.set(quizName, row)
    }
  }

  return Array.from(bestByQuiz.entries())
    .sort((a, b) => {
      if (b[1].percentage !== a[1].percentage) return b[1].percentage - a[1].percentage
      if (b[1].score !== a[1].score) return b[1].score - a[1].score
      return a[0].localeCompare(b[0])
    })
    .map(
      ([quizName, row]) => `${quizName}: ${row.score}/${row.total_questions} (${row.percentage}%)`,
    )
}
