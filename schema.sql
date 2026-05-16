-- ============================================================
-- Indentify Quiz Platform — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('AI Programming', 'AI Fundamental', 'Digital Circuit', 'Human Rights', 'Operating System', 'English', 'Negotiations')),
  sheet text,
  type text NOT NULL CHECK (type IN ('mcq', 'truefalse')),
  question text NOT NULL,
  options jsonb NOT NULL,
  answer integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  percentage integer NOT NULL,
  category text CHECK (category IN ('AI Programming', 'AI Fundamental', 'Digital Circuit', 'Human Rights', 'Operating System', 'English', 'Negotiations')),
  sheet text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Sheets table — each sheet belongs to a category
CREATE TABLE IF NOT EXISTS sheets (
  name text PRIMARY KEY,
  category text NOT NULL CHECK (category IN ('AI Programming', 'AI Fundamental', 'Digital Circuit', 'Human Rights', 'Operating System', 'English', 'Negotiations')),
  is_official boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- Indexes for frequently queried columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_sheet ON questions(sheet);
CREATE INDEX IF NOT EXISTS idx_scores_user_name ON scores(user_name);
CREATE INDEX IF NOT EXISTS idx_scores_sheet ON scores(sheet);
CREATE INDEX IF NOT EXISTS idx_scores_percentage ON scores(percentage DESC);
CREATE INDEX IF NOT EXISTS idx_sheets_category ON sheets(category);

-- ============================================================
-- Row Level Security — Questions table
-- ============================================================

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on questions to avoid conflicts
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

-- Allow SELECT for everyone (anon + authenticated)
CREATE POLICY "Allow anonymous read access" ON questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow INSERT only for authenticated users (admin operations)
CREATE POLICY "Allow authenticated insert" ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow UPDATE only for authenticated users
CREATE POLICY "Allow authenticated update" ON questions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow DELETE only for authenticated users
CREATE POLICY "Allow authenticated delete" ON questions
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- Row Level Security — Scores table
-- ============================================================

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on scores to avoid conflicts
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'scores'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON scores', pol.policyname);
  END LOOP;
END $$;

-- Allow SELECT for everyone (leaderboard display)
CREATE POLICY "Allow anonymous read scores" ON scores
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow INSERT for everyone (quiz completion saves score)
-- NOTE: In a more secure setup, this would be restricted to authenticated users
-- or handled via a Supabase RPC function to validate the score before insertion.
CREATE POLICY "Allow anonymous insert scores" ON scores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No UPDATE or DELETE for anon — scores are immutable once recorded
-- Only authenticated users (admins) can update/delete scores
CREATE POLICY "Allow authenticated update scores" ON scores
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete scores" ON scores
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- Row Level Security — Sheets table
-- ============================================================

ALTER TABLE sheets ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on sheets to avoid conflicts
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sheets'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON sheets', pol.policyname);
  END LOOP;
END $$;

-- Allow SELECT for everyone (home page displays sheets)
CREATE POLICY "Allow anonymous read sheets" ON sheets
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow INSERT only for authenticated users (admin operations)
CREATE POLICY "Allow authenticated insert sheets" ON sheets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow UPDATE only for authenticated users
CREATE POLICY "Allow authenticated update sheets" ON sheets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow DELETE only for authenticated users
CREATE POLICY "Allow authenticated delete sheets" ON sheets
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- Sample data (optional)
-- ============================================================

-- ─── Sample Sheets ───
INSERT INTO sheets (name, category) VALUES
  ('Sheet 1', 'AI Programming'),
  ('Sheet 2', 'AI Fundamental'),
  ('Sheet 3', 'Digital Circuit'),
  ('Sheet 4', 'English'),
  ('Sheet 5', 'Human Rights')
ON CONFLICT DO NOTHING;

-- ─── AI Programming ───
INSERT INTO questions (category, type, question, options, answer, explanation)
VALUES
  ('AI Programming', 'mcq', 'Which Python library is most commonly used for building neural networks?', '["NumPy", "TensorFlow", "Pandas", "Matplotlib"]', 1, 'TensorFlow is a deep learning framework specifically designed for building and training neural networks.'),
  ('AI Programming', 'mcq', 'What does the term "backpropagation" refer to in machine learning?', '["Forward data flow", "Error propagation from output to input", "Data augmentation", "Feature extraction"]', 1, 'Backpropagation is the algorithm used to compute gradients of the loss function with respect to weights by propagating errors backward through the network.'),
  ('AI Programming', 'mcq', 'Which activation function is most commonly used in hidden layers of deep neural networks?', '["Sigmoid", "ReLU", "Softmax", "Tanh"]', 1, 'ReLU (Rectified Linear Unit) is the most popular activation function for hidden layers due to its simplicity and effectiveness in avoiding the vanishing gradient problem.'),
  ('AI Programming', 'truefalse', 'Gradient descent always converges to the global minimum of the loss function.', '["True", "False"]', 1, 'Gradient descent may converge to a local minimum, not necessarily the global minimum, especially for non-convex loss surfaces.'),
  ('AI Programming', 'mcq', 'What is the primary purpose of a loss function in machine learning?', '["To speed up training", "To measure how far predictions are from actual values", "To initialize weights", "To regularize the model"]', 1, 'A loss function quantifies the difference between predicted outputs and actual targets, guiding the optimization process.')
ON CONFLICT DO NOTHING;

-- ─── AI Fundamental ───
INSERT INTO questions (category, type, question, options, answer, explanation)
VALUES
  ('AI Fundamental', 'mcq', 'What is the Turing Test used to evaluate?', '["Computing speed", "Machine intelligence", "Network latency", "Data storage"]', 1, 'The Turing Test evaluates whether a machine can exhibit behavior indistinguishable from that of a human.'),
  ('AI Fundamental', 'mcq', 'Which search algorithm uses heuristics to find the optimal path efficiently?', '["Breadth-First Search", "A* Search", "Depth-First Search", "Linear Search"]', 1, 'A* Search uses heuristics combined with actual cost to efficiently find the shortest path.'),
  ('AI Fundamental', 'mcq', 'What type of learning uses labeled training data to predict outcomes?', '["Unsupervised Learning", "Reinforcement Learning", "Supervised Learning", "Self-supervised Learning"]', 2, 'Supervised learning uses labeled data where both inputs and desired outputs are provided to train a model.'),
  ('AI Fundamental', 'truefalse', 'Artificial Neural Networks are inspired by the structure of the human brain.', '["True", "False"]', 0, 'ANNs are computational models inspired by biological neural networks in the brain.'),
  ('AI Fundamental', 'mcq', 'What is the difference between strong AI and weak AI?', '["Strong AI is faster; weak AI is slower", "Strong AI has general intelligence; weak AI is task-specific", "Strong AI uses more data; weak AI uses less", "There is no difference"]', 1, 'Strong AI (general AI) can perform any intellectual task a human can, while weak AI is designed for specific tasks.')
ON CONFLICT DO NOTHING;

-- ─── Digital Circuit ───
INSERT INTO questions (category, type, question, options, answer, explanation)
VALUES
  ('Digital Circuit', 'mcq', 'Which logic gate outputs HIGH only when all inputs are HIGH?', '["OR gate", "AND gate", "NOT gate", "XOR gate"]', 1, 'An AND gate produces a HIGH output only when all of its inputs are HIGH.'),
  ('Digital Circuit', 'mcq', 'What is the binary representation of the decimal number 10?', '["1010", "1100", "1001", "1110"]', 0, 'Decimal 10 equals binary 1010 (8+2=10).'),
  ('Digital Circuit', 'mcq', 'A flip-flop is a basic building block of which type of circuit?', '["Combinational circuit", "Sequential circuit", "Analog circuit", "Passive circuit"]', 1, 'Flip-flops store one bit of memory and are fundamental to sequential circuits which depend on past states.'),
  ('Digital Circuit', 'truefalse', 'A multiplexer selects one of several input lines and forwards it to a single output line.', '["True", "False"]', 0, 'A multiplexer (MUX) acts as a data selector, choosing one input from many based on control signals.'),
  ('Digital Circuit', 'mcq', 'How many inputs does a half adder have?', '["1", "2", "3", "4"]', 1, 'A half adder takes two inputs (the bits to add) and produces sum and carry outputs.')
ON CONFLICT DO NOTHING;

-- ─── English ───
INSERT INTO questions (category, type, question, options, answer, explanation)
VALUES
  ('English', 'mcq', 'Which of the following sentences is grammatically correct?', '["She dont like coffee", "She doesn\'t like coffee", "She not like coffee", "She don\'t likes coffee"]', 1, 'The correct form uses the auxiliary "doesn\'t" (does not) with the base form of the verb for third-person singular.'),
  ('English', 'mcq', 'What is the past tense of the verb "go"?', '["Goed", "Gone", "Went", "Going"]', 2, '"Go" is an irregular verb; its simple past tense is "went."'),
  ('English', 'mcq', 'Which word is a synonym for "abundant"?', '["Scarce", "Plentiful", "Tiny", "Rare"]', 1, '"Plentiful" means available in large quantities, similar to "abundant."'),
  ('English', 'truefalse', 'An adjective modifies a noun or pronoun.', '["True", "False"]', 0, 'Adjectives describe or modify nouns and pronouns, e.g., "beautiful" in "a beautiful day."'),
  ('English', 'mcq', 'What is the correct plural form of "child"?', '["Childs", "Children", "Childes", "Childen"]', 1, '"Child" has an irregular plural form: "children."')
ON CONFLICT DO NOTHING;

-- ─── Negotiations ───
INSERT INTO questions (category, type, question, options, answer, explanation)
VALUES
  ('Negotiations', 'mcq', 'Which negotiation strategy focuses on finding a win-win outcome for both parties?', '["Competitive negotiation", "Collaborative negotiation", "Avoidance negotiation", "Accommodation negotiation"]', 1, 'Collaborative (integrative) negotiation seeks mutually beneficial outcomes rather than zero-sum competition.'),
  ('Negotiations', 'mcq', 'What is BATNA in negotiation terminology?', '["Best Alternative To a Negotiated Agreement", "Basic Approach To Negotiation Analysis", "Balanced Agreement Through Negotiation", "Best Action To Negotiate Agreement"]', 0, 'BATNA stands for Best Alternative To a Negotiated Agreement — your fallback option if negotiations fail.'),
  ('Negotiations', 'mcq', 'Which phase of negotiation involves gathering information and understanding the other party\'s interests?', '["Closing", "Bargaining", "Preparation", "Implementation"]', 2, 'The preparation phase is when you research, define goals, and understand the other party before entering negotiations.'),
  ('Negotiations', 'truefalse', 'Making the first offer in a negotiation is always a disadvantage.', '["True", "False"]', 1, 'Making the first offer can set the anchor point and influence the range of the negotiation, often providing an advantage.'),
  ('Negotiations', 'mcq', 'What is the "anchoring effect" in negotiations?', '["Setting a final price", "Using the first offer to influence perceived value", "Agreeing on all terms", "Walking away from the table"]', 1, 'The anchoring effect means the first number proposed tends to set a reference point that shapes all subsequent offers.')
ON CONFLICT DO NOTHING;

-- ─── Human Rights ───
INSERT INTO questions (category, type, question, options, answer, explanation)
VALUES
  ('Human Rights', 'mcq', 'When was the Universal Declaration of Human Rights adopted by the UN?', '["1945", "1948", "1950", "1960"]', 1, 'The UDHR was adopted by the United Nations General Assembly on December 10, 1948.'),
  ('Human Rights', 'mcq', 'Which article of the UDHR states that all human beings are born free and equal in dignity and rights?', '["Article 1", "Article 2", "Article 3", "Article 5"]', 0, 'Article 1 declares: "All human beings are born free and equal in dignity and rights."'),
  ('Human Rights', 'mcq', 'What is the right to a fair trial classified as?', '["Economic right", "Social right", "Civil and political right", "Cultural right"]', 2, 'The right to a fair trial is a civil and political right ensuring due process and equality before the law.'),
  ('Human Rights', 'truefalse', 'The right to education is considered a fundamental human right under international law.', '["True", "False"]', 0, 'The right to education is recognized in Article 26 of the UDHR and various international treaties.'),
  ('Human Rights', 'mcq', 'Which international body is primarily responsible for monitoring human rights globally?', '["World Bank", "UN Human Rights Council", "International Court of Justice", "World Health Organization"]', 1, 'The UN Human Rights Council is the principal inter-governmental body responsible for strengthening the promotion and protection of human rights.')
ON CONFLICT DO NOTHING;

-- ─── Operating System ───
INSERT INTO questions (category, type, question, options, answer, explanation)
VALUES
  ('Operating System', 'mcq', 'What is the primary function of an operating system?', '["Running applications only", "Managing hardware resources and providing services to software", "Storing files only", "Connecting to the internet"]', 1, 'An OS manages CPU, memory, storage, and I/O devices, and provides an interface for applications to use these resources.'),
  ('Operating System', 'mcq', 'Which scheduling algorithm gives the shortest job priority to minimize average waiting time?', '["Round Robin", "First-Come First-Served", "Shortest Job First", "Priority Scheduling"]', 2, 'Shortest Job First (SJF) minimizes average waiting time by executing the shortest processes first.'),
  ('Operating System', 'mcq', 'What is a deadlock in an operating system?', '["A process that runs forever", "A situation where two or more processes are each waiting for resources held by the other", "A memory overflow", "A CPU crash"]', 1, 'Deadlock occurs when processes form a circular chain where each holds a resource needed by the next.'),
  ('Operating System', 'truefalse', 'Virtual memory allows a system to use more memory than is physically available in RAM.', '["True", "False"]', 0, 'Virtual memory uses disk space to extend available memory beyond physical RAM, enabling larger programs to run.'),
  ('Operating System', 'mcq', 'What is the purpose of a page table in memory management?', '["To store user passwords", "To map virtual addresses to physical addresses", "To list running processes", "To manage disk partitions"]', 1, 'A page table is the data structure used by the OS to translate virtual page numbers to physical frame addresses in RAM.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Admin Auth User
-- The admin page requires a Supabase Auth session (authenticated role)
-- to perform INSERT/UPDATE/DELETE on sheets, questions, and scores.
-- Create the admin user with a bcrypt-hashed password.
-- ============================================================

-- Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Create admin user in auth.users
-- Default credentials: email=admin@quiz.local, password=admin123
-- IMPORTANT: Change the password after initial setup!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@quiz.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}',
  '{"role": "admin"}',
  '',
  '',
  '',
  ''
) ON CONFLICT DO NOTHING;

-- Create the corresponding identity record (required for signInWithPassword)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'admin@quiz.local'),
  'admin@quiz.local',
  'email',
  '{"sub": "", "email": "admin@quiz.local", "email_verified": true, "phone_verified": false, "iss": "", "aud": ""}',
  now(),
  now(),
  now()
) ON CONFLICT DO NOTHING;
