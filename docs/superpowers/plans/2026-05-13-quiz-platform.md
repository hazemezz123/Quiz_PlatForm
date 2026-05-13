# Quiz Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Quiz Platform using React + Vite + TypeScript + Mantine UI with Supabase backend.

**Architecture:** Client-side rendered React app with React Router for navigation. Quiz state managed via React Context. Supabase PostgreSQL stores questions fetched via Supabase JS client. No auth; user enters name once.

**Tech Stack:** React 18, Vite, TypeScript, Mantine UI v7, React Router DOM v6, Supabase JS Client

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Create project files**

Create `package.json`:
```json
{
  "name": "quiz-platform",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "@mantine/core": "^7.5.0",
    "@mantine/hooks": "^7.5.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.0"
  }
}
```

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

Create `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quiz Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```

Create `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@mantine/core/styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
)
```

Create `src/App.tsx` (initial placeholder):
```typescript
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>App</div>} />
    </Routes>
  )
}

export default App
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: All dependencies installed successfully.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: scaffold quiz platform with vite + react + ts"
```

---

### Task 2: Types & Supabase Client

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/supabaseClient.ts`

- [ ] **Step 1: Create types**

Create `src/types/index.ts`:
```typescript
export type QuestionType = 'mcq' | 'truefalse'

export interface Question {
  id: string
  category: string
  type: QuestionType
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface QuizState {
  userName: string
  currentCategory: string | null
  questions: Question[]
  answers: Record<string, number>
  score: number | null
}
```

- [ ] **Step 2: Create Supabase client**

Create `src/lib/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Question } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('category')

  if (error) throw error

  const categories = [...new Set(data.map((q: { category: string }) => q.category))]
  return categories
}

export async function fetchQuestionsByCategory(category: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category', category)

  if (error) throw error

  return data as Question[]
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types src/lib
git commit -m "feat: add types and supabase client"
```

---

### Task 3: Quiz Context

**Files:**
- Create: `src/context/QuizContext.tsx`

- [ ] **Step 1: Write QuizContext**

Create `src/context/QuizContext.tsx`:
```typescript
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Question } from '../types'
import { fetchQuestionsByCategory } from '../lib/supabaseClient'

interface QuizContextType {
  userName: string
  setUserName: (name: string) => void
  currentCategory: string | null
  questions: Question[]
  answers: Record<string, number>
  score: number | null
  loading: boolean
  error: string | null
  startQuiz: (category: string) => Promise<void>
  setAnswer: (questionId: string, optionIndex: number) => void
  submitQuiz: () => void
  resetQuiz: () => void
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

const STORAGE_KEY = 'quiz_user_name'

export function QuizProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || ''
  })
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setUserName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEY, name)
    setUserNameState(name)
  }, [])

  const startQuiz = useCallback(async (category: string) => {
    setLoading(true)
    setError(null)
    setAnswers({})
    setScore(null)
    try {
      const data = await fetchQuestionsByCategory(category)
      setQuestions(data)
      setCurrentCategory(category)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [])

  const setAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }, [])

  const submitQuiz = useCallback(() => {
    let correctCount = 0
    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        correctCount++
      }
    })
    setScore(correctCount)
  }, [questions, answers])

  const resetQuiz = useCallback(() => {
    setCurrentCategory(null)
    setQuestions([])
    setAnswers({})
    setScore(null)
    setError(null)
  }, [])

  return (
    <QuizContext.Provider
      value={{
        userName,
        setUserName,
        currentCategory,
        questions,
        answers,
        score,
        loading,
        error,
        startQuiz,
        setAnswer,
        submitQuiz,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context
git commit -m "feat: add QuizContext for state management"
```

---

### Task 4: Layout Component

**Files:**
- Create: `src/components/Layout.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Layout component**

Create `src/components/Layout.tsx`:
```typescript
import { Container } from '@mantine/core'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <Container size="md" py="xl">
      {children}
    </Container>
  )
}
```

- [ ] **Step 2: Update App.tsx with QuizProvider and routes**

Replace `src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import { Layout } from './components/Layout'

function App() {
  return (
    <QuizProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<div>Entry</div>} />
          <Route path="/home" element={<div>Home</div>} />
          <Route path="/quiz/:category" element={<div>Quiz</div>} />
          <Route path="/result" element={<div>Result</div>} />
        </Routes>
      </Layout>
    </QuizProvider>
  )
}

export default App
```

- [ ] **Step 3: Commit**

```bash
git add src/components src/App.tsx
git commit -m "feat: add Layout component and wire up routes"
```

---

### Task 5: Entry Page

**Files:**
- Create: `src/pages/Entry.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Entry page**

Create `src/pages/Entry.tsx`:
```typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, TextInput, Button, Text, Stack } from '@mantine/core'
import { useQuiz } from '../context/QuizContext'

export function Entry() {
  const navigate = useNavigate()
  const { userName, setUserName } = useQuiz()
  const [name, setName] = useState('')

  useEffect(() => {
    if (userName) {
      navigate('/home')
    }
  }, [userName, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setUserName(name.trim())
      navigate('/home')
    }
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack>
        <Text size="xl" fw={700} ta="center">
          Welcome to Quiz Platform
        </Text>
        <Text c="dimmed" ta="center">
          Enter your name to get started
        </Text>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Button type="submit" fullWidth>
              Start Quiz
            </Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  )
}
```

- [ ] **Step 2: Import Entry in App.tsx**

Update `src/App.tsx` to import Entry:
```typescript
import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import { Layout } from './components/Layout'
import { Entry } from './pages/Entry'

function App() {
  return (
    <QuizProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/home" element={<div>Home</div>} />
          <Route path="/quiz/:category" element={<div>Quiz</div>} />
          <Route path="/result" element={<div>Result</div>} />
        </Routes>
      </Layout>
    </QuizProvider>
  )
}

export default App
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Entry.tsx src/App.tsx
git commit -m "feat: add Entry page with name input"
```

---

### Task 6: Home Page

**Files:**
- Create: `src/pages/Home.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Home page**

Create `src/pages/Home.tsx`:
```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Text, Stack, Group, Loader } from '@mantine/core'
import { useQuiz } from '../context/QuizContext'
import { fetchCategories } from '../lib/supabaseClient'

export function Home() {
  const navigate = useNavigate()
  const { userName, startQuiz } = useQuiz()
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectCategory = async (category: string) => {
    await startQuiz(category)
    navigate(`/quiz/${encodeURIComponent(category)}`)
  }

  if (loading) {
    return (
      <Stack align="center">
        <Loader />
        <Text>Loading categories...</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Text c="red">{error}</Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Stack>
      </Card>
    )
  }

  return (
    <Stack>
      <Text size="xl" fw={700} ta="center">
        Hello, {userName}!
      </Text>
      <Text c="dimmed" ta="center">
        Select a category to start your quiz
      </Text>
      <Group justify="center">
        {categories.map((category) => (
          <Card key={category} shadow="sm" padding="lg" radius="md" withBorder w={250}>
            <Stack>
              <Text fw={500} size="lg" ta="center">
                {category}
              </Text>
              <Button onClick={() => handleSelectCategory(category)} fullWidth>
                Start Quiz
              </Button>
            </Stack>
          </Card>
        ))}
      </Group>
    </Stack>
  )
}
```

- [ ] **Step 2: Import Home in App.tsx**

Update `src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import { Layout } from './components/Layout'
import { Entry } from './pages/Entry'
import { Home } from './pages/Home'

function App() {
  return (
    <QuizProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/home" element={<Home />} />
          <Route path="/quiz/:category" element={<div>Quiz</div>} />
          <Route path="/result" element={<div>Result</div>} />
        </Routes>
      </Layout>
    </QuizProvider>
  )
}

export default App
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx src/App.tsx
git commit -m "feat: add Home page with category selection"
```

---

### Task 7: Quiz Page

**Files:**
- Create: `src/pages/Quiz.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Quiz page**

Create `src/pages/Quiz.tsx`:
```typescript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Text,
  Stack,
  Group,
  Progress,
  Radio,
  Loader,
} from '@mantine/core'
import { useQuiz } from '../context/QuizContext'

export function Quiz() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const {
    questions,
    answers,
    setAnswer,
    submitQuiz,
    loading,
    error,
    currentCategory,
    startQuiz,
  } = useQuiz()

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!category) return
    const decodedCategory = decodeURIComponent(category)
    if (currentCategory !== decodedCategory) {
      startQuiz(decodedCategory)
    }
  }, [category, currentCategory, startQuiz])

  useEffect(() => {
    setCurrentIndex(0)
  }, [questions])

  if (loading) {
    return (
      <Stack align="center">
        <Loader />
        <Text>Loading questions...</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Text c="red">{error}</Text>
          <Button onClick={() => navigate('/home')}>Back to Home</Button>
        </Stack>
      </Card>
    )
  }

  if (questions.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Text>No questions available for this category.</Text>
          <Button onClick={() => navigate('/home')}>Back to Home</Button>
        </Stack>
      </Card>
    )
  }

  const currentQuestion = questions[currentIndex]
  const hasAnswered = currentQuestion.id in answers
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    submitQuiz()
    navigate('/result')
  }

  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <Stack>
      <Progress value={progress} size="sm" radius="xl" />
      <Text size="sm" c="dimmed" ta="right">
        Question {currentIndex + 1} of {questions.length}
      </Text>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Text fw={500} size="lg">
            {currentQuestion.question}
          </Text>

          <Radio.Group
            value={hasAnswered ? String(answers[currentQuestion.id]) : ''}
            onChange={(value) => setAnswer(currentQuestion.id, Number(value))}
          >
            <Stack>
              {currentQuestion.options.map((option, idx) => (
                <Radio key={idx} value={String(idx)} label={option} />
              ))}
            </Stack>
          </Radio.Group>

          {hasAnswered && (
            <Card padding="sm" radius="sm" bg="gray.0">
              <Text size="sm">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </Text>
            </Card>
          )}
        </Stack>
      </Card>

      <Group justify="space-between">
        <Button
          variant="default"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button onClick={handleSubmit} disabled={!hasAnswered}>
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!hasAnswered}>
            Next
          </Button>
        )}
      </Group>
    </Stack>
  )
}
```

- [ ] **Step 2: Import Quiz in App.tsx**

Update `src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import { Layout } from './components/Layout'
import { Entry } from './pages/Entry'
import { Home } from './pages/Home'
import { Quiz } from './pages/Quiz'

function App() {
  return (
    <QuizProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/home" element={<Home />} />
          <Route path="/quiz/:category" element={<Quiz />} />
          <Route path="/result" element={<div>Result</div>} />
        </Routes>
      </Layout>
    </QuizProvider>
  )
}

export default App
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Quiz.tsx src/App.tsx
git commit -m "feat: add Quiz page with navigation and explanations"
```

---

### Task 8: Result Page

**Files:**
- Create: `src/pages/Result.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Result page**

Create `src/pages/Result.tsx`:
```typescript
import { useNavigate } from 'react-router-dom'
import { Card, Button, Text, Stack, Progress } from '@mantine/core'
import { useQuiz } from '../context/QuizContext'

export function Result() {
  const navigate = useNavigate()
  const { userName, score, questions, resetQuiz } = useQuiz()

  const handleRetake = () => {
    resetQuiz()
    navigate('/home')
  }

  if (score === null) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Text>No quiz results available.</Text>
          <Button onClick={() => navigate('/home')}>Go Home</Button>
        </Stack>
      </Card>
    )
  }

  const totalQuestions = questions.length
  const percentage = Math.round((score / totalQuestions) * 100)

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack align="center">
        <Text size="xl" fw={700}>
          Quiz Complete!
        </Text>
        <Text size="lg">
          Great job, {userName}!
        </Text>
        <Text size="md">
          You scored {score} out of {totalQuestions}
        </Text>
        <Progress
          value={percentage}
          size="xl"
          radius="xl"
          w="100%"
        />
        <Text size="sm" c="dimmed">
          {percentage}% correct
        </Text>
        <Button onClick={handleRetake} fullWidth>
          Take Another Quiz
        </Button>
      </Stack>
    </Card>
  )
}
```

- [ ] **Step 2: Import Result in App.tsx**

Update `src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import { Layout } from './components/Layout'
import { Entry } from './pages/Entry'
import { Home } from './pages/Home'
import { Quiz } from './pages/Quiz'
import { Result } from './pages/Result'

function App() {
  return (
    <QuizProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/home" element={<Home />} />
          <Route path="/quiz/:category" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </Layout>
    </QuizProvider>
  )
}

export default App
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Result.tsx src/App.tsx
git commit -m "feat: add Result page with score display"
```

---

### Task 9: Seed Data & Environment Configuration

**Files:**
- Create: `data/questions.json`
- Create: `.env.example`

- [ ] **Step 1: Create seed data**

Create `data/questions.json`:
```json
[
  {
    "category": "Python",
    "type": "mcq",
    "question": "What does len() do?",
    "options": ["Add", "Length", "Remove", "Sort"],
    "answer": 1,
    "explanation": "len() returns the number of items in an object."
  },
  {
    "category": "Python",
    "type": "truefalse",
    "question": "Python is a statically typed language.",
    "options": ["True", "False"],
    "answer": 1,
    "explanation": "Python is dynamically typed, meaning types are checked at runtime."
  },
  {
    "category": "Python",
    "type": "mcq",
    "question": "Which keyword is used to define a function in Python?",
    "options": ["func", "def", "function", "define"],
    "answer": 1,
    "explanation": "The 'def' keyword is used to define a function in Python."
  },
  {
    "category": "JavaScript",
    "type": "mcq",
    "question": "What is the result of '2' + 2 in JavaScript?",
    "options": ["4", "22", "NaN", "Error"],
    "answer": 1,
    "explanation": "In JavaScript, the + operator concatenates strings, so '2' + 2 = '22'."
  },
  {
    "category": "JavaScript",
    "type": "truefalse",
    "question": "JavaScript and Java are the same language.",
    "options": ["True", "False"],
    "answer": 1,
    "explanation": "JavaScript and Java are completely different languages with different purposes."
  },
  {
    "category": "JavaScript",
    "type": "mcq",
    "question": "Which method is used to add an element to the end of an array?",
    "options": ["shift()", "unshift()", "pop()", "push()"],
    "answer": 3,
    "explanation": "push() adds one or more elements to the end of an array."
  }
]
```

- [ ] **Step 2: Create environment example file**

Create `.env.example`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 3: Commit**

```bash
git add data/questions.json .env.example
git commit -m "chore: add seed data and env example"
```

---

### Task 10: Final Integration & Verification

**Files:**
- Modify: `src/App.tsx` (if needed)
- Modify: Any files with issues

- [ ] **Step 1: Verify all imports and types**

Run: `npm run build`
Expected: Build completes with 0 errors.

- [ ] **Step 2: Run dev server for smoke test**

Run: `npm run dev`
Expected: Server starts on `http://localhost:5173` with no runtime errors.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete quiz platform implementation"
```

---

## Spec Coverage Checklist

| Spec Requirement | Implementing Task |
|------------------|-------------------|
| React + Vite + TypeScript | Task 1 |
| Mantine UI components only | Tasks 5, 6, 7, 8 |
| Supabase backend | Tasks 2, 6, 7 |
| Name entry (no auth) | Task 5 |
| Home page with categories | Task 6 |
| Quiz page one question at a time | Task 7 |
| MCQ and True/False support | Task 7 |
| Next/Previous navigation | Task 7 |
| Submit button | Task 7 |
| Score calculation | Task 3 (Context), Task 7 (submit), Task 8 (display) |
| Result page | Task 8 |
| Explanation after answering | Task 7 |
| Progress bar | Task 7 |
| Clean project structure | All tasks |

## Placeholder Scan
- [x] No TBD/TODO/fill in details
- [x] No vague "add error handling" without specifics
- [x] No "similar to Task X" references
- [x] All file paths are exact
- [x] All code blocks contain complete, runnable code
