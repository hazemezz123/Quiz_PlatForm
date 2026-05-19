import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  Button,
  Text,
  Stack,
  Group,
  Box,
  Badge,
  Progress,
  TextInput,
  Divider,
} from '@mantine/core'
import { ArrowLeft, ArrowRight, Check, X, Lightbulb, RotateCcw } from 'lucide-react'
import { getCategoryConfig, CATEGORY_IDS, CategoryId } from '../lib/categories'
import { getDefinitionsForCategory, Definition } from '../lib/definitions'
import { evaluateDefinitionAnswer, AnswerResult } from '../lib/levenshtein'

interface QuizState {
  currentIndex: number
  answers: Record<number, AnswerResult>
  hintsUsed: Record<number, string>
  userInputs: Record<number, string>
  showResult: boolean
  completed: boolean
}

export function DefinitionQuiz() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()

  const decodedCategory = category ? decodeURIComponent(category) : ''
  const isValidCategory = CATEGORY_IDS.includes(decodedCategory as CategoryId)
  const categoryId = decodedCategory as CategoryId
  const config = getCategoryConfig(categoryId)

  const definitions = getDefinitionsForCategory(categoryId)

  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    answers: {},
    hintsUsed: {},
    userInputs: {},
    showResult: false,
    completed: false,
  })
  const [inputValue, setInputValue] = useState('')
  const [shake, setShake] = useState(false)

  // Shuffle definitions on mount
  const [shuffledDefs, setShuffledDefs] = useState<Definition[]>([])

  useEffect(() => {
    if (definitions.length > 0) {
      const shuffled = [...definitions].sort(() => Math.random() - 0.5)
      setShuffledDefs(shuffled)
    }
  }, [definitions])

  const currentDef = shuffledDefs[state.currentIndex]
  const total = shuffledDefs.length

  const handleSubmit = useCallback(() => {
    if (!currentDef || state.showResult) return

    const userAnswer = inputValue.trim()
    if (!userAnswer) return

    const result = evaluateDefinitionAnswer(userAnswer, currentDef.term)

    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentIndex]: result.result },
      hintsUsed: { ...prev.hintsUsed, [prev.currentIndex]: result.hint },
      userInputs: { ...prev.userInputs, [prev.currentIndex]: userAnswer },
      showResult: true,
    }))

    if (result.result === 'wrong') {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }, [currentDef, inputValue, state.showResult])

  const handleNext = useCallback(() => {
    if (state.currentIndex >= total - 1) {
      setState((prev) => ({ ...prev, completed: true }))
    } else {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showResult: false,
      }))
      setInputValue('')
    }
  }, [state.currentIndex, total])

  const handleRetry = useCallback(() => {
    const shuffled = [...definitions].sort(() => Math.random() - 0.5)
    setShuffledDefs(shuffled)
    setState({
      currentIndex: 0,
      answers: {},
      hintsUsed: {},
      userInputs: {},
      showResult: false,
      completed: false,
    })
    setInputValue('')
  }, [definitions])

  // Invalid category or no definitions
  if (!isValidCategory || definitions.length === 0) {
    return (
      <Stack align="center" gap="md" pt="xl">
        <Text c="red" fw={700} size="lg">
          {!isValidCategory ? 'Category not found' : 'No definitions available for this category'}
        </Text>
        <Button
          variant="light"
          color="teal"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate(`/subject/${encodeURIComponent(decodedCategory)}`)}
        >
          Back to Subject
        </Button>
      </Stack>
    )
  }

  // ─── Completed: Show Results ───
  if (state.completed) {
    const correctCount = Object.values(state.answers).filter((a) => a === 'correct').length
    const hintCount = Object.values(state.answers).filter((a) => a === 'hint').length
    const wrongCount = Object.values(state.answers).filter((a) => a === 'wrong').length
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0

    return (
      <Stack gap="xl" align="center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Stack align="center" gap="sm">
            <Text size="2rem" fw={800} ta="center">
              Definition Quiz Complete!
            </Text>
            <Text c="dimmed" ta="center" size="md">
              {config?.label ?? categoryId} — {total} terms
            </Text>
          </Stack>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card shadow="md" padding="xl" radius="md" withBorder maw={500} w="100%">
            <Stack gap="lg" align="center">
              <Text
                size="3rem"
                fw={900}
                ta="center"
                c={percentage >= 70 ? 'teal' : percentage >= 40 ? 'yellow' : 'red'}
              >
                {percentage}%
              </Text>
              <Progress
                value={percentage}
                color={percentage >= 70 ? 'teal' : percentage >= 40 ? 'yellow' : 'red'}
                size="lg"
                radius="md"
                maw={400}
                w="100%"
              />
              <Group gap="md" justify="center">
                <Badge color="teal" variant="light" size="lg">
                  ✓ {correctCount} Correct
                </Badge>
                <Badge color="yellow" variant="light" size="lg">
                  💡 {hintCount} With Hint
                </Badge>
                <Badge color="red" variant="light" size="lg">
                  ✗ {wrongCount} Wrong
                </Badge>
              </Group>
            </Stack>
          </Card>
        </motion.div>

        {/* Detailed results */}
        <Stack gap="sm" maw={600} w="100%">
          <Text fw={700} size="lg" ta="center">
            Detailed Results
          </Text>
          {shuffledDefs.map((def, idx) => {
            const answerResult = state.answers[idx]
            const userInput = state.userInputs[idx]
            const hint = state.hintsUsed[idx]

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card shadow="sm" padding="sm" radius="md" withBorder>
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Text
                        fw={700}
                        size="sm"
                        c={
                          answerResult === 'correct'
                            ? 'teal'
                            : answerResult === 'hint'
                              ? 'yellow'
                              : 'red'
                        }
                      >
                        {def.term}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {def.definition}
                      </Text>
                      {userInput && answerResult !== 'correct' && (
                        <Text size="xs" c="dimmed">
                          Your answer: "{userInput}"
                        </Text>
                      )}
                      {hint && answerResult === 'hint' && (
                        <Text size="xs" c="yellow.3">
                          Hint: {hint}
                        </Text>
                      )}
                    </Stack>
                    <Box>
                      {answerResult === 'correct' && <Check size={20} color="teal" />}
                      {answerResult === 'hint' && <Lightbulb size={20} color="yellow" />}
                      {answerResult === 'wrong' && <X size={20} color="red" />}
                    </Box>
                  </Group>
                </Card>
              </motion.div>
            )
          })}
        </Stack>

        <Group gap="md">
          <Button
            size="lg"
            color={config?.color ?? 'teal'}
            leftSection={<RotateCcw size={18} />}
            onClick={handleRetry}
          >
            Try Again
          </Button>
          <Button
            size="lg"
            variant="light"
            color="teal"
            leftSection={<ArrowLeft size={18} />}
            onClick={() => navigate(`/subject/${encodeURIComponent(decodedCategory)}`)}
          >
            Back to Subject
          </Button>
        </Group>
      </Stack>
    )
  }

  // ─── Active Quiz ───
  const currentAnswer = state.answers[state.currentIndex]
  const progressPercent = total > 0 ? Math.round((state.currentIndex / total) * 100) : 0

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Button
          variant="subtle"
          color={config?.color ?? 'teal'}
          size="sm"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate(`/subject/${encodeURIComponent(decodedCategory)}`)}
        >
          Back
        </Button>
        <Group gap="xs">
          <Badge color={config?.color ?? 'teal'} variant="light" size="md">
            {state.currentIndex + 1} / {total}
          </Badge>
        </Group>
      </Group>

      <Progress value={progressPercent} color={config?.color ?? 'teal'} size="sm" radius="md" />

      {/* Definition Card */}
      {currentDef && (
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              shadow="md"
              padding="xl"
              radius="md"
              withBorder
              style={{
                borderColor:
                  currentAnswer === 'correct'
                    ? 'var(--mantine-color-teal-5)'
                    : currentAnswer === 'hint'
                      ? 'var(--mantine-color-yellow-5)'
                      : currentAnswer === 'wrong'
                        ? 'var(--mantine-color-red-5)'
                        : 'var(--mantine-color-dark-4)',
                borderWidth: '2px',
              }}
            >
              <Stack gap="lg" align="center">
                {/* Question label */}
                <Badge color={config?.color ?? 'teal'} variant="filled" size="lg">
                  What term matches this definition?
                </Badge>

                {/* Definition text */}
                <Box maw={500} ta="center">
                  <Text size="lg" fw={600} ta="center" lh={1.6}>
                    {currentDef.definition}
                  </Text>
                </Box>

                {/* Arabic translation (if available) */}
                {currentDef.translation && (
                  <Text size="sm" c="dimmed" dir="rtl" ta="center" lh={1.6}>
                    {currentDef.translation}
                  </Text>
                )}

                <Divider />

                {/* Input area */}
                {!state.showResult ? (
                  <Stack gap="md" align="center" maw={400} w="100%">
                    <TextInput
                      placeholder="Type the term here..."
                      size="lg"
                      radius="md"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmit()
                      }}
                      maw={400}
                      w="100%"
                      styles={{
                        input: {
                          textAlign: 'center',
                          fontWeight: 600,
                        },
                      }}
                    />
                    <Button
                      size="lg"
                      color={config?.color ?? 'teal'}
                      rightSection={<Check size={18} />}
                      onClick={handleSubmit}
                      disabled={!inputValue.trim()}
                    >
                      Submit Answer
                    </Button>
                  </Stack>
                ) : (
                  <Stack gap="md" align="center">
                    {/* Result display */}
                    {currentAnswer === 'correct' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Stack gap="sm" align="center">
                          <Box c="teal.4">
                            <Check size={48} strokeWidth={2} />
                          </Box>
                          <Text fw={700} size="xl" c="teal">
                            Correct! 🎉
                          </Text>
                          <Text size="md" fw={600} c="teal.3">
                            {currentDef.term}
                          </Text>
                        </Stack>
                      </motion.div>
                    )}

                    {currentAnswer === 'hint' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={shake ? { animation: 'shake 0.5s' } : {}}
                      >
                        <Stack gap="sm" align="center">
                          <Box c="yellow.4">
                            <Lightbulb size={48} strokeWidth={2} />
                          </Box>
                          <Text fw={700} size="xl" c="yellow">
                            Close! Here's a hint 💡
                          </Text>
                          <Text size="lg" fw={700} c="yellow.3" style={{ letterSpacing: '2px' }}>
                            {state.hintsUsed[state.currentIndex]}
                          </Text>
                          <Text size="sm" c="dimmed">
                            You had{' '}
                            {state.userInputs[state.currentIndex] && (
                              <Text span fw={600} c="yellow.3">
                                "{state.userInputs[state.currentIndex]}"
                              </Text>
                            )}{' '}
                            —{' '}
                            {
                              evaluateDefinitionAnswer(
                                state.userInputs[state.currentIndex] ?? '',
                                currentDef.term,
                              ).distance
                            }{' '}
                            spelling error(s)
                          </Text>
                        </Stack>
                      </motion.div>
                    )}

                    {currentAnswer === 'wrong' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={shake ? { animation: 'shake 0.5s' } : {}}
                      >
                        <Stack gap="sm" align="center">
                          <Box c="red.4">
                            <X size={48} strokeWidth={2} />
                          </Box>
                          <Text fw={700} size="xl" c="red">
                            Incorrect ✗
                          </Text>
                          <Text size="sm" c="dimmed">
                            Your answer: "{state.userInputs[state.currentIndex]}"
                          </Text>
                          <Text size="md" fw={700} c="teal.3">
                            Correct answer: {currentDef.term}
                          </Text>
                        </Stack>
                      </motion.div>
                    )}

                    {/* Next button */}
                    <Button
                      size="lg"
                      color={config?.color ?? 'teal'}
                      rightSection={<ArrowRight size={18} />}
                      onClick={handleNext}
                    >
                      {state.currentIndex >= total - 1 ? 'See Results' : 'Next'}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Score tracker */}
      <Group justify="center" gap="md">
        <Badge color="teal" variant="light" size="sm">
          ✓ {Object.values(state.answers).filter((a) => a === 'correct').length} Correct
        </Badge>
        <Badge color="yellow" variant="light" size="sm">
          💡 {Object.values(state.answers).filter((a) => a === 'hint').length} Hint
        </Badge>
        <Badge color="red" variant="light" size="sm">
          ✗ {Object.values(state.answers).filter((a) => a === 'wrong').length} Wrong
        </Badge>
      </Group>

      {/* Shake animation CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </Stack>
  )
}
