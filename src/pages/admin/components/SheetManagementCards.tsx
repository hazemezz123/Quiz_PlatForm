import { memo } from 'react'
import { Card, Group, Select, TextInput, Button } from '@mantine/core'
import { Trash, Pencil } from 'lucide-react'
import { CATEGORY_IDS, CategoryId } from '../../../lib/categories'

interface SheetManagementCardsProps {
  sheets: string[]
  deleteSheetValue: string | null
  setDeleteSheetValue: (val: string | null) => void
  renameOldSheet: string | null
  setRenameOldSheet: (val: string | null) => void
  renameNewSheet: string
  setRenameNewSheet: (val: string) => void
  changeCatSheet: string | null
  setChangeCatSheet: (val: string | null) => void
  changeCatNew: CategoryId | null
  setChangeCatNew: (val: CategoryId | null) => void
  onDeleteSheet: () => void
  onRenameSheet: () => void
  onChangeSheetCategory: () => void
}

export const SheetManagementCards = memo(function SheetManagementCards({
  sheets,
  deleteSheetValue,
  setDeleteSheetValue,
  renameOldSheet,
  setRenameOldSheet,
  renameNewSheet,
  setRenameNewSheet,
  changeCatSheet,
  setChangeCatSheet,
  changeCatNew,
  setChangeCatNew,
  onDeleteSheet,
  onRenameSheet,
  onChangeSheetCategory,
}: SheetManagementCardsProps) {
  return (
    <>
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" align="flex-end">
          <Select
            label="Delete Entire Sheet"
            placeholder="Select sheet to delete"
            data={sheets}
            value={deleteSheetValue}
            onChange={setDeleteSheetValue}
            clearable
            style={{ minWidth: 280 }}
          />
          <Button
            color="red"
            variant="light"
            disabled={!deleteSheetValue}
            leftSection={<Trash size={16} />}
            onClick={onDeleteSheet}
          >
            Delete Sheet
          </Button>
        </Group>
      </Card>

      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" align="flex-end" grow>
          <Select
            label="Rename Sheet"
            placeholder="Select sheet"
            data={sheets}
            value={renameOldSheet}
            onChange={setRenameOldSheet}
            clearable
            style={{ minWidth: 200 }}
          />
          <TextInput
            label="New Name"
            placeholder="e.g., 5, Topic-Name..."
            value={renameNewSheet}
            onChange={(e) => setRenameNewSheet(e.currentTarget.value)}
            style={{ minWidth: 200 }}
          />
          <Button
            color="blue"
            variant="light"
            disabled={!renameOldSheet || !renameNewSheet.trim()}
            leftSection={<Pencil size={16} />}
            onClick={onRenameSheet}
          >
            Rename
          </Button>
        </Group>
      </Card>

      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" align="flex-end" grow>
          <Select
            label="Change Sheet Category"
            placeholder="Select sheet"
            data={sheets}
            value={changeCatSheet}
            onChange={setChangeCatSheet}
            clearable
            style={{ minWidth: 200 }}
          />
          <Select
            label="New Category"
            placeholder="Select new category"
            data={CATEGORY_IDS.map((c) => ({ value: c, label: c }))}
            value={changeCatNew}
            onChange={(val) => setChangeCatNew(val as CategoryId)}
            clearable
            style={{ minWidth: 200 }}
          />
          <Button
            color="orange"
            variant="light"
            disabled={!changeCatSheet || !changeCatNew}
            leftSection={<Pencil size={16} />}
            onClick={onChangeSheetCategory}
          >
            Change Category
          </Button>
        </Group>
      </Card>
    </>
  )
})
