# Admin Page Refactoring & Performance Optimization Design

**Date**: 2026-06-06
**Approach**: A — Hook-First Decomposition

## Problem

`src/pages/Admin.tsx` is 1315 lines with 25+ `useState` hooks in a single component. Every keystroke in any input field triggers a re-render of the entire Admin component, including all 4 tab panels, both data tables, dashboard stats, and all form inputs. This causes severe input lag.

## Performance Bottlenecks

| # | Issue | Cause | Impact |
|---|-------|-------|--------|
| 1 | 25+ useState in one component | Any state change re-renders entire Admin | Typing in any input re-renders ALL tabs, ALL tables |
| 2 | Form state in parent | jsonInput, sheetName, etc. live in Admin | Typing in add-form textarea re-renders question table |
| 3 | Search state in parent | search, userSearch live in Admin | Typing in question search re-renders add form + export tab |
| 4 | Sheet mgmt state in parent | deleteSheetValue, renameOldSheet, etc. | Selecting a sheet to delete re-renders entire page |
| 5 | Inline dashboard stats array | `[{...}, {...}]` recreated every render | 6 stat cards get new props object every render |
| 6 | No debounce on search | filteredQuestions recomputes every keystroke | CPU-intensive filter on hundreds of questions per keystroke |
| 7 | No table virtualization | All rows rendered even when off-screen | DOM nodes for hundreds of rows updated on every parent re-render |
| 8 | All tabs mount simultaneously | Mantine mounts inactive tab panels | Inactive tab content re-renders on unrelated state changes |
| 9 | onClear inline arrow function | `onClear={() => { ... }}` | New function ref each render, breaks AddQuestionsForm memo |

## Solution: Hook-First Decomposition

Move business logic into custom hooks. Move form/search state into the components that use them. Each hook/component only re-renders when its own state changes.

## Folder Structure

```
src/pages/admin/
  Admin.tsx                          Thin orchestrator (~60 lines, no local state)
  components/
    AdminLogin.tsx                   Login form (owns password state locally)
    DashboardStatsCards.tsx          Memo'd stats grid
    DashboardStatCard.tsx            Memo'd single stat card
    AddQuestionsForm.tsx             Owns all form state internally (jsonInput, sheetName, etc.)
    ManageQuestionsTab.tsx           Search + filters + sheet ops + table
    QuestionTable.tsx                Virtualized question table
    QuestionRow.tsx                  Memo'd row (moved from Admin.tsx)
    EditQuestionModal.tsx            Owns edit form state internally (moved from Admin.tsx)
    SheetManagementCards.tsx         Delete/rename/category-change cards
    UsersTab.tsx                     Owns userSearch state internally
    ExportTab.tsx                    Export questions + scores
  hooks/
    useAuth.ts                       Auth state, login/logout, session listener
    useQuestions.ts                  Questions data, search, filters, CRUD, edit modal
    useSheets.ts                     Sheets data, delete/rename/change-category
    useUsers.ts                      Users data, loading
    useDashboard.ts                  Dashboard stats
    useExport.ts                     Export scores data
  utils/
    questionParser.ts                JSON parse + validation for add form
  constants.ts                       STAT_CARDS config, ADMIN_EMAIL
```

## File Responsibilities

### Hooks

| Hook | State Owned | Operations |
|------|-------------|------------|
| `useAuth` | isAuthenticated, authLoading | handleLogin, handleLogout, session check + listener |
| `useQuestions` | questions, search, filterCategory, filterSheet, editOpened, editingQuestion | loadQuestions, handleDelete, openEditModal, filteredQuestions (memo'd), categories (memo'd) |
| `useSheets` | dbSheets, sheets (memo'd) | loadSheets, handleDeleteSheet, handleRenameSheet, handleChangeSheetCategory |
| `useUsers` | users, usersLoading | loadUsers |
| `useDashboard` | dashboardStats | loadDashboardStats |
| `useExport` | exportScores, exportLoading | loadExportScores |

### Components

| Component | State Owned | Props Received |
|-----------|-------------|---------------|
| `AdminLogin` | password, passwordError | authLoading, ADMIN_EMAIL, onLogin, onLogout |
| `DashboardStatsCards` | none | dashboardStats |
| `DashboardStatCard` | none | stat config (icon, label, value, color) |
| `AddQuestionsForm` | jsonInput, jsonFile, sheetName, sheetCategory, jsonError, addSuccess | sheets, categories, onSuccess callback |
| `ManageQuestionsTab` | deleteSheetValue, renameOldSheet, renameNewSheet, changeCatSheet, changeCatNew | questions, search, filterCategory, filterSheet, filteredQuestions, categories, sheets, callbacks |
| `SheetManagementCards` | none | sheets, categories, all sheet operation callbacks |
| `QuestionTable` | none | filteredQuestions, onEdit, onDelete |
| `QuestionRow` | none | q, onEdit, onDelete (memo'd) |
| `EditQuestionModal` | category, sheet, type, questionText, options, answer, explanation | opened, onClose, question, onSave |
| `UsersTab` | userSearch | users, usersLoading |
| `ExportTab` | none | questions, categories, sheets, exportScores, exportLoading |

### Utils & Constants

| File | Contents |
|------|----------|
| `questionParser.ts` | `parseAndValidateQuestions(jsonString)` — pure function, handles JSON parse + field validation + format mapping |
| `constants.ts` | `STAT_CARDS` array config, `ADMIN_EMAIL` constant |

## Render Optimizations

| Optimization | Mechanism | Estimated Improvement |
|-------------|-----------|---------------------|
| Localize form state to AddQuestionsForm | Component owns its useState | ~90% fewer re-renders on typing |
| Localize search state to ManageQuestionsTab | Component owns search/filter useState | ~75% fewer re-renders |
| Localize userSearch to UsersTab | Component owns userSearch useState | ~75% fewer re-renders |
| Localize sheet mgmt state | ManageQuestionsTab owns sheet mgmt useState | ~80% fewer re-renders |
| Localize password to AdminLogin | Component owns password useState | ~90% fewer re-renders |
| Memo DashboardStatCard | React.memo on individual cards | ~6x fewer card re-renders |
| Move stat configs to constants.ts | Stable reference outside render | Eliminates unnecessary card re-renders |
| Debounce search input | 300ms debounce before filtering | ~3x fewer filter computations |
| Virtualize question table | Only visible rows in DOM | ~10x faster for 200+ questions |
| Memo onClear/callbacks | useCallback for stable references | Preserves child memo boundaries |

## Data Flow

```
Admin.tsx (orchestrator, no local state)
  ├── useAuth() → isAuthenticated, authLoading, handleLogin, handleLogout
  ├── useQuestions() → questions, filteredQuestions, search, filters, handleDelete, editModal
  ├── useSheets() → sheets, categories, handleDeleteSheet, handleRenameSheet, handleChangeCategory
  ├── useUsers() → users, usersLoading
  ├── useDashboard() → dashboardStats
  ├── useExport() → exportScores, exportLoading
  │
  ├── <AdminLogin /> (owns password state)
  ├── <DashboardStatsCards stats={dashboardStats} /> (memo'd)
  ├── <Tabs>
  │     ├── <AddQuestionsForm /> (owns ALL form state)
  │     ├── <ManageQuestionsTab /> (owns sheet mgmt state, receives questions data)
  │     │     ├── <SheetManagementCards />
  │     │     └─ <QuestionTable /> (virtualized)
  │     │          └─ <QuestionRow /> (memo'd)
  │     ├── <UsersTab /> (owns userSearch state)
  │     └─ <ExportTab /> (pure display)
  └─ <EditQuestionModal /> (owns edit form state)
```

## Virtualization Strategy

Add `@tanstack/react-virtual` (lightweight, ~3KB) as a new dependency. Use `useVirtualizer` inside `QuestionTable.tsx` to render only visible rows. Integrate with Mantine Table by mapping virtual items to `<Table.Tr>` rows. This avoids rendering hundreds of DOM rows that are off-screen.

## Debounce Strategy

Use `useDebouncedValue` from `@mantine/hooks` (already in project dependencies). The search `TextInput` updates local state immediately for responsive display, but `filteredQuestions` uses the debounced value (300ms) so the expensive filter computation only runs after the user pauses typing.

## Additional Recommendations for Scaling

1. Consider React Query (TanStack Query) for server state management — provides caching, background refetching, and eliminates manual loading/error state management
2. Add error boundaries per tab to prevent one tab's error from crashing the entire page
3. Consider lazy-loading tab content with `React.lazy()` for the heaviest tabs
4. Add pagination to question/user tables instead of loading all records
5. Consider moving sheet management to its own tab if the Manage tab grows further