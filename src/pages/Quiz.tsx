import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  Button,
  Text,
  Stack,
  Group,
  Progress,
  Loader,
  Badge,
} from '@mantine/core'
import { useQuiz } from '../context/QuizContext'
import { CodeRenderer } from '../components/CodeRenderer'
import {
  slideVariants,
  staggerContainerFast,
  fadeInLeft,
  shakeVariants,
  springTransition,
  usePrefersReducedMotion,
} from '../lib/animations'

export function Quiz() {
  const { category, sheet } = useParams<{ category?: string; sheet?: string }>()
  const navigate = useNavigate()
  const {
    questions,
    answers,
    submittedAnswers,
    setAnswer,
    submitQuiz,
    loading,
    error,
    currentCategory,
    currentSheet,
    startQuiz,
    startSheetQuiz,
  } = useQuiz()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredOption, setHoveredOption] = useState<number | null>(null)
  const [direction, setDirection] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (category) {
      const decodedCategory = decodeURIComponent(category)
      if (currentCategory !== decodedCategory) {
        startQuiz(decodedCategory)
      }
    } else if (sheet) {
      const decodedSheet = decodeURIComponent(sheet)
      if (currentSheet !== decodedSheet) {
        startSheetQuiz(decodedSheet)
      }
    }
  }, [category, sheet, currentCategory, currentSheet, startQuiz, startSheetQuiz])

  useEffect(() => {
    setCurrentIndex(0)
  }, [questions])

  if (loading) {
    return (
      <Stack align="center" gap="md" pt="xl">
        <Loader size="md" color="teal" />
        <Text c="dimmed" size="sm">Loading questions...</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text c="red">{error}</Text>
          <Button onClick={() => navigate('/home')} variant="light" color="teal">
            Back to Home
          </Button>
        </Stack>
      </Card>
    )
  }

  if (questions.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text>No questions available for this category.</Text>
          <Button onClick={() => navigate('/home')} variant="light" color="teal">
            Back to Home
          </Button>
        </Stack>
      </Card>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    submitQuiz()
    navigate('/result')
  }

  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Badge color="teal" variant="light" size="sm">
          {currentQuestion.category}
        </Badge>
        <Text size="sm" c="dimmed">
          {currentIndex + 1} / {questions.length}
        </Text>
      </Group>

      <Progress
        value={progress}
        size="sm"
        radius="xl"
        color="teal"
        transitionDuration={200}
      />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQuestion.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
        >
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="lg">
              <CodeRenderer text={currentQuestion.question} maxCodeWidth={600} textSize="lg" />

              <Stack gap="xs">
                {currentQuestion.options.map((option, idx) => {
                  const selected = answers[currentQuestion.id] === idx
                  const isHovered = hoveredOption === idx
                  const isSubmitted = submittedAnswers[currentQuestion.id]
                  const isCorrect = idx === currentQuestion.answer

                  let bg: string | undefined = undefined
                  let borderColor: string | undefined = undefined

                  if (isSubmitted) {
                    if (isCorrect) {
                      bg = 'rgba(32, 201, 151, 0.08)'
                      borderColor = 'var(--mantine-color-teal-6)'
                    } else if (selected) {
                      bg = 'rgba(250, 82, 82, 0.08)'
                      borderColor = 'var(--mantine-color-red-6)'
                    } else {
                      borderColor = 'var(--mantine-color-dark-6)'
                    }
                  } else {
                    bg = selected
                      ? 'var(--mantine-color-dark-6)'
                      : isHovered
                        ? 'var(--mantine-color-dark-5)'
                        : undefined
                    borderColor = selected
                      ? 'var(--mantine-color-teal-6)'
                      : isHovered
                        ? 'var(--mantine-color-teal-8)'
                        : 'var(--mantine-color-dark-6)'
                  }

                  return (
                    <Card
                      key={idx}
                      padding="md"
                      radius="md"
                      withBorder
                      bg={bg}
                      style={{
                        borderColor,
                        cursor: isSubmitted ? 'default' : 'pointer',
                        transition: 'all 120ms ease',
                      }}
                      onClick={() => {
                        if (!isSubmitted) setAnswer(currentQuestion.id, idx)
                      }}
                      onMouseEnter={() => {
                        if (!isSubmitted) setHoveredOption(idx)
                      }}
                      onMouseLeave={() => setHoveredOption(null)}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text fw={selected ? 600 : 400} size="sm">
                          {option}
                        </Text>
                        {isSubmitted && isCorrect && (
                          <Badge color="teal" size="xs" variant="filled">
                            Correct
                          </Badge>
                        )}
                        {isSubmitted && selected && !isCorrect && (
                          <Badge color="red" size="xs" variant="filled">
                            Your answer
                          </Badge>
                        )}
                      </Group>
                    </Card>
                  )
                })}
              </Stack>

              {submittedAnswers[currentQuestion.id] && (
                <Card
                  padding="sm"
                  radius="md"
                  style={{
                    background: 'var(--mantine-color-dark-7)',
                    border: '1px solid var(--mantine-color-dark-6)',
                  }}
                >
                  <Text size="xs" c="dimmed">
                    <Text span fw={600} c="gray.4">
                      Correct answer:
                    </Text>{' '}
                    {currentQuestion.options[currentQuestion.answer]}
                  </Text>
                  {currentQuestion.explanation && (
                    <Text size="xs" c="dimmed" mt={4}>
                      <Text span fw={600} c="gray.4">
                        Explanation:
                      </Text>{' '}
                      {currentQuestion.explanation}
                    </Text>
                  )}
                </Card>
              )}

              {!submittedAnswers[currentQuestion.id] && (
                <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>
                  Select an answer to continue
                </Text>
              )}
            </Stack>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Group justify="space-between">
        <Button
          variant="default"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          size="md"
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            color="teal"
            size="md"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            color="teal"
            size="md"
            disabled={answers[currentQuestion.id] === undefined}
          >
            Next
          </Button>
        )}
      </Group>
    </Stack>
  )
}
