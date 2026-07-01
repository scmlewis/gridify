## Task 5: Category Groups - Complete

### Status
Done

### Files Created/Modified
- `src/components/HabitRow.tsx` - Compact habit row with colored left border, checkbox, name, streak
- `src/components/CategoryGroup.tsx` - Collapsible category sections with localStorage persistence
- `src/components/TodayTab.tsx` - Updated to group habits by category and render CategoryGroups

### Implementation Details
- **HabitRow**: Fetches logs for last 30 days to compute streak, optimistic check-in toggle with haptic feedback, colored left border from `habit.color` field
- **CategoryGroup**: Collapse state persisted in localStorage under `habit-tracker-collapsed-categories`, chevron rotation animation, category count badge
- **TodayTab**: Groups habits by `category` field, sorts categories alphabetically with "uncategorized" last, passes `refreshKey` to SummaryCard

### Build
`npm run build` passes (tsc + vite)

### Commit
`feat: add category groups`

### Concerns
- None. All existing patterns followed (optimistic updates, Dexie queries, design tokens).
