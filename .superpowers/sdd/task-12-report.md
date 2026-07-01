### Task 12: Category Filters — Complete

**Status:** Done
**Commit:** `60fd5f9` — `feat: add category filter pills`

**Changes:**
- Added `activeCategory` state (defaults to `'All'`)
- Extracted unique categories from habits and sorted alphabetically
- Filtered habit grids based on selected category
- Added filter pills row between Overall Activity and habit grids
- Pills use `bg-primary text-white` for active, `bg-surface-elevated` for inactive

**Build:** Pass (`tsc -b && vite build` — 631ms)

**Concerns:** None
