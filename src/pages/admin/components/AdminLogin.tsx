import { useState, useCallback } from 'react'
import { Stack, Card, Text, TextInput, PasswordInput, Button } from '@mantine/core'
import { ADMIN_EMAIL } from '../constants'

interface AdminLoginProps {
  authLoading: boolean
  onLogin: () => Promise<string | undefined>
}

export function AdminLogin({ authLoading, onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleLogin = useCallback(async () => {
    const error = await onLogin()
    if (error) {
      setPasswordError(error)
    } else {
      setPasswordError('')
    }
  }, [onLogin])

  return (
    <Stack align="center" gap="lg" pt="xl">
      <Text fw={700} size="xl">
        Admin Login
      </Text>
      <Card shadow="sm" padding="xl" radius="md" withBorder maw={400} w="100%">
        <Stack gap="md">
          <TextInput
            label="Email"
            value={ADMIN_EMAIL}
            disabled
            description="Admin account is pre-configured"
          />
          <PasswordInput
            label="Password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={passwordError}
            onKeyDown={(e) => e.key === 'Enter' && !authLoading && handleLogin()}
          />
          <Button onClick={handleLogin} color="teal" fullWidth loading={authLoading}>
            Login
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}
