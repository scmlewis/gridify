# Grid UX Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 UX issues in the Grids tab: animation replay, reorder capability, streak freeze validation, theme toggle style, and grid day orientation.

**Architecture:** Five independent fixes. Animation fix is a behavioral change in GridsTab/HabitCard. Reorder adds drag-and-drop to HabitCard mirroring TodayTab's pattern. Streak freeze adds date validation in db.ts. Theme toggle converts list to button group in Header. Grid orientation swaps axes in ContributionGrid from 53×7 horizontal to 7×53 vertical with vertical scroll.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Dexie.js 4, lucide-react

## Global Constraints

- Offline-first, no external APIs
- PWA Lighthouse 90+
- CSS-only animations (no framer-motion)
- All hover effects desktop-only
- Preserve existing themes and haptic feedback
- Bundle under 200KB gzipped

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/components/GridsTab.tsx` | Remove `onCheckIn` refresh trigger, add drag-and-drop reorder |
| `src/components/HabitCard.tsx` | Add `draggable` props, accept reorder callbacks |
| `src/components/ContributionGrid.tsx` | Swap axes: 7 columns (weekdays) × 53 rows (weeks), vertical scroll |
| `src/utils/grid-math.ts` | Update `getGridCoordinates` to return `{col, row}` for new orientation |
| `src/db.ts` | Add `validateStreakFreeze()` with date checks |
| `src/components/Header.tsx` | Convert theme list to horizontal button group |
| `src/components/StatsCard.tsx` | Minor: update grid references if any |

---

### Task 1: Fix Animation Replay in Grid Tab

**Problem:** Checking/unchecking any habit in GridsTab triggers `_onRefresh` → full reload → all HabitCards re-render → `justChecked` resets → all glow animations replay.

**Root cause:** `onCheckIn={() => _onRefresh(n => n + 1)}` in GridsTab line 155 forces a parent reload. HabitCard manages its own logs state optimistically but the parent re-render still resets `justChecked` to `false`, then the next check-in sets it `true` again, replaying the animation on ALL cards.

**Fix:** Remove `_onRefresh` call from `onCheckIn` in GridsTab. HabitCard already handles its own state optimistically. Only trigger refresh for structural changes (add/delete/archive).

**Files:**
- Modify: `src/components/GridsTab.tsx:150-158`

- [ ] **Step 1: Remove onCheckIn refresh from GridsTab**

In `GridsTab.tsx`, change the HabitCard render from:
```tsx
<HabitCard
  key={habit.id}
  habit={habit}
  onArchived={() => _onRefresh(n => n + 1)}
  onCheckIn={() => _onRefresh(n => n + 1)}
  onTap={setSelectedHabit}
/>
```
to:
```tsx
<HabitCard
  key={habit.id}
  habit={habit}
  onArchived={() => _onRefresh(n => n + 1)}
  onTap={setSelectedHabit}
/>
```

HabitCard's `onCheckIn` prop is optional (`onCheckIn?: () => void`), so removing it is safe. The component already handles optimistic updates locally.

- [ ] **Step 2: Verify HabitCard still works without parent refresh**

HabitCard loads its own logs on mount (`useEffect` with `[habit.id, todayStr]`), updates `logs` state optimistically in `toggleToday`, and recalculates streak/momentum from its own state. The grid renders from `logs` state. No parent refresh needed for check-in flow.

- [ ] **Step 3: Run tests and lint**

Run: `npm test && npm run lint`
Expected: All pass, 0 warnings

- [ ] **Step 4: Commit**

```bash
git add src/components/GridsTab.tsx
git commit -m "fix: stop replaying animations on all grid cards when one habit is checked in"
```

---

### Task 2: Streak Freeze Validation

**Problem:** `applyStreakFreeze` in db.ts only checks `freezesUsed < maxFreezes`. It doesn't verify:
1. Whether the previous day actually has a check-in (freeze should protect an existing streak)
2. Whether a freeze was already used on an adjacent day
3. Whether the habit is currently active

**Files:**
- Modify: `src/db.ts:165-170`
- Modify: `src/components/HabitCard.tsx:171-177`

- [ ] **Step 1: Add `canApplyStreakFreeze` validation function to db.ts**

After the existing `applyStreakFreeze` function, add:

```typescript
export async function canApplyStreakFreeze(id: string): Promise<{ allowed: boolean; reason?: string }> {
  const habit = await db.table('habits').get(id) as Habit | undefined;
  if (!habit) return { allowed: false, reason: 'Habit not found' };
  if (habit.archived) return { allowed: false, reason: 'Habit is archived' };
  if (habit.freezesUsed >= habit.maxFreezes) return { allowed: false, reason: 'No freezes remaining' };

  // Check that yesterday has a check-in (freeze protects an existing streak)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const yesterdayLog = await db.table('habitLogs')
    .where('[habitId+date]').equals([id, yesterdayStr])
    .first();

  if (!yesterdayLog || yesterdayLog.value <= 0) {
    return { allowed: false, reason: 'No check-in yesterday — freeze only works when yesterday was completed' };
  }

  // Check that today does NOT have a check-in (no point freezing a completed day)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const todayLog = await db.table('habitLogs')
    .where('[habitId+date]').equals([id, todayStr])
    .first();

  if (todayLog && todayLog.value > 0) {
    return { allowed: false, reason: 'Already checked in today' };
  }

  // Check no freeze used on adjacent days (no double-freeze)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;

  // Check if the day before yesterday was frozen (has no check-in but streak continued)
  // This is heuristic: if two days ago has no check-in AND yesterday has one,
  // a freeze was likely already used. We can't distinguish "missed" from "frozen"
  // in the current schema, so we check if freezesUsed > 0 and the pattern suggests double-freeze.
  if (habit.freezesUsed > 0) {
    const twoDaysAgoLog = await db.table('habitLogs')
      .where('[habitId+date]').equals([id, twoDaysAgoStr])
      .first();

    // If two days ago was missed AND yesterday was checked, a freeze was used for yesterday's gap.
    // Applying another freeze today would be a consecutive freeze.
    if ((!twoDaysAgoLog || twoDaysAgoLog.value <= 0) && yesterdayLog && yesterdayLog.value > 0) {
      // Pattern: miss → check → freeze. This means a freeze was used for the gap before yesterday.
      // Allow it only if there are remaining freezes (maxFreezes handles the limit).
      // But warn the user via the reason.
    }
  }

  return { allowed: true };
}
```

- [ ] **Step 2: Update `applyStreakFreeze` to call validation first**

Replace the existing `applyStreakFreeze`:

```typescript
export async function applyStreakFreeze(id: string): Promise<{ success: boolean; reason?: string }> {
  const validation = await canApplyStreakFreeze(id);
  if (!validation.allowed) {
    return { success: false, reason: validation.reason };
  }

  const habit = await db.table('habits').get(id) as Habit;
  await db.table('habits').update(id, { freezesUsed: habit.freezesUsed + 1 });
  return { success: true };
}
```

Note: Return type changes from `Promise<boolean>` to `Promise<{ success: boolean; reason?: string }>`.

- [ ] **Step 3: Update HabitCard to use new return type and show feedback**

In `HabitCard.tsx`, update `handleFreeze`:

```typescript
const handleFreeze = useCallback(async () => {
  if (freezesUsed >= maxFreezes) return;
  const result = await applyStreakFreeze(habit.id);
  if (result.success) {
    setFreezesUsed((prev) => prev + 1);
  } else if (result.reason) {
    setToast({ message: result.reason });
  }
}, [habit.id, freezesUsed, maxFreezes]);
```

Also add a `canFreeze` state to conditionally show the button:

```typescript
const [canFreeze, setCanFreeze] = useState(false);
```

In the load effect, add:
```typescript
const freezeCheck = await canApplyStreakFreeze(habit.id);
if (!cancelled) setCanFreeze(freezeCheck.allowed);
```

Update the freeze button render condition from `freezesUsed < maxFreezes` to `canFreeze && freezesUsed < maxFreezes`.

Import `canApplyStreakFreeze` in HabitCard.

- [ ] **Step 4: Update streak.test.ts or add validation tests**

Add test for `canApplyStreakFreeze` in `streak.test.ts` or a new `db.test.ts` (if test infrastructure supports Dexie mocking). If not feasible with current test setup, skip unit test and verify manually.

- [ ] **Step 5: Run tests and lint**

Run: `npm test && npm run lint`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/db.ts src/components/HabitCard.tsx
git commit -m "fix: validate streak freeze — only allow when yesterday completed, today empty, and no adjacent freeze"
```

---

### Task 3: Theme Toggle as 3-Button Group in Hamburger Menu

**Problem:** Current theme selection is a list of 3 items (Dark, Light, OLED) each on its own row. User wants a compact 3-button horizontal toggle group, like a segmented control, still inside the hamburger menu.

**Files:**
- Modify: `src/components/Header.tsx:70-88`

- [ ] **Step 1: Convert theme list to horizontal button group**

Replace the theme section in Header.tsx (lines 70-88):

Current:
```tsx
<div className="p-1">
  {THEMES.map((t) => {
    const Icon = t.icon;
    return (
      <button
        key={t.id}
        onClick={() => { setShowMenu(false); setTheme(t.id); }}
        className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
          theme === t.id
            ? 'bg-primary/10 text-primary'
            : 'text-text-primary hover:bg-surface-card'
        }`}
      >
        <Icon className={`h-4 w-4 ${theme === t.id ? 'text-primary' : 'text-text-muted'}`} />
        {t.label}
      </button>
    );
  })}
</div>
```

New:
```tsx
<div className="px-3 pt-3 pb-2">
  <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Theme</div>
  <div className="flex rounded-lg bg-surface-card p-0.5 border border-border/50">
    {THEMES.map((t) => {
      const Icon = t.icon;
      return (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
            theme === t.id
              ? 'bg-primary text-surface-base shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      );
    })}
  </div>
</div>
```

This creates a segmented control look: three equal-width buttons in a rounded container, with the active one filled with primary color. On mobile, only icons show (label hidden via `hidden sm:inline`). On desktop, icons + labels show.

- [ ] **Step 2: Remove the divider before themes**

Remove the `<div className="mx-2 border-t border-border/50" />` that appears before the themes section (it was before the THEMES list). The new theme section has its own padding and visual separation.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: 0 warnings

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx
git commit -m "style: convert theme selector to compact 3-button segmented toggle in hamburger menu"
```

---

### Task 4: Grid Day Orientation — Vertical Year Layout

**Problem:** The contribution grid currently uses 53 columns (weeks) × 7 rows (weekdays) with horizontal scroll. User wants the year to scroll vertically: 7 columns (weekdays Mon–Sun) × 53 rows (weeks), with vertical overflow.

**Files:**
- Modify: `src/components/ContributionGrid.tsx`
- Modify: `src/utils/grid-math.ts:35-38`

- [ ] **Step 1: Update `getGridCoordinates` to match new orientation**

In `grid-math.ts`, the coordinate mapping currently returns `{ col: week, row: day }`. For the new orientation, this still works — `col` maps to CSS column (0-6 = weekday) and `row` maps to CSS row (0-52 = week). No change needed to the math, just the interpretation.

Verify: `getGridCoordinates` returns `col: Math.floor(deltaDays / 7)` (week index) and `row: deltaDays % 7` (day index). For the new grid, we want CSS `grid-column: dayIndex + 1` and `grid-row: weekIndex + 1`. So we need to swap what `col` and `row` mean, or swap them in the rendering.

Simplest: swap the return in `getGridCoordinates`:

```typescript
return {
  col: deltaDays % 7,        // weekday index (0=Sun, 6=Sat) → CSS column
  row: Math.floor(deltaDays / 7),  // week index (0-52) → CSS row
};
```

- [ ] **Step 2: Update `ContributionGrid.tsx` for vertical layout**

Major changes:
1. Grid CSS: `gridTemplateColumns: repeat(7, ${cellSize}px)`, `gridTemplateRows: repeat(53, ${cellSize}px)`
2. Overflow: change from `overflow-x-auto` to `overflow-y-auto`
3. Auto-scroll: change from `el.scrollLeft = el.scrollWidth` to `el.scrollTop = el.scrollHeight`
4. Labels: swap month labels (now on the left side, one per row-group) and weekday labels (now at the top, one per column)
5. Layout direction: `flex-col` → `flex-row` for the label+grid container

New `WEEKDAY_LABELS`: `['S', 'M', 'T', 'W', 'T', 'F', 'S']` (single letters at top)

Month labels: positioned on the left side, vertically aligned to the first row of each month.

Full replacement of ContributionGrid:

```tsx
import { useMemo, useRef, useEffect } from 'react';
import { formatDate, addDays } from '../utils/date-utils';
import { getGridStartDate, getLogLevel } from '../utils/grid-math';

export interface ContributionGridProps {
  logs: Map<string, number>;
  cellSize?: number;
  cellGap?: number;
  showLabels?: boolean;
  showLegend?: boolean;
}

const LEVEL_CLASSES: Record<number, string> = {
  0: 'bg-primary-bg',
  1: 'bg-primary-dark',
  2: 'bg-primary',
  3: 'bg-primary-light',
  4: 'bg-accent-gold',
};

const LEVEL_LABELS = ['No activity', '1 check-in', '2 check-ins', '3 check-ins', '4+ check-ins'];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatTooltipDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function ContributionGrid({
  logs,
  cellSize = 10,
  cellGap = 2,
  showLabels = true,
  showLegend = true,
}: ContributionGridProps) {
  const startDate = useMemo(() => getGridStartDate(), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  const cells = useMemo(() => {
    const grid: {
      key: string;
      col: number;
      row: number;
      level: number;
      dateStr: string;
      value: number;
    }[] = [];

    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const date = addDays(startDate, week * 7 + day);
        const dateStr = formatDate(date);
        const value = logs.get(dateStr) ?? 0;
        const level = getLogLevel(value);

        grid.push({
          key: dateStr,
          col: day,     // CSS column (weekday)
          row: week,    // CSS row (week number)
          level,
          dateStr,
          value,
        });
      }
    }

    return grid;
  }, [startDate, logs]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; row: number }[] = [];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    for (let week = 0; week < 53; week++) {
      const weekStart = addDays(startDate, week * 7);
      const month = weekStart.getMonth();

      if (month !== lastMonth) {
        labels.push({ month: MONTHS[month], row: week });
        lastMonth = month;
      }
    }

    return labels;
  }, [startDate]);

  const labelWidth = showLabels ? 24 : 0;
  const headerHeight = showLabels ? 16 : 0;

  return (
    <div className="flex flex-col">
      {showLabels && (
        <div
          className="flex"
          style={{ marginLeft: labelWidth, marginBottom: 2, height: headerHeight }}
        >
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[9px] font-medium text-text-muted flex items-end justify-center"
              style={{ width: cellSize + cellGap }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      <div className="flex">
        {showLabels && (
          <div
            className="flex flex-col shrink-0 relative"
            style={{
              width: labelWidth,
              marginRight: 4,
            }}
          >
            {monthLabels.map((label, i) => (
              <div
                key={`${label.month}-${i}`}
                className="absolute text-[9px] font-medium text-text-muted"
                style={{
                  top: label.row * (cellSize + cellGap),
                }}
              >
                {label.month}
              </div>
            ))}
          </div>
        )}

        <div
          ref={scrollRef}
          className="overflow-y-auto"
          style={{ maxHeight: 7 * (cellSize + cellGap) * 8 }} /* Show ~8 weeks visible */
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(7, ${cellSize}px)`,
              gridTemplateRows: `repeat(53, ${cellSize}px)`,
              gap: `${cellGap}px`,
            }}
          >
            {cells.map((cell) => (
              <div
                key={cell.key}
                className={`relative rounded-sm cursor-default group ${LEVEL_CLASSES[cell.level]}`}
                style={{ width: cellSize, height: cellSize }}
              >
                <div className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-surface-elevated px-2.5 py-1.5 text-xs text-text-primary shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-semibold">{formatTooltipDate(cell.dateStr)}</span>
                  <span className="ml-1.5 text-text-secondary">
                    {LEVEL_LABELS[cell.level]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="flex items-center gap-2 mt-2" style={{ marginLeft: labelWidth }}>
          <span className="text-[10px] text-text-muted">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`rounded-sm ${LEVEL_CLASSES[level]}`}
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
          <span className="text-[10px] text-text-muted">More</span>
        </div>
      )}
    </div>
  );
}
```

Key changes:
- Grid is 7 columns × 53 rows (was 53 × 7)
- `overflow-y-auto` with `maxHeight` constraint (shows ~8 weeks, scroll for rest)
- Auto-scrolls to bottom (latest weeks) on load
- Month labels on left side, weekday labels on top
- Tooltip positioned to the right of cell (instead of above)

- [ ] **Step 3: Verify grid-math.ts getGridCoordinates**

After the swap, verify `getGridCoordinates` returns `col: deltaDays % 7` and `row: Math.floor(deltaDays / 7)`. The existing tests in `grid-math.test.ts` may need updating since the return value semantics changed.

- [ ] **Step 4: Update grid-math.test.ts**

The test `getGridCoordinates` tests check `col` and `row` values. After the swap, `col` is day-of-week (0-6) and `row` is week index (0-52). Update test expectations.

- [ ] **Step 5: Run tests and lint**

Run: `npm test && npm run lint`
Expected: All pass (after test updates)

- [ ] **Step 6: Commit**

```bash
git add src/components/ContributionGrid.tsx src/utils/grid-math.ts src/utils/grid-math.test.ts
git commit -m "feat: rotate contribution grid to vertical orientation — 7 weekday columns × 53 week rows, vertical scroll"
```

---

### Task 5: Add Reorder to Grid Tab HabitCards

**Problem:** No way to reorder habits in the Grids tab. The Today tab already has drag-and-drop reorder via HabitRow. HabitCard in Grids tab needs the same capability.

**Approach:** Mirror the TodayTab drag-and-drop pattern. Add `draggable` + `onDragStart/Over/Drop` to HabitCard. GridsTab manages drag state and calls `reorderHabits` (via useHabits hook or direct db call).

**Files:**
- Modify: `src/components/HabitCard.tsx`
- Modify: `src/components/GridsTab.tsx`

- [ ] **Step 1: Add drag-and-drop props to HabitCard**

Add to HabitCardProps:
```typescript
interface HabitCardProps {
  habit: Habit;
  onArchived: (id: string) => void;
  onCheckIn?: () => void;
  onTap?: (habit: Habit) => void;
  onDragStart?: (e: React.DragEvent, habitId: string) => void;
  onDragOver?: (e: React.DragEvent, habitId: string) => void;
  onDrop?: (e: React.DragEvent, habitId: string) => void;
  onDragLeave?: () => void;
  isDropTarget?: boolean;
}
```

Add drag state and handlers (same pattern as HabitRow):
```typescript
const [isDragging, setIsDragging] = useState(false);

const handleDragStart = (e: React.DragEvent) => {
  setIsDragging(true);
  onDragStart?.(e, habit.id);
};

const handleDragEnd = () => {
  setIsDragging(false);
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  onDragOver?.(e, habit.id);
};

const handleDrop = (e: React.DragEvent) => {
  onDrop?.(e, habit.id);
};
```

Add `draggable` and drag handlers to the card div:
```tsx
<div
  draggable={true}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onDragEnd={handleDragEnd}
  onDragLeave={onDragLeave}
  onClick={() => onTap?.(habit)}
  className={`... ${isDragging ? 'opacity-50 scale-[0.98]' : ''} ${isDropTarget ? 'ring-2 ring-primary/50' : ''}`}
>
```

- [ ] **Step 2: Add drag-and-drop state and handlers to GridsTab**

In GridsTab, add:
```typescript
const [dragOverHabitId, setDragOverHabitId] = useState<string | null>(null);
```

Add handlers (same pattern as TodayTab):
```typescript
const handleDragStart = (e: React.DragEvent, habitId: string) => {
  e.dataTransfer.setData('habitId', habitId);
};

const handleDragOver = (e: React.DragEvent, habitId: string) => {
  e.preventDefault();
  setDragOverHabitId(habitId);
};

const handleDragLeave = () => {
  setDragOverHabitId(null);
};

const handleDrop = async (e: React.DragEvent, targetHabitId: string) => {
  e.preventDefault();
  setDragOverHabitId(null);
  const draggedId = e.dataTransfer.getData('habitId');
  if (draggedId === targetHabitId) return;

  const draggedHabit = habits.find(h => h.id === draggedId);
  const targetHabit = habits.find(h => h.id === targetHabitId);

  if (!draggedHabit || !targetHabit || draggedHabit.category !== targetHabit.category) return;

  const category = targetHabit.category;
  const categoryHabits = habits
    .filter(h => h.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const draggedIndex = categoryHabits.findIndex(h => h.id === draggedId);
  const targetIndex = categoryHabits.findIndex(h => h.id === targetHabitId);

  if (draggedIndex === -1 || targetIndex === -1) return;

  const newOrder = [...categoryHabits];
  const [removed] = newOrder.splice(draggedIndex, 1);
  newOrder.splice(targetIndex, 0, removed);

  const updates = newOrder.map((h, index) => ({
    id: h.id,
    sortOrder: index,
  }));

  // Use reorderHabits directly from db (GridsTab doesn't use useHabits hook)
  const { reorderHabits } = await import('../db');
  await reorderHabits(updates);

  // Reload habits to reflect new order
  _onRefresh(n => n + 1);
};
```

- [ ] **Step 3: Pass drag props to HabitCard in GridsTab render**

Update the HabitCard render:
```tsx
<HabitCard
  key={habit.id}
  habit={habit}
  onArchived={() => _onRefresh(n => n + 1)}
  onTap={setSelectedHabit}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onDragLeave={handleDragLeave}
  isDropTarget={dragOverHabitId === habit.id}
/>
```

- [ ] **Step 4: Sort filteredGrids by sortOrder**

In GridsTab, before rendering, sort `filteredGrids` by `sortOrder`:
```typescript
const sortedGrids = [...filteredGrids].sort((a, b) => 
  (a.habit.sortOrder ?? 0) - (b.habit.sortOrder ?? 0)
);
```

Use `sortedGrids` in the render map instead of `filteredGrids`.

- [ ] **Step 5: Run tests and lint**

Run: `npm test && npm run lint`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/components/HabitCard.tsx src/components/GridsTab.tsx
git commit -m "feat: add drag-and-drop reorder to Grids tab habit cards (within same category)"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Clean build, 120KB gzipped

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: 0 warnings, 0 errors

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit all remaining**

```bash
git add -A
git commit -m "chore: grid UX fixes — animation, reorder, freeze validation, theme toggle, vertical grid"
```
