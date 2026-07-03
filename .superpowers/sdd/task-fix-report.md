# Fix Report — Final Review Issues

## Status: DONE

## Commit

- `60b907e` — fix: critical + important issues from final review

## Fixes Applied

1. **Critical: sheet-open stagger for 7th+ children** — `src/index.css`
   Added `.sheet-open > *:nth-child(n+7)` fallback rule so children beyond 6 remain visible after stagger.

2. **Important 1: Reorder transition on HabitRow** — `src/components/HabitRow.tsx`
   Added explicit `transition: 'transform 250ms var(--ease-spring), box-shadow 200ms ease, opacity 200ms ease'` to the wrapper div style, overriding Tailwind's generic `transition-all`.

3. **Important 2: Ripple only on check-in** — `src/components/HabitCard.tsx`
   Guarded `setRippleKey` with `if (!todayChecked)` so the ripple animation only fires on positive check-in, not uncheck.

4. **Important 3: Glow pulse replays on mount** — `src/components/HabitCard.tsx`
   Added `justChecked` state that only becomes true after a user-initiated check-in. `animate-glow-pulse` now applies only when `todayChecked && justChecked`, preventing replay on initial render.

## Test Results

```
✓ src/utils/csv.test.ts         (14 tests)
✓ src/utils/date-utils.test.ts  (13 tests)
✓ src/utils/insights.test.ts    (10 tests)
✓ src/utils/grid-math.test.ts   (21 tests)
✓ src/utils/analytics.test.ts   (10 tests)
✓ src/utils/streak.test.ts      (13 tests)
✓ src/utils/gamification.test.ts (8 tests)

Test Files  7 passed (7)
     Tests  89 passed (89)
```

TypeScript (`tsc --noEmit`): clean, no errors.

## Report File

`.superpowers/sdd/task-fix-report.md`
