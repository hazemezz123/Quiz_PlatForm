import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Text,
  Stack,
  Group,
  TextInput,
  Textarea,
  Table,
  Badge,
  Tabs,
  NumberInput,
  Select,
  Modal,
  ActionIcon,
  ScrollArea,
  Grid,
  PasswordInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trash, Pencil, Search, Plus, ArrowLeft } from 'lucide-react'
import { Question, QuestionType } from '../types'
import { CodeRenderer } from '../components/CodeRenderer'
import {
  fetchAllQuestions,
  insertQuestions,
  deleteQuestion,
  updateQuestion,
  deleteSheet as deleteSheetApi,
  renameSheet,
} from '../lib/supabaseClient'

const ADMIN_PASSWORD = 'hazemezz123123'
const ADMIN_KEY = 'quiz_admin_auth'

/* ------------------------------------------------------------------ */
/*  Edit Modal – extracted so its state changes don’t re-render table  */
/* ------------------------------------------------------------------ */
interface EditModalProps {
  opened: boolean
  onClose: () => void
  question: Question | null
  onSave: () => void
}

const EditQuestionModal = memo(function EditQuestionModal({
  opened,
  onClose,
  question,
  onSave,
}: EditModalProps) {
  const [category, setCategory] = useState('')
  const [sheet, setSheet] = useState('')
  const [type, setType] = useState<QuestionType>('mcq')
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState('')
  const [answer, setAnswer] = useState(0)
  const [explanation, setExplanation] = useState('')

  useEffect(() => {
    if (question) {
      setCategory(question.category)
      setSheet(question.sheet || '')
      setType(question.type)
      setQuestionText(question.question)
      setOptions(JSON.stringify(question.options, null, 2))
      setAnswer(question.answer)
      setExplanation(question.explanation)
    }
  }, [question])

  const handleUpdate = async () => {
    if (!question) return
    let parsedOptions: string[]
    try {
      parsedOptions = JSON.parse(options)
      if (!Array.isArray(parsedOptions)) throw new Error()
    } catch {
      alert('Options must be a valid JSON array')
      return
    }
    try {
      await updateQuestion(question.id, {
        category,
        sheet: sheet || undefined,
        type,
        question: questionText,
        options: parsedOptions,
        answer,
        explanation,
      })
      onSave()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to update')
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Question" size="lg">
      <Stack gap="md">
        <TextInput
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.currentTarget.value)}
        />
        <TextInput
          label="Sheet"
          value={sheet}
          onChange={(e) => setSheet(e.currentTarget.value)}
          description="Leave empty for no sheet"
        />
        <Select
          label="Type"
          data={[
            { value: 'mcq', label: 'MCQ' },
            { value: 'truefalse', label: 'True / False' },
          ]}
          value={type}
          onChange={(val) => setType(val as QuestionType)}
        />
        <Textarea
          label="Question"
          value={questionText}
          onChange={(e) => setQuestionText(e.currentTarget.value)}
          minRows={2}
        />
        <Textarea
          label="Options (JSON array)"
          value={options}
          onChange={(e) => setOptions(e.currentTarget.value)}
          minRows={3}
          styles={{ input: { fontFamily: 'monospace' } }}
          description='Example: ["Option A", "Option B", "Option C", "Option D"]'
        />
        <NumberInput
          label="Correct Answer Index"
          value={answer}
          onChange={(val) => setAnswer(Number(val))}
          min={0}
          description="Zero-based index of the correct option"
        />
        <Textarea
          label="Explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.currentTarget.value)}
          minRows={2}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
})

/* ------------------------------------------------------------------ */
/*  Question Table Row – memoised so parent re-renders don’t touch it  */
/* ------------------------------------------------------------------ */
interface RowProps {
  q: Question
  onEdit: (q: Question) => void
  onDelete: (id: string) => void
}

const QuestionRow = memo(function QuestionRow({ q, onEdit, onDelete }: RowProps) {
  return (
    <Table.Tr>
      <Table.Td>
        <CodeRenderer text={q.question} />
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light">
          {q.category}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{q.sheet || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" color={q.type === 'mcq' ? 'blue' : 'grape'}>
          {q.type}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="teal">
          {q.options[q.answer]}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="light" color="blue" onClick={() => onEdit(q)}>
            <Pencil size={16} />
          </ActionIcon>
          <ActionIcon variant="light" color="red" onClick={() => onDelete(q.id)}>
            <Trash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  )
})

/* ------------------------------------------------------------------ */
/*  Main Admin Page                                                   */
/* ------------------------------------------------------------------ */
export function Admin() {
  const navigate = useNavigate()

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(ADMIN_KEY) === 'true'
  })
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [questions, setQuestions] = useState<Question[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterSheet, setFilterSheet] = useState<string | null>(null)

  // Delete sheet state
  const [deleteSheetValue, setDeleteSheetValue] = useState<string | null>(null)

  // Rename sheet state
  const [renameOldSheet, setRenameOldSheet] = useState<string | null>(null)
  const [renameNewSheet, setRenameNewSheet] = useState('')

  // Add form state
  const [jsonInput, setJsonInput] = useState('')
  const [sheetName, setSheetName] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  // Edit modal state
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

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions()
    }
  }, [isAuthenticated, loadQuestions])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, 'true')
      setIsAuthenticated(true)
      setPasswordError('')
    } else {
      setPasswordError('Incorrect password')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY)
    setIsAuthenticated(false)
  }

  const handleAddQuestions = async () => {
    setJsonError('')
    setAddSuccess('')

    if (!sheetName.trim()) {
      setJsonError('Sheet name is required (e.g., 1, 2, 3)')
      return
    }

    let parsed: any[]
    try {
      parsed = JSON.parse(jsonInput)
      if (!Array.isArray(parsed)) {
        setJsonError('JSON must be an array of question objects')
        return
      }
    } catch {
      setJsonError('Invalid JSON format')
      return
    }

    const formatted = parsed.map((q: any) => {
      if (
        !q.category ||
        !q.type ||
        !q.question ||
        !Array.isArray(q.options) ||
        typeof q.answer !== 'number' ||
        !q.explanation
      ) {
        throw new Error(
          'Each question must have: category, type, question, options (array), answer (number), explanation'
        )
      }
      return {
        category: String(q.category),
        sheet: String(sheetName),
        type: q.type as QuestionType,
        question: String(q.question),
        options: q.options.map(String),
        answer: Number(q.answer),
        explanation: String(q.explanation),
      }
    })

    try {
      await insertQuestions(formatted)
      setAddSuccess(`Successfully added ${formatted.length} question(s) to Sheet ${sheetName}`)
      setJsonInput('')
      loadQuestions()
    } catch (err: any) {
      setJsonError(err.message || 'Failed to insert questions')
    }
  }

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this question?')) return
      try {
        await deleteQuestion(id)
        loadQuestions()
      } catch (err: any) {
        alert(err.message || 'Failed to delete')
      }
    },
    [loadQuestions]
  )

  const handleDeleteSheet = async () => {
    if (!deleteSheetValue) return
    const count = questions.filter((q) => q.sheet === deleteSheetValue).length
    if (
      !window.confirm(
        `Are you sure you want to delete Sheet "${deleteSheetValue}"?\nThis will permanently delete ${count} question(s).`
      )
    )
      return
    try {
      await deleteSheetApi(deleteSheetValue)
      setDeleteSheetValue(null)
      loadQuestions()
    } catch (err: any) {
      alert(err.message || 'Failed to delete sheet')
    }
  }

  const handleRenameSheet = async () => {
    if (!renameOldSheet || !renameNewSheet.trim()) return
    if (renameOldSheet === renameNewSheet.trim()) {
      alert('New name must be different from the current name')
      return
    }
    const count = questions.filter((q) => q.sheet === renameOldSheet).length
    if (
      !window.confirm(
        `Rename Sheet "${renameOldSheet}" to "${renameNewSheet.trim()}"?\nThis will update ${count} question(s) and all linked scores.`
      )
    )
      return
    try {
      await renameSheet(renameOldSheet, renameNewSheet.trim())
      setRenameOldSheet(null)
      setRenameNewSheet('')
      loadQuestions()
    } catch (err: any) {
      alert(err.message || 'Failed to rename sheet')
    }
  }

  const openEditModal = useCallback((q: Question) => {
    setEditingQuestion(q)
    openEdit()
  }, [openEdit])

  /* Memoised derived data – prevents re-computation on every keystroke */
  const filteredQuestions = useMemo(() => {
    const term = search.toLowerCase()
    return questions.filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(term) ||
        q.category.toLowerCase().includes(term)
      const matchesCategory = filterCategory ? q.category === filterCategory : true
      const matchesSheet = filterSheet ? q.sheet === filterSheet : true
      return matchesSearch && matchesCategory && matchesSheet
    })
  }, [questions, search, filterCategory, filterSheet])

  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category))],
    [questions]
  )
  const sheets = useMemo(
    () => [...new Set(questions.map((q) => q.sheet).filter((s): s is string => !!s))],
    [questions]
  )

  const totalQuestions = questions.length
  const totalCategories = categories.length
  const totalSheets = sheets.length

  if (!isAuthenticated) {
    return (
      <Stack align="center" gap="lg" pt="xl">
        <Text fw={700} size="xl">
          Admin Login
        </Text>
        <Card shadow="sm" padding="xl" radius="md" withBorder maw={400} w="100%">
          <Stack gap="md">
            <PasswordInput
              label="Password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              error={passwordError}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} color="teal" fullWidth>
              Login
            </Button>
          </Stack>
        </Card>
      </Stack>
    )
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Text fw={700} size="xl">
          Admin Dashboard
        </Text>
        <Group gap="sm">
          <Button
            variant="default"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => navigate('/home')}
          >
            Back to Platform
          </Button>
          <Button variant="light" color="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed">
              Total Questions
            </Text>
            <Text fw={700} size="2xl">
              {totalQuestions}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed">
              Categories
            </Text>
            <Text fw={700} size="2xl">
              {totalCategories}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed">
              Sheets
            </Text>
            <Text fw={700} size="2xl">
              {totalSheets}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Tabs defaultValue="add" color="teal">
        <Tabs.List>
          <Tabs.Tab value="add" leftSection={<Plus size={16} />}>
            Add Questions
          </Tabs.Tab>
          <Tabs.Tab value="manage" leftSection={<Search size={16} />}>
            Manage Questions
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="add" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Text fw={600}>Add Questions via JSON</Text>

              <TextInput
                label="Sheet Name"
                placeholder="e.g., 1, 2, 3..."
                value={sheetName}
                onChange={(e) => setSheetName(e.currentTarget.value)}
                description="All questions will be assigned to this sheet"
                required
              />

              <Textarea
                label="Questions JSON"
                placeholder={`[\n  {\n    "category": "Science",\n    "type": "mcq",\n    "question": "What is...?",\n    "options": ["A", "B", "C", "D"],\n    "answer": 0,\n    "explanation": "Because..."\n  }\n]`}
                minRows={10}
                maxRows={20}
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
                <Button
                  variant="default"
                  onClick={() => {
                    setJsonInput('')
                    setJsonError('')
                    setAddSuccess('')
                  }}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleAddQuestions}
                  color="teal"
                  leftSection={<Plus size={16} />}
                >
                  Add Questions
                </Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="manage" pt="md">
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

            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" align="flex-end">
                <Select
                  label="Delete Entire Sheet"
                  placeholder="Select sheet to delete"
                  data={sheets}
                  value={deleteSheetValue}
                  onChange={setDeleteSheetValue}
                  clearable
                  style={{ minWidth: 280 }}
                />
                <Button
                  color="red"
                  variant="light"
                  disabled={!deleteSheetValue}
                  leftSection={<Trash size={16} />}
                  onClick={handleDeleteSheet}
                >
                  Delete Sheet
                </Button>
              </Group>
            </Card>

            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" align="flex-end" grow>
                <Select
                  label="Rename Sheet"
                  placeholder="Select sheet"
                  data={sheets}
                  value={renameOldSheet}
                  onChange={setRenameOldSheet}
                  clearable
                  style={{ minWidth: 200 }}
                />
                <TextInput
                  label="New Name"
                  placeholder="e.g., 5, Topic-Name..."
                  value={renameNewSheet}
                  onChange={(e) => setRenameNewSheet(e.currentTarget.value)}
                  style={{ minWidth: 200 }}
                />
                <Button
                  color="blue"
                  variant="light"
                  disabled={!renameOldSheet || !renameNewSheet.trim()}
                  leftSection={<Pencil size={16} />}
                  onClick={handleRenameSheet}
                >
                  Rename
                </Button>
              </Group>
            </Card>

            <Card shadow="sm" padding={0} radius="md" withBorder>
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Question</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Sheet</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Answer</Table.Th>
                      <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredQuestions.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Text c="dimmed" ta="center" py="md">
                            No questions found.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredQuestions.map((q) => (
                        <QuestionRow
                          key={q.id}
                          q={q}
                          onEdit={openEditModal}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <EditQuestionModal
        opened={editOpened}
        onClose={closeEdit}
        question={editingQuestion}
        onSave={loadQuestions}
      />
    </Stack>
  )
}
