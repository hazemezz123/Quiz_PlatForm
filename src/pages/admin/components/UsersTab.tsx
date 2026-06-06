import { useState, useMemo } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import {
  Stack,
  Group,
  TextInput,
  Text,
  Card,
  Table,
  Badge,
  Loader,
  ScrollArea,
} from '@mantine/core'
import { Search } from 'lucide-react'
import { UserRecord } from '../../../lib/supabaseClient'

interface UsersTabProps {
  users: UserRecord[]
  usersLoading: boolean
}

export function UsersTab({ users, usersLoading }: UsersTabProps) {
  const [userSearch, setUserSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(userSearch, 300)

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users
    const term = debouncedSearch.toLowerCase()
    return users.filter((u) => u.user_name.toLowerCase().includes(term))
  }, [users, debouncedSearch])

  return (
    <Stack gap="md">
      <Group>
        <TextInput
          placeholder="Search users..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.currentTarget.value)}
          leftSection={<Search size={16} />}
          style={{ flex: 1 }}
        />
        <Text size="sm" c="dimmed">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </Text>
      </Group>

      {usersLoading ? (
        <Stack align="center" gap="md" py="xl">
          <Loader size="md" color="teal" />
          <Text c="dimmed" size="sm">
            Loading users...
          </Text>
        </Stack>
      ) : (
        <Card shadow="sm" padding={0} radius="md" withBorder>
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 60 }}>#</Table.Th>
                  <Table.Th>User Name</Table.Th>
                  <Table.Th>Quizzes Taken</Table.Th>
                  <Table.Th>First Seen</Table.Th>
                  <Table.Th>Last Seen</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUsers.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center" py="md">
                        No users found.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <Table.Tr key={u.user_name}>
                      <Table.Td>
                        <Text fw={700} c="teal">
                          #{idx + 1}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600}>{u.user_name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={u.quiz_count > 0 ? 'teal' : 'gray'} variant="light">
                          {u.quiz_count}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {new Date(u.created_at).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {new Date(u.last_seen).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      )}
    </Stack>
  )
}
