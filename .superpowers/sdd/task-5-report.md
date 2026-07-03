# Task 5: Drag & Drop Polish — Report

**Status:** DONE

## Commit

- `80d8102` — feat: drag & drop polish — ghost lift, drop zone pulse, reorder transition

## Changes

- `src/index.css` — added `.dragging` (ghost lift with scale, shadow, opacity) and `.drop-target` (dashed border + pulse animation) CSS classes
- `src/components/HabitRow.tsx` — added `isDragging` state, `handleDragEnd` handler, `isDropTarget`/`onDragLeave` props, applied `dragging`/`drop-target` classes conditionally
- `src/components/TodayTab.tsx` — added `dragOverHabitId` state, `handleDragLeave` handler, updated `handleDragOver` to accept `habitId`, passed new props to `CategoryGroup`
- `src/components/CategoryGroup.tsx` — added `dragOverHabitId`/`onDragLeave` props, forwarded `isDropTarget` and `onDragLeave` to each `HabitRow`

## Test Summary

- TypeScript: clean (no errors)
- Vitest: 89 tests passed across 7 test files
