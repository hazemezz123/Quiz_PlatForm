import { Container, Text, Group, Box } from '@mantine/core'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
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
            <Text fw={700} size="lg" c="teal.4">
              Quiz Platform
            </Text>
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
          <Text size="xs" c="dimmed" ta="center">
            Quiz Platform
          </Text>
        </Container>
      </Box>
    </Box>
  )
}
