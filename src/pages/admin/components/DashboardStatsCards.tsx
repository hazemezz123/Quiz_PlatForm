import { memo } from 'react'
import { SimpleGrid } from '@mantine/core'
import { DashboardStatCard } from './DashboardStatCard'
import { STAT_CARDS } from '../constants'
import type { DashboardStats } from '../../../lib/supabaseClient'

interface DashboardStatsCardsProps {
  stats: DashboardStats
}

export const DashboardStatsCards = memo(function DashboardStatsCards({
  stats,
}: DashboardStatsCardsProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
      {STAT_CARDS.map((card) => (
        <DashboardStatCard
          key={card.label}
          icon={card.icon}
          label={card.label}
          value={card.getValue(stats)}
          color={card.color}
        />
      ))}
    </SimpleGrid>
  )
})
