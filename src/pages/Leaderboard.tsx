import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@mantine/core'
import { Trophy, ArrowLeft, Medal, Crown, Star, Award } from 'lucide-react'
import { Score } from '../types'
import { fetchLeaderboard, fetchScoresByUser } from '../lib/supabaseClient'
import { useQuiz } from '../context/QuizContext'

function getDegree(percentage: number): { label: string; color: string; icon: React.ReactNode } {
  if (percentage === 100) return { label: 'Legend', color: 'yellow', icon: <Crown size={16} /> }
  if (percentage >= 95) return { label: 'Grandmaster', color: 'orange', icon: <Crown size={16} /> }
  if (percentage >= 90) return { label: 'Master', color: 'teal', icon: <Trophy size={16} /> }
  if (percentage >= 85) return { label: 'Expert', color: 'cyan', icon: <Medal size={16} /> }
  if (percentage >= 80) return { label: 'Advanced', color: 'blue', icon: <Award size={16} /> }
  if (percentage >= 70) return { label: 'Proficient', color: 'indigo', icon: <Star size={16} /> }
  if (percentage >= 60) return { label: 'Competent', color: 'violet', icon: <Star size={16} /> }
  if (percentage >= 50) return { label: 'Beginner', color: 'grape', icon: <Award size={16} /> }
  return { label: 'Novice', color: 'gray', icon: <Award size={16} /> }
}

function getRankColor(rank: number): string {
  if (rank === 1) return '#FFD700'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  return 'var(--mantine-color-dimmed)'
}

export function Leaderboard() {
  const navigate = useNavigate()
  const { userName } = useQuiz()
  const [scores, setScores] = useState<Score[]>([])
  const [myScores, setMyScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterSheet, setFilterSheet] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [all, mine] = await Promise.all([
          fetchLeaderboard(200),
          fetchScoresByUser(userName, 50),
        ])
        setScores(all)
        setMyScores(mine)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userName])

  const sheets = useMemo(
    () => [...new Set(scores.map((s) => s.sheet).filter((s): s is string => !!s))],
    [scores]
  )

  const filteredScores = useMemo(() => {
    if (!filterSheet) return scores
    return scores.filter((s) => s.sheet === filterSheet)
  }, [scores, filterSheet])

  const topThree = filteredScores.slice(0, 3)

  if (loading) {
    return (
      <Stack align="center" gap="md" pt="xl">
        <Loader size="md" color="teal" />
        <Text c="dimmed" size="sm">Loading leaderboard...</Text>
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

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Button variant="default" size="sm" leftSection={<ArrowLeft size={16} />} onClick={() => navigate('/home')}>
          Back
        </Button>
        <Text size="2rem" fw={800} ta="center">
          Leaderboard
        </Text>
        <div style={{ width: 80 }} />
      </Group>

      <Tabs defaultValue="global" color="teal">
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
                placeholder="Filter by sheet"
                data={sheets}
                value={filterSheet}
                onChange={setFilterSheet}
                clearable
                style={{ minWidth: 200 }}
              />
            </Group>

            {topThree.length > 0 && (
              <Group justify="center" gap="md" pt="sm">
                {topThree.map((s, idx) => {
                  const degree = getDegree(s.percentage)
                  const rank = idx + 1
                  return (
                    <Card
                      key={s.id}
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      w={220}
                      style={{
                        borderColor: getRankColor(rank),
                        transform: rank === 1 ? 'translateY(-8px) scale(1.05)' : undefined,
                        transition: 'all 200ms ease',
                      }}
                    >
                      <Stack align="center" gap="sm">
                        <Avatar
                          size="lg"
                          radius="xl"
                          styles={{
                            root: {
                              background: rank === 1
                                ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                                : rank === 2
                                ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)'
                                : 'linear-gradient(135deg, #CD7F32, #B87333)',
                            },
                          }}
                        >
                          <Text fw={800} c="white" size="xl">
                            {rank}
                          </Text>
                        </Avatar>
                        <Text fw={700} size="md" ta="center" lineClamp={1}>
                          {s.user_name}
                        </Text>
                        <Badge color={degree.color} variant="light" leftSection={degree.icon}>
                          {degree.label}
                        </Badge>
                        <Text fw={800} size="xl" c="teal">
                          {s.percentage}%
                        </Text>
                        <Text size="xs" c="dimmed">
                          {s.score} / {s.total_questions} correct
                        </Text>
                        {s.sheet && (
                          <Badge size="xs" variant="dot">
                            Sheet {s.sheet}
                          </Badge>
                        )}
                      </Stack>
                    </Card>
                  )
                })}
              </Group>
            )}

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
                      <Table.Th>Sheet</Table.Th>
                      <Table.Th>Date</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredScores.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={7}>
                          <Text c="dimmed" ta="center" py="md">
                            No scores yet. Be the first!
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredScores.map((s, idx) => {
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
                              <Text fw={s.user_name === userName ? 700 : 400}>
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
                              <Text fw={700} c={s.percentage >= 80 ? 'teal' : s.percentage >= 50 ? 'yellow' : 'red'}>
                                {s.percentage}%
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">{s.sheet || '-'}</Text>
                            </Table.Td>
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
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="mine" pt="md">
          <Card shadow="sm" padding={0} radius="md" withBorder>
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Degree</Table.Th>
                    <Table.Th>Score</Table.Th>
                    <Table.Th>Accuracy</Table.Th>
                    <Table.Th>Sheet</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {myScores.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text c="dimmed" ta="center" py="md">
                          You haven't taken any quizzes yet.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    myScores.map((s) => {
                      const degree = getDegree(s.percentage)
                      return (
                        <Table.Tr key={s.id}>
                          <Table.Td>
                            <Text size="sm">
                              {new Date(s.created_at).toLocaleDateString()}
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
                            <Text fw={700} c={s.percentage >= 80 ? 'teal' : s.percentage >= 50 ? 'yellow' : 'red'}>
                              {s.percentage}%
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{s.sheet || '-'}</Text>
                          </Table.Td>
                        </Table.Tr>
                      )
                    })
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}
