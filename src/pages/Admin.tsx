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
  PasswordInput,
  Loader,
  SimpleGrid,
  Box,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  Trash,
  Pencil,
  Search,
  Plus,
  ArrowLeft,
  Users,
  FileQuestion,
  FileText,
  ClipboardList,
  Target,
  Award,
  Download,
} from 'lucide-react'
import { Question, QuestionType, Sheet, Score } from '../types'
import { CodeRenderer } from '../components/CodeRenderer'
import {
  fetchAllQuestions,
  insertQuestions,
  deleteQuestion,
  updateQuestion,
  deleteSheet as deleteSheetApi,
  renameSheet,
  insertSheet,
  fetchSheets,
  updateSheetCategory,
  fetchUsersWithQuizCount,
  fetchDashboardStats,
  fetchAllScores,
  DashboardStats,
  UserRecord,
} from '../lib/supabaseClient'
import { questionsToCsv, scoresToCsv, downloadCsv } from '../lib/csvExport'
import { CATEGORY_IDS, CategoryId } from '../lib/categories'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || ''
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
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [sheet, setSheet] = useState('')
  const [type, setType] = useState<QuestionType>('mcq')
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState('')
  const [answer, setAnswer] = useState(0)
  const [explanation, setExplanation] = useState('')

  useEffect(() => {
    if (question) {
      setCategory(question.category as CategoryId)
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
    if (!category) {
      alert('Category is required')
      return
    }
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Question" size="lg">
      <Stack gap="md">
        <Select
          label="Category"
          data={CATEGORY_IDS.map((c) => ({ value: c, label: c }))}
          value={category}
          onChange={(val) => setCategory(val as CategoryId)}
          required
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
        <Text size="sm" fw={600} c="teal" style={{ fontFamily: 'monospace' }}>
          {q.options[q.answer].includes('\n')
            ? JSON.stringify(q.options[q.answer])
            : q.options[q.answer]}
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

  // Change sheet category state
  const [changeCatSheet, setChangeCatSheet] = useState<string | null>(null)
  const [changeCatNew, setChangeCatNew] = useState<CategoryId | null>(null)

  // Add form state
  const [jsonInput, setJsonInput] = useState('')
  const [sheetName, setSheetName] = useState('')
  const [sheetCategory, setSheetCategory] = useState<CategoryId | null>(null)
  const [jsonError, setJsonError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  // Sheets from DB
  const [dbSheets, setDbSheets] = useState<Sheet[]>([])

  // Users from DB
  const [users, setUsers] = useState<UserRecord[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  // Export state
  const [exportScores, setExportScores] = useState<Score[]>([])
  const [exportLoading, setExportLoading] = useState(false)

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

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

  const loadSheets = useCallback(async () => {
    try {
      const data = await fetchSheets()
      setDbSheets(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const data = await fetchUsersWithQuizCount()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const loadDashboardStats = useCallback(async () => {
    try {
      const data = await fetchDashboardStats()
      setDashboardStats(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const loadExportScores = useCallback(async () => {
    setExportLoading(true)
    try {
      const data = await fetchAllScores()
      setExportScores(data)
    } catch (err) {
      console.error(err)
    } finally {
      setExportLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions()
      loadSheets()
      loadUsers()
      loadDashboardStats()
      loadExportScores()
    }
  }, [isAuthenticated, loadQuestions, loadSheets, loadUsers, loadDashboardStats, loadExportScores])

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

    if (!sheetCategory) {
      setJsonError('Category is required — select one of the allowed categories')
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
          'Each question must have: category, type, question, options (array), answer (number), explanation',
        )
      }
      return {
        category: String(q.category) as CategoryId,
        sheet: String(sheetName),
        type: q.type as QuestionType,
        question: String(q.question),
        options: q.options.map(String),
        answer: Number(q.answer),
        explanation: String(q.explanation),
      }
    })

    try {
      // Insert the sheet record first
      await insertSheet({ name: sheetName.trim(), category: sheetCategory })
      await insertQuestions(formatted)
      setAddSuccess(
        `Successfully added ${formatted.length} question(s) to Sheet "${sheetName}" (${sheetCategory})`,
      )
      setJsonInput('')
      loadQuestions()
      loadSheets()
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Failed to insert questions')
    }
  }

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

  const handleDeleteSheet = async () => {
    if (!deleteSheetValue) return
    const count = questions.filter((q) => q.sheet === deleteSheetValue).length
    if (
      !window.confirm(
        `Are you sure you want to delete Sheet "${deleteSheetValue}"?\nThis will permanently delete ${count} question(s).`,
      )
    )
      return
    try {
      await deleteSheetApi(deleteSheetValue)
      setDeleteSheetValue(null)
      loadQuestions()
      loadSheets()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete sheet')
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
        `Rename Sheet "${renameOldSheet}" to "${renameNewSheet.trim()}"?\nThis will update ${count} question(s) and all linked scores.`,
      )
    )
      return
    try {
      await renameSheet(renameOldSheet, renameNewSheet.trim())
      setRenameOldSheet(null)
      setRenameNewSheet('')
      loadQuestions()
      loadSheets()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to rename sheet')
    }
  }

  const handleChangeSheetCategory = async () => {
    if (!changeCatSheet || !changeCatNew) return
    // Find current category of the selected sheet
    const currentSheet = dbSheets.find((s) => s.name === changeCatSheet)
    if (currentSheet && currentSheet.category === changeCatNew) {
      alert('The sheet already belongs to this category')
      return
    }
    const count = questions.filter((q) => q.sheet === changeCatSheet).length
    if (
      !window.confirm(
        `Change category of Sheet "${changeCatSheet}" from "${currentSheet?.category ?? 'unknown'}" to "${changeCatNew}"?\nThis will update ${count} question(s) and all linked scores.`,
      )
    )
      return
    try {
      await updateSheetCategory(changeCatSheet, changeCatNew)
      setChangeCatSheet(null)
      setChangeCatNew(null)
      loadQuestions()
      loadSheets()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to change sheet category')
    }
  }

  const openEditModal = useCallback(
    (q: Question) => {
      setEditingQuestion(q)
      openEdit()
    },
    [openEdit],
  )

  /* Memoised derived data – prevents re-computation on every keystroke */
  const filteredQuestions = useMemo(() => {
    const term = search.toLowerCase()
    return questions.filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(term) || q.category.toLowerCase().includes(term)
      const matchesCategory = filterCategory ? q.category === filterCategory : true
      const matchesSheet = filterSheet ? q.sheet === filterSheet : true
      return matchesSearch && matchesCategory && matchesSheet
    })
  }, [questions, search, filterCategory, filterSheet])

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users
    const term = userSearch.toLowerCase()
    return users.filter((u) => u.user_name.toLowerCase().includes(term))
  }, [users, userSearch])

  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category))] as CategoryId[],
    [questions],
  )
  const sheets = useMemo(() => dbSheets.map((s) => s.name), [dbSheets])

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
            onClick={() => navigate('/')}
          >
            Back to Platform
          </Button>
          <Button variant="light" color="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Group>

      {/* ─── Dashboard Stats ─── */}
      {dashboardStats && (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
          {[
            {
              label: 'Quizzes Taken',
              value: dashboardStats.totalQuizzes,
              icon: ClipboardList,
              color: 'teal',
            },
            { label: 'Total Users', value: dashboardStats.totalUsers, icon: Users, color: 'blue' },
            {
              label: 'Total Questions',
              value: dashboardStats.totalQuestions,
              icon: FileQuestion,
              color: 'violet',
            },
            {
              label: 'Total Sheets',
              value: dashboardStats.totalSheets,
              icon: FileText,
              color: 'grape',
            },
            {
              label: 'Avg Score',
              value: `${dashboardStats.averagePercentage}%`,
              icon: Target,
              color: 'orange',
            },
            {
              label: 'Best Score',
              value: `${dashboardStats.bestPercentage}%`,
              icon: Award,
              color: 'yellow',
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} shadow="sm" padding="md" radius="md" withBorder ta="center">
                <Stack gap="xs" align="center">
                  <Box c={`${stat.color}.4`}>
                    <Icon size={24} strokeWidth={1.5} />
                  </Box>
                  <Text fw={800} size="xl" c={stat.color}>
                    {stat.value}
                  </Text>
                  <Text c="dimmed" size="xs">
                    {stat.label}
                  </Text>
                </Stack>
              </Card>
            )
          })}
        </SimpleGrid>
      )}

      <Tabs defaultValue="add" color="teal">
        <Tabs.List>
          <Tabs.Tab value="add" leftSection={<Plus size={16} />}>
            Add Questions
          </Tabs.Tab>
          <Tabs.Tab value="manage" leftSection={<Search size={16} />}>
            Manage Questions
          </Tabs.Tab>
          <Tabs.Tab value="users" leftSection={<Users size={16} />}>
            Users
          </Tabs.Tab>
          <Tabs.Tab value="export" leftSection={<Download size={16} />}>
            Export CSV
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="add" pt="md">
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
                <Button onClick={handleAddQuestions} color="teal" leftSection={<Plus size={16} />}>
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

            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" align="flex-end" grow>
                <Select
                  label="Change Sheet Category"
                  placeholder="Select sheet"
                  data={sheets}
                  value={changeCatSheet}
                  onChange={setChangeCatSheet}
                  clearable
                  style={{ minWidth: 200 }}
                />
                <Select
                  label="New Category"
                  placeholder="Select new category"
                  data={CATEGORY_IDS.map((c) => ({ value: c, label: c }))}
                  value={changeCatNew}
                  onChange={(val) => setChangeCatNew(val as CategoryId)}
                  clearable
                  style={{ minWidth: 200 }}
                />
                <Button
                  color="orange"
                  variant="light"
                  disabled={!changeCatSheet || !changeCatNew}
                  leftSection={<Pencil size={16} />}
                  onClick={handleChangeSheetCategory}
                >
                  Change Category
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

        <Tabs.Panel value="users" pt="md">
          <Stack gap="md">
            <Group>
              <TextInput
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.currentTarget.value)}
                leftSection={<Search size={16} />}
                style={{ flex: 1 }}
              />
              <Text size="sm" c="dimmed">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </Text>
            </Group>

            {usersLoading ? (
              <Stack align="center" gap="md" py="xl">
                <Loader size="md" color="teal" />
                <Text c="dimmed" size="sm">
                  Loading users...
                </Text>
              </Stack>
            ) : (
              <Card shadow="sm" padding={0} radius="md" withBorder>
                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ width: 60 }}>#</Table.Th>
                        <Table.Th>User Name</Table.Th>
                        <Table.Th>Quizzes Taken</Table.Th>
                        <Table.Th>First Seen</Table.Th>
                        <Table.Th>Last Seen</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredUsers.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={5}>
                            <Text c="dimmed" ta="center" py="md">
                              No users found.
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        filteredUsers.map((u, idx) => (
                          <Table.Tr key={u.user_name}>
                            <Table.Td>
                              <Text fw={700} c="teal">
                                #{idx + 1}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text fw={600}>{u.user_name}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={u.quiz_count > 0 ? 'teal' : 'gray'} variant="light">
                                {u.quiz_count}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" c="dimmed">
                                {new Date(u.created_at).toLocaleDateString()}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" c="dimmed">
                                {new Date(u.last_seen).toLocaleDateString()}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ))
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>

        {/* ─── Export CSV ─── */}
        <Tabs.Panel value="export" pt="md">
          <Stack gap="md">
            {/* ── Export Questions ── */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={600}>Export Questions as CSV</Text>
                <Text size="sm" c="dimmed">
                  Download all questions or filter by a specific sheet. Each row contains: category,
                  sheet, type, question, options (JSON), answer index, explanation.
                </Text>

                <Group justify="flex-end">
                  <Button
                    variant="default"
                    leftSection={<Download size={16} />}
                    onClick={() => {
                      const csv = questionsToCsv(questions)
                      downloadCsv(csv, 'all_questions.csv')
                    }}
                  >
                    Export All Questions ({questions.length})
                  </Button>
                </Group>

                <Group justify="space-between" align="flex-end" grow>
                  <Select
                    label="Export Questions by Sheet"
                    placeholder="Select a sheet"
                    data={sheets}
                    clearable
                    style={{ minWidth: 280 }}
                  />
                  <Button
                    color="teal"
                    variant="light"
                    leftSection={<Download size={16} />}
                    onClick={() => {
                      // Use the filterSheet state which tracks the selected sheet
                      if (!filterSheet) {
                        alert('Please select a sheet first')
                        return
                      }
                      const sheetQuestions = questions.filter((q) => q.sheet === filterSheet)
                      if (sheetQuestions.length === 0) {
                        alert('No questions found for this sheet')
                        return
                      }
                      const csv = questionsToCsv(sheetQuestions)
                      downloadCsv(csv, `sheet_${filterSheet}_questions.csv`)
                    }}
                  >
                    Export Sheet Questions
                  </Button>
                </Group>

                <Group justify="space-between" align="flex-end" grow>
                  <Select
                    label="Export Questions by Category"
                    placeholder="Select a category"
                    data={categories}
                    clearable
                    style={{ minWidth: 280 }}
                  />
                  <Button
                    color="violet"
                    variant="light"
                    leftSection={<Download size={16} />}
                    onClick={() => {
                      if (!filterCategory) {
                        alert('Please select a category first')
                        return
                      }
                      const catQuestions = questions.filter((q) => q.category === filterCategory)
                      if (catQuestions.length === 0) {
                        alert('No questions found for this category')
                        return
                      }
                      const csv = questionsToCsv(catQuestions)
                      downloadCsv(csv, `category_${filterCategory}_questions.csv`)
                    }}
                  >
                    Export Category Questions
                  </Button>
                </Group>
              </Stack>
            </Card>

            {/* ── Export Scores ── */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={600}>Export Scores as CSV</Text>
                <Text size="sm" c="dimmed">
                  Download all quiz scores. Each row contains: user_name, score, total_questions,
                  percentage, category, sheet, created_at.
                </Text>

                {exportLoading ? (
                  <Group justify="center" py="sm">
                    <Loader size="sm" color="teal" />
                    <Text size="sm" c="dimmed">
                      Loading scores...
                    </Text>
                  </Group>
                ) : (
                  <Group justify="flex-end">
                    <Button
                      color="blue"
                      variant="light"
                      leftSection={<Download size={16} />}
                      onClick={() => {
                        if (exportScores.length === 0) {
                          alert('No scores to export')
                          return
                        }
                        const csv = scoresToCsv(exportScores)
                        downloadCsv(csv, 'all_scores.csv')
                      }}
                    >
                      Export All Scores ({exportScores.length})
                    </Button>
                  </Group>
                )}
              </Stack>
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
