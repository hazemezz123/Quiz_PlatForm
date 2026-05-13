import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Text, Stack, Group, Loader, Box, Badge } from '@mantine/core'
import {
  FileText,
  Code2,
  Braces,
  Variable,
  Type,
  List,
  Repeat,
  FunctionSquare,
  Calculator,
  GitBranch,
  ToggleLeft,
  BookOpen,
  Package,
  CircleDot,
  Puzzle,
  Bug,
  Keyboard,
  Clock,
  ArrowLeftRight,
  Hash,
  Terminal,
  Layers,
  ShieldAlert,
  Database,
  FileQuestion,
  BrainCircuit,
  Trophy,
} from 'lucide-react'
import { useQuiz } from '../context/QuizContext'
import { fetchCategories, fetchSheets } from '../lib/supabaseClient'

const categoryIcons: Record<string, React.ReactNode> = {
  'Python Basics': <Terminal size={28} strokeWidth={1.5} />,
  'Syntax': <Braces size={28} strokeWidth={1.5} />,
  'Variables': <Variable size={28} strokeWidth={1.5} />,
  'Strings': <Type size={28} strokeWidth={1.5} />,
  'Lists': <List size={28} strokeWidth={1.5} />,
  'Loops': <Repeat size={28} strokeWidth={1.5} />,
  'Functions': <FunctionSquare size={28} strokeWidth={1.5} />,
  'Operators': <Calculator size={28} strokeWidth={1.5} />,
  'Conditionals': <GitBranch size={28} strokeWidth={1.5} />,
  'Boolean Logic': <ToggleLeft size={28} strokeWidth={1.5} />,
  'Booleans': <ToggleLeft size={28} strokeWidth={1.5} />,
  'Dictionaries': <BookOpen size={28} strokeWidth={1.5} />,
  'Tuples': <Package size={28} strokeWidth={1.5} />,
  'Sets': <CircleDot size={28} strokeWidth={1.5} />,
  'Modules': <Puzzle size={28} strokeWidth={1.5} />,
  'Error Detection': <Bug size={28} strokeWidth={1.5} />,
  'Input': <Keyboard size={28} strokeWidth={1.5} />,
  'Time': <Clock size={28} strokeWidth={1.5} />,
  'Type Conversion': <ArrowLeftRight size={28} strokeWidth={1.5} />,
  'Programming': <Code2 size={28} strokeWidth={1.5} />,
  'Comments': <Hash size={28} strokeWidth={1.5} />,
  'File Handling': <FileText size={28} strokeWidth={1.5} />,
  'OOP': <Layers size={28} strokeWidth={1.5} />,
  'Exceptions': <ShieldAlert size={28} strokeWidth={1.5} />,
  'Data Structures': <Database size={28} strokeWidth={1.5} />,
  'Algorithms': <BrainCircuit size={28} strokeWidth={1.5} />,
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] ?? <FileQuestion size={28} strokeWidth={1.5} />
}

function getSheetIcon(sheet: string) {
  if (sheet.toLowerCase().includes('python')) {
    return <Code2 size={32} strokeWidth={1.5} />
  }
  return <FileText size={32} strokeWidth={1.5} />
}

export function Home() {
  const navigate = useNavigate()
  const { userName, startQuiz, startSheetQuiz } = useQuiz()
  const [categories, setCategories] = useState<string[]>([])
  const [sheets, setSheets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchCategories(), fetchSheets()])
      .then(([cats, shs]) => {
        setCategories(cats)
        setSheets(shs)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectCategory = async (category: string) => {
    await startQuiz(category)
    navigate(`/quiz/${encodeURIComponent(category)}`)
  }

  const handleSelectSheet = async (sheet: string) => {
    await startSheetQuiz(sheet)
    navigate(`/sheet/${encodeURIComponent(sheet)}`)
  }

  if (loading) {
    return (
      <Stack align="center" gap="md" pt="xl">
        <Loader size="md" color="teal" />
        <Text c="dimmed" size="sm">Loading content...</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text c="red">{error}</Text>
          <Button onClick={() => window.location.reload()} variant="light" color="teal">
            Retry
          </Button>
        </Stack>
      </Card>
    )
  }

  return (
    <Stack gap="xl">
      <Box>
        <Text size="2rem" fw={800} ta="center">
          Hello, {userName}!
        </Text>
        <Text c="dimmed" ta="center" size="sm" mt="xs">
          Choose how you want to practice
        </Text>
        <Group justify="center" mt="md">
          <Button
            variant="light"
            color="yellow"
            leftSection={<Trophy size={18} />}
            onClick={() => navigate('/leaderboard')}
          >
            Leaderboard
          </Button>
        </Group>
      </Box>

      {sheets.length > 0 && (
        <Stack gap="md">
          <Group gap="xs" justify="center">
            <Text fw={700} size="lg">
              Full Sheets
            </Text>
            <Badge color="teal" variant="light" size="sm">
              All topics
            </Badge>
          </Group>
          <Group justify="center">
            {sheets.map((sheet) => (
              <Card
                key={sheet}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                w={300}
                style={{
                  transition: 'transform 120ms ease, border-color 120ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = 'var(--mantine-color-teal-6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = ''
                }}
              >
                <Stack gap="sm" align="center">
                  <Box c="teal.4">
                    {getSheetIcon(sheet)}
                  </Box>
                  <Text fw={700} size="xl" ta="center">
                    {sheet}
                  </Text>
                  <Text c="dimmed" size="xs" ta="center">
                    Complete quiz covering every topic
                  </Text>
                  <Button
                    onClick={() => handleSelectSheet(sheet)}
                    fullWidth
                    color="teal"
                    size="md"
                  >
                    Start Big Quiz
                  </Button>
                </Stack>
              </Card>
            ))}
          </Group>
        </Stack>
      )}

      <Stack gap="md">
        <Text fw={700} size="lg" ta="center">
          Categories
        </Text>
        <Group justify="center">
          {categories.map((category) => (
            <Card
              key={category}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              w={220}
              style={{
                transition: 'transform 120ms ease, border-color 120ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'var(--mantine-color-teal-6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = ''
              }}
            >
              <Stack gap="sm" align="center">
                <Box c="teal.4">
                  {getCategoryIcon(category)}
                </Box>
                <Text fw={600} size="md" ta="center" lineClamp={2} style={{ minHeight: '2.5rem' }}>
                  {category}
                </Text>
                <Button
                  onClick={() => handleSelectCategory(category)}
                  fullWidth
                  variant="light"
                  color="teal"
                  size="sm"
                >
                  Start Quiz
                </Button>
              </Stack>
            </Card>
          ))}
        </Group>
      </Stack>
    </Stack>
  )
}
