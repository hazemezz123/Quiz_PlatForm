import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Card,
  Button,
  Text,
  Stack,
  Table,
  Badge,
  Group,
  Loader,
  ScrollArea,
  Tabs,
  Select,
  Avatar,
  Box,
  Divider,
} from '@mantine/core'
import { Trophy, Star, ArrowLeft, Crown, Medal, Award } from 'lucide-react'
import { Score, Sheet } from '../types'
import { fetchLeaderboard, fetchScoresByUser, fetchSheets } from '../lib/supabaseClient'
import { useQuiz } from '../context/QuizContext'
import { getDegree, getRankColor } from '../lib/degrees'
import { getCategoryConfig } from '../lib/categories'
import { springTransition, usePrefersReducedMotion } from '../lib/animations'

/* ─── Podium Card for Top 3 ─── */
function PodiumCard({
  score,
  rank,
  userName,
  isCategory,
}: {
  score: Score
  rank: number
  userName: string
  isCategory: boolean
}) {
  const degree = getDegree(score.percentage)
  const reducedMotion = usePrefersReducedMotion()

  const podiumColors: Record<
    number,
    { bg: string; border: string; glow: string; avatarBg: string; label: string }
  > = {
    1: {
      bg: 'linear-gradient(160deg, rgba(255,215,0,0.12) 0%, rgba(255,165,0,0.06) 100%)',
      border: '#FFD700',
      glow: '0 0 24px rgba(255,215,0,0.35), 0 4px 16px rgba(255,165,0,0.2)',
      avatarBg: 'linear-gradient(135deg, #FFD700, #FFA500)',
      label: '1st',
    },
    2: {
      bg: 'linear-gradient(160deg, rgba(192,192,192,0.12) 0%, rgba(160,160,160,0.06) 100%)',
      border: '#C0C0C0',
      glow: '0 0 20px rgba(192,192,192,0.3), 0 4px 12px rgba(160,160,160,0.15)',
      avatarBg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)',
      label: '2nd',
    },
    3: {
      bg: 'linear-gradient(160deg, rgba(205,127,50,0.12) 0%, rgba(184,115,51,0.06) 100%)',
      border: '#CD7F32',
      glow: '0 0 18px rgba(205,127,50,0.3), 0 4px 12px rgba(184,115,51,0.15)',
      avatarBg: 'linear-gradient(135deg, #CD7F32, #B87333)',
      label: '3rd',
    },
  }

  const style = podiumColors[rank] || podiumColors[3]
  const isCurrentUser = score.user_name === userName

  const rankIcon =
    rank === 1 ? (
      <Crown size={20} color="#FFD700" />
    ) : rank === 2 ? (
      <Medal size={20} color="#C0C0C0" />
    ) : (
      <Award size={20} color="#CD7F32" />
    )

  // Podium heights: 1st = tallest, 2nd = medium, 3rd = shortest
  const podiumHeight = rank === 1 ? 28 : rank === 2 ? 20 : 14

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 30, scale: 0.9 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springTransition, delay: (3 - rank) * 0.15 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        w={220}
        style={{
          background: style.bg,
          borderColor: style.border,
          boxShadow: style.glow,
          borderWidth: 2,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Crown badge for #1 */}
        {rank === 1 && (
          <Box
            style={{
              position: 'absolute',
              top: -18,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
            }}
          >
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, scale: 0 }}
              animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ ...springTransition, delay: 0.5 }}
            >
              <Crown size={28} color="#FFD700" fill="#FFD700" />
            </motion.div>
          </Box>
        )}

        <Stack align="center" gap="sm" mt={rank === 1 ? 8 : 0}>
          <Avatar
            size="lg"
            radius="xl"
            styles={{
              root: {
                background: style.avatarBg,
                boxShadow: `0 0 12px ${style.border}40`,
              },
            }}
          >
            <Text fw={800} c="white" size="xl">
              {rank}
            </Text>
          </Avatar>

          <Group gap={4}>
            {rankIcon}
            <Text fw={800} size="sm" c={style.border}>
              {style.label}
            </Text>
          </Group>

          <Text component="div" fw={700} size="md" ta="center" lineClamp={1}>
            {score.user_name}
            {isCurrentUser && (
              <Badge ml="xs" size="xs" color="teal" variant="filled">
                You
              </Badge>
            )}
          </Text>

          <Badge color={degree.color} variant="light" leftSection={degree.icon} size="sm">
            {degree.label}
          </Badge>

          <Text fw={800} size="xl" c="teal">
            {score.percentage}%
          </Text>

          <Text size="xs" c="dimmed">
            {score.score} / {score.total_questions} correct
          </Text>

          {isCategory && score.category && (
            <Badge
              size="xs"
              variant="dot"
              color={getCategoryConfig(score.category)?.color ?? 'blue'}
            >
              {score.category}
            </Badge>
          )}
          {!isCategory && score.sheet && (
            <Badge size="xs" variant="dot" color="grape">
              {score.sheet}
            </Badge>
          )}
        </Stack>
      </Card>

      {/* Podium step below the card */}
      <Box
        mt={4}
        w={180}
        h={podiumHeight}
        style={{
          background: `linear-gradient(180deg, ${style.border}40, ${style.border}15)`,
          borderRadius: '0 0 12px 12px',
          borderTop: `3px solid ${style.border}`,
        }}
      />
    </motion.div>
  )
}

/* ─── Podium Section (Top 3 layout: 2nd | 1st | 3rd) ─── */
function PodiumSection({
  topThree,
  userName,
  isCategory,
}: {
  topThree: Score[]
  userName: string
  isCategory: boolean
}) {
  if (topThree.length === 0) return null

  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumOrder: Score[] = []
  if (topThree.length >= 2) podiumOrder.push(topThree[1]) // 2nd place (left)
  if (topThree.length >= 1) podiumOrder.push(topThree[0]) // 1st place (center)
  if (topThree.length >= 3) podiumOrder.push(topThree[2]) // 3rd place (right)
  // If only 1 or 2 entries, just show them in order
  if (topThree.length === 1) podiumOrder.splice(0, 1, topThree[0])
  if (topThree.length === 2) {
    podiumOrder.splice(0, 2, topThree[1], topThree[0])
  }

  const rankMap = [2, 1, 3] // ranks corresponding to podium positions

  return (
    <Group justify="center" gap="md" pt="sm" wrap="nowrap" align="flex-end">
      {podiumOrder.map((s, idx) => (
        <PodiumCard
          key={s.id}
          score={s}
          rank={rankMap[idx] || idx + 1}
          userName={userName}
          isCategory={isCategory}
        />
      ))}
    </Group>
  )
}

/* ─── Leaderboard Table ─── */
function LeaderboardTable({
  scores,
  userName,
  isCategory,
}: {
  scores: Score[]
  userName: string
  isCategory: boolean
}) {
  return (
    <Card shadow="sm" padding={0} radius="md" withBorder>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 60 }}>Rank</Table.Th>
              <Table.Th>Player</Table.Th>
              <Table.Th>Degree</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Accuracy</Table.Th>
              {isCategory ? <Table.Th>Category</Table.Th> : <Table.Th>Sheet</Table.Th>}
              <Table.Th>Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {scores.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text c="dimmed" ta="center" py="md">
                    No scores yet. Be the first!
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              scores.map((s, idx) => {
                const degree = getDegree(s.percentage)
                const rank = idx + 1
                return (
                  <Table.Tr key={s.id}>
                    <Table.Td>
                      <Text fw={700} c={getRankColor(rank)}>
                        #{rank}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text component="div" fw={s.user_name === userName ? 700 : 400}>
                        {s.user_name}
                        {s.user_name === userName && (
                          <Badge ml="xs" size="xs" color="teal" variant="filled">
                            You
                          </Badge>
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={degree.color} variant="light" leftSection={degree.icon}>
                        {degree.label}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600}>
                        {s.score} / {s.total_questions}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        fw={700}
                        c={s.percentage >= 80 ? 'teal' : s.percentage >= 50 ? 'yellow' : 'red'}
                      >
                        {s.percentage}%
                      </Text>
                    </Table.Td>
                    {isCategory ? (
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="dot"
                          color={getCategoryConfig(s.category ?? '')?.color ?? 'blue'}
                        >
                          {s.category || '-'}
                        </Badge>
                      </Table.Td>
                    ) : (
                      <Table.Td>
                        <Badge size="sm" variant="dot" color="grape">
                          {s.sheet || '-'}
                        </Badge>
                      </Table.Td>
                    )}
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {new Date(s.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )
              })
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  )
}

/* ─── My Scores Table ─── */
function MyScoresTable({ scores, isCategory }: { scores: Score[]; isCategory: boolean }) {
  return (
    <Card shadow="sm" padding={0} radius="md" withBorder>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Degree</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Accuracy</Table.Th>
              {isCategory ? <Table.Th>Category</Table.Th> : <Table.Th>Sheet</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {scores.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center" py="md">
                    You haven't taken any {isCategory ? 'category' : 'sheet'} quizzes yet.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              scores.map((s) => {
                const degree = getDegree(s.percentage)
                return (
                  <Table.Tr key={s.id}>
                    <Table.Td>
                      <Text size="sm">{new Date(s.created_at).toLocaleDateString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={degree.color} variant="light" leftSection={degree.icon}>
                        {degree.label}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600}>
                        {s.score} / {s.total_questions}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        fw={700}
                        c={s.percentage >= 80 ? 'teal' : s.percentage >= 50 ? 'yellow' : 'red'}
                      >
                        {s.percentage}%
                      </Text>
                    </Table.Td>
                    {isCategory ? (
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="dot"
                          color={getCategoryConfig(s.category ?? '')?.color ?? 'blue'}
                        >
                          {s.category || '-'}
                        </Badge>
                      </Table.Td>
                    ) : (
                      <Table.Td>
                        <Badge size="sm" variant="dot" color="grape">
                          {s.sheet || '-'}
                        </Badge>
                      </Table.Td>
                    )}
                  </Table.Tr>
                )
              })
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  )
}

/* ─── Main Leaderboard Page ─── */
export function Leaderboard() {
  const navigate = useNavigate()
  const { userName } = useQuiz()
  const [scores, setScores] = useState<Score[]>([])
  const [myScores, setMyScores] = useState<Score[]>([])
  const [sheetData, setSheetData] = useState<Sheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterSheet, setFilterSheet] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [all, mine, shs] = await Promise.all([
          fetchLeaderboard(200),
          fetchScoresByUser(userName, 50),
          fetchSheets(),
        ])
        setScores(all)
        setMyScores(mine)
        setSheetData(shs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userName])

  // ─── Separate scores by quiz type ───
  const sheetScores = useMemo(() => scores.filter((s) => s.sheet !== null), [scores])

  const mySheetScores = useMemo(() => myScores.filter((s) => s.sheet !== null), [myScores])

  // ─── Filter options ───
  const sheets = useMemo(() => sheetData.map((s) => s.name), [sheetData])

  // ─── Get category for a sheet name ───
  const getSheetCategory = useMemo(
    () => (sheetName: string) => sheetData.find((s) => s.name === sheetName)?.category ?? null,
    [sheetData],
  )

  // ─── Filtered scores ───
  const filteredSheetScores = useMemo(() => {
    let result = sheetScores
    if (filterSheet) {
      result = result.filter((s) => s.sheet === filterSheet)
    }
    if (filterCategory) {
      result = result.filter((s) => {
        const cat = s.category ?? getSheetCategory(s.sheet ?? '')
        return cat === filterCategory
      })
    }
    return result
  }, [sheetScores, filterSheet, filterCategory, getSheetCategory])

  const sheetTopThree = filteredSheetScores.slice(0, 3)

  if (loading) {
    return (
      <Stack align="center" gap="md" pt="xl">
        <Loader size="md" color="teal" />
        <Text c="dimmed" size="sm">
          Loading leaderboard...
        </Text>
      </Stack>
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

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Button
          variant="default"
          size="sm"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate('/')}
        >
          Back
        </Button>
        <Group justify="center" gap="xs">
          <Trophy size={28} color="var(--mantine-color-teal-6)" />
          <Text size="2rem" fw={800} ta="center">
            Leaderboard
          </Text>
        </Group>
        <div style={{ width: 80 }} />
      </Group>

      <Tabs defaultValue="global" color="grape">
        <Tabs.List justify="center">
          <Tabs.Tab value="global" leftSection={<Trophy size={16} />}>
            Global Rankings
          </Tabs.Tab>
          <Tabs.Tab value="mine" leftSection={<Star size={16} />}>
            My Scores
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="global" pt="md">
          <Stack gap="md">
            <Group justify="center">
              <Select
                placeholder="Filter by category"
                data={Array.from(new Set(sheetData.map((s) => s.category))).map((cat) => ({
                  value: cat,
                  label: cat,
                }))}
                value={filterCategory}
                onChange={setFilterCategory}
                clearable
                style={{ minWidth: 200 }}
              />
              <Select
                placeholder="Filter by sheet"
                data={sheets}
                value={filterSheet}
                onChange={setFilterSheet}
                clearable
                style={{ minWidth: 200 }}
              />
            </Group>

            {sheetTopThree.length > 0 && (
              <Box
                py="lg"
                px="md"
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                }}
              >
                <Group justify="center" gap="xs" mb="md">
                  <Medal size={20} color="#FFD700" />
                  <Text fw={700} size="lg" ta="center">
                    Top Performers
                  </Text>
                </Group>
                <PodiumSection topThree={sheetTopThree} userName={userName} isCategory={false} />
              </Box>
            )}

            <Divider label="Full Rankings" labelPosition="center" />

            <LeaderboardTable scores={filteredSheetScores} userName={userName} isCategory={false} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="mine" pt="md">
          <MyScoresTable scores={mySheetScores} isCategory={false} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}
