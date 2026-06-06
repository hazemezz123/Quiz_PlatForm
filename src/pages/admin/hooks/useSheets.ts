import { useState, useCallback, useMemo } from 'react'
import {
  fetchSheets,
  deleteSheet as deleteSheetApi,
  renameSheet,
  insertSheet,
  updateSheetCategory,
} from '../../../lib/supabaseClient'
import { Sheet } from '../../../types'
import { CategoryId } from '../../../lib/categories'

export function useSheets() {
  const [dbSheets, setDbSheets] = useState<Sheet[]>([])

  const loadSheets = useCallback(async () => {
    try {
      const data = await fetchSheets()
      setDbSheets(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const sheets = useMemo(() => dbSheets.map((s) => s.name), [dbSheets])

  const handleDeleteSheet = useCallback(async (sheetName: string, questionCount: number) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Sheet "${sheetName}"?\nThis will permanently delete ${questionCount} question(s).`,
      )
    )
      return false
    try {
      await deleteSheetApi(sheetName)
      return true
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete sheet')
      return false
    }
  }, [])

  const handleRenameSheet = useCallback(
    async (oldName: string, newName: string, questionCount: number) => {
      if (oldName === newName) {
        alert('New name must be different from the current name')
        return false
      }
      if (
        !window.confirm(
          `Rename Sheet "${oldName}" to "${newName}"?\nThis will update ${questionCount} question(s) and all linked scores.`,
        )
      )
        return false
      try {
        await renameSheet(oldName, newName)
        return true
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to rename sheet')
        return false
      }
    },
    [],
  )

  const handleChangeSheetCategory = useCallback(
    async (
      sheetName: string,
      newCategory: CategoryId,
      currentCategory: string,
      questionCount: number,
    ) => {
      if (currentCategory === newCategory) {
        alert('The sheet already belongs to this category')
        return false
      }
      if (
        !window.confirm(
          `Change category of Sheet "${sheetName}" from "${currentCategory}" to "${newCategory}"?\nThis will update ${questionCount} question(s) and all linked scores.`,
        )
      )
        return false
      try {
        await updateSheetCategory(sheetName, newCategory)
        return true
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to change sheet category')
        return false
      }
    },
    [],
  )

  const insertNewSheet = useCallback(async (name: string, category: CategoryId) => {
    try {
      await insertSheet({ name, category })
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null ? (err as { code?: string }).code : undefined
      if (code !== '23505') {
        throw err
      }
    }
  }, [])

  const findSheetByName = useCallback(
    (name: string) => dbSheets.find((s) => s.name === name),
    [dbSheets],
  )

  return {
    dbSheets,
    sheets,
    loadSheets,
    handleDeleteSheet,
    handleRenameSheet,
    handleChangeSheetCategory,
    insertNewSheet,
    findSheetByName,
  }
}
