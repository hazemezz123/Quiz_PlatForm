import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button, Text, Stack, Group, Badge, Box, Modal, Progress } from '@mantine/core'
import { useQuiz } from '../context/QuizContext'
import { SavedProgress } from '../context/QuizContext'
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
    saveProgress,
    clearProgress,
    getSavedProgress,
    resumeFromProgress,
    loading,
  } = useQuiz()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredOption, setHoveredOption] = useState<number | null>(null)
  const [direction, setDirection] = useState(0)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null)
  // Flag: true while user hasn't decided whether to resume or start fresh
  // This blocks the startQuiz effect from resetting state
  const awaitingResumeChoice = useRef(false)
  // Flag: true when we're resuming — prevents currentIndex reset
  const isResumingRef = useRef(false)
  const reducedMotion = usePrefersReducedMotion()

  // Check for saved progress on mount — BEFORE any quiz starts
  useEffect(() => {
    const progress = getSavedProgress()
    if (progress) {
      setSavedProgress(progress)
      setShowResumeModal(true)
      awaitingResumeChoice.current = true // Block fresh quiz start
    }
  }, [getSavedProgress])

  // Start quiz from URL params — ONLY if user is NOT awaiting a resume choice
  useEffect(() => {
    if (awaitingResumeChoice.current) return // Don't start fresh while resume modal is open

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

  // Reset currentIndex when questions change — unless we're resuming
  useEffect(() => {
    if (isResumingRef.current) {
      isResumingRef.current = false
      return
    }
    setCurrentIndex(0)
  }, [questions])

  // Auto-save progress whenever answers or currentIndex change
  useEffect(() => {
    if (questions.length > 0 && Object.keys(answers).length > 0) {
      saveProgress(currentIndex)
    }
  }, [answers, submittedAnswers, currentIndex, questions.length, saveProgress])

  // Resume: restore all answers and jump to the saved question index
  const handleResumeQuiz = async () => {
    if (savedProgress) {
      isResumingRef.current = true
      awaitingResumeChoice.current = false
      await resumeFromProgress(savedProgress)
      setCurrentIndex(savedProgress.currentIndex)
      setSavedProgress(null)
    }
    setShowResumeModal(false)
  }

  // Discard: clear saved progress and start a fresh quiz
  const handleDiscardProgress = () => {
    clearProgress()
    setSavedProgress(null)
    awaitingResumeChoice.current = false // Now allow the startQuiz effect to run
    setShowResumeModal(false)
    // Trigger fresh quiz start after clearing the block
    if (category) {
      startQuiz(decodeURIComponent(category) as CategoryId)
    } else if (sheet) {
      startSheetQuiz(decodeURIComponent(sheet))
    }
  }

  const handleExitClick = () => {
    setShowExitModal(true)
  }

  const handleConfirmExit = () => {
    saveProgress(currentIndex)
    setShowExitModal(false)
    navigate('/')
  }

  const handleConfirmExitWithoutSave = () => {
    clearProgress()
    setShowExitModal(false)
    navigate('/')
  }

  const handleCancelExit = () => {
    setShowExitModal(false)
  }

  if (loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md" align="center">
          <Text>Loading questions...</Text>
        </Stack>
      </Card>
    )
  }

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

  if (questions.length === 0 && !showResumeModal) {
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

  // If resume modal is open but questions haven't loaded yet, just show the modal
  if (questions.length === 0 && showResumeModal) {
    return (
      <Modal
        opened={showResumeModal}
        onClose={handleDiscardProgress}
        title="Resume Previous Quiz?"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">You have a saved quiz progress from a previous session.</Text>
          {savedProgress && (
            <Stack gap="xs">
              <Text size="xs" c="dimmed">
                <Text span fw={600}>
                  Category:
                </Text>{' '}
                {savedProgress.category || savedProgress.sheet}
              </Text>
              <Text size="xs" c="dimmed">
                <Text span fw={600}>
                  Questions answered:
                </Text>{' '}
                {Object.keys(savedProgress.answers).length}
              </Text>
              <Text size="xs" c="dimmed">
                <Text span fw={600}>
                  Last question:
                </Text>{' '}
                #{savedProgress.currentIndex + 1}
              </Text>
              <Text size="xs" c="dimmed">
                <Text span fw={600}>
                  Saved on:
                </Text>{' '}
                {new Date(savedProgress.timestamp).toLocaleString()}
              </Text>
            </Stack>
          )}
          <Group justify="space-between" mt="md">
            <Button variant="default" onClick={handleDiscardProgress}>
              Start New Quiz
            </Button>
            <Button color="teal" onClick={handleResumeQuiz}>
              Resume Quiz
            </Button>
          </Group>
        </Stack>
      </Modal>
    )
  }

  if (questions.length === 0) {
    return null
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

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
      {/* Resume Progress Modal */}
      <Modal
        opened={showResumeModal}
        onClose={handleDiscardProgress}
        title="Resume Previous Quiz?"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            You have a saved quiz progress from a previous session. Would you like to continue where
            you left off?
          </Text>
          {savedProgress && (
            <Stack gap="xs">
              <Text size="xs" c="dimmed">
                <Text span fw={600}>
                  Category:
                </Text>{' '}
                {savedProgress.category || savedProgress.sheet}
              </Text>
              <Text size="xs" c="dimmed">
                <Text span fw={600}>
                  Questions answered:
                </Text>{' '}
                {Object.keys(savedProgress.answers).length}
              </Text>
              <Text size="xs" c="dimmed">
                <Text span fw={600}>
                  Last question:
                </Text>{' '}
                #{savedProgress.currentIndex + 1}
              </Text>
              <Text size="xs" c="dimmed">
                <Text span fw={600}>
                  Saved on:
                </Text>{' '}
                {new Date(savedProgress.timestamp).toLocaleString()}
              </Text>
            </Stack>
          )}
          <Group justify="space-between" mt="md">
            <Button variant="default" onClick={handleDiscardProgress}>
              Start New Quiz
            </Button>
            <Button color="teal" onClick={handleResumeQuiz}>
              Resume Quiz
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal
        opened={showExitModal}
        onClose={handleCancelExit}
        title="Exit Quiz?"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to exit the quiz? Your progress will be saved so you can continue
            later.
          </Text>
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              <Text span fw={600}>
                Questions answered:
              </Text>{' '}
              {answeredCount} / {questions.length}
            </Text>
            <Text size="xs" c="dimmed">
              <Text span fw={600}>
                Current question:
              </Text>{' '}
              #{currentIndex + 1}
            </Text>
          </Stack>
          <Progress
            value={(answeredCount / questions.length) * 100}
            color="teal"
            size="sm"
            mt="xs"
          />
          <Group justify="space-between" mt="md">
            <Button variant="default" onClick={handleConfirmExitWithoutSave} color="red">
              Exit Without Saving
            </Button>
            <Button color="teal" onClick={handleConfirmExit}>
              Save & Exit
            </Button>
          </Group>
          <Button variant="subtle" onClick={handleCancelExit} fullWidth mt="xs">
            Cancel — Continue Quiz
          </Button>
        </Stack>
      </Modal>

      <Group justify="space-between" align="center">
        <Badge color="teal" variant="light" size="sm">
          {currentQuestion.category}
        </Badge>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {currentIndex + 1} / {questions.length}
          </Text>
          <Button variant="subtle" color="red" size="xs" onClick={handleExitClick}>
            Exit Quiz
          </Button>
        </Group>
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
                        <Group justify="space-between" wrap="nowrap" align="flex-start">
                          <Text
                            fw={selected ? 600 : 400}
                            size="sm"
                            style={{ whiteSpace: 'pre-wrap' }}
                          >
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
                          <Text span style={{ whiteSpace: 'pre-wrap' }}>
                            {currentQuestion.options[currentQuestion.answer]}
                          </Text>
                        </Text>
                      {currentQuestion.explanation && (
                        <Text size="xs" c="dimmed" mt={4}>
                          <Text span fw={600} c="gray.4">
                            Explanation:
                          </Text>{' '}
                          <Text span style={{ whiteSpace: 'pre-wrap' }}>
                            {currentQuestion.explanation}
                          </Text>
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
