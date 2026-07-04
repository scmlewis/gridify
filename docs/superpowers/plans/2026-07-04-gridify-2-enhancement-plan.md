# Gridify 2.0 — Enhancement Plan

**Date:** 2026-07-04
**Based on:** Gridify 2.0 Enhancement Roadmap + Codebase audit

---

## Product Philosophy

Transform Gridify from *"A habit tracker"* into *"A personal consistency dashboard."*

The contribution graph should remain the hero of the application. Everything else should support understanding the graph rather than distracting from it.

Every enhancement must improve one of: **insight** | **speed** | **simplicity** | **visual clarity** | **consistency awareness**. If a proposed feature does not clearly improve one of those five areas, reject it.

**Core principles:** Offline-first, extremely fast, one-tap interaction, high information density, analytics over gamification, minimal cognitive load, no unnecessary configuration.

---

## Completed (Do Not Rebuild)

- Onboarding (3-step wizard, skippable, categories + first habit)
- Streak metrics (current, best, completion %, weekly avg, total, trend, best/worst day)
- Day-of-week heatmap (per-day percentage bars)
- Trend sparkline (30-day SVG line chart)
- Bar charts (week/month toggle, per-habit breakdown)
- Plain-language insights (correlation, trend, pattern)
- Cross-habit correlations (Jaccard similarity)
- Haptic feedback (navigator.vibrate)
- Confetti + milestones + toasts + undo
- 3 themes (dark/light/OLED)
- Icons for habits (emoji picker)
- Numeric habits + inline stepper
- Goal setting (weekly targets)

---

## Prioritized Backlog

### P0 — Observations Engine

Deterministic plain-language statements from existing data. Most insight per line of code.

All data already computed in `analytics.ts` / `insights.ts` / `streak.ts`:
- `calculateDayOfWeekStats()` → Record<day, count>
- `getMonthlyTrends()` → Record<month, total>
- `calculateCompletionRate()` → percentage
- `calculateStreak()` → current streak
- `calculateMomentum()` → X of last Y
- `getCrossHabitCorrelations()` → habit pairs + similarity

Generate statements like:
- "You completed this habit on 82% of Tuesdays"
- "Your strongest period is mornings — you tend to miss Sundays"
- "Exercise consistency improves after meditation"
- "This month is 18% better than last month"
- "July was your best month (24/31 days)"

**Files:** New `src/utils/observations.ts`, New `src/components/ObservationCard.tsx`, modify `src/components/AnalyticsTab.tsx`

---

### P0 — Momentum Score Labels

Map existing `calculateMomentum()` output to clear labels:

| Range | Label |
|-------|-------|
| ≥90% | Excellent |
| ≥70% | Good |
| ≥40% | Recovering |
| <40% | Needs Attention |

**Files:** Modify `src/utils/streak.ts` (add `getMomentumLabel()`), modify `src/components/StatsCard.tsx`

---

### P1 — Empty State Refactor (Consistency & Polish)

Current state is inconsistent across 3 views:
- `EmptyState.tsx` — reusable, accepts emoji strings as icon
- `TodayTab.tsx` — inline empty state with emoji `🎯`, does NOT use EmptyState component
- `GridsTab.tsx` — uses EmptyState with emoji `📊`
- `AnalyticsTab.tsx` — uses EmptyState with emoji `📊`

Changes:
1. Refactor `EmptyState` to accept a `lucide-react` icon component instead of emoji string
2. Replace TodayTab's inline empty state with unified EmptyState component
3. Pick appropriate lucide icons per context: `Target`, `Calendar`, `BarChart3`
4. Add subtle decorative SVG element behind icon for premium feel
5. Add "done for today" state when all habits checked in

**Files:** Modify `src/components/EmptyState.tsx`, `src/components/TodayTab.tsx`, `src/components/GridsTab.tsx`, `src/components/AnalyticsTab.tsx`

---

### P1 — Contribution Graph Explainers

- **Onboarding:** Add one sentence: "Each square is one day. Over time, this graph becomes a visual record of your entire year."
- **First check-in animation:** Glow pulse on graph square + tooltip: "Your first square! They add up."
- **All-green-week celebration:** Toast when 7 consecutive days completed: "First full week — nice."

**Files:** Modify `src/components/OnboardingFlow.tsx`, `src/components/HabitCard.tsx`

---

### P1 — Completion Distribution Visualization

Compact bar showing what % of days fall into each intensity bucket (0, 1, 2, 3, 4+). Uses existing `getLogLevel()`.

**Files:** New `src/components/CompletionDistribution.tsx`, modify `src/components/HabitDetailSheet.tsx`

---

### P1 — Plain-Language Trend Detection

Enhance InsightsPanel with more specific patterns:
- "You tend to skip [habit] on [day]" (best/worst day exists)
- "Your most consistent stretch was [date range] with [X] days"
- "[Habit] completion rate up/down [X]% this month"

**Files:** Modify `src/components/InsightsPanel.tsx`, `src/utils/insights.ts`

---

### P2 — Year-Over-Year Comparison

Compact overlay comparing current year's grid to previous year's. Toggle or split view.

**Files:** New `src/utils/year-comparison.ts`, modify `src/components/ContributionGrid.tsx`

---

### P2 — Heatmap Palette Customization

4-5 color scheme presets: Teal→Gold (current), Blue→Purple, Green→Teal, Monochrome, Warm.

**Files:** New `src/components/PalettePicker.tsx`, modify `src/components/ContributionGrid.tsx`, `src/components/HabitDetailSheet.tsx`

---

### P2 — Streak Timeline

Visual bar showing streak periods (green) and breaks (red dots).

**Files:** New `src/components/StreakTimeline.tsx`, modify `src/components/HabitDetailSheet.tsx`

---

### P3 — Performance Audit

Lighthouse >95, React.memo on heavy lists, IndexedDB read profiling, bundle visualizer, reduced-motion audit.

---

### P3 — Product Identity

Tagline in header, PWA manifest update, grid-square favicon.

**Files:** Modify `src/components/Header.tsx`, `vite.config.ts`

---

## Non-Goals

No social features, cloud accounts, chat, AI assistant, backend reminders, achievements for achievements' sake, complex projects, task management, Pomodoro, notes, journals, or calendar replacing the graph.
