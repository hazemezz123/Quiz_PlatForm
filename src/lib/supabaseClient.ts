import { createClient } from '@supabase/supabase-js'
import { Question, Score, Sheet } from '../types'
import { CategoryId } from './categories'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchCategories(): Promise<CategoryId[]> {
  const { data, error } = await supabase.from('questions').select('category')

  if (error) throw error

  const categories = [...new Set(data.map((q) => q.category))] as CategoryId[]
  return categories
}

export async function fetchQuestionsByCategory(category: CategoryId): Promise<Question[]> {
  const { data, error } = await supabase.from('questions').select('*').eq('category', category)

  if (error) throw error

  return data as Question[]
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
