import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Button, Text, Stack, Group, Box, Badge, Loader, SimpleGrid } from '@mantine/core'
import { AnimatedCard } from '../components/AnimatedCard'
import { staggerContainer, fadeInUp, springTransitionFast } from '../lib/animations'
import { FileText, Trophy, Sparkles, ArrowRight } from 'lucide-react'
import { useQuiz } from '../context/QuizContext'
import { fetchSheets, fetchCategories } from '../lib/supabaseClient'
import { CATEGORIES, getCategoryConfig, CategoryId } from '../lib/categories'
import { Sheet } from '../types'

export function Home() {
  const navigate = useNavigate()
  const { userName, startQuiz, startSheetQuiz } = useQuiz()
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [availableCategories, setAvailableCategories] = useState<CategoryId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchSheets(), fetchCategories()])
      .then(([shs, cats]) => {
        setSheets(shs)
        setAvailableCategories(cats)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectCategory = async (categoryId: CategoryId) => {
    await startQuiz(categoryId)
    navigate(`/quiz/${encodeURIComponent(categoryId)}`)
  }

  const handleSelectSheet = async (sheetName: string) => {
    await startSheetQuiz(sheetName)
    navigate(`/sheet/${encodeURIComponent(sheetName)}`)
  }

  if (loading) {
    return (
      <Stack align="center" gap="md" pt="xl">
        <Loader size="md" color="teal" />
        <Text c="dimmed" size="sm">
          Loading quizzes...
        </Text>
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
            style={{
              width: 100,
              height: 100,
              objectFit: 'contain',
              marginBottom: 16,
            }}
          />
          <Text
            size="2.5rem"
            fw={900}
            ta="center"
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-teal-4), var(--mantine-color-teal-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to Indentify
          </Text>
          <Text c="dimmed" ta="center" size="md" mt="md" lh={1.6}>
            A quiz platform for every topic. Choose a category, test your knowledge, and track your
            progress.
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
          Choose a category to start practicing
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

      {/* ─── Categories Section ─── */}
      <Stack gap="md">
        <Group gap="xs" justify="center">
          <Text fw={700} size="lg">
            Categories
          </Text>
          <Badge color="teal" variant="light" size="sm">
            {availableCategories.length} available
          </Badge>
        </Group>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'contents' }}
        >
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {CATEGORIES.map((cat, index) => {
              const config = getCategoryConfig(cat.id)
              const hasQuestions = availableCategories.includes(cat.id as CategoryId)
              const Icon = config?.icon ?? FileText
              // Count sheets for this category
              const categorySheets = sheets.filter((s) => s.category === cat.id)

              return (
                <motion.div
                  key={cat.id}
                  variants={fadeInUp}
                  transition={{
                    ...springTransitionFast,
                    delay: index * 0.05 + 0.2,
                  }}
                >
                  <AnimatedCard
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                      cursor: hasQuestions ? 'pointer' : 'default',
                      opacity: hasQuestions ? 1 : 0.6,
                    }}
                  >
                    <Stack gap="sm" align="center">
                      <Box c={`${config?.color ?? 'teal'}.4`}>
                        <Icon size={36} strokeWidth={1.5} />
                      </Box>
                      <Text fw={700} size="lg" ta="center">
                        {cat.label}
                      </Text>
                      <Text c="dimmed" size="xs" ta="center" lineClamp={2}>
                        {cat.description}
                      </Text>
                      {categorySheets.length > 0 && (
                        <Badge color="teal" variant="light" size="xs">
                          {categorySheets.length} sheet(s)
                        </Badge>
                      )}
                      {hasQuestions ? (
                        <Button
                          onClick={() => handleSelectCategory(cat.id)}
                          fullWidth
                          color={config?.color ?? 'teal'}
                          size="md"
                        >
                          Start Quiz
                        </Button>
                      ) : (
                        <Badge color="gray" variant="light" size="sm">
                          Coming soon
                        </Badge>
                      )}
                    </Stack>
                  </AnimatedCard>
                </motion.div>
              )
            })}
          </SimpleGrid>
        </motion.div>
      </Stack>

      {/* ─── Sheets grouped by Category ─── */}
      {sheets.length > 0 && (
        <Stack gap="lg">
          {CATEGORIES.filter((cat) => sheets.some((s) => s.category === cat.id)).map((cat) => {
            const config = getCategoryConfig(cat.id)
            const Icon = config?.icon ?? FileText
            const categorySheets = sheets.filter((s) => s.category === cat.id)

            return (
              <Stack gap="md" key={cat.id}>
                <Group gap="xs" justify="center">
                  <Box c={`${config?.color ?? 'teal'}.4`}>
                    <Icon size={20} strokeWidth={1.5} />
                  </Box>
                  <Text fw={700} size="lg">
                    {cat.label} Sheets
                  </Text>
                  <Badge color={config?.color ?? 'teal'} variant="light" size="sm">
                    {categorySheets.length} available
                  </Badge>
                </Group>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'contents' }}
                >
                  <Group justify="center">
                    {categorySheets.map((sheet, index) => (
                      <motion.div
                        key={sheet.name}
                        variants={fadeInUp}
                        transition={{
                          ...springTransitionFast,
                          delay: index * 0.05 + 0.2,
                        }}
                      >
                        <AnimatedCard shadow="sm" padding="lg" radius="md" withBorder w={300}>
                          <Stack gap="sm" align="center">
                            <Box c={`${config?.color ?? 'teal'}.4`}>
                              <Icon size={32} strokeWidth={1.5} />
                            </Box>
                            <Text fw={700} size="xl" ta="center">
                              {sheet.name}
                            </Text>
                            <Badge color={config?.color ?? 'teal'} variant="light" size="sm">
                              {sheet.category}
                            </Badge>
                            <Text c="dimmed" size="xs" ta="center">
                              Complete quiz for {sheet.category}
                            </Text>
                            <Button
                              onClick={() => handleSelectSheet(sheet.name)}
                              fullWidth
                              color={config?.color ?? 'teal'}
                              size="md"
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
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
