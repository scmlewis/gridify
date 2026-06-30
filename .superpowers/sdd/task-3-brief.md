# Phase 3: Interactive App Dashboard & Toggle Optimistic UI

## Task Description

Create the primary dashboard view as described in Section 4. Render a grid of habits where users can add, delete, and instantly check-in for the day. Use React local state to optimistically toggle active cell states in the UI while asynchronous Dexie transactions run in the background.

## Dashboard Layout

### Header Module
- Minimalist app brand title ("Habit Tracker")
- System connection state flag (Online/Offline indicator) — use `navigator.onLine` and `online`/`offline` events
- A "Global Productivity Grid" showing the aggregated sum of all active habits (uses `<ContributionGrid />` with `getAllLogsForDateRange` + `getDailyTotals`)

### Control Panel
- Quick input field to create new habits with auto-incremented sorting index
- Enter key or button click to add
- Clear input after successful creation

### Habit Tracker Body
- A vertically stacked, highly compact grid of custom card components
- Each habit card rendered as a dense row containing:

#### Individual Habit Component
- **Habit Controls (Left Column):**
  - Habit name
  - Current daily streak metric (consecutive days with check-ins, counting backward from today)
  - Rapid touch-optimized button to trigger a toggle state for "Today" (optimistically updating UI instantly)
- **Compact Grid Viewer (Right Column):**
  - Individual instance of `<ContributionGrid />` showing only the history of this particular habit
- **Visual States:**
  - Soft-archiving toggle button (hover to reveal) when hovering over the habit controls
  - Archive icon (e.g., a subtle X or archive box icon)

## Optimistic UI Pattern

When user clicks the check-in button for today:
1. Immediately update React local state to show today's cell as filled (level 1)
2. Show streak increment optimistically
3. Call `logCheckIn()` from db.ts in background
4. If db write fails, revert the optimistic update and show error (console.error is fine for now)

When user clicks again to un-check-in:
1. Immediately update React local state to show today's cell as empty (level 0)
2. Show streak decrement optimistically
3. Call `removeCheckIn()` from db.ts in background

## Streak Calculation

```ts
function calculateStreak(logs: Map<string, number>): number {
  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);
  
  while (true) {
    const dateStr = formatDate(checkDate);
    if (logs.has(dateStr) && logs.get(dateStr)! > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
```

## File Structure Expected

```
src/
├── components/
│   ├── ContributionGrid.tsx     # Already exists (Phase 2)
│   ├── Dashboard.tsx            # Main dashboard layout
│   ├── HabitCard.tsx            # Individual habit row component
│   ├── Header.tsx               # App header with global grid
│   ├── AddHabitForm.tsx         # Quick habit creation input
│   └── OnlineStatus.tsx         # Online/offline indicator
├── hooks/
│   └── useHabits.ts             # Custom hook for habit CRUD + optimistic state
├── utils/
│   ├── date-utils.ts            # Already exists (Phase 2)
│   ├── grid-math.ts             # Already exists (Phase 2)
│   └── streak.ts                # Streak calculation utility
├── db.ts                        # Already exists (Phase 1)
├── types.ts                     # Already exists (Phase 1)
└── App.tsx                      # Updated to render Dashboard
```

## Requirements

1. **useHabits.ts** — Custom hook:
   - Loads habits from Dexie on mount
   - Provides `addHabit(name)`, `deleteHabit(id)`, `archiveHabit(id)`
   - Manages local habit list state
   - Returns `{ habits, addHabit, deleteHabit, archiveHabit, isLoading }`

2. **Dashboard.tsx** — Main layout:
   - Renders Header, AddHabitForm, and list of HabitCards
   - Manages the global grid data
   - Full-screen dark background (bg-gray-900)

3. **HabitCard.tsx** — Individual habit:
   - Loads habit logs from Dexie on mount
   - Manages optimistic today state locally
   - Renders habit name, streak, check-in button, and ContributionGrid
   - Handles archive with hover-reveal UI

4. **Header.tsx** — App header:
   - Brand title
   - OnlineStatus component
   - Global ContributionGrid (all habits aggregated)

5. **AddHabitForm.tsx** — Quick add:
   - Single input + optional submit
   - Enter key submits
   - Clears after creation

6. **OnlineStatus.tsx** — Connection indicator:
   - Shows green dot when online, red when offline
   - Listens to online/offline events
   - Updates state reactively

7. **streak.ts** — Streak utility:
   - `calculateStreak(logs: Map<string, number>): number`

8. **App.tsx** — Updated:
   - Renders `<Dashboard />` as the main view

## Styling

- Dark mode: bg-gray-900 for body, bg-gray-800 for cards
- Text: white/gray-200 for primary, gray-400 for secondary
- Check-in button: emerald-500 when active, gray-600 when inactive
- Hover states: smooth transitions
- Compact layout: minimal padding, dense grid

## Context

This phase builds on Phase 1 (database) and Phase 2 (ContributionGrid). The `<ContributionGrid />` component is already implemented and accepts `logs: Map<string, number>`. The database functions `getHabits()`, `getHabitLogs()`, `getAllLogsForDateRange()`, `getDailyTotals()`, `logCheckIn()`, `removeCheckIn()`, `createHabit()`, `deleteHabit()`, and `archiveHabit()` are all available in `src/db.ts`.

The App.tsx currently has a placeholder component that needs to be replaced with the Dashboard.
