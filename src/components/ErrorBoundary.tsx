import { Component, ReactNode, ErrorInfo } from 'react'
import { Card, Button, Text, Stack } from '@mantine/core'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Stack align="center" gap="xl" pt="xl">
          <AlertTriangle size={48} color="var(--mantine-color-red-6)" />
          <Text size="lg" fw={600} ta="center">
            Something went wrong
          </Text>
          <Text c="dimmed" ta="center" size="sm" maw={400}>
            An unexpected error occurred. Please try refreshing the page.
          </Text>
          <Card shadow="sm" padding="lg" radius="md" withBorder maw={300} w="100%">
            <Stack gap="md" align="center">
              <Button fullWidth color="teal" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button fullWidth variant="default" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </Stack>
          </Card>
        </Stack>
      )
    }

    return this.props.children
  }
}
