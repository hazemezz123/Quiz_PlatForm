import {
  ClipboardList,
  Users,
  FileQuestion,
  FileText,
  Target,
  Award,
  type LucideIcon,
} from 'lucide-react'

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@quiz.local'

export interface StatCardConfig {
  label: string
  getValue: (stats: {
    totalQuizzes: number
    totalUsers: number
    totalQuestions: number
    totalSheets: number
    averagePercentage: number
    bestPercentage: number
  }) => string
  icon: LucideIcon
  color: string
}

export const STAT_CARDS: StatCardConfig[] = [
  {
    label: 'Quizzes Taken',
    getValue: (s) => String(s.totalQuizzes),
    icon: ClipboardList,
    color: 'teal',
  },
  {
    label: 'Total Users',
    getValue: (s) => String(s.totalUsers),
    icon: Users,
    color: 'blue',
  },
  {
    label: 'Total Questions',
    getValue: (s) => String(s.totalQuestions),
    icon: FileQuestion,
    color: 'violet',
  },
  {
    label: 'Total Sheets',
    getValue: (s) => String(s.totalSheets),
    icon: FileText,
    color: 'grape',
  },
  {
    label: 'Avg Score',
    getValue: (s) => `${s.averagePercentage}%`,
    icon: Target,
    color: 'orange',
  },
  {
    label: 'Best Score',
    getValue: (s) => `${s.bestPercentage}%`,
    icon: Award,
    color: 'yellow',
  },
]
