import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://qrdcragrwvfvjuiayhlw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZGNyYWdyd3Zmdmp1aWF5aGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTYyNzAsImV4cCI6MjA5NDI3MjI3MH0.1Y5pqLgn3jJtvfS9Cupfn_sj6Ba79kHktHTtxgsVExw'
const adminEmail = 'admin@quiz.local'
const adminPassword = 'admin123'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  })
  if (authError) {
    console.error('Auth failed:', authError.message)
    process.exit(1)
  }
  console.log('Logged in as admin')

  // Step 1: Fix HR Sheet 1 - delete wrongly inserted questions
  console.log('\n--- Step 1: Fix HR Sheet 1 ---')
  const { error: delete1Error } = await supabase
    .from('questions')
    .delete()
    .eq('sheet', 'HR Sheet 1')
  
  if (delete1Error) {
    console.error('Failed to delete from HR Sheet 1:', delete1Error.message)
    process.exit(1)
  }
  console.log('Deleted wrongly inserted questions from HR Sheet 1')

  // Verify HR Sheet 1 is now empty
  const { data: check1 } = await supabase
    .from('questions')
    .select('id')
    .eq('sheet', 'HR Sheet 1')
  console.log(`HR Sheet 1 now has ${check1?.length || 0} questions (should be 0)`)

  // Step 2: Replace HR Sheet 5 with new questions
  console.log('\n--- Step 2: Replace HR Sheet 5 ---')
  
  // Delete old questions from HR Sheet 5
  const { error: delete5Error } = await supabase
    .from('questions')
    .delete()
    .eq('sheet', 'HR Sheet 5')
  
  if (delete5Error) {
    console.error('Failed to delete from HR Sheet 5:', delete5Error.message)
    process.exit(1)
  }
  console.log('Deleted old questions from HR Sheet 5')

  // Read new questions
  const questionsData = JSON.parse(
    fs.readFileSync('questions/sheet2_human_rights_new.json', 'utf-8')
  )

  // Format questions for insertion
  const formattedQuestions = questionsData.map(q => ({
    category: 'Human Rights',
    sheet: 'HR Sheet 5',
    type: q.type,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }))

  console.log(`Inserting ${formattedQuestions.length} new questions into HR Sheet 5...`)

  // Insert new questions
  const { error: insertError } = await supabase
    .from('questions')
    .insert(formattedQuestions)
  
  if (insertError) {
    console.error('Failed to insert new questions:', insertError.message)
    process.exit(1)
  }
  console.log(`Successfully inserted ${formattedQuestions.length} new questions into HR Sheet 5`)

  // Verify
  const { data: verifyData } = await supabase
    .from('questions')
    .select('id, question, answer')
    .eq('sheet', 'HR Sheet 5')
  
  console.log(`Verification: ${verifyData?.length || 0} questions now in HR Sheet 5`)

  // Step 3: Also update HR All Questions sheet
  console.log('\n--- Step 3: Update HR All Questions ---')
  
  // Delete old Group 2 questions from HR All Questions (the ones that match HR Sheet 5 old content)
  // Since HR All Questions contains all MCQ questions, we need to delete and re-insert the matching ones
  // Actually, the HR All Questions sheet has 120 questions. We need to replace the 30 that were from old Group 2
  // The simplest approach: delete all from HR All Questions and re-insert from Sheets 4, 5, 6
  
  const { error: deleteAllError } = await supabase
    .from('questions')
    .delete()
    .eq('sheet', 'HR All Questions')
  
  if (deleteAllError) {
    console.error('Failed to delete from HR All Questions:', deleteAllError.message)
    process.exit(1)
  }
  console.log('Deleted all questions from HR All Questions')

  // Fetch questions from HR Sheet 4, 5, 6
  const [s4, s5, s6] = await Promise.all([
    supabase.from('questions').select('*').eq('sheet', 'HR Sheet 4'),
    supabase.from('questions').select('*').eq('sheet', 'HR Sheet 5'),
    supabase.from('questions').select('*').eq('sheet', 'HR Sheet 6'),
  ])

  const allQuestions = [
    ...(s4.data || []),
    ...(s5.data || []),
    ...(s6.data || []),
  ].map(q => ({
    category: 'Human Rights',
    sheet: 'HR All Questions',
    type: q.type,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }))

  console.log(`Re-inserting ${allQuestions.length} questions into HR All Questions...`)

  const { error: insertAllError } = await supabase
    .from('questions')
    .insert(allQuestions)
  
  if (insertAllError) {
    console.error('Failed to insert into HR All Questions:', insertAllError.message)
    process.exit(1)
  }
  console.log(`Successfully inserted ${allQuestions.length} questions into HR All Questions`)

  // Final verification
  console.log('\n--- Final Verification ---')
  const sheetsToCheck = ['HR Sheet 1', 'HR Sheet 2', 'HR Sheet 3', 'HR Sheet 4', 'HR Sheet 5', 'HR Sheet 6', 'HR All Questions']
  for (const sheet of sheetsToCheck) {
    const { data } = await supabase
      .from('questions')
      .select('id, type')
      .eq('sheet', sheet)
    const mcqCount = data?.filter(q => q.type === 'mcq').length || 0
    const tfCount = data?.filter(q => q.type === 'truefalse').length || 0
    console.log(`${sheet}: ${data?.length || 0} total (${mcqCount} MCQ, ${tfCount} TF)`)
  }
}

main().catch(err => {
  console.error('Script failed:', err)
  process.exit(1)
})