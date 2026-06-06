import { useState, useCallback } from 'react'
import { fetchAllScores } from '../../../lib/supabaseClient'
import { Score } from '../../../types'

export function useExport() {
  const [exportScores, setExportScores] = useState<Score[]>([])
  const [exportLoading, setExportLoading] = useState(false)

  const loadExportScores = useCallback(async () => {
    setExportLoading(true)
    try {
      const data = await fetchAllScores()
      setExportScores(data)
    } catch (err) {
      console.error(err)
    } finally {
      setExportLoading(false)
    }
  }, [])

  return { exportScores, exportLoading, loadExportScores }
}
