import { useState, useCallback } from 'react'
import { Stack, Group, TextInput, Select, Card } from '@mantine/core'
import { Search } from 'lucide-react'
import { Question } from '../../../types'
import { CategoryId } from '../../../lib/categories'
import { QuestionTable } from './QuestionTable'
import { SheetManagementCards } from './SheetManagementCards'

interface ManageQuestionsTabProps {
  filteredQuestions: Question[]
  search: string
  setSearch: (val: string) => void
  filterCategory: string | null
  setFilterCategory: (val: string | null) => void
  filterSheet: string | null
  setFilterSheet: (val: string | null) => void
  categories: CategoryId[]
  sheets: string[]
  questions: Question[]
  onEdit: (q: Question) => void
  onDelete: (id: string) => void
  onDeleteSheet: (sheetName: string, questionCount: number) => Promise<boolean>
  onRenameSheet: (oldName: string, newName: string, questionCount: number) => Promise<boolean>
  onChangeSheetCategory: (
    sheetName: string,
    newCategory: CategoryId,
    currentCategory: string,
    questionCount: number,
  ) => Promise<boolean>
  refreshData: () => void
}

export function ManageQuestionsTab({
  filteredQuestions,
  search,
  setSearch,
  filterCategory,
  setFilterCategory,
  filterSheet,
  setFilterSheet,
  categories,
  sheets,
  questions,
  onEdit,
  onDelete,
  onDeleteSheet,
  onRenameSheet,
  onChangeSheetCategory,
  refreshData,
}: ManageQuestionsTabProps) {
  const [deleteSheetValue, setDeleteSheetValue] = useState<string | null>(null)
  const [renameOldSheet, setRenameOldSheet] = useState<string | null>(null)
  const [renameNewSheet, setRenameNewSheet] = useState('')
  const [changeCatSheet, setChangeCatSheet] = useState<string | null>(null)
  const [changeCatNew, setChangeCatNew] = useState<CategoryId | null>(null)

  const handleDeleteSheet = useCallback(async () => {
    if (!deleteSheetValue) return
    const count = questions.filter((q) => q.sheet === deleteSheetValue).length
    const success = await onDeleteSheet(deleteSheetValue, count)
    if (success) {
      setDeleteSheetValue(null)
      refreshData()
    }
  }, [deleteSheetValue, questions, onDeleteSheet, refreshData])

  const handleRenameSheet = useCallback(async () => {
    if (!renameOldSheet || !renameNewSheet.trim()) return
    const count = questions.filter((q) => q.sheet === renameOldSheet).length
    const success = await onRenameSheet(renameOldSheet, renameNewSheet.trim(), count)
    if (success) {
      setRenameOldSheet(null)
      setRenameNewSheet('')
      refreshData()
    }
  }, [renameOldSheet, renameNewSheet, questions, onRenameSheet, refreshData])

  const handleChangeSheetCategory = useCallback(async () => {
    if (!changeCatSheet || !changeCatNew) return
    const count = questions.filter((q) => q.sheet === changeCatSheet).length
    const currentCategory = questions.find((q) => q.sheet === changeCatSheet)?.category || ''
    const success = await onChangeSheetCategory(
      changeCatSheet,
      changeCatNew,
      currentCategory,
      count,
    )
    if (success) {
      setChangeCatSheet(null)
      setChangeCatNew(null)
      refreshData()
    }
  }, [changeCatSheet, changeCatNew, questions, onChangeSheetCategory, refreshData])

  return (
    <Stack gap="md">
      <Group>
        <TextInput
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          leftSection={<Search size={16} />}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by category"
          data={categories}
          value={filterCategory}
          onChange={setFilterCategory}
          clearable
          style={{ minWidth: 180 }}
        />
        <Select
          placeholder="Filter by sheet"
          data={sheets}
          value={filterSheet}
          onChange={setFilterSheet}
          clearable
          style={{ minWidth: 180 }}
        />
      </Group>

      <SheetManagementCards
        sheets={sheets}
        deleteSheetValue={deleteSheetValue}
        setDeleteSheetValue={setDeleteSheetValue}
        renameOldSheet={renameOldSheet}
        setRenameOldSheet={setRenameOldSheet}
        renameNewSheet={renameNewSheet}
        setRenameNewSheet={setRenameNewSheet}
        changeCatSheet={changeCatSheet}
        setChangeCatSheet={setChangeCatSheet}
        changeCatNew={changeCatNew}
        setChangeCatNew={setChangeCatNew}
        onDeleteSheet={handleDeleteSheet}
        onRenameSheet={handleRenameSheet}
        onChangeSheetCategory={handleChangeSheetCategory}
      />

      <Card shadow="sm" padding={0} radius="md" withBorder>
        <QuestionTable filteredQuestions={filteredQuestions} onEdit={onEdit} onDelete={onDelete} />
      </Card>
    </Stack>
  )
}
