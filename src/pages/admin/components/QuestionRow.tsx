import { memo } from 'react'
import { Table, Badge, Text, Group, ActionIcon } from '@mantine/core'
import { Pencil, Trash } from 'lucide-react'
import { CodeRenderer } from '../../../components/CodeRenderer'
import { Question } from '../../../types'

interface QuestionRowProps {
  q: Question
  onEdit: (q: Question) => void
  onDelete: (id: string) => void
}

export const QuestionRow = memo(function QuestionRow({ q, onEdit, onDelete }: QuestionRowProps) {
  return (
    <Table.Tr>
      <Table.Td>
        <CodeRenderer text={q.question} />
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light">
          {q.category}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{q.sheet || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" color={q.type === 'mcq' ? 'blue' : 'grape'}>
          {q.type}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="teal" style={{ fontFamily: 'monospace' }}>
          {q.options[q.answer].includes('\n')
            ? JSON.stringify(q.options[q.answer])
            : q.options[q.answer]}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="light" color="blue" onClick={() => onEdit(q)}>
            <Pencil size={16} />
          </ActionIcon>
          <ActionIcon variant="light" color="red" onClick={() => onDelete(q.id)}>
            <Trash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  )
})
