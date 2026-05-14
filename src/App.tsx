import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import { Layout } from './components/Layout'
import { PageTransition } from './components/PageTransition'
import { Entry } from './pages/Entry'
import { Home } from './pages/Home'
import { Quiz } from './pages/Quiz'
import { Result } from './pages/Result'
import { Leaderboard } from './pages/Leaderboard'
import { Admin } from './pages/Admin'

function App() {
  return (
    <QuizProvider>
      <Layout>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Entry />} />
            <Route path="/quiz/:category" element={<Quiz />} />
            <Route path="/sheet/:sheet" element={<Quiz />} />
            <Route path="/result" element={<Result />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </PageTransition>
      </Layout>
    </QuizProvider>
  )
}

export default App
