import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Card,
  Button,
  Text,
  Stack,
  Group,
  Box,
  Badge,
  Loader,
  SimpleGrid,
  Table,
  ScrollArea,
  Accordion,
  Divider,
  TextInput,
} from '@mantine/core'
import { AnimatedCard } from '../components/AnimatedCard'
import { staggerContainer, fadeInUp, springTransitionFast } from '../lib/animations'
import { ArrowLeft, ArrowRight, FileText, Search, BookOpen, Lightbulb } from 'lucide-react'
import { useQuiz } from '../context/QuizContext'
import { fetchSheets, fetchCategories } from '../lib/supabaseClient'
import { getCategoryConfig, CategoryId, CATEGORY_IDS } from '../lib/categories'
import { getDefinitionsForCategory, hasDefinitions, Definition } from '../lib/definitions'
import { getComparisonsForCategory, hasComparisons, Comparison } from '../lib/comparisons'
import { Sheet } from '../types'

export function SubjectPage() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const { startQuiz, startSheetQuiz } = useQuiz()
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [availableCategories, setAvailableCategories] = useState<CategoryId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Decode the category from URL
  const decodedCategory = category ? decodeURIComponent(category) : ''
  const isValidCategory = CATEGORY_IDS.includes(decodedCategory as CategoryId)
  const categoryId = decodedCategory as CategoryId
  const config = getCategoryConfig(categoryId)
  const Icon = config?.icon ?? FileText

  // Definitions for this category
  const definitions = getDefinitionsForCategory(categoryId)
  const hasDefs = hasDefinitions(categoryId)
  const comparisons = getComparisonsForCategory(categoryId)
  const hasComps = hasComparisons(categoryId)

  // Filter definitions by search
  const filteredDefinitions = definitions.filter(
    (d: Definition) =>
      d.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.translation.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    Promise.all([fetchSheets(), fetchCategories()])
      .then(([shs, cats]) => {
        setSheets(shs)
        setAvailableCategories(cats)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectCategory = async (catId: CategoryId) => {
    await startQuiz(catId)
    navigate(`/quiz/${encodeURIComponent(catId)}`)
  }

  const handleSelectSheet = async (sheetName: string) => {
    await startSheetQuiz(sheetName)
    navigate(`/sheet/${encodeURIComponent(sheetName)}`)
  }

  // Invalid category
  if (!isValidCategory) {
    return (
      <Stack align="center" gap="md" pt="xl">
        <Text c="red" fw={700} size="lg">
          Category not found
        </Text>
        <Button
          variant="light"
          color="teal"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Stack>
    )
  }

  if (loading) {
    return (
      <Stack align="center" gap="md" pt="xl">
        <Loader size="md" color={config?.color ?? 'teal'} />
        <Text c="dimmed" size="sm">
          Loading {config?.label ?? 'subject'}...
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

  // Sheets for this category
  const categorySheets = sheets.filter((s) => s.category === categoryId)
  const hasQuestions = availableCategories.includes(categoryId)

  return (
    <Stack gap="xl">
      {/* ─── Header ─── */}
      <Box>
        <Group justify="space-between" align="center" mb="md">
          <Button
            variant="subtle"
            color={config?.color ?? 'teal'}
            size="sm"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => navigate('/')}
          >
            Back
          </Button>
        </Group>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack align="center" gap="sm">
            <Box c={`${config?.color ?? 'teal'}.4`}>
              <Icon size={48} strokeWidth={1.5} />
            </Box>
            <Text size="2rem" fw={800} ta="center">
              {config?.label ?? categoryId}
            </Text>
            <Text c="dimmed" ta="center" size="md" maw={500}>
              {config?.description ?? ''}
            </Text>
            <Group gap="xs" justify="center">
              {hasQuestions && (
                <Badge color={config?.color ?? 'teal'} variant="light" size="md">
                  Quiz Available
                </Badge>
              )}
              {categorySheets.length > 0 && (
                <Badge color="yellow" variant="light" size="md">
                  {categorySheets.length} Sheet(s)
                </Badge>
              )}
              {hasDefs && (
                <Badge color="blue" variant="light" size="md">
                  {definitions.length} Definitions
                </Badge>
              )}
              {hasComps && (
                <Badge color="grape" variant="light" size="md">
                  {comparisons.length} Comparisons
                </Badge>
              )}
            </Group>
          </Stack>
        </motion.div>
      </Box>

      <Divider />

      {/* ─── Start Big Quiz ─── */}
      {hasQuestions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card
            shadow="md"
            padding="xl"
            radius="md"
            withBorder
            style={{
              background: `linear-gradient(135deg, var(--mantine-color-dark-7), var(--mantine-color-dark-6))`,
              borderColor: `var(--mantine-color-${config?.color ?? 'teal'}-5)`,
              borderWidth: '2px',
            }}
          >
            <Stack gap="md" align="center">
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, var(--mantine-color-${config?.color ?? 'teal'}-6), var(--mantine-color-${config?.color ?? 'teal'}-5))`,
                }}
              >
                <Icon size={28} strokeWidth={1.5} color="white" />
              </Box>
              <Text fw={700} size="xl" ta="center" c={`${config?.color ?? 'teal'}.3`}>
                Big Quiz — {config?.label}
              </Text>
              <Text c="dimmed" size="sm" ta="center">
                Test your knowledge with all official questions for this subject
              </Text>
              <Button
                size="lg"
                color={config?.color ?? 'teal'}
                rightSection={<ArrowRight size={18} />}
                onClick={() => handleSelectCategory(categoryId)}
              >
                Start Big Quiz
              </Button>
            </Stack>
          </Card>
        </motion.div>
      )}

      {/* ─── Definition Quiz ─── */}
      {hasDefs && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card
            shadow="md"
            padding="xl"
            radius="md"
            withBorder
            style={{
              background: `linear-gradient(135deg, var(--mantine-color-dark-7), var(--mantine-color-dark-6))`,
              borderColor: 'var(--mantine-color-blue-5)',
              borderWidth: '2px',
            }}
          >
            <Stack gap="md" align="center">
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-blue-5))',
                }}
              >
                <Lightbulb size={28} strokeWidth={1.5} color="white" />
              </Box>
              <Text fw={700} size="xl" ta="center" c="blue.3">
                Definition Quiz — {config?.label}
              </Text>
              <Text c="dimmed" size="sm" ta="center">
                Type the correct term for each definition. 1–3 spelling errors get a hint, more than
                3 marks it wrong!
              </Text>
              <Badge color="blue" variant="light" size="sm">
                {definitions.length} terms to practice
              </Badge>
              <Button
                size="lg"
                color="blue"
                rightSection={<ArrowRight size={18} />}
                onClick={() => navigate(`/def-quiz/${encodeURIComponent(categoryId)}`)}
              >
                Start Definition Quiz
              </Button>
            </Stack>
          </Card>
        </motion.div>
      )}

      {/* ─── Sheets Section ─── */}
      {categorySheets.length > 0 && (
        <Stack gap="md">
          <Group gap="xs" justify="center">
            <Box c={`${config?.color ?? 'teal'}.4`}>
              <FileText size={20} strokeWidth={1.5} />
            </Box>
            <Text fw={700} size="lg">
              Practice Sheets
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
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {categorySheets.map((sheet, index) => (
                <motion.div
                  key={sheet.name}
                  variants={fadeInUp}
                  transition={{
                    ...springTransitionFast,
                    delay: index * 0.05 + 0.2,
                  }}
                >
                  <AnimatedCard shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="sm" align="center">
                      <Box c={`${config?.color ?? 'teal'}.4`}>
                        <Icon size={28} strokeWidth={1.5} />
                      </Box>
                      <Text fw={700} size="md" ta="center">
                        {sheet.name}
                      </Text>
                      <Group gap="xs">
                        <Badge color={config?.color ?? 'teal'} variant="light" size="sm">
                          {sheet.category}
                        </Badge>
                        {!sheet.is_official && (
                          <Badge color="yellow" variant="filled" size="sm">
                            Unofficial
                          </Badge>
                        )}
                        {sheet.questionTypes?.map((qt) => (
                          <Badge
                            key={qt}
                            color={qt === 'mcq' ? 'blue' : 'orange'}
                            variant="light"
                            size="sm"
                          >
                            {qt === 'mcq' ? 'MCQ' : 'True/False'}
                          </Badge>
                        ))}
                      </Group>
                      <Text c="dimmed" size="xs" ta="center">
                        {!sheet.is_official
                          ? 'Practice questions — not included in Big Quiz'
                          : `Complete quiz for ${sheet.category}`}
                      </Text>
                      <Button
                        onClick={() => handleSelectSheet(sheet.name)}
                        fullWidth
                        color={sheet.is_official ? (config?.color ?? 'teal') : 'yellow'}
                        size="sm"
                      >
                        Start Quiz
                      </Button>
                    </Stack>
                  </AnimatedCard>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </Stack>
      )}

      {/* ─── Comparisons Section ─── */}
      {hasComps && (
        <Stack gap="md">
          <Group gap="xs" justify="center">
            <Box c="grape.4">
              <FileText size={20} strokeWidth={1.5} />
            </Box>
            <Text fw={700} size="lg">
              Comparison Tables
            </Text>
            <Badge color="grape" variant="light" size="sm">
              {comparisons.length} comparisons
            </Badge>
          </Group>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Accordion variant="separated" radius="md" chevronPosition="right">
              {comparisons.map((comp: Comparison) => (
                <Accordion.Item key={comp.title} value={comp.title}>
                  <Accordion.Control>
                    <Text fw={700} size="sm">
                      {comp.title}
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="sm">
                      {comp.similarities && comp.similarities.length > 0 && (
                        <Box>
                          <Text fw={600} size="sm" c="grape.4" mb={4}>
                            Similarities
                          </Text>
                          {comp.similarities.map((s, i) => (
                            <Text key={i} size="sm" mb={2}>
                              • {s}
                            </Text>
                          ))}
                        </Box>
                      )}
                      <ScrollArea>
                        <Table
                          highlightOnHover
                          withTableBorder
                          withColumnBorders
                          withRowBorders
                          striped
                          style={{
                            borderRadius: 'var(--mantine-radius-md)',
                            overflow: 'hidden',
                          }}
                        >
                          <Table.Thead>
                            <Table.Tr>
                              {comp.headers.map((h) => (
                                <Table.Th key={h} style={{ textAlign: h === 'Feature' ? 'left' : 'center' }}>
                                  <Text fw={700} size="xs" c="grape.4">
                                    {h}
                                  </Text>
                                </Table.Th>
                              ))}
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {comp.rows.map((row) => (
                              <Table.Tr key={row.feature}>
                                <Table.Td>
                                  <Text fw={600} size="sm">
                                    {row.feature}
                                  </Text>
                                </Table.Td>
                                {row.values.map((val, i) => (
                                  <Table.Td key={i}>
                                    <Text size="sm">{val}</Text>
                                  </Table.Td>
                                ))}
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </ScrollArea>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </motion.div>
        </Stack>
      )}

      {/* ─── Definitions Section ─── */}
      {hasDefs && (
        <Stack gap="md">
          <Group gap="xs" justify="center">
            <Box c="blue.4">
              <BookOpen size={20} strokeWidth={1.5} />
            </Box>
            <Text fw={700} size="lg">
              Definitions & Key Terms
            </Text>
            <Badge color="blue" variant="light" size="sm">
              {definitions.length} terms
            </Badge>
          </Group>

          {/* Search bar */}
          <Group justify="center">
            <TextInput
              placeholder="Search definitions..."
              leftSection={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              maw={400}
              radius="md"
              size="md"
            />
          </Group>

          {/* Definitions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ScrollArea>
              <Table
                highlightOnHover
                withTableBorder
                withColumnBorders
                withRowBorders
                striped
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                  overflow: 'hidden',
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '5%', textAlign: 'center' }}>#</Table.Th>
                    <Table.Th style={{ width: '20%' }}>Term</Table.Th>
                    <Table.Th style={{ width: '40%' }}>Definition</Table.Th>
                    <Table.Th style={{ width: '35%' }}>Translation (ترجمة)</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredDefinitions.map((def: Definition, idx: number) => (
                    <Table.Tr key={def.term}>
                      <Table.Td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {idx + 1}
                      </Table.Td>
                      <Table.Td>
                        <Text fw={700} size="sm" c={`${config?.color ?? 'teal'}.4`}>
                          {def.term}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{def.definition}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" dir="rtl" style={{ textAlign: 'right' }}>
                          {def.translation}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {filteredDefinitions.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text c="dimmed" ta="center" py="md">
                          No definitions found matching "{searchTerm}"
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </motion.div>

          {/* Mobile-friendly Accordion view */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Text c="dimmed" size="xs" ta="center" mt="sm">
              Mobile view — tap a term to expand
            </Text>
            <Accordion variant="separated" radius="md" chevronPosition="right">
              {filteredDefinitions.map((def: Definition, idx: number) => (
                <Accordion.Item key={def.term} value={def.term}>
                  <Accordion.Control>
                    <Group gap="xs">
                      <Badge color={config?.color ?? 'teal'} variant="light" size="xs">
                        {idx + 1}
                      </Badge>
                      <Text fw={700} size="sm">
                        {def.term}
                      </Text>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="sm">
                      <Text size="sm">{def.definition}</Text>
                      <Divider />
                      <Text size="sm" dir="rtl" style={{ textAlign: 'right' }} fw={500}>
                        {def.translation}
                      </Text>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </motion.div>
        </Stack>
      )}

      {/* ─── No content available ─── */}
      {!hasQuestions && categorySheets.length === 0 && !hasDefs && !hasComps && (
        <Stack align="center" gap="md" py="xl">
          <Box c="dimmed">
            <Icon size={48} strokeWidth={1.5} />
          </Box>
          <Text c="dimmed" size="lg" ta="center">
            No content available for {config?.label ?? categoryId} yet
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            Check back later for quizzes and definitions
          </Text>
        </Stack>
      )}
    </Stack>
  )
}
