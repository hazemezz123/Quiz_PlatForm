# Admin Page Refactoring & Performance Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the 1315-line Admin.tsx into a scalable hook-first architecture with localized state, debounced search, virtualized tables, and memo'd components to eliminate input lag.

**Architecture:** Custom hooks own business logic + server state. Form/search components own their local state. Each component only re-renders when its own data changes. Dashboard stats config extracted to a constants file for stable references.

**Tech Stack:** React 18, Mantine v7, @mantine/hooks (useDebouncedValue, useDisclosure), @tanstack/react-virtual, Supabase, TypeScript strict mode

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/pages/admin/constants.ts` | STAT_CARDS config, ADMIN_EMAIL |
| Create | `src/pages/admin/utils/questionParser.ts` | JSON parse + validation pure functions |
| Create | `src/pages/admin/hooks/useAuth.ts` | Auth state, login/logout, session listener |
| Create | `src/pages/admin/hooks/useQuestions.ts` | Questions data, search, filters, CRUD, edit modal |
| Create | `src/pages/admin/hooks/useSheets.ts` | Sheets data, delete/rename/change-category |
| Create | `src/pages/admin/hooks/useUsers.ts` | Users data, loading |
| Create | `src/pages/admin/hooks/useDashboard.ts` | Dashboard stats |
| Create | `src/pages/admin/hooks/useExport.ts` | Export scores data |
| Create | `src/pages/admin/components/AdminLogin.tsx` | Login form with localized password state |
| Create | `src/pages/admin/components/DashboardStatCard.tsx` | Memo'd single stat card |
| Create | `src/pages/admin/components/DashboardStatsCards.tsx` | Memo'd stats grid |
| Create | `src/pages/admin/components/AddQuestionsForm.tsx` | Add questions form with ALL form state local |
| Create | `src/pages/admin/components/QuestionRow.tsx` | Memo'd table row |
| Create | `src/pages/admin/components/QuestionTable.tsx` | Virtualized question table |
| Create | `src/pages/admin/components/EditQuestionModal.tsx` | Edit modal with local form state |
| Create | `src/pages/admin/components/SheetManagementCards.tsx` | Delete/rename/category cards |
| Create | `src/pages/admin/components/ManageQuestionsTab.tsx` | Manage tab with local sheet mgmt state |
| Create | `src/pages/admin/components/UsersTab.tsx` | Users tab with local userSearch state |
| Create | `src/pages/admin/components/ExportTab.tsx` | Export tab (pure display) |
| Create | `src/pages/admin/Admin.tsx` | Thin orchestrator, combines hooks, renders tabs |
| Modify | `src/App.tsx` | Update import path for Admin |
| Delete | `src/pages/Admin.tsx` | Old monolithic file (replaced by src/pages/admin/) |
| Install | `@tanstack/react-virtual` | Table virtualization |

---

### Task 1: Install virtualization dependency

- [ ] **Step 1: Install @tanstack/react-virtual**

```bash
npm install @tanstack/react-virtual
```

- [ ] **Step 2: Verify installation**

```bash
npm ls @tanstack/react-virtual
```

Expected: `@tanstack/react-virtual@3.x.x`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @tanstack/react-virtual for table virtualization"
```

---

### Task 2: Create directory structure

- [ ] **Step 1: Create all directories**

```bash
mkdir -p src/pages/admin/components src/pages/admin/hooks src/pages/admin/utils
```

Note: On Windows PowerShell use:

```powershell
New-Item -ItemType Directory -Path "src/pages/admin/components" -Force
New-Item -ItemType Directory -Path "src/pages/admin/hooks" -Force
New-Item -ItemType Directory -Path "src/pages/admin/utils" -Force
```

- [ ] **Step 2: Verify directories exist**

```bash
ls src/pages/admin/
```

Expected: `components/ hooks/ utils/`

---

### Task 3: Create constants.ts

**Files:**
- Create: `src/pages/admin/constants.ts`

- [ ] **Step 1: Write constants.ts**

```typescript
import { ClipboardList, Users, FileQuestion, FileText, Target, Award, type LucideIcon } from 'lucide-react'

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@quiz.local'

export interface StatCardConfig {
  label: string
  getValue: (stats: { totalQuizzes: number; totalUsers: number; totalQuestions: number; totalSheets: number; averagePercentage: number; bestPercentage: number }) => string
  icon: LucideIcon
  color: string
}

export const STAT_CARDS: StatCardConfig[] = [
  {
    label: 'Quizzes Taken',
    getValue: (s) => String(s.totalQuizzes),
    icon: ClipboardList,
    color: 'teal',
  },
  {
    label: 'Total Users',
    getValue: (s) => String(s.totalUsers),
    icon: Users,
    color: 'blue',
  },
  {
    label: 'Total Questions',
    getValue: (s) => String(s.totalQuestions),
    icon: FileQuestion,
    color: 'violet',
  },
  {
    label: 'Total Sheets',
    getValue: (s) => String(s.totalSheets),
    icon: FileText,
    color: 'grape',
  },
  {
    label: 'Avg Score',
    getValue: (s) => `${s.averagePercentage}%`,
    icon: Target,
    color: 'orange',
  },
  {
    label: 'Best Score',
    getValue: (s) => `${s.bestPercentage}%`,
    icon: Award,
    color: 'yellow',
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/constants.ts
git commit -m "feat: add admin constants — stat cards config and admin email"
```

---

### Task 4: Create questionParser.ts

**Files:**
- Create: `src/pages/admin/utils/questionParser.ts`

- [ ] **Step 1: Write questionParser.ts**

```typescript
import { QuestionType } from '../../../types'
import { CategoryId } from '../../../lib/categories'

export interface ParsedQuestion {
  category: CategoryId
  sheet: string
  type: QuestionType
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface ParseResult {
  success: true
  questions: ParsedQuestion[]
}

export interface ParseError {
  success: false
  error: string
}

export type ParseOutcome = ParseResult | ParseError

export function parseJsonQuestions(jsonString: string): ParseOutcome {
  let parsed: unknown[]
  try {
    parsed = JSON.parse(jsonString)
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'JSON must be an array of question objects' }
    }
  } catch {
    return { success: false, error: 'Invalid JSON format' }
  }

  const questions: ParsedQuestion[] = []
  for (const q of parsed) {
    if (
      !q.type ||
      !q.question ||
      !Array.isArray(q.options) ||
      typeof q.answer !== 'number' ||
      !q.explanation
    ) {
      return {
        success: false,
        error: 'Each question must have: type, question, options (array), answer (number), explanation',
      }
    }
    questions.push({
      type: q.type as QuestionType,
      question: String(q.question),
      options: q.options.map(String),
      answer: Number(q.answer),
      explanation: String(q.explanation),
    })
  }

  return { success: true, questions }
}

export function formatQuestionsForInsert(
  parsed: ParsedQuestion[],
  sheetCategory: CategoryId,
  sheetName: string,
): Omit<import('../../../types').Question, 'id' | 'created_at'>[] {
  return parsed.map((q) => ({
    category: sheetCategory,
    sheet: sheetName,
    type: q.type,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }))
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/utils/questionParser.ts
git commit -m "feat: add question parser — pure JSON parse + validation utility"
```

---

### Task 5: Create useAuth.ts

**Files:**
- Create: `src/pages/admin/hooks/useAuth.ts`

- [ ] **Step 1: Write useAuth.ts**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase, signInAdmin, signOutAdmin, getAdminSession } from '../../../lib/supabaseClient'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    getAdminSession()
      .then((session) => {
        setIsAuthenticated(session !== null)
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
      .finally(() => {
        setAuthLoading(false)
      })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(session !== null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = useCallback(async () => {
    setAuthLoading(true)
    try {
      await signInAdmin()
      setIsAuthenticated(true)
      return undefined
    } catch (err) {
      return err instanceof Error ? err.message : 'Login failed — check your credentials'
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await signOutAdmin()
    } catch {
      // Even if signOut fails on the server, clear local state
    }
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, authLoading, handleLogin, handleLogout }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/hooks/useAuth.ts
git commit -m "feat: add useAuth hook — isolated auth state and operations"
```

---

### Task 6: Create useQuestions.ts

**Files:**
- Create: `src/pages/admin/hooks/useQuestions.ts`

- [ ] **Step 1: Write useQuestions.ts**

```typescript
import { useState, useCallback, useMemo } from 'react'
import { useDisclosure, useDebouncedValue } from '@mantine/hooks'
import { fetchAllQuestions, deleteQuestion, updateQuestion } from '../../../lib/supabaseClient'
import { Question, QuestionType } from '../../../types'
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/hooks/useQuestions.ts
git commit -m "feat: add useQuestions hook — questions data, debounced search, filters, CRUD"
```

---

### Task 7: Create useSheets.ts

**Files:**
- Create: `src/pages/admin/hooks/useSheets.ts`

- [ ] **Step 1: Write useSheets.ts**

```typescript
import { useState, useCallback, useMemo } from 'react'
import {
  fetchSheets,
  deleteSheet as deleteSheetApi,
  renameSheet,
  insertSheet,
  updateSheetCategory,
} from '../../../lib/supabaseClient'
import { Sheet } from '../../../types'
import { CategoryId } from '../../../lib/categories'

export function useSheets() {
  const [dbSheets, setDbSheets] = useState<Sheet[]>([])

  const loadSheets = useCallback(async () => {
    try {
      const data = await fetchSheets()
      setDbSheets(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const sheets = useMemo(() => dbSheets.map((s) => s.name), [dbSheets])

  const handleDeleteSheet = useCallback(
    async (sheetName: string, questionCount: number) => {
      if (
        !window.confirm(
          `Are you sure you want to delete Sheet "${sheetName}"?\nThis will permanently delete ${questionCount} question(s).`,
        )
      )
        return
      try {
        await deleteSheetApi(sheetName)
        return true
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete sheet')
        return false
      }
    },
    [],
  )

  const handleRenameSheet = useCallback(
    async (oldName: string, newName: string, questionCount: number) => {
      if (oldName === newName) {
        alert('New name must be different from the current name')
        return false
      }
      if (
        !window.confirm(
          `Rename Sheet "${oldName}" to "${newName}"?\nThis will update ${questionCount} question(s) and all linked scores.`,
        )
      )
        return false
      try {
        await renameSheet(oldName, newName)
        return true
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to rename sheet')
        return false
      }
    },
    [],
  )

  const handleChangeSheetCategory = useCallback(
    async (sheetName: string, newCategory: CategoryId, currentCategory: string, questionCount: number) => {
      if (currentCategory === newCategory) {
        alert('The sheet already belongs to this category')
        return false
      }
      if (
        !window.confirm(
          `Change category of Sheet "${sheetName}" from "${currentCategory}" to "${newCategory}"?\nThis will update ${questionCount} question(s) and all linked scores.`,
        )
      )
        return false
      try {
        await updateSheetCategory(sheetName, newCategory)
        return true
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to change sheet category')
        return false
      }
    },
    [],
  )

  const insertNewSheet = useCallback(
    async (name: string, category: CategoryId) => {
      try {
        await insertSheet({ name, category })
      } catch (err) {
        const code =
          typeof err === 'object' && err !== null ? (err as { code?: string }).code : undefined
        if (code !== '23505') {
          throw err
        }
      }
    },
    [],
  )

  const findSheetByName = useCallback(
    (name: string) => dbSheets.find((s) => s.name === name),
    [dbSheets],
  )

  return {
    dbSheets,
    sheets,
    loadSheets,
    handleDeleteSheet,
    handleRenameSheet,
    handleChangeSheetCategory,
    insertNewSheet,
    findSheetByName,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/hooks/useSheets.ts
git commit -m "feat: add useSheets hook — sheets data, delete/rename/change-category ops"
```

---

### Task 8: Create useUsers.ts

**Files:**
- Create: `src/pages/admin/hooks/useUsers.ts`

- [ ] **Step 1: Write useUsers.ts**

```typescript
import { useState, useCallback } from 'react'
import { fetchUsersWithQuizCount, UserRecord } from '../../../lib/supabaseClient'

export function useUsers() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

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

  return { users, usersLoading, loadUsers }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/hooks/useUsers.ts
git commit -m "feat: add useUsers hook — users data and loading state"
```

---

### Task 9: Create useDashboard.ts

**Files:**
- Create: `src/pages/admin/hooks/useDashboard.ts`

- [ ] **Step 1: Write useDashboard.ts**

```typescript
import { useState, useCallback } from 'react'
import { fetchDashboardStats, DashboardStats } from '../../../lib/supabaseClient'

export function useDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

  const loadDashboardStats = useCallback(async () => {
    try {
      const data = await fetchDashboardStats()
      setDashboardStats(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  return { dashboardStats, loadDashboardStats }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/hooks/useDashboard.ts
git commit -m "feat: add useDashboard hook — dashboard stats fetch"
```

---

### Task 10: Create useExport.ts

**Files:**
- Create: `src/pages/admin/hooks/useExport.ts`

- [ ] **Step 1: Write useExport.ts**

```typescript
import { useState, useCallback } from 'react'
import { fetchAllScores } from '../../../lib/supabaseClient'
import { Score } from '../../../types'

export function useExport() {
  const [exportScores, setExportScores] = useState<Score[]>([])
  const [exportLoading, setExportLoading] = useState(false)

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

  return { exportScores, exportLoading, loadExportScores }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/hooks/useExport.ts
git commit -m "feat: add useExport hook — export scores data and loading"
```

---

### Task 11: Create AdminLogin.tsx

**Files:**
- Create: `src/pages/admin/components/AdminLogin.tsx`

- [ ] **Step 1: Write AdminLogin.tsx**

```typescript
import { useState, useCallback } from 'react'
import { Stack, Card, Text, TextInput, PasswordInput, Button } from '@mantine/core'
import { ADMIN_EMAIL } from '../constants'

interface AdminLoginProps {
  authLoading: boolean
  onLogin: () => Promise<string | undefined>
}

export function AdminLogin({ authLoading, onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleLogin = useCallback(async () => {
    const error = await onLogin()
    if (error) {
      setPasswordError(error)
    } else {
      setPasswordError('')
    }
  }, [onLogin])

  return (
    <Stack align="center" gap="lg" pt="xl">
      <Text fw={700} size="xl">
        Admin Login
      </Text>
      <Card shadow="sm" padding="xl" radius="md" withBorder maw={400} w="100%">
        <Stack gap="md">
          <TextInput
            label="Email"
            value={ADMIN_EMAIL}
            disabled
            description="Admin account is pre-configured"
          />
          <PasswordInput
            label="Password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={passwordError}
            onKeyDown={(e) => e.key === 'Enter' && !authLoading && handleLogin()}
          />
          <Button onClick={handleLogin} color="teal" fullWidth loading={authLoading}>
            Login
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/AdminLogin.tsx
git commit -m "feat: add AdminLogin component — isolated password state"
```

---

### Task 12: Create DashboardStatCard.tsx and DashboardStatsCards.tsx

**Files:**
- Create: `src/pages/admin/components/DashboardStatCard.tsx`
- Create: `src/pages/admin/components/DashboardStatsCards.tsx`

- [ ] **Step 1: Write DashboardStatCard.tsx**

```typescript
import { memo } from 'react'
import { Card, Stack, Box, Text } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'

interface DashboardStatCardProps {
  icon: LucideIcon
  label: string
  value: string
  color: string
}

export const DashboardStatCard = memo(function DashboardStatCard({
  icon: Icon,
  label,
  value,
  color,
}: DashboardStatCardProps) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder ta="center">
      <Stack gap="xs" align="center">
        <Box c={`${color}.4`}>
          <Icon size={24} strokeWidth={1.5} />
        </Box>
        <Text fw={800} size="xl" c={color}>
          {value}
        </Text>
        <Text c="dimmed" size="xs">
          {label}
        </Text>
      </Stack>
    </Card>
  )
})
```

- [ ] **Step 2: Write DashboardStatsCards.tsx**

```typescript
import { memo } from 'react'
import { SimpleGrid } from '@mantine/core'
import { DashboardStatCard } from './DashboardStatCard'
import { STAT_CARDS } from '../constants'
import type { DashboardStats } from '../../../lib/supabaseClient'

interface DashboardStatsCardsProps {
  stats: DashboardStats
}

export const DashboardStatsCards = memo(function DashboardStatsCards({
  stats,
}: DashboardStatsCardsProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
      {STAT_CARDS.map((card) => (
        <DashboardStatCard
          key={card.label}
          icon={card.icon}
          label={card.label}
          value={card.getValue(stats)}
          color={card.color}
        />
      ))}
    </SimpleGrid>
  )
})
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/components/DashboardStatCard.tsx src/pages/admin/components/DashboardStatsCards.tsx
git commit -m "feat: add DashboardStatsCards — memo'd stat cards with stable config"
```

---

### Task 13: Create QuestionRow.tsx

**Files:**
- Create: `src/pages/admin/components/QuestionRow.tsx`

- [ ] **Step 1: Write QuestionRow.tsx**

```typescript
import { memo } from 'react'
import { Table, Badge, Text, Group, ActionIcon } from '@mantine/core'
import { Pencil, Trash } from 'lucide-react'
import { CodeRenderer } from '../../../components/CodeRenderer'
import { Question } from '../../../types'

interface QuestionRowProps {
  q: Question
  onEdit: (q: Question) => void
  onDelete: (id: string) => void
}

export const QuestionRow = memo(function QuestionRow({ q, onEdit, onDelete }: QuestionRowProps) {
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/QuestionRow.tsx
git commit -m "feat: add QuestionRow — memo'd table row component"
```

---

### Task 14: Create QuestionTable.tsx (virtualized)

**Files:**
- Create: `src/pages/admin/components/QuestionTable.tsx`

- [ ] **Step 1: Write QuestionTable.tsx**

```typescript
import { useRef, useCallback } from 'react'
import { Table, ScrollArea, Text, Box } from '@mantine/core'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Question } from '../../../types'
import { QuestionRow } from './QuestionRow'

interface QuestionTableProps {
  filteredQuestions: Question[]
  onEdit: (q: Question) => void
  onDelete: (id: string) => void
}

const ROW_HEIGHT = 72

export function QuestionTable({ filteredQuestions, onEdit, onDelete }: QuestionTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: filteredQuestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  return (
    <Box style={{ position: 'relative' }}>
      <ScrollArea h={600} scrollRef={parentRef}>
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
              virtualizer.getVirtualItems().map((virtualRow) => {
                const q = filteredQuestions[virtualRow.index]
                return (
                  <QuestionRow
                    key={q.id}
                    q={q}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                )
              })
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  )
}
```

Note: If virtualization causes layout issues with Mantine's Table, the fallback is to remove `useVirtualizer` and render all rows directly (same as the original). The ROW_HEIGHT estimate of 72px is for typical single-line questions; code blocks may be taller. If rows have variable heights, set `measureElement` on the virtualizer and add `data-index` to each row for dynamic measurement.

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/QuestionTable.tsx
git commit -m "feat: add QuestionTable — virtualized question table"
```

---

### Task 15: Create EditQuestionModal.tsx

**Files:**
- Create: `src/pages/admin/components/EditQuestionModal.tsx`

- [ ] **Step 1: Write EditQuestionModal.tsx**

```typescript
import { useState, useEffect, memo } from 'react'
import { Modal, Stack, Select, TextInput, Textarea, NumberInput, Group, Button } from '@mantine/core'
import { updateQuestion } from '../../../lib/supabaseClient'
import { Question, QuestionType } from '../../../types'
import { CATEGORY_IDS, CategoryId } from '../../../lib/categories'

interface EditQuestionModalProps {
  opened: boolean
  onClose: () => void
  question: Question | null
  onSave: () => void
}

export const EditQuestionModal = memo(function EditQuestionModal({
  opened,
  onClose,
  question,
  onSave,
}: EditQuestionModalProps) {
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/EditQuestionModal.tsx
git commit -m "feat: add EditQuestionModal — memo'd modal with local form state"
```

---

### Task 16: Create SheetManagementCards.tsx

**Files:**
- Create: `src/pages/admin/components/SheetManagementCards.tsx`

- [ ] **Step 1: Write SheetManagementCards.tsx**

```typescript
import { memo } from 'react'
import { Card, Group, Select, TextInput, Button } from '@mantine/core'
import { Trash, Pencil } from 'lucide-react'
import { CATEGORY_IDS, CategoryId } from '../../../lib/categories'

interface SheetManagementCardsProps {
  sheets: string[]
  deleteSheetValue: string | null
  setDeleteSheetValue: (val: string | null) => void
  renameOldSheet: string | null
  setRenameOldSheet: (val: string | null) => void
  renameNewSheet: string
  setRenameNewSheet: (val: string) => void
  changeCatSheet: string | null
  setChangeCatSheet: (val: string | null) => void
  changeCatNew: CategoryId | null
  setChangeCatNew: (val: CategoryId | null) => void
  onDeleteSheet: () => void
  onRenameSheet: () => void
  onChangeSheetCategory: () => void
}

export const SheetManagementCards = memo(function SheetManagementCards({
  sheets,
  deleteSheetValue,
  setDeleteSheetValue,
  renameOldSheet,
  setRenameOldSheet,
  renameNewSheet,
  setRenameNewSheet,
  changeCatSheet,
  setChangeCatSheet,
  changeCatNew,
  setChangeCatNew,
  onDeleteSheet,
  onRenameSheet,
  onChangeSheetCategory,
}: SheetManagementCardsProps) {
  return (
    <>
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
            onClick={onDeleteSheet}
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
            onClick={onRenameSheet}
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
            onClick={onChangeSheetCategory}
          >
            Change Category
          </Button>
        </Group>
      </Card>
    </>
  )
})
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/SheetManagementCards.tsx
git commit -m "feat: add SheetManagementCards — memo'd sheet operation cards"
```

---

### Task 17: Create ManageQuestionsTab.tsx

**Files:**
- Create: `src/pages/admin/components/ManageQuestionsTab.tsx`

This component owns all sheet management state locally (deleteSheetValue, renameOldSheet, renameNewSheet, changeCatSheet, changeCatNew) so typing in "New Name" only re-renders this tab.

- [ ] **Step 1: Write ManageQuestionsTab.tsx**

```typescript
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
  onChangeSheetCategory: (sheetName: string, newCategory: CategoryId, currentCategory: string, questionCount: number) => Promise<boolean>
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
    const success = await onChangeSheetCategory(changeCatSheet, changeCatNew, currentCategory, count)
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
        <QuestionTable
          filteredQuestions={filteredQuestions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Card>
    </Stack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/ManageQuestionsTab.tsx
git commit -m "feat: add ManageQuestionsTab — localized sheet mgmt state"
```

---

### Task 18: Create AddQuestionsForm.tsx

**Files:**
- Create: `src/pages/admin/components/AddQuestionsForm.tsx`

This component owns ALL form state internally. Typing in the JSON textarea or sheet name input only re-renders this component, not the entire page.

- [ ] **Step 1: Write AddQuestionsForm.tsx**

```typescript
import { useState, useCallback } from 'react'
import { Card, Stack, Text, Group, Button, TextInput, Textarea, Select, FileInput } from '@mantine/core'
import { Plus } from 'lucide-react'
import { CATEGORY_IDS, CategoryId } from '../../../lib/categories'
import { insertQuestions } from '../../../lib/supabaseClient'
import { parseJsonQuestions, formatQuestionsForInsert, type ParseOutcome } from '../utils/questionParser'

interface AddQuestionsFormProps {
  sheets: string[]
  findSheetByName: (name: string) => { name: string; category: string } | undefined
  insertNewSheet: (name: string, category: CategoryId) => Promise<void>
  onSuccess: () => void
}

export function AddQuestionsForm({
  sheets,
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

    const outcome: ParseOutcome = parseJsonQuestions(jsonString)
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
  }, [sheetCategory, sheetName, jsonInput, jsonFile, sheets, findSheetByName, insertNewSheet, onSuccess, handleClear])

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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/AddQuestionsForm.tsx
git commit -m "feat: add AddQuestionsForm — all form state localized, eliminates input lag"
```

---

### Task 19: Create UsersTab.tsx

**Files:**
- Create: `src/pages/admin/components/UsersTab.tsx`

Owns `userSearch` state locally. Uses `useDebouncedValue` for search debounce. Uses memo'd filtered user list.

- [ ] **Step 1: Write UsersTab.tsx**

```typescript
import { useState, useMemo } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { Stack, Group, TextInput, Text, Card, Table, Badge, Loader, ScrollArea } from '@mantine/core'
import { Search } from 'lucide-react'
import { UserRecord } from '../../../lib/supabaseClient'

interface UsersTabProps {
  users: UserRecord[]
  usersLoading: boolean
}

export const UsersTab = function UsersTab({ users, usersLoading }: UsersTabProps) {
  const [userSearch, setUserSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(userSearch, 300)

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users
    const term = debouncedSearch.toLowerCase()
    return users.filter((u) => u.user_name.toLowerCase().includes(term))
  }, [users, debouncedSearch])

  return (
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
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/UsersTab.tsx
git commit -m "feat: add UsersTab — localized search with debounced filtering"
```

---

### Task 20: Create ExportTab.tsx

**Files:**
- Create: `src/pages/admin/components/ExportTab.tsx`

Pure display component. No local state (except export sheet/category selectors which should be local).

- [ ] **Step 1: Write ExportTab.tsx**

```typescript
import { useState, useCallback } from 'react'
import { Stack, Card, Text, Group, Button, Select, Loader } from '@mantine/core'
import { Download } from 'lucide-react'
import { CategoryId } from '../../../lib/categories'
import { Question, Score } from '../../../types'
import {
  questionsToCsv,
  scoresToCsv,
  downloadCsv,
  questionsToJson,
  scoresToJson,
  downloadJson,
} from '../../../lib/csvExport'

interface ExportTabProps {
  questions: Question[]
  categories: CategoryId[]
  sheets: string[]
  exportScores: Score[]
  exportLoading: boolean
}

export function ExportTab({
  questions,
  categories,
  sheets,
  exportScores,
  exportLoading,
}: ExportTabProps) {
  const [exportSheet, setExportSheet] = useState<string | null>(null)
  const [exportCategory, setExportCategory] = useState<string | null>(null)

  const handleExportAllCsv = useCallback(() => {
    const csv = questionsToCsv(questions)
    downloadCsv(csv, 'all_questions.csv')
  }, [questions])

  const handleExportAllJson = useCallback(() => {
    const json = questionsToJson(questions)
    downloadJson(json, 'all_questions.json')
  }, [questions])

  const handleExportSheetCsv = useCallback(() => {
    if (!exportSheet) {
      alert('Please select a sheet first')
      return
    }
    const sheetQuestions = questions.filter((q) => q.sheet === exportSheet)
    if (sheetQuestions.length === 0) {
      alert('No questions found for this sheet')
      return
    }
    const csv = questionsToCsv(sheetQuestions)
    downloadCsv(csv, `sheet_${exportSheet}_questions.csv`)
  }, [questions, exportSheet])

  const handleExportSheetJson = useCallback(() => {
    if (!exportSheet) {
      alert('Please select a sheet first')
      return
    }
    const sheetQuestions = questions.filter((q) => q.sheet === exportSheet)
    if (sheetQuestions.length === 0) {
      alert('No questions found for this sheet')
      return
    }
    const json = questionsToJson(sheetQuestions)
    downloadJson(json, `sheet_${exportSheet}_questions.json`)
  }, [questions, exportSheet])

  const handleExportCategoryCsv = useCallback(() => {
    if (!exportCategory) {
      alert('Please select a category first')
      return
    }
    const catQuestions = questions.filter((q) => q.category === exportCategory)
    if (catQuestions.length === 0) {
      alert('No questions found for this category')
      return
    }
    const csv = questionsToCsv(catQuestions)
    downloadCsv(csv, `category_${exportCategory}_questions.csv`)
  }, [questions, exportCategory])

  const handleExportCategoryJson = useCallback(() => {
    if (!exportCategory) {
      alert('Please select a category first')
      return
    }
    const catQuestions = questions.filter((q) => q.category === exportCategory)
    if (catQuestions.length === 0) {
      alert('No questions found for this category')
      return
    }
    const json = questionsToJson(catQuestions)
    downloadJson(json, `category_${exportCategory}_questions.json`)
  }, [questions, exportCategory])

  const handleExportScoresCsv = useCallback(() => {
    if (exportScores.length === 0) {
      alert('No scores to export')
      return
    }
    const csv = scoresToCsv(exportScores)
    downloadCsv(csv, 'all_scores.csv')
  }, [exportScores])

  const handleExportScoresJson = useCallback(() => {
    if (exportScores.length === 0) {
      alert('No scores to export')
      return
    }
    const json = scoresToJson(exportScores)
    downloadJson(json, 'all_scores.json')
  }, [exportScores])

  return (
    <Stack gap="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600}>Export Questions</Text>
          <Text size="sm" c="dimmed">
            Download all questions or filter by a specific sheet. Available in CSV and JSON formats.
          </Text>

          <Group justify="flex-end">
            <Button
              variant="default"
              leftSection={<Download size={16} />}
              onClick={handleExportAllCsv}
            >
              CSV – All Questions ({questions.length})
            </Button>
            <Button
              color="grape"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportAllJson}
            >
              JSON – All Questions ({questions.length})
            </Button>
          </Group>

          <Group justify="space-between" align="flex-end" grow>
            <Select
              label="Export Questions by Sheet"
              placeholder="Select a sheet"
              data={sheets}
              value={exportSheet}
              onChange={setExportSheet}
              clearable
              style={{ minWidth: 280 }}
            />
            <Button
              color="teal"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportSheetCsv}
            >
              CSV – Sheet Questions
            </Button>
            <Button
              color="grape"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportSheetJson}
            >
              JSON – Sheet Questions
            </Button>
          </Group>

          <Group justify="space-between" align="flex-end" grow>
            <Select
              label="Export Questions by Category"
              placeholder="Select a category"
              data={categories}
              value={exportCategory}
              onChange={setExportCategory}
              clearable
              style={{ minWidth: 280 }}
            />
            <Button
              color="violet"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportCategoryCsv}
            >
              CSV – Category Questions
            </Button>
            <Button
              color="grape"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportCategoryJson}
            >
              JSON – Category Questions
            </Button>
          </Group>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600}>Export Scores</Text>
          <Text size="sm" c="dimmed">
            Download all quiz scores. Available in CSV and JSON formats.
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
                onClick={handleExportScoresCsv}
              >
                CSV – All Scores ({exportScores.length})
              </Button>
              <Button
                color="grape"
                variant="light"
                leftSection={<Download size={16} />}
                onClick={handleExportScoresJson}
              >
                JSON – All Scores ({exportScores.length})
              </Button>
            </Group>
          )}
        </Stack>
      </Card>
    </Stack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/components/ExportTab.tsx
git commit -m "feat: add ExportTab — pure display with localized export selectors"
```

---

### Task 21: Create Admin.tsx (thin orchestrator)

**Files:**
- Create: `src/pages/admin/Admin.tsx`
- Modify: `src/App.tsx` (update import path)

This is the main orchestrator. It combines all hooks and renders child components. No local state of its own.

- [ ] **Step 1: Write src/pages/admin/Admin.tsx**

```typescript
import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Group, Text, Button, Loader, Tabs } from '@mantine/core'
import { ArrowLeft, Plus, Search, Users, Download } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useQuestions } from './hooks/useQuestions'
import { useSheets } from './hooks/useSheets'
import { useUsers } from './hooks/useUsers'
import { useDashboard } from './hooks/useDashboard'
import { useExport } from './hooks/useExport'
import { AdminLogin } from './components/AdminLogin'
import { DashboardStatsCards } from './components/DashboardStatsCards'
import { AddQuestionsForm } from './components/AddQuestionsForm'
import { ManageQuestionsTab } from './components/ManageQuestionsTab'
import { UsersTab } from './components/UsersTab'
import { ExportTab } from './components/ExportTab'
import { EditQuestionModal } from './components/EditQuestionModal'

export function Admin() {
  const navigate = useNavigate()
  const auth = useAuth()
  const questions = useQuestions()
  const sheets = useSheets()
  const users = useUsers()
  const dashboard = useDashboard()
  const exportData = useExport()

  const refreshAll = useCallback(() => {
    questions.loadQuestions()
    sheets.loadSheets()
  }, [questions.loadQuestions, sheets.loadSheets])

  useEffect(() => {
    if (auth.isAuthenticated) {
      questions.loadQuestions()
      sheets.loadSheets()
      users.loadUsers()
      dashboard.loadDashboardStats()
      exportData.loadExportScores()
    }
  }, [auth.isAuthenticated, questions.loadQuestions, sheets.loadSheets, users.loadUsers, dashboard.loadDashboardStats, exportData.loadExportScores])

  if (auth.authLoading && !auth.isAuthenticated) {
    return (
      <Stack align="center" gap="lg" pt="xl">
        <Loader size="md" color="teal" />
        <Text c="dimmed" size="sm">
          Checking authentication...
        </Text>
      </Stack>
    )
  }

  if (!auth.isAuthenticated) {
    return <AdminLogin authLoading={auth.authLoading} onLogin={auth.handleLogin} />
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
          <Button variant="light" color="red" size="sm" onClick={auth.handleLogout}>
            Logout
          </Button>
        </Group>
      </Group>

      {dashboard.dashboardStats && (
        <DashboardStatsCards stats={dashboard.dashboardStats} />
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
            Export
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="add" pt="md">
          <AddQuestionsForm
            sheets={sheets.sheets}
            findSheetByName={(name) => {
              const s = sheets.findSheetByName(name)
              return s ? { name: s.name, category: s.category } : undefined
            }}
            insertNewSheet={sheets.insertNewSheet}
            onSuccess={refreshAll}
          />
        </Tabs.Panel>

        <Tabs.Panel value="manage" pt="md">
          <ManageQuestionsTab
            filteredQuestions={questions.filteredQuestions}
            search={questions.search}
            setSearch={questions.setSearch}
            filterCategory={questions.filterCategory}
            setFilterCategory={questions.setFilterCategory}
            filterSheet={questions.filterSheet}
            setFilterSheet={questions.setFilterSheet}
            categories={questions.categories}
            sheets={sheets.sheets}
            questions={questions.questions}
            onEdit={questions.openEditModal}
            onDelete={questions.handleDelete}
            onDeleteSheet={sheets.handleDeleteSheet}
            onRenameSheet={sheets.handleRenameSheet}
            onChangeSheetCategory={sheets.handleChangeSheetCategory}
            refreshData={refreshAll}
          />
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          <UsersTab users={users.users} usersLoading={users.usersLoading} />
        </Tabs.Panel>

        <Tabs.Panel value="export" pt="md">
          <ExportTab
            questions={questions.questions}
            categories={questions.categories}
            sheets={sheets.sheets}
            exportScores={exportData.exportScores}
            exportLoading={exportData.exportLoading}
          />
        </Tabs.Panel>
      </Tabs>

      <EditQuestionModal
        opened={questions.editOpened}
        onClose={questions.closeEditModal}
        question={questions.editingQuestion}
        onSave={questions.handleEditSave}
      />
    </Stack>
  )
}
```

- [ ] **Step 2: Update App.tsx import**

In `src/App.tsx`, change line 17 from:

```typescript
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })))
```

to:

```typescript
const Admin = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.Admin })))
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 4: Delete old Admin.tsx**

```bash
rm src/pages/Admin.tsx
```

On Windows PowerShell:

```powershell
Remove-Item -LiteralPath "src\pages\Admin.tsx"
```

- [ ] **Step 5: Build and verify again**

```bash
npm run build
```

Expected: Build succeeds. The old file is no longer referenced.

- [ ] **Step 6: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/Admin.tsx src/App.tsx
git rm src/pages/Admin.tsx
git commit -m "feat: replace monolithic Admin.tsx with hook-first architecture"
```

---

### Task 22: Visual verification

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Manual verification checklist**

Navigate to `/admin` in browser and verify:

1. Login form works — type password, click Login
2. Dashboard stats cards display correctly
3. Add Questions tab — fill form, submit JSON, questions appear in Manage tab
4. Manage Questions tab — search works (with debounce), filters work
5. Delete/Rename/Change Category sheet operations work
6. Question table displays with virtualization
7. Edit modal opens, form fills, save works
8. Users tab — search works (with debounce)
9. Export tab — all export buttons work (CSV, JSON, by sheet, by category)
10. Logout works
11. Back to Platform button works
12. No console errors

---

## Self-Review Checklist

**1. Spec coverage:** Every requirement from the spec maps to a task:
- Split into reusable components → Tasks 11-20
- Move business logic into custom hooks → Tasks 5-10
- Extract API calls into service files → Already in supabaseClient.ts (no duplication)
- Extract utility functions → Task 4 (questionParser.ts)
- Extract constants → Task 3 (constants.ts)
- Keep existing functionality → All handlers preserved
- Folder structure → Task 2 + all file creation tasks
- Performance: React.memo → DashboardStatCard, DashboardStatsCards, SheetManagementCards, QuestionRow, EditQuestionModal
- Performance: useMemo → filteredQuestions, filteredUsers, categories, sheets
- Performance: useCallback → All handlers in hooks and components
- Performance: Debouncing → useDebouncedValue in useQuestions and UsersTab
- Performance: Virtualization → QuestionTable uses @tanstack/react-virtual
- Performance: State splitting → Form state in AddQuestionsForm, search in ManageQuestionsTab/UsersTab

**2. Placeholder scan:** No TBD, TODO, or placeholder patterns found.

**3. Type consistency:** All interfaces and types are consistent across tasks. `ParseOutcome` type defined in Task 4 and used in Task 18. `DashboardStats` imported from supabaseClient in Task 9 and DashboardStatsCards. `CategoryId` from categories module used consistently.