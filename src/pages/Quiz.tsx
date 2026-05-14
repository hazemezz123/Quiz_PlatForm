import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button, Text, Stack, Group, Badge, Box } from '@mantine/core'
import { useQuiz } from '../context/QuizContext'
import { CodeRenderer } from '../components/CodeRenderer'
import { CategoryId } from '../lib/categories'
import {
  slideVariants,
  staggerContainerFast,
  fadeInLeft,
  springTransition,
  usePrefersReducedMotion,
} from '../lib/animations'

export function Quiz() {
  const { category, sheet } = useParams<{
    category?: string
    sheet?: string
  }>()
  const navigate = useNavigate()
  const {
    questions,
    answers,
    submittedAnswers,
    setAnswer,
    skipQuestion,
    submitQuiz,
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
      const decodedCategory = decodeURIComponent(category) as CategoryId
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

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text c="red">{error}</Text>
          <Button onClick={() => navigate('/')} variant="light" color="teal">
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
          <Button onClick={() => navigate('/')} variant="light" color="teal">
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

      <Box
        style={{
          width: '100%',
          background: 'var(--mantine-color-dark-6)',
          borderRadius: 'var(--mantine-radius-xl)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '8px',
            background: 'var(--mantine-color-teal-6)',
            borderRadius: 'var(--mantine-radius-xl)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={springTransition}
        />
      </Box>

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

              <motion.div
                variants={staggerContainerFast}
                initial="hidden"
                animate="visible"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--mantine-spacing-xs)',
                }}
              >
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
                    <motion.div
                      key={idx}
                      variants={fadeInLeft}
                      whileTap={!isSubmitted && !reducedMotion ? { scale: 0.97 } : {}}
                      animate={
                        isSubmitted && selected && !isCorrect && !reducedMotion
                          ? { x: [-5, 5, -5, 5, 0] }
                          : isSubmitted && isCorrect && !reducedMotion
                            ? { scale: 1.02 }
                            : {}
                      }
                      transition={
                        isSubmitted && selected && !isCorrect ? { duration: 0.4 } : springTransition
                      }
                    >
                      <Card
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
                    </motion.div>
                  )
                })}
              </motion.div>

              <AnimatePresence>
                {submittedAnswers[currentQuestion.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={springTransition}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

              {!submittedAnswers[currentQuestion.id] && (
                <Group justify="center" gap="xs">
                  <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>
                    Select an answer or skip to continue
                  </Text>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => {
                      skipQuestion(currentQuestion.id)
                      if (!isLastQuestion) handleNext()
                    }}
                  >
                    Skip
                  </Button>
                </Group>
              )}
            </Stack>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Group justify="space-between">
        <Button variant="default" onClick={handlePrevious} disabled={currentIndex === 0} size="md">
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
