# Task 3 Report: Interactive App Dashboard & Toggle Optimistic UI

## What Was Implemented

All files from the task brief:

| File | Purpose |
|------|---------|
| `src/utils/streak.ts` | `calculateStreak()` — counts consecutive days backward from today |
| `src/hooks/useHabits.ts` | Custom hook: loads habits, provides `addHabit`, `deleteHabit`, `archiveHabit` |
| `src/components/OnlineStatus.tsx` | Green/red dot with online/offline event listeners |
| `src/components/AddHabitForm.tsx` | Single input + Add button, clears on submit |
| `src/components/Header.tsx` | Brand title, OnlineStatus, global ContributionGrid |
| `src/components/HabitCard.tsx` | Habit row with toggle button, streak, archive, mini grid |
| `src/components/Dashboard.tsx` | Main layout composing Header, AddHabitForm, HabitCards |
| `src/App.tsx` | Updated to render `<Dashboard />` |

## Optimistic UI Flow

Check-in toggle in `HabitCard`:
1. `setTodayChecked` + `setLogs` + `setStreak` update React state immediately
2. `logCheckIn()` or `removeCheckIn()` called in background
3. On failure: state reverts to previous values, `console.error` logs the error

## Test Results

- `npm run build` — **passed** (tsc + vite build, 0 errors)
- `npm run lint` — **passed** (oxlint, 0 warnings, 0 errors)

No runtime tests exist yet (no test framework configured in the project).

## Files Changed

- **Modified:** `src/App.tsx`
- **Created:** `src/utils/streak.ts`, `src/hooks/useHabits.ts`, `src/components/OnlineStatus.tsx`, `src/components/AddHabitForm.tsx`, `src/components/Header.tsx`, `src/components/HabitCard.tsx`, `src/components/Dashboard.tsx`

## Self-Review Findings

1. **getHabits filter in db.ts** — `getHabits()` uses `.where('archived').equals(0)` but `archived` is a boolean. Dexie indexes booleans as 0/1 which works, but this is fragile. Not a blocker for this phase.
2. **Global grid reload** — Header's global grid doesn't auto-refresh after check-ins. Acceptable for now; a refresh mechanism could be added in Phase 4.
3. **No error toast** — Errors are logged to console only as specified in the brief.

## Commit

- `57a02f2` — feat: add interactive dashboard with optimistic check-in UI
