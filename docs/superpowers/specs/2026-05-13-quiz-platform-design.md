# Quiz Platform Design Spec

> Date: 2026-05-13
> Topic: Quiz Platform with Supabase Backend

## Overview
A simple, interactive quiz platform built with React + Vite + TypeScript and Mantine UI. Questions are fetched from a Supabase backend. Users enter their name once and can take quizzes across different categories.

## Goals
- Provide a clean, intuitive quiz-taking experience
- Support MCQ and True/False question types
- Show explanations immediately after answering
- Calculate and display scores on completion
- Use Supabase as the single source of truth for questions

## Architecture

### Frontend
- **React 18** with functional components and hooks
- **Vite** for build tooling and dev server
- **TypeScript** for type safety
- **React Router DOM** for client-side navigation
- **Mantine UI** as the sole UI component library
- **Supabase JS Client** for data fetching

### Backend (Supabase)
- PostgreSQL database with a single `questions` table
- No authentication; no RLS policies needed for read-only public access
- Questions fetched via `.select()` queries

## Database Schema

### Table: `questions`
| Column      | Type    | Description                          |
|-------------|---------|--------------------------------------|
| id          | uuid    | Primary key                          |
| category    | text    | Quiz category (e.g., "Python")       |
| type        | text    | "mcq" or "truefalse"                 |
| question    | text    | The question text                    |
| options     | jsonb   | Array of option strings              |
| answer      | integer | Index of correct option (0-based)    |
| explanation | text    | Explanation shown after answering    |

## Pages & Components

### Pages
1. **Entry Page** (`/`)  
   - Single text input for user's name
   - "Start Quiz" button
   - Stores name in React Context + localStorage
   - Redirects to Home if name already exists

2. **Home Page** (`/home`)  
   - Welcome message with user's name
   - Fetches distinct categories from Supabase
   - Category cards; clicking starts a quiz in that category

3. **Quiz Page** (`/quiz/:category`)  
   - Fetches questions for the selected category
   - Displays one question at a time
   - `Progress` bar showing completion
   - `RadioGroup` for answer selection
   - Explanation `Text` appears immediately after selecting an answer
   - "Previous" and "Next" `Button`s
   - "Submit" `Button` on the final question

4. **Result Page** (`/result`)  
   - Shows user's name and final score
   - `Progress` ring/bar for visual score representation
   - "Take Another Quiz" `Button` to return Home

### Components
- **Layout** (`components/Layout.tsx`): Wraps all pages in a Mantine `Container`

### Context
- **QuizContext** (`context/QuizContext.tsx`):  
  - `userName: string`  
  - `currentCategory: string | null`  
  - `questions: Question[]`  
  - `answers: Record<questionId, selectedOptionIndex>`  
  - `score: number | null`  
  - Actions: `setUserName`, `startQuiz`, `setAnswer`, `submitQuiz`, `resetQuiz`

### Lib
- **supabaseClient** (`lib/supabaseClient.ts`):  
  - Initializes Supabase client with `createClient(url, anonKey)`

## Data Flow
1. User enters name on Entry page → stored in Context + localStorage
2. Home page loads → fetches distinct `category` values from `questions` table
3. User selects category → Context stores category, fetches questions where `category = selected`
4. Quiz page renders question by index from Context
5. User selects answer → stored in Context immediately, explanation shown
6. Navigation (Next/Previous) updates question index in local state
7. Submit → Context calculates score by comparing `answers[question.id]` to `question.answer`
8. Result page reads `score` and `questions.length` from Context

## UI Requirements (Mantine Components Only)
- `Container` for page layout wrapper
- `Card` for category selection and question cards
- `Button` for all actions (Next, Previous, Submit, Start)
- `RadioGroup` / `Radio` for answer choices
- `Progress` for quiz completion bar
- `Text` for all text content
- `TextInput` for name entry

## Question Data Format (JSON)
```json
{
  "id": "q1",
  "type": "mcq",
  "question": "What does len() do?",
  "options": ["Add", "Length", "Remove", "Sort"],
  "answer": 1,
  "explanation": "len() returns number of items"
}
```

## State Management
All quiz state lives in `QuizContext` to avoid prop drilling across pages:
- User name is persisted to `localStorage` so refreshing doesn't lose it
- Answers are tracked in a dictionary: `{ [questionId]: selectedOptionIndex }`
- Score is computed on submit, not incrementally

## Error Handling
- If Supabase fetch fails, show a simple error `Text` with a "Retry" `Button`
- If no questions exist for a category, show "No questions available" message
- Loading states use Mantine `Loader` or simple `Text` ("Loading...")

## Routing
| Route            | Page   |
|------------------|--------|
| `/`              | Entry  |
| `/home`          | Home   |
| `/quiz/:category`| Quiz   |
| `/result`        | Result |

## Project Structure
```
src/
  pages/
    Entry.tsx
    Home.tsx
    Quiz.tsx
    Result.tsx
  components/
    Layout.tsx
  context/
    QuizContext.tsx
  lib/
    supabaseClient.ts
  types/
    index.ts
  App.tsx
  main.tsx
public/
data/               # Seed JSON for Supabase (optional)
```

## Out of Scope (YAGNI)
- User authentication / accounts
- Quiz history / persistence of results
- Timers or time limits
- Leaderboards
- Admin panel for adding questions
- Multiple question types beyond MCQ and True/False
- Image or media-based questions

## Success Criteria
- [ ] User can enter their name and it persists
- [ ] Categories load from Supabase
- [ ] Questions load from Supabase for selected category
- [ ] One question displayed at a time with navigation
- [ ] Explanation shown after selecting an answer
- [ ] Score calculated correctly on submit
- [ ] Result page shows name and score
- [ ] Only Mantine UI components used
- [ ] Clean, readable, well-typed code
