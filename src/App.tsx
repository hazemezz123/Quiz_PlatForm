import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import { Layout } from './components/Layout'
import { PageTransition } from './components/PageTransition'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Entry } from './pages/Entry'
import { Home } from './pages/Home'
import { Loader, Text, Stack } from '@mantine/core'

// Lazy-loaded pages — reduces initial bundle size
const Quiz = lazy(() => import('./pages/Quiz').then((m) => ({ default: m.Quiz })))
const Result = lazy(() => import('./pages/Result').then((m) => ({ default: m.Result })))
const Leaderboard = lazy(() =>
  import('./pages/Leaderboard').then((m) => ({ default: m.Leaderboard })),
)
const Admin = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.Admin })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))
const SubjectPage = lazy(() =>
  import('./pages/SubjectPage').then((m) => ({ default: m.SubjectPage })),
)
const DefinitionQuiz = lazy(() =>
  import('./pages/DefinitionQuiz').then((m) => ({ default: m.DefinitionQuiz })),
)

function PageLoader() {
  return (
    <Stack align="center" gap="md" pt="xl">
      <Loader size="md" color="teal" />
      <Text c="dimmed" size="sm">
        Loading...
      </Text>
    </Stack>
  )
}

function App() {
  return (
    <QuizProvider>
      <Layout>
        <ErrorBoundary>
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Entry />} />
                <Route path="/subject/:category" element={<SubjectPage />} />
                <Route path="/def-quiz/:category" element={<DefinitionQuiz />} />
                <Route path="/quiz/:category" element={<Quiz />} />
                <Route path="/sheet/:sheet" element={<Quiz />} />
                <Route path="/result" element={<Result />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </ErrorBoundary>
      </Layout>
    </QuizProvider>
  )
}

export default App
