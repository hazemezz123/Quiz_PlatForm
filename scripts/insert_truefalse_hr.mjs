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

  const questionsData = JSON.parse(
    fs.readFileSync('questions/truefalse_human_rights.json', 'utf-8')
  )

  const group1 = questionsData.slice(0, 35).map(q => ({
    category: 'Human Rights',
    sheet: 'HR TF Sheet 1',
    type: q.type,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }))

  const group2 = questionsData.slice(35).map(q => ({
    category: 'Human Rights',
    sheet: 'HR TF Sheet 2',
    type: q.type,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }))

  console.log(`\n--- Inserting Group 1 (35 questions) into HR TF Sheet 1 ---`)
  const { error: insert1Error } = await supabase
    .from('questions')
    .insert(group1)
  if (insert1Error) {
    console.error('Failed to insert Group 1:', insert1Error.message)
    process.exit(1)
  }
  console.log('Successfully inserted 35 questions into HR TF Sheet 1')

  console.log(`\n--- Inserting Group 2 (20 questions) into HR TF Sheet 2 ---`)
  const { error: insert2Error } = await supabase
    .from('questions')
    .insert(group2)
  if (insert2Error) {
    console.error('Failed to insert Group 2:', insert2Error.message)
    process.exit(1)
  }
  console.log('Successfully inserted 20 questions into HR TF Sheet 2')

  console.log('\n--- Adding sheets to sheets table ---')
  const { error: sheetsError } = await supabase
    .from('sheets')
    .insert([
      { name: 'HR TF Sheet 1', category: 'Human Rights', is_official: true },
      { name: 'HR TF Sheet 2', category: 'Human Rights', is_official: true },
    ])
  if (sheetsError) {
    if (sheetsError.code === '23505') {
      console.log('Sheet entries already exist, skipping')
    } else {
      console.error('Failed to insert sheets:', sheetsError.message)
      process.exit(1)
    }
  } else {
    console.log('Successfully added HR TF Sheet 1 and HR TF Sheet 2 to sheets table')
  }

  console.log('\n--- Final Verification ---')
  const sheetsToCheck = ['HR TF Sheet 1', 'HR TF Sheet 2']
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