import { Trophy, Crown, Medal, Star, Award } from 'lucide-react'

export interface Degree {
  label: string
  color: string
  icon: React.ReactNode
}

export function getDegree(percentage: number): Degree {
  if (percentage === 100) return { label: 'Legend', color: 'yellow', icon: <Crown size={16} /> }
  if (percentage >= 95) return { label: 'Grandmaster', color: 'orange', icon: <Crown size={16} /> }
  if (percentage >= 90) return { label: 'Master', color: 'teal', icon: <Trophy size={16} /> }
  if (percentage >= 85) return { label: 'Expert', color: 'cyan', icon: <Medal size={16} /> }
  if (percentage >= 80) return { label: 'Advanced', color: 'blue', icon: <Award size={16} /> }
  if (percentage >= 70) return { label: 'Proficient', color: 'indigo', icon: <Star size={16} /> }
  if (percentage >= 60) return { label: 'Competent', color: 'violet', icon: <Star size={16} /> }
  if (percentage >= 50) return { label: 'Beginner', color: 'grape', icon: <Award size={16} /> }
  return { label: 'Novice', color: 'gray', icon: <Award size={16} /> }
}

export function getRankColor(rank: number): string {
  if (rank === 1) return '#FFD700'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  return 'var(--mantine-color-dimmed)'
}
