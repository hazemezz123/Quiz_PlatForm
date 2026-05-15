import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, TextInput, Button, Text, Stack, Box } from '@mantine/core'
import { useQuiz } from '../context/QuizContext'
import { registerUser } from '../lib/supabaseClient'

const MIN_NAME_LENGTH = 2
const MAX_NAME_LENGTH = 30
const NAME_REGEX = /^[a-zA-Z0-9\s_-]+$/

function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Name is required'
  if (trimmed.length < MIN_NAME_LENGTH) return `Name must be at least ${MIN_NAME_LENGTH} characters`
  if (trimmed.length > MAX_NAME_LENGTH) return `Name must be no more than ${MAX_NAME_LENGTH} characters`
  if (!NAME_REGEX.test(trimmed)) return 'Name can only contain letters, numbers, spaces, hyphens, and underscores'
  return null
}

export function Entry() {
  const navigate = useNavigate()
  const { userName, setUserName } = useQuiz()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userName) {
      navigate('/')
    }
  }, [userName, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateName(name)
    if (validationError) {
      setError(validationError)
      return
    }
    const trimmed = name.trim()
    setUserName(trimmed)
    registerUser(trimmed).catch((err) =>
      console.error('Failed to register user:', err)
    )
    navigate('/')
  }

  return (
    <Box style={{ maxWidth: 420, margin: '0 auto', paddingTop: '8vh' }}>
      <Card shadow="md" padding="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Stack gap="xs" align="center">
            <img
              src="/logo.png"
              alt="Indentify"
              style={{ width: 80, height: 80, objectFit: 'contain' }}
            />
            <Text c="dimmed" ta="center" size="sm">
              Test your knowledge. Track your progress.
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Your Name"
                placeholder="Enter your name"
                value={name}
                onChange={handleChange}
                error={error}
                maxLength={MAX_NAME_LENGTH}
                size="md"
                styles={{
                  label: { marginBottom: '0.375rem', fontWeight: 500 },
                }}
              />
              <Text size="xs" c="dimmed" ta="right">
                {name.length}/{MAX_NAME_LENGTH}
              </Text>
              <Button
                type="submit"
                fullWidth
                size="md"
                color="teal"
                disabled={!name.trim()}
              >
                Get Started
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Box>
  )
}
