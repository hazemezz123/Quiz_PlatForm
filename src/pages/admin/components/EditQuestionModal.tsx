import { useState, useEffect, memo } from 'react'
import {
  Modal,
  Stack,
  Select,
  TextInput,
  Textarea,
  NumberInput,
  Group,
  Button,
} from '@mantine/core'
import { updateQuestion } from '../../../lib/supabaseClient'
import { Question, QuestionType } from '../../../types'
import { CATEGORY_IDS, CategoryId } from '../../../lib/categories'

interface EditQuestionModalProps {
  opened: boolean
  onClose: () => void
  question: Question | null
  onSave: () => void
}

export const EditQuestionModal = memo(function EditQuestionModal({
  opened,
  onClose,
  question,
  onSave,
}: EditQuestionModalProps) {
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [sheet, setSheet] = useState('')
  const [type, setType] = useState<QuestionType>('mcq')
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState('')
  const [answer, setAnswer] = useState(0)
  const [explanation, setExplanation] = useState('')

  useEffect(() => {
    if (question) {
      setCategory(question.category as CategoryId)
      setSheet(question.sheet || '')
      setType(question.type)
      setQuestionText(question.question)
      setOptions(JSON.stringify(question.options, null, 2))
      setAnswer(question.answer)
      setExplanation(question.explanation)
    }
  }, [question])

  const handleUpdate = async () => {
    if (!question) return
    if (!category) {
      alert('Category is required')
      return
    }
    let parsedOptions: string[]
    try {
      parsedOptions = JSON.parse(options)
      if (!Array.isArray(parsedOptions)) throw new Error()
    } catch {
      alert('Options must be a valid JSON array')
      return
    }
    try {
      await updateQuestion(question.id, {
        category,
        sheet: sheet || undefined,
        type,
        question: questionText,
        options: parsedOptions,
        answer,
        explanation,
      })
      onSave()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Question" size="lg">
      <Stack gap="md">
        <Select
          label="Category"
          data={CATEGORY_IDS.map((c) => ({ value: c, label: c }))}
          value={category}
          onChange={(val) => setCategory(val as CategoryId)}
          required
        />
        <TextInput
          label="Sheet"
          value={sheet}
          onChange={(e) => setSheet(e.currentTarget.value)}
          description="Leave empty for no sheet"
        />
        <Select
          label="Type"
          data={[
            { value: 'mcq', label: 'MCQ' },
            { value: 'truefalse', label: 'True / False' },
          ]}
          value={type}
          onChange={(val) => setType(val as QuestionType)}
        />
        <Textarea
          label="Question"
          value={questionText}
          onChange={(e) => setQuestionText(e.currentTarget.value)}
          minRows={2}
        />
        <Textarea
          label="Options (JSON array)"
          value={options}
          onChange={(e) => setOptions(e.currentTarget.value)}
          minRows={3}
          styles={{ input: { fontFamily: 'monospace' } }}
          description='Example: ["Option A", "Option B", "Option C", "Option D"]'
        />
        <NumberInput
          label="Correct Answer Index"
          value={answer}
          onChange={(val) => setAnswer(Number(val))}
          min={0}
          description="Zero-based index of the correct option"
        />
        <Textarea
          label="Explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.currentTarget.value)}
          minRows={2}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
})
