import { Container, Text, Group, Box, Stack, Button } from '@mantine/core'
import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutList, Trophy, Heart } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        style={{
          borderBottom: '1px solid var(--mantine-color-dark-6)',
          background: 'var(--mantine-color-dark-8)',
        }}
      >
        <Container size="md" py="md">
          <Group justify="space-between">
            <img
              src="/logo.png"
              alt="Indentify"
              style={{
                width: 120,
                objectFit: 'contain',
                margin: -10,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            />
            <Group gap="xs">
              <Button
                variant={location.pathname === '/' ? 'light' : 'subtle'}
                color="teal"
                size="sm"
                leftSection={<LayoutList size={16} />}
                onClick={() => navigate('/')}
              >
                Quizzes
              </Button>
              <Button
                variant={location.pathname.startsWith('/leaderboard') ? 'light' : 'subtle'}
                color="yellow"
                size="sm"
                leftSection={<Trophy size={16} />}
                onClick={() => navigate('/leaderboard')}
              >
                Leaderboard
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      <Box style={{ flex: 1 }}>
        <Container size="md" py="xl">
          {children}
        </Container>
      </Box>

      <Box
        style={{
          borderTop: '1px solid var(--mantine-color-dark-6)',
          background: 'var(--mantine-color-dark-8)',
        }}
      >
        <Container size="md" py="sm">
          <Stack align="center" gap="xs">
            <Text size="xs" c="dimmed">
              &copy; {new Date().getFullYear()} Hazem Ezz. All rights reserved.
            </Text>
            <Group gap="xs" align="center">
              <Heart size={12} color="#ff4d4d" fill="#ff4d4d" strokeWidth={2} />
              <Text size="xs" c="dimmed">
                Built by Hazem with Love
              </Text>
            </Group>
            <Group gap="xs">
              <a
                href="https://github.com/hazemezz123"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--mantine-color-dimmed)',
                  display: 'flex',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/hazem-ezz-424498285/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--mantine-color-dimmed)',
                  display: 'flex',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
