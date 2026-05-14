import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Question } from '../types'
import { CategoryId } from '../lib/categories'
import { fetchQuestionsByCategory, fetchQuestionsBySheet, saveScore } from '../lib/supabaseClient'

interface QuizContextType {
  userName: string
  setUserName: (name: string) => void
  currentCategory: CategoryId | null
  currentSheet: string | null
  questions: Question[]
  answers: Record<string, number>
  submittedAnswers: Record<string, boolean>
  score: number | null
  loading: boolean
  error: string | null
  startQuiz: (category: CategoryId) => Promise<void>
  startSheetQuiz: (sheet: string) => Promise<void>
  setAnswer: (questionId: string, optionIndex: number) => void
  skipQuestion: (questionId: string) => void
  submitQuiz: () => void
  resetQuiz: () => void
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

const STORAGE_KEY = 'quiz_user_name'

export function QuizProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || ''
  })
  const [currentCategory, setCurrentCategory] = useState<CategoryId | null>(null)
  const [currentSheet, setCurrentSheet] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({})
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setUserName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEY, name)
    setUserNameState(name)
  }, [])

  const startQuiz = useCallback(async (category: CategoryId) => {
    setLoading(true)
    setError(null)
    setAnswers({})
    setSubmittedAnswers({})
    setScore(null)
    setCurrentSheet(null)
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

  const startSheetQuiz = useCallback(async (sheet: string) => {
    setLoading(true)
    setError(null)
    setAnswers({})
    setSubmittedAnswers({})
    setScore(null)
    setCurrentCategory(null)
    try {
      const data = await fetchQuestionsBySheet(sheet)
      setQuestions(data)
      setCurrentSheet(sheet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [])

  const setAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      if (prev[questionId] !== undefined) return prev
      return { ...prev, [questionId]: optionIndex }
    })
    setSubmittedAnswers((prev) => ({ ...prev, [questionId]: true }))
  }, [])

  const skipQuestion = useCallback((questionId: string) => {
    setAnswers((prev) => {
      if (prev[questionId] !== undefined) return prev
      return { ...prev, [questionId]: -1 }
    })
    setSubmittedAnswers((prev) => {
      if (prev[questionId]) return prev
      return { ...prev, [questionId]: true }
    })
  }, [])

  const submitQuiz = useCallback(() => {
    let correctCount = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correctCount++
      }
    })
    setScore(correctCount)

    // Save to leaderboard
    const total = questions.length
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0
    saveScore({
      user_name: userName,
      score: correctCount,
      total_questions: total,
      percentage,
      category: currentCategory,
      sheet: currentSheet,
    }).catch((err) => console.error('Failed to save score:', err))
  }, [questions, answers, userName, currentCategory, currentSheet])

  const resetQuiz = useCallback(() => {
    setCurrentCategory(null)
    setCurrentSheet(null)
    setQuestions([])
    setAnswers({})
    setSubmittedAnswers({})
    setScore(null)
    setError(null)
  }, [])

  return (
    <QuizContext.Provider
      value={{
        userName,
        setUserName,
        currentCategory,
        currentSheet,
        questions,
        answers,
        submittedAnswers,
        score,
        loading,
        error,
        startQuiz,
        startSheetQuiz,
        setAnswer,
        skipQuestion,
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
