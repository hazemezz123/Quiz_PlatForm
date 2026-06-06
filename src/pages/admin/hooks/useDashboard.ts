import { useState, useCallback } from 'react'
import { fetchDashboardStats, DashboardStats } from '../../../lib/supabaseClient'

export function useDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

  const loadDashboardStats = useCallback(async () => {
    try {
      const data = await fetchDashboardStats()
      setDashboardStats(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  return { dashboardStats, loadDashboardStats }
}
