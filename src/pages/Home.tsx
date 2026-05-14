import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Button, Text, Stack, Group, Loader, Box, Badge } from '@mantine/core'
import { AnimatedCard } from '../components/AnimatedCard'
import {
  staggerContainer,
  fadeInUp,
  springTransitionFast,
} from '../lib/animations'
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
  Sparkles,
  ArrowRight,
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

  // If user hasn't set their name yet, show welcome prompt
  if (!userName) {
    return (
      <Stack align="center" gap="xl" pt="xl">
        <Box ta="center" maw={500}>
          <img
            src="/logo.png"
            alt="Indentify"
            style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 16 }}
          />
          <Text
            size="2.5rem"
            fw={900}
            ta="center"
            style={{
              background: 'linear-gradient(135deg, var(--mantine-color-teal-4), var(--mantine-color-teal-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to Indentify
          </Text>
          <Text c="dimmed" ta="center" size="md" mt="md" lh={1.6}>
            A quiz platform for every topic. Choose a category, test your knowledge, and track your progress.
          </Text>
        </Box>

        <Card shadow="md" padding="xl" radius="md" withBorder maw={420} w="100%">
          <Stack gap="md" align="center">
            <Sparkles size={32} color="var(--mantine-color-teal-4)" />
            <Text fw={600} ta="center">
              Get started in seconds
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Enter your name to save your scores and compete on the leaderboard.
            </Text>
            <Button
              fullWidth
              size="md"
              color="teal"
              rightSection={<ArrowRight size={18} />}
              onClick={() => navigate('/login')}

            >
              Enter Your Name
            </Button>
            <Button
              fullWidth
              size="md"
              variant="subtle"
              color="gray"
              onClick={() => {
                // Continue as guest - just proceed without name
                navigate('/login')
              }}
            >
              Or continue as guest
            </Button>
          </Stack>
        </Card>
      </Stack>
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
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ display: 'contents' }}
          >
            <Group justify="center">
              {sheets.map((sheet, index) => (
                <motion.div
                  key={sheet}
                  variants={fadeInUp}
                  transition={{ ...springTransitionFast, delay: index * 0.05 + 0.2 }}
                >
                  <AnimatedCard
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    w={300}
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
                  </AnimatedCard>
                </motion.div>
              ))}
            </Group>
          </motion.div>
        </Stack>
      )}

      <Stack gap="md">
        <Text fw={700} size="lg" ta="center">
          Categories
        </Text>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'contents' }}
        >
          <Group justify="center">
            {categories.map((category, index) => (
              <motion.div
                key={category}
                variants={fadeInUp}
                transition={{ ...springTransitionFast, delay: index * 0.05 }}
              >
                <AnimatedCard
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  w={220}
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
                </AnimatedCard>
              </motion.div>
            ))}
          </Group>
        </motion.div>
      </Stack>
    </Stack>
  )
}
