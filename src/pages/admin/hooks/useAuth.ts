import { useState, useEffect, useCallback } from 'react'
import { supabase, signInAdmin, signOutAdmin, getAdminSession } from '../../../lib/supabaseClient'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    getAdminSession()
      .then((session) => {
        setIsAuthenticated(session !== null)
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
      .finally(() => {
        setAuthLoading(false)
      })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(session !== null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = useCallback(async () => {
    setAuthLoading(true)
    try {
      await signInAdmin()
      setIsAuthenticated(true)
      return undefined
    } catch (err) {
      return err instanceof Error ? err.message : 'Login failed — check your credentials'
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await signOutAdmin()
    } catch {
      // Even if signOut fails on the server, clear local state
    }
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, authLoading, handleLogin, handleLogout }
}
