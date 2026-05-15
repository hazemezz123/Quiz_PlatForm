import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, TextInput, Button, Text, Stack, Box } from '@mantine/core'
import { useQuiz } from '../context/QuizContext'
import { registerUser } from '../lib/supabaseClient'

export function Entry() {
  const navigate = useNavigate()
  const { userName, setUserName } = useQuiz()
  const [name, setName] = useState('')

  useEffect(() => {
    if (userName) {
      navigate('/')
    }
  }, [userName, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setUserName(name.trim())
      registerUser(name.trim()).catch((err) =>
        console.error('Failed to register user:', err)
      )
      navigate('/')
    }
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
                onChange={(e) => setName(e.target.value)}
                required
                size="md"
                styles={{
                  label: { marginBottom: '0.375rem', fontWeight: 500 },
                }}
              />
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
