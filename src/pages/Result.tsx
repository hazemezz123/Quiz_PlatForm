import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button, Text, Stack, Progress, RingProgress, Box, Badge, Group } from '@mantine/core'
import { Trophy, Check, X } from 'lucide-react'
import { useQuiz } from '../context/QuizContext'
import { getDegree } from '../lib/degrees'
import { rtlDir } from '../lib/rtl'
import {
  scaleIn,
  fadeInUp,
  staggerContainer,
  springTransition,
  usePrefersReducedMotion,
} from '../lib/animations'

type FilterType = 'all' | 'correct' | 'wrong'

export function Result() {
  const navigate = useNavigate()
  const { userName, score, questions, answers, resetQuiz } = useQuiz()
  const [filter, setFilter] = useState<FilterType>('all')
  const reducedMotion = usePrefersReducedMotion()

  const handleRetake = () => {
    resetQuiz()
    navigate('/')
  }

  if (score === null) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text>No quiz results available.</Text>
          <Button onClick={() => navigate('/')} variant="light" color="teal">
            Go Home
          </Button>
        </Stack>
      </Card>
    )
  }

  const totalQuestions = questions.length
  const percentage = Math.round((score / totalQuestions) * 100)

  let ringColor: string = 'teal'
  if (percentage < 50) ringColor = 'red'
  else if (percentage < 80) ringColor = 'yellow'

  const degree = getDegree(percentage)

  return (
    <Stack gap="xl">
      <Text size="2rem" fw={800} ta="center">
        Quiz Complete
      </Text>

      <Card shadow="sm" padding="xl" radius="md" withBorder maw={480} mx="auto" w="100%">
        <Stack align="center" gap="xl">
          <motion.div variants={scaleIn} initial="hidden" animate="visible">
            <RingProgress
              size={160}
              thickness={12}
              roundCaps
              sections={[{ value: percentage, color: ringColor }]}
              label={
                <Text ta="center" fw={800} size="xl">
                  {percentage}%
                </Text>
              }
            />
          </motion.div>

          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.3 }}
          >
            <Stack gap="xs" align="center">
              <Text size="lg" fw={600}>
                Great job, {userName}!
              </Text>
              <Badge
                size="lg"
                color={degree.color}
                variant="filled"
                leftSection={degree.icon}
                styles={{ root: { textTransform: 'none' } }}
              >
                {degree.label}
              </Badge>
              <Text c="dimmed" size="sm">
                You answered {score} out of {totalQuestions} correctly
              </Text>
            </Stack>
          </motion.div>

          <Box w="100%">
            <Progress value={percentage} size="lg" radius="xl" color={ringColor} />
          </Box>

          <Stack gap="xs" w="100%">
            <Button onClick={handleRetake} fullWidth color="teal" size="md">
              Take Another Quiz
            </Button>
            <Button
              variant="light"
              color="yellow"
              fullWidth
              size="md"
              leftSection={<Trophy size={16} />}
              onClick={() => navigate('/leaderboard')}
            >
              View Leaderboard
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Stack gap="md">
        <Group justify="center" gap="xs">
          <Button
            variant={filter === 'all' ? 'filled' : 'outline'}
            color="teal"
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({questions.length})
          </Button>
          <Button
            variant={filter === 'correct' ? 'filled' : 'outline'}
            color="teal"
            size="sm"
            leftSection={<Check size={14} />}
            onClick={() => setFilter('correct')}
          >
            Correct ({questions.filter((q) => answers[q.id] === q.answer).length})
          </Button>
          <Button
            variant={filter === 'wrong' ? 'filled' : 'outline'}
            color="red"
            size="sm"
            leftSection={<X size={14} />}
            onClick={() => setFilter('wrong')}
          >
            Wrong ({questions.filter((q) => answers[q.id] !== q.answer).length})
          </Button>
        </Group>

        <Text fw={700} size="lg" ta="center">
          Review
        </Text>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--mantine-spacing-md)',
          }}
        >
          <AnimatePresence mode="popLayout">
            {questions
              .filter((q) => {
                if (filter === 'correct') return answers[q.id] === q.answer
                if (filter === 'wrong') return answers[q.id] !== q.answer
                return true
              })
              .map((q, index) => {
                const originalIndex = questions.indexOf(q)
                const userAnswer = answers[q.id]
                const isCorrect = userAnswer === q.answer
                const isSkipped = userAnswer === -1
                const textDir = rtlDir(q.question)

                const statusBadge = (
                  <Badge color={isCorrect ? 'teal' : 'red'} variant="light" size="sm">
                    {isCorrect
                      ? textDir === 'rtl'
                        ? 'صحيح'
                        : 'Correct'
                      : isSkipped
                        ? textDir === 'rtl'
                          ? 'خطأ (تخطي)'
                          : 'Wrong (Skipped)'
                        : textDir === 'rtl'
                          ? 'خطأ'
                          : 'Wrong'}
                  </Badge>
                )

                return (
                  <motion.div
                    key={q.id}
                    variants={fadeInUp}
                    layout={!reducedMotion}
                    initial={reducedMotion ? {} : { opacity: 0, y: 15 }}
                    animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                    transition={{ ...springTransition, delay: index * 0.04 }}
                  >
                    <Card shadow="sm" padding="lg" radius="md" withBorder dir={textDir}>
                      <Stack gap="sm">
                        <Group
                          justify={textDir === 'rtl' ? 'flex-start' : 'space-between'}
                          wrap="nowrap"
                          align="flex-start"
                        >
                          <Text
                            fw={600}
                            size="sm"
                            dir={textDir}
                            style={{
                              whiteSpace: 'pre-wrap',
                              textAlign: textDir === 'rtl' ? 'right' : 'left',
                            }}
                          >
                            {originalIndex + 1}. {q.question}
                          </Text>
                          {statusBadge}
                        </Group>

                        <Stack gap="xs">
                          {q.options.map((opt, optIdx) => {
                            const isUserPick = userAnswer === optIdx
                            const isCorrectOpt = optIdx === q.answer

                            let border = '1px solid var(--mantine-color-dark-6)'
                            let bg: string | undefined = undefined

                            if (isCorrectOpt) {
                              border = '1px solid var(--mantine-color-teal-6)'
                              bg = 'rgba(32, 201, 151, 0.08)'
                            } else if (isUserPick && !isCorrectOpt) {
                              border = '1px solid var(--mantine-color-red-6)'
                              bg = 'rgba(250, 82, 82, 0.08)'
                            }

                            return (
                              <motion.div
                                key={optIdx}
                                initial={false}
                                animate={{
                                  background: bg,
                                  borderColor: border.replace('1px solid ', ''),
                                }}
                                transition={springTransition}
                                style={{
                                  borderRadius: 'var(--mantine-radius-md)',
                                  border,
                                  background: bg,
                                  padding: 'var(--mantine-spacing-sm)',
                                }}
                              >
                                <Group
                                  justify={textDir === 'rtl' ? 'flex-start' : 'space-between'}
                                  wrap="nowrap"
                                  align="flex-start"
                                >
                                  <Text
                                    size="sm"
                                    fw={isUserPick ? 600 : 400}
                                    dir={textDir}
                                    style={{
                                      whiteSpace: 'pre-wrap',
                                      textAlign: textDir === 'rtl' ? 'right' : 'left',
                                    }}
                                  >
                                    {opt}
                                  </Text>
                                  {isCorrectOpt && (
                                    <Badge color="teal" size="xs" variant="filled">
                                      {textDir === 'rtl' ? 'صحيح' : 'Correct'}
                                    </Badge>
                                  )}
                                  {isUserPick && !isCorrectOpt && (
                                    <Badge color="red" size="xs" variant="filled">
                                      {textDir === 'rtl' ? 'إجابتك' : 'Your answer'}
                                    </Badge>
                                  )}
                                </Group>
                              </motion.div>
                            )
                          })}
                        </Stack>

                        <Box
                          p="sm"
                          dir={textDir}
                          style={{
                            borderRadius: 'var(--mantine-radius-md)',
                            background: 'var(--mantine-color-dark-7)',
                            border: '1px solid var(--mantine-color-dark-6)',
                          }}
                        >
                          <Text size="xs" c="dimmed">
                            <Text span fw={600} c="gray.4">
                              {textDir === 'rtl' ? 'التوضيح:' : 'Explanation:'}
                            </Text>{' '}
                            <Text
                              span
                              dir={textDir}
                              style={{
                                whiteSpace: 'pre-wrap',
                                textAlign: textDir === 'rtl' ? 'right' : 'left',
                              }}
                            >
                              {q.explanation}
                            </Text>
                          </Text>
                        </Box>
                      </Stack>
                    </Card>
                  </motion.div>
                )
              })}
          </AnimatePresence>
        </motion.div>

        {questions.filter((q) => {
          if (filter === 'correct') return answers[q.id] === q.answer
          if (filter === 'wrong') return answers[q.id] !== q.answer
          return true
        }).length === 0 && (
          <Card shadow="sm" padding="xl" radius="md" withBorder ta="center">
            <Text c="dimmed" size="sm">
              No {filter === 'correct' ? 'correct' : 'wrong'} answers to display
            </Text>
          </Card>
        )}
      </Stack>
    </Stack>
  )
}
