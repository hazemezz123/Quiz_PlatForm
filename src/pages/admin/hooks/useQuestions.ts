import { useState, useCallback, useMemo } from 'react'
import { useDisclosure, useDebouncedValue } from '@mantine/hooks'
import { fetchAllQuestions, deleteQuestion } from '../../../lib/supabaseClient'
import { Question } from '../../../types'
import { CategoryId } from '../../../lib/categories'

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterSheet, setFilterSheet] = useState<string | null>(null)

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const loadQuestions = useCallback(async () => {
    try {
      const data = await fetchAllQuestions()
      setQuestions(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const [debouncedSearch] = useDebouncedValue(search, 300)

  const filteredQuestions = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return questions.filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(term) || q.category.toLowerCase().includes(term)
      const matchesCategory = filterCategory ? q.category === filterCategory : true
      const matchesSheet = filterSheet ? q.sheet === filterSheet : true
      return matchesSearch && matchesCategory && matchesSheet
    })
  }, [questions, debouncedSearch, filterCategory, filterSheet])

  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category))] as CategoryId[],
    [questions],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this question?')) return
      try {
        await deleteQuestion(id)
        loadQuestions()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete')
      }
    },
    [loadQuestions],
  )

  const openEditModal = useCallback(
    (q: Question) => {
      setEditingQuestion(q)
      openEdit()
    },
    [openEdit],
  )

  const closeEditModal = useCallback(() => {
    closeEdit()
  }, [closeEdit])

  const handleEditSave = useCallback(async () => {
    loadQuestions()
  }, [loadQuestions])

  return {
    questions,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    filterSheet,
    setFilterSheet,
    filteredQuestions,
    categories,
    loadQuestions,
    handleDelete,
    editOpened,
    editingQuestion,
    openEditModal,
    closeEditModal,
    handleEditSave,
  }
}
