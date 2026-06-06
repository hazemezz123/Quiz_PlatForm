import { memo } from 'react'
import { Card, Stack, Box, Text } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'

interface DashboardStatCardProps {
  icon: LucideIcon
  label: string
  value: string
  color: string
}

export const DashboardStatCard = memo(function DashboardStatCard({
  icon: Icon,
  label,
  value,
  color,
}: DashboardStatCardProps) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder ta="center">
      <Stack gap="xs" align="center">
        <Box c={`${color}.4`}>
          <Icon size={24} strokeWidth={1.5} />
        </Box>
        <Text fw={800} size="xl" c={color}>
          {value}
        </Text>
        <Text c="dimmed" size="xs">
          {label}
        </Text>
      </Stack>
    </Card>
  )
})
