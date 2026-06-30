# Phase 2: Matrix Mathematical Engine & Grid Component

## Task Description

Write the `<ContributionGrid />` React Component in Tailwind CSS. Compute the continuous calendar grid of 53 columns representing weeks, mapping individual date tiles using the exact local timestamp offset mathematical conversion formula from Section 3. Use standard CSS tooltips on cell hover.

## Grid Matrix Calculations

Let **D_start** be the exact date of Sunday of the week occurring exactly 52 weeks prior to the current week's Sunday.

Let **D_log** be the date of any recorded habit completion.

To compute the zero-indexed coordinate position **(C, R)** where **C** is the column index (0 to 52) and **R** is the row index (0 to 6 representing Sunday to Saturday):

1. Convert both dates to standard local midnight timestamps (eliminating hour/minute time shift errors).
2. Calculate the raw elapsed day delta **N**:
   ```
   N = (T_log - T_start) / (86400 × 1000)
   ```
   (where T represents the absolute Unix timestamp in milliseconds)

3. Compute column index **C**:
   ```
   C = floor(N / 7)
   ```

4. Compute row index **R**:
   ```
   R = N mod 7
   ```

## Color Gradient Scaling

Let **V_day** be the sum of log values on a specific calendar day *d*. The cell intensity level **L** (ranging 0 to 4) is mapped dynamically:

| Condition | Level |
|---|---|
| V_day = 0 | 0 |
| 0 < V_day ≤ q₁ | 1 |
| q₁ < V_day ≤ q₂ | 2 |
| q₂ < V_day ≤ q₃ | 3 |
| V_day > q₃ | 4 |

For now, use fixed thresholds: q₁=1, q₂=2, q₃=3. Dynamic quartiles can be added later.

## Component Interface

```tsx
interface ContributionGridProps {
  logs: Map<string, number>; // key: date string (YYYY-MM-DD), value: total value for that day
  cellSize?: number;         // optional, default 12px
  cellGap?: number;          // optional, default 2px
}
```

## File Structure Expected

```
src/
├── components/
│   └── ContributionGrid.tsx  # The grid component
├── utils/
│   └── grid-math.ts          # Pure functions for grid coordinate computation
│   └── date-utils.ts         # Date helper functions (getStartOfWeek, formatDate, etc.)
├── db.ts                     # Already exists (Phase 1)
├── types.ts                  # Already exists (Phase 1)
```

## Requirements

1. **grid-math.ts** — Pure functions:
   - `getGridStartDate(): Date` — Returns the Sunday of the week 52 weeks ago
   - `getGridCoordinates(dateStr: string, startDate: Date): { col: number; row: number }` — Maps a date string to grid position
   - `getLogLevel(value: number): number` — Maps a day's total value to 0-4 intensity level

2. **date-utils.ts** — Pure functions:
   - `formatDate(date: Date): string` — Returns YYYY-MM-DD format
   - `parseDate(dateStr: string): Date` — Parses YYYY-MM-DD to local midnight Date
   - `getSunday(date: Date): Date` — Gets the Sunday of the given week
   - `addDays(date: Date, days: number): Date` — Adds days to a date

3. **ContributionGrid.tsx** — React component:
   - Renders a 7×53 grid of cells using CSS Grid
   - Each cell is a small colored square representing one day
   - Color intensity based on log value (0=gray, 1-4=increasing green shades or similar)
   - Standard CSS tooltip on hover showing date and value
   - Responsive: cells should be small enough to fit 53 columns on screen
   - Uses dark theme appropriate colors (bg-gray-800 for empty, shades of green/emerald for filled)

## Styling

- Dark mode appropriate (background: dark gray, cells: gray shades)
- Cell colors: 
  - Level 0: `bg-gray-800` (no data)
  - Level 1: `bg-emerald-900`
  - Level 2: `bg-emerald-700`
  - Level 3: `bg-emerald-500`
  - Level 4: `bg-emerald-300`
- Tooltip: Standard CSS `:hover` pseudo-element with `::after` content
- Grid layout: CSS Grid with appropriate gap

## Context

This phase builds on Phase 1 (database layer). The component will be consumed by Phase 3 (dashboard). The grid math functions must be pure and testable. The component accepts a pre-computed Map of daily totals, keeping data fetching concerns separate.
