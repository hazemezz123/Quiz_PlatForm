import { useState, useCallback } from 'react'
import {
  Card,
  Stack,
  Text,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  FileInput,
} from '@mantine/core'
import { Plus } from 'lucide-react'
import { CATEGORY_IDS, CategoryId } from '../../../lib/categories'
import { insertQuestions } from '../../../lib/supabaseClient'
import { parseJsonQuestions, formatQuestionsForInsert } from '../utils/questionParser'

interface AddQuestionsFormProps {
  sheets: string[]
  findSheetByName: (name: string) => { name: string; category: string } | undefined
  insertNewSheet: (name: string, category: CategoryId) => Promise<void>
  onSuccess: () => void
}

export function AddQuestionsForm({
  findSheetByName,
  insertNewSheet,
  onSuccess,
}: AddQuestionsFormProps) {
  const [sheetCategory, setSheetCategory] = useState<CategoryId | null>(null)
  const [sheetName, setSheetName] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [jsonError, setJsonError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const handleClear = useCallback(() => {
    setJsonInput('')
    setJsonFile(null)
    setJsonError('')
    setAddSuccess('')
  }, [])

  const handleAddQuestions = useCallback(async () => {
    setJsonError('')
    setAddSuccess('')

    if (!sheetName.trim()) {
      setJsonError('Sheet name is required (e.g., 1, 2, 3)')
      return
    }

    if (!sheetCategory) {
      setJsonError('Category is required — select one of the allowed categories')
      return
    }

    if (!jsonFile && !jsonInput.trim()) {
      setJsonError('Either upload a JSON file or enter JSON content')
      return
    }

    let jsonString = jsonInput
    if (jsonFile) {
      try {
        jsonString = await jsonFile.text()
      } catch {
        setJsonError('Failed to read the selected file')
        return
      }
    }

    const outcome = parseJsonQuestions(jsonString)
    if (!outcome.success) {
      setJsonError(outcome.error)
      return
    }

    const formatted = formatQuestionsForInsert(outcome.questions, sheetCategory, sheetName.trim())

    try {
      const existingSheet = findSheetByName(sheetName.trim())
      if (existingSheet && existingSheet.category !== sheetCategory) {
        setJsonError(
          `Sheet "${sheetName.trim()}" already exists under category "${existingSheet.category}"`,
        )
        return
      }

      if (!existingSheet) {
        await insertNewSheet(sheetName.trim(), sheetCategory)
      }

      await insertQuestions(formatted)
      setAddSuccess(
        `Successfully added ${formatted.length} question(s) to Sheet "${sheetName}" (${sheetCategory})`,
      )
      handleClear()
      onSuccess()
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Failed to insert questions')
    }
  }, [
    sheetCategory,
    sheetName,
    jsonInput,
    jsonFile,
    findSheetByName,
    insertNewSheet,
    onSuccess,
    handleClear,
  ])

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text fw={600}>Add Questions via JSON</Text>

        <Select
          label="Sheet Category"
          placeholder="Select category for this sheet"
          data={CATEGORY_IDS.map((c) => ({ value: c, label: c }))}
          value={sheetCategory}
          onChange={(val) => setSheetCategory(val as CategoryId)}
          description="All questions in this sheet will belong to this category"
          required
        />

        <TextInput
          label="Sheet Name"
          placeholder="e.g., 1, 2, 3..."
          value={sheetName}
          onChange={(e) => setSheetName(e.currentTarget.value)}
          description="All questions will be assigned to this sheet"
          required
        />

        <FileInput
          label="Upload JSON File"
          placeholder="Select a JSON file from your device"
          accept="application/json,.json"
          value={jsonFile}
          onChange={setJsonFile}
          clearable
          description="Alternatively, upload a JSON file instead of pasting content"
        />

        <Textarea
          label="Questions JSON"
          placeholder={`[\n  {\n    "category": "Science",\n    "type": "mcq",\n    "question": "What is...?",\n    "options": ["A", "B", "C", "D"],\n    "answer": 0,\n    "explanation": "Because..."\n  }\n]`}
          minRows={15}
          maxRows={30}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.currentTarget.value)}
          error={jsonError}
          styles={{ input: { fontFamily: 'monospace' } }}
        />

        {addSuccess && (
          <Text size="sm" c="teal">
            {addSuccess}
          </Text>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleAddQuestions} color="teal" leftSection={<Plus size={16} />}>
            Add Questions
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
