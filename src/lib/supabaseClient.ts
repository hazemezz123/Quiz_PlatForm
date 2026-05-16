import { createClient, Session } from '@supabase/supabase-js'
import { Question, Score, Sheet } from '../types'
import { CategoryId } from './categories'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ------------------------------------------------------------------ */
/*  Auth helpers for admin operations                                  */
/* ------------------------------------------------------------------ */

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@quiz.local'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || ''

export async function signInAdmin(): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })
  if (error) throw error
  if (!data.session) throw new Error('No session returned')
  return data.session
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getAdminSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function fetchCategories(): Promise<CategoryId[]> {
  // Only count questions from official sheets for category availability
  const { data: unofficialSheets, error: sheetsError } = await supabase
    .from('sheets')
    .select('name')
    .eq('is_official', false)

  if (sheetsError) throw sheetsError

  const unofficialNames = unofficialSheets.map((s) => s.name)

  const { data, error } = await supabase.from('questions').select('category, sheet')

  if (error) throw error

  // Filter out questions from unofficial sheets
  const filtered = data.filter((q) => !unofficialNames.includes(q.sheet ?? ''))
  const categories = [...new Set(filtered.map((q) => q.category))] as CategoryId[]
  return categories
}

export async function fetchQuestionsByCategory(category: CategoryId): Promise<Question[]> {
  // Fetch unofficial sheet names so we can exclude them from the "Big Quiz"
  const { data: unofficialSheets, error: sheetsError } = await supabase
    .from('sheets')
    .select('name')
    .eq('is_official', false)

  if (sheetsError) throw sheetsError

  const unofficialNames = unofficialSheets.map((s) => s.name)

  const { data, error } = await supabase.from('questions').select('*').eq('category', category)

  if (error) throw error

  // Exclude questions from unofficial sheets — the "Big Quiz" only includes official sheets
  const filtered = (data as Question[]).filter((q) => !unofficialNames.includes(q.sheet ?? ''))

  return filtered
}

export async function fetchSheets(): Promise<Sheet[]> {
  const { data, error } = await supabase.from('sheets').select('*').order('name')

  if (error) throw error

  return data as Sheet[]
}

export async function fetchQuestionsBySheet(sheet: string): Promise<Question[]> {
  const { data, error } = await supabase.from('questions').select('*').eq('sheet', sheet)

  if (error) throw error

  return data as Question[]
}

// Admin CRUD operations
export async function fetchAllQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Question[]
}

export async function insertQuestions(
  questions: Omit<Question, 'id' | 'created_at'>[],
): Promise<void> {
  const { error } = await supabase.from('questions').insert(questions)

  if (error) throw error
}

export async function insertSheet(sheet: Sheet): Promise<void> {
  const { error } = await supabase.from('sheets').insert(sheet)

  if (error) throw error
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('questions').delete().eq('id', id)

  if (error) throw error
}

export async function updateQuestion(
  id: string,
  updates: Partial<Omit<Question, 'id'>>,
): Promise<void> {
  const { error } = await supabase.from('questions').update(updates).eq('id', id)

  if (error) throw error
}

export async function deleteSheet(sheet: string): Promise<void> {
  // Delete from sheets table
  const { error: sheetError } = await supabase.from('sheets').delete().eq('name', sheet)

  if (sheetError) throw sheetError

  // Delete all questions belonging to this sheet
  const { error: qError } = await supabase.from('questions').delete().eq('sheet', sheet)

  if (qError) throw qError
}

export async function renameSheet(oldSheet: string, newSheet: string): Promise<void> {
  // Update sheets table
  const { error: sheetError } = await supabase
    .from('sheets')
    .update({ name: newSheet })
    .eq('name', oldSheet)

  if (sheetError) throw sheetError

  // Update questions table
  const { error: qError } = await supabase
    .from('questions')
    .update({ sheet: newSheet })
    .eq('sheet', oldSheet)

  if (qError) throw qError

  // Update scores table
  const { error: sError } = await supabase
    .from('scores')
    .update({ sheet: newSheet })
    .eq('sheet', oldSheet)

  if (sError) throw sError
}

export async function updateSheetCategory(sheetName: string, category: CategoryId): Promise<void> {
  // Update sheets table
  const { error: sheetError } = await supabase
    .from('sheets')
    .update({ category })
    .eq('name', sheetName)

  if (sheetError) throw sheetError

  // Update all questions belonging to this sheet
  const { error: qError } = await supabase
    .from('questions')
    .update({ category })
    .eq('sheet', sheetName)

  if (qError) throw qError

  // Update all scores belonging to this sheet
  const { error: sError } = await supabase
    .from('scores')
    .update({ category })
    .eq('sheet', sheetName)

  if (sError) throw sError
}

// Leaderboard operations
export async function saveScore(score: Omit<Score, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('scores').insert(score)

  if (error) throw error
}

export async function fetchLeaderboard(limit: number = 100): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('percentage', { ascending: false })
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Score[]
}

export interface UserRecord {
  user_name: string
  created_at: string
  last_seen: string
  quiz_count: number
}

export async function registerUser(userName: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert(
      { user_name: userName, last_seen: new Date().toISOString() },
      { onConflict: 'user_name' },
    )

  if (error) throw error
}

export async function fetchUsersWithQuizCount(limit: number = 200): Promise<UserRecord[]> {
  const { data, error } = await supabase
    .from('users')
    .select('user_name, created_at, last_seen')
    .order('last_seen', { ascending: false })
    .limit(limit)

  if (error) throw error

  // Get quiz counts from scores table
  const { data: scoreData, error: scoreError } = await supabase.from('scores').select('user_name')

  if (scoreError) throw scoreError

  const quizCounts: Record<string, number> = {}
  scoreData?.forEach((s) => {
    quizCounts[s.user_name] = (quizCounts[s.user_name] || 0) + 1
  })

  return data.map((u) => ({
    ...u,
    quiz_count: quizCounts[u.user_name] || 0,
  }))
}

export async function fetchScoresByUser(userName: string, limit: number = 20): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_name', userName)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Score[]
}

export async function fetchAllScores(): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Score[]
}

export interface DashboardStats {
  totalQuizzes: number
  totalUsers: number
  totalQuestions: number
  totalSheets: number
  averagePercentage: number
  bestPercentage: number
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [scoresRes, usersRes, questionsRes, sheetsRes] = await Promise.all([
    supabase.from('scores').select('percentage, user_name'),
    supabase.from('users').select('user_name'),
    supabase.from('questions').select('id', { count: 'exact' }),
    supabase.from('sheets').select('name', { count: 'exact' }),
  ])

  if (scoresRes.error) throw scoresRes.error
  if (usersRes.error) throw usersRes.error
  if (questionsRes.error) throw questionsRes.error
  if (sheetsRes.error) throw sheetsRes.error

  const scores = scoresRes.data
  const totalQuizzes = scores.length
  const uniqueUsers = new Set(scores.map((s) => s.user_name)).size
  const totalUsers = Math.max(uniqueUsers, usersRes.data?.length ?? 0)
  const percentages = scores.map((s) => s.percentage)
  const averagePercentage =
    percentages.length > 0
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      : 0
  const bestPercentage = percentages.length > 0 ? Math.max(...percentages) : 0

  return {
    totalQuizzes,
    totalUsers,
    totalQuestions: questionsRes.count ?? 0,
    totalSheets: sheetsRes.count ?? 0,
    averagePercentage,
    bestPercentage,
  }
}
