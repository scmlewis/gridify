# Task 2 (HabitCard Interactions) Fix Report

**Date:** 2026-07-03
**Commit:** 94b1798

## Issues Fixed

### Issue 1: Ripple is not click-triggered

**Root Cause:** The `animate-ripple` span was conditionally rendered (`{todayChecked && ...}`), making it a static visual indicator that only appeared when checked, rather than a click-triggered animation.

**Fix:**
- Added `rippleKey` state (`useState(0)`) at line 48
- Added `setRippleKey(prev => prev + 1)` in the button's `onClick` handler before `toggleToday()` (line 199)
- Replaced conditional render with always-present `<span key={rippleKey}>` (line 210)

The `key` change forces React to remount the span on each click, replaying the `animate-ripple` animation.

### Issue 2: Streak animation placement

**Root Cause:** The `newStreak`/`setStreakAnimating` block (lines 155-159) was outside the `try` block, meaning it ran even if the DB write failed.

**Fix:**
- Moved the streak animation block inside the `try` block, right after the DB write succeeds (lines 150-153)
- Removed the duplicate `const newStreak = calculateStreak(updatedLogs)` declaration (already computed at line 99)

## Verification

- **TypeScript:** `npx tsc --noEmit` — 0 errors
- **Tests:** `npx vitest run` — 89/89 passed (7 test files)
