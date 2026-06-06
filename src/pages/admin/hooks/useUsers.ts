import { useState, useCallback } from 'react'
import { fetchUsersWithQuizCount, UserRecord } from '../../../lib/supabaseClient'

export function useUsers() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const data = await fetchUsersWithQuizCount()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  return { users, usersLoading, loadUsers }
}
