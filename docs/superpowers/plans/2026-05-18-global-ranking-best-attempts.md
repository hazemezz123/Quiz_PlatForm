# Global Ranking Best-Attempts Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change Global Ranking to sum each user's best score for each distinct quiz target.

**Architecture:** Keep score storage unchanged. In `Leaderboard.tsx`, derive global totals from raw score rows by grouping first on user, then on quiz key (`sheet` if present, otherwise `category`). For each user+quiz key, keep the highest percentage score row, then sum those best rows into one global total used for ranking.

**Tech Stack:** React, TypeScript, Supabase client, existing leaderboard UI.

---

### Task 1: Add best-attempt aggregation

**Files:**
- Modify: `src/pages/Leaderboard.tsx`

- [ ] **Step 1: Replace current user-level dedupe with per-quiz aggregation**

Use this aggregation shape in the `useMemo` that builds global rankings:

```ts
const globalScores = useMemo(() => {
  const byUser = new Map<
    string,
    {
      user_name: string
      score: number
      total_questions: number
      percentage: number
      created_at: string
      category: string | null
      sheet: string | null
    }[]
  >()

  for (const score of scores) {
    const quizKey = score.sheet || score.category || 'unknown'
    const userScores = byUser.get(score.user_name) ?? []
    const existingIndex = userScores.findIndex((s) => (s.sheet || s.category || 'unknown') === quizKey)

    if (existingIndex === -1) {
      userScores.push(score)
    } else if (score.percentage > userScores[existingIndex].percentage) {
      userScores[existingIndex] = score
    }

    byUser.set(score.user_name, userScores)
  }

  return Array.from(byUser.values())
    .map((userScores) => {
      const totalScore = userScores.reduce((sum, s) => sum + s.score, 0)
      const totalQuestions = userScores.reduce((sum, s) => sum + s.total_questions, 0)
      const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0
      const latestCreatedAt = userScores
        .map((s) => s.created_at)
        .sort()
        .at(-1) ?? new Date(0).toISOString()

      return {
        id: userScores[0].id,
        user_name: userScores[0].user_name,
        score: totalScore,
        total_questions: totalQuestions,
        percentage,
        created_at: latestCreatedAt,
        category: null,
        sheet: null,
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.percentage !== a.percentage) return b.percentage - a.percentage
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}, [scores])
```

- [ ] **Step 2: Point Global Ranking UI at aggregated totals**

Replace the current `bestScores`-based data flow so podium, table, and category filter all read from the new aggregated list.

- [ ] **Step 3: Keep My Scores unchanged**

Leave `myScores` as raw rows so the user can still see each quiz attempt separately.

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors.
