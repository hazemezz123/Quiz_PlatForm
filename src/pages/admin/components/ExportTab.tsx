import { useState, useCallback } from 'react'
import { Stack, Card, Text, Group, Button, Select, Loader } from '@mantine/core'
import { Download } from 'lucide-react'
import { CategoryId } from '../../../lib/categories'
import { Question, Score } from '../../../types'
import {
  questionsToCsv,
  scoresToCsv,
  downloadCsv,
  questionsToJson,
  scoresToJson,
  downloadJson,
} from '../../../lib/csvExport'

interface ExportTabProps {
  questions: Question[]
  categories: CategoryId[]
  sheets: string[]
  exportScores: Score[]
  exportLoading: boolean
}

export function ExportTab({
  questions,
  categories,
  sheets,
  exportScores,
  exportLoading,
}: ExportTabProps) {
  const [exportSheet, setExportSheet] = useState<string | null>(null)
  const [exportCategory, setExportCategory] = useState<string | null>(null)

  const handleExportAllCsv = useCallback(() => {
    const csv = questionsToCsv(questions)
    downloadCsv(csv, 'all_questions.csv')
  }, [questions])

  const handleExportAllJson = useCallback(() => {
    const json = questionsToJson(questions)
    downloadJson(json, 'all_questions.json')
  }, [questions])

  const handleExportSheetCsv = useCallback(() => {
    if (!exportSheet) {
      alert('Please select a sheet first')
      return
    }
    const sheetQuestions = questions.filter((q) => q.sheet === exportSheet)
    if (sheetQuestions.length === 0) {
      alert('No questions found for this sheet')
      return
    }
    const csv = questionsToCsv(sheetQuestions)
    downloadCsv(csv, `sheet_${exportSheet}_questions.csv`)
  }, [questions, exportSheet])

  const handleExportSheetJson = useCallback(() => {
    if (!exportSheet) {
      alert('Please select a sheet first')
      return
    }
    const sheetQuestions = questions.filter((q) => q.sheet === exportSheet)
    if (sheetQuestions.length === 0) {
      alert('No questions found for this sheet')
      return
    }
    const json = questionsToJson(sheetQuestions)
    downloadJson(json, `sheet_${exportSheet}_questions.json`)
  }, [questions, exportSheet])

  const handleExportCategoryCsv = useCallback(() => {
    if (!exportCategory) {
      alert('Please select a category first')
      return
    }
    const catQuestions = questions.filter((q) => q.category === exportCategory)
    if (catQuestions.length === 0) {
      alert('No questions found for this category')
      return
    }
    const csv = questionsToCsv(catQuestions)
    downloadCsv(csv, `category_${exportCategory}_questions.csv`)
  }, [questions, exportCategory])

  const handleExportCategoryJson = useCallback(() => {
    if (!exportCategory) {
      alert('Please select a category first')
      return
    }
    const catQuestions = questions.filter((q) => q.category === exportCategory)
    if (catQuestions.length === 0) {
      alert('No questions found for this category')
      return
    }
    const json = questionsToJson(catQuestions)
    downloadJson(json, `category_${exportCategory}_questions.json`)
  }, [questions, exportCategory])

  const handleExportScoresCsv = useCallback(() => {
    if (exportScores.length === 0) {
      alert('No scores to export')
      return
    }
    const csv = scoresToCsv(exportScores)
    downloadCsv(csv, 'all_scores.csv')
  }, [exportScores])

  const handleExportScoresJson = useCallback(() => {
    if (exportScores.length === 0) {
      alert('No scores to export')
      return
    }
    const json = scoresToJson(exportScores)
    downloadJson(json, 'all_scores.json')
  }, [exportScores])

  return (
    <Stack gap="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600}>Export Questions</Text>
          <Text size="sm" c="dimmed">
            Download all questions or filter by a specific sheet. Available in CSV and JSON formats.
          </Text>

          <Group justify="flex-end">
            <Button
              variant="default"
              leftSection={<Download size={16} />}
              onClick={handleExportAllCsv}
            >
              CSV – All Questions ({questions.length})
            </Button>
            <Button
              color="grape"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportAllJson}
            >
              JSON – All Questions ({questions.length})
            </Button>
          </Group>

          <Group justify="space-between" align="flex-end" grow>
            <Select
              label="Export Questions by Sheet"
              placeholder="Select a sheet"
              data={sheets}
              value={exportSheet}
              onChange={setExportSheet}
              clearable
              style={{ minWidth: 280 }}
            />
            <Button
              color="teal"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportSheetCsv}
            >
              CSV – Sheet Questions
            </Button>
            <Button
              color="grape"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportSheetJson}
            >
              JSON – Sheet Questions
            </Button>
          </Group>

          <Group justify="space-between" align="flex-end" grow>
            <Select
              label="Export Questions by Category"
              placeholder="Select a category"
              data={categories}
              value={exportCategory}
              onChange={setExportCategory}
              clearable
              style={{ minWidth: 280 }}
            />
            <Button
              color="violet"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportCategoryCsv}
            >
              CSV – Category Questions
            </Button>
            <Button
              color="grape"
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportCategoryJson}
            >
              JSON – Category Questions
            </Button>
          </Group>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600}>Export Scores</Text>
          <Text size="sm" c="dimmed">
            Download all quiz scores. Available in CSV and JSON formats.
          </Text>

          {exportLoading ? (
            <Group justify="center" py="sm">
              <Loader size="sm" color="teal" />
              <Text size="sm" c="dimmed">
                Loading scores...
              </Text>
            </Group>
          ) : (
            <Group justify="flex-end">
              <Button
                color="blue"
                variant="light"
                leftSection={<Download size={16} />}
                onClick={handleExportScoresCsv}
              >
                CSV – All Scores ({exportScores.length})
              </Button>
              <Button
                color="grape"
                variant="light"
                leftSection={<Download size={16} />}
                onClick={handleExportScoresJson}
              >
                JSON – All Scores ({exportScores.length})
              </Button>
            </Group>
          )}
        </Stack>
      </Card>
    </Stack>
  )
}
