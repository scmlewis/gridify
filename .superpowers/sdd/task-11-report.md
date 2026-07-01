### Task 11: Habit Detail Sheet - Report

**Status:** Complete

**Commit:** `c83ca28` - feat: add Habit Detail Sheet

**Files Created:**
- `src/components/DayOfWeekHeatmap.tsx` - Horizontal bars showing completion % by day of week (Sun-Sat)
- `src/components/StatsCard.tsx` - Grid of stat boxes: streak, best streak, completion rate, weekly avg, total check-ins, trend vs prev 2 weeks, best/worst day
- `src/components/HabitDetailSheet.tsx` - Bottom sheet with contribution grid, stats, day-of-week heatmap, and delete action

**Files Modified:**
- `src/components/HabitRow.tsx` - Added `onTap` prop, row is now clickable
- `src/components/CategoryGroup.tsx` - Added `onHabitTap` prop, passed through to HabitRow
- `src/components/TodayTab.tsx` - Added `selectedHabit` state, opens detail sheet on habit tap
- `src/components/GridsTab.tsx` - Added `selectedHabit` state, habit cards open detail sheet on click

**Build:** Passes (`npm run build`)

**Test Summary:** No automated tests exist in the project. Manual verification required.

**Concerns:**
- No test coverage for new components
- Detail sheet loads full year of logs on open (could be optimized for large datasets)
- Delete action has confirm step but no undo after confirmation
