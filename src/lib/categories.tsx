import { Bot, Brain, Cpu, BookOpen, Handshake, Scale, Monitor, type LucideIcon } from 'lucide-react'

export interface CategoryConfig {
  id: CategoryId
  label: string
  description: string
  icon: LucideIcon
  color: string
}

/**
 * Allowed category values — must match the CHECK constraint in schema.sql.
 * The `id` must match the `category` column value stored in Supabase.
 */
export const CATEGORY_IDS = [
  'AI Programming',
  'AI Fundamental',
  'Digital Circuit',
  'Human Rights',
  'Operating System',
  'English',
  'Negotiations',
] as const

export type CategoryId = (typeof CATEGORY_IDS)[number]

/**
 * Main categories displayed on the Home page.
 */
export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'AI Programming',
    label: 'AI Programming',
    description: 'Artificial Intelligence programming concepts, algorithms, and frameworks.',
    icon: Bot,
    color: 'violet',
  },
  {
    id: 'AI Fundamental',
    label: 'AI Fundamental',
    description:
      'Core principles of Artificial Intelligence — search, logic, learning, and ethics.',
    icon: Brain,
    color: 'cyan',
  },
  {
    id: 'Digital Circuit',
    label: 'Digital Circuit',
    description: 'Logic gates, combinational & sequential circuits, and hardware design basics.',
    icon: Cpu,
    color: 'orange',
  },
  {
    id: 'Human Rights',
    label: 'Human Rights',
    description: 'International law, declarations, and principles protecting human dignity.',
    icon: Scale,
    color: 'red',
  },
  {
    id: 'Operating System',
    label: 'Operating System',
    description: 'Processes, memory, scheduling, file systems, and OS architecture.',
    icon: Monitor,
    color: 'indigo',
  },
  {
    id: 'English',
    label: 'English',
    description: 'Grammar, vocabulary, reading comprehension, and writing skills.',
    icon: BookOpen,
    color: 'blue',
  },
  {
    id: 'Negotiations',
    label: 'Negotiations',
    description: 'Strategies, tactics, and communication skills for effective negotiation.',
    icon: Handshake,
    color: 'green',
  },
]

/** Lookup a category config by its database id (category name). */
export function getCategoryConfig(id: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
