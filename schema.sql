-- Run this in the Supabase SQL Editor to fix RLS issues
-- This recreates the questions table policies cleanly

-- 1. Ensure table exists with sheet column
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  sheet text,
  type text NOT NULL CHECK (type IN ('mcq', 'truefalse')),
  question text NOT NULL,
  options jsonb NOT NULL,
  answer integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable Row Level Security (idempotent)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies on questions to avoid conflicts
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'questions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON questions', pol.policyname);
  END LOOP;
END $$;

-- 4. Recreate policies for anonymous access
-- The frontend uses the anon key, so policies must target 'anon'

-- Allow SELECT for everyone
CREATE POLICY "Allow anonymous read access" ON questions
  FOR SELECT
  TO anon
  USING (true);

-- Allow INSERT for everyone (protected by frontend password)
CREATE POLICY "Allow anonymous insert" ON questions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow UPDATE for everyone
CREATE POLICY "Allow anonymous update" ON questions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow DELETE for everyone
CREATE POLICY "Allow anonymous delete" ON questions
  FOR DELETE
  TO anon
  USING (true);

-- 5. Optional: insert sample data
INSERT INTO questions (category, type, question, options, answer, explanation)
VALUES
  ('Science', 'mcq', 'What is the chemical symbol for water?', '["H2O", "CO2", "O2", "NaCl"]', 0, 'Water is composed of two hydrogen atoms and one oxygen atom.'),
  ('Science', 'mcq', 'What planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 1, 'Mars appears red due to iron oxide on its surface.'),
  ('Geography', 'mcq', 'What is the capital of France?', '["London", "Berlin", "Madrid", "Paris"]', 3, 'Paris has been the capital of France since 508 CE.'),
  ('Geography', 'truefalse', 'The Sahara is the largest desert in the world.', '["True", "False"]', 1, 'Antarctica is technically the largest desert; Sahara is the largest hot desert.'),
  ('History', 'mcq', 'In which year did World War II end?', '["1943", "1944", "1945", "1946"]', 2, 'World War II ended in 1945 with the surrender of Germany and Japan.')
ON CONFLICT DO NOTHING;
