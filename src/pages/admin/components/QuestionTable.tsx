import { useRef } from 'react'
import { Table, Text, Box } from '@mantine/core'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Question } from '../../../types'
import { QuestionRow } from './QuestionRow'

interface QuestionTableProps {
  filteredQuestions: Question[]
  onEdit: (q: Question) => void
  onDelete: (id: string) => void
}

const ROW_HEIGHT = 72

export function QuestionTable({ filteredQuestions, onEdit, onDelete }: QuestionTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: filteredQuestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  return (
    <Box
      ref={parentRef}
      style={{
        height: 600,
        overflow: 'auto',
      }}
    >
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Question</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Sheet</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Answer</Table.Th>
            <Table.Th style={{ width: 100 }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredQuestions.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text c="dimmed" ta="center" py="md">
                  No questions found.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            virtualizer.getVirtualItems().map((virtualRow) => {
              const q = filteredQuestions[virtualRow.index]
              return <QuestionRow key={q.id} q={q} onEdit={onEdit} onDelete={onDelete} />
            })
          )}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
