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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadQuestions/loadSheets are stable useCallback refs
  }, [])

  useEffect(() => {
    if (auth.isAuthenticated) {
      questions.loadQuestions()
      sheets.loadSheets()
      users.loadUsers()
      dashboard.loadDashboardStats()
      exportData.loadExportScores()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load functions are stable useCallback refs, hook objects change every render
  }, [auth.isAuthenticated])

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

      {dashboard.dashboardStats && <DashboardStatsCards stats={dashboard.dashboardStats} />}

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
