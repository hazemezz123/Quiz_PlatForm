import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Question } from '../types'
import { CategoryId } from '../lib/categories'
import { fetchQuestionsByCategory, fetchQuestionsBySheet, saveScore } from '../lib/supabaseClient'

export interface SavedProgress {
  category: CategoryId | null
  sheet: string | null
  answers: Record<string, number>
  submittedAnswers: Record<string, boolean>
  currentIndex: number
  timestamp: number
}

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
  saveProgress: (currentIndex: number) => void
  clearProgress: () => void
  getSavedProgress: () => SavedProgress | null
  resumeFromProgress: (progress: SavedProgress) => Promise<void>
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

const STORAGE_KEY = 'quiz_user_name'
const PROGRESS_STORAGE_KEY = 'quiz_saved_progress'

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

    // Clear saved progress since quiz is complete
    localStorage.removeItem(PROGRESS_STORAGE_KEY)
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

  const saveProgress = useCallback(
    (currentIndex: number) => {
      const progress: SavedProgress = {
        category: currentCategory,
        sheet: currentSheet,
        answers,
        submittedAnswers,
        currentIndex,
        timestamp: Date.now(),
      }
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    },
    [currentCategory, currentSheet, answers, submittedAnswers],
  )

  const clearProgress = useCallback(() => {
    localStorage.removeItem(PROGRESS_STORAGE_KEY)
  }, [])

  const getSavedProgress = useCallback((): SavedProgress | null => {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as SavedProgress
    } catch {
      localStorage.removeItem(PROGRESS_STORAGE_KEY)
      return null
    }
  }, [])

  const resumeFromProgress = useCallback(async (progress: SavedProgress) => {
    setLoading(true)
    setError(null)
    try {
      let data: Question[]
      if (progress.category) {
        data = await fetchQuestionsByCategory(progress.category)
        setCurrentCategory(progress.category)
        setCurrentSheet(null)
      } else if (progress.sheet) {
        data = await fetchQuestionsBySheet(progress.sheet)
        setCurrentSheet(progress.sheet)
        setCurrentCategory(null)
      } else {
        throw new Error('No category or sheet in saved progress')
      }
      setQuestions(data)
      setAnswers(progress.answers)
      setSubmittedAnswers(progress.submittedAnswers)
      setScore(null)
      // Clear the saved progress after successful resume
      localStorage.removeItem(PROGRESS_STORAGE_KEY)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume quiz')
      localStorage.removeItem(PROGRESS_STORAGE_KEY)
    } finally {
      setLoading(false)
    }
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
        saveProgress,
        clearProgress,
        getSavedProgress,
        resumeFromProgress,
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
