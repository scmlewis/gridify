# Progressive Simplicity Redesign - Implementation Plan

> For agentic workers: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Gridify into a retention-focused, data-rich, personalized habit tracker with two-tab UI, categories, numeric tracking, weekly goals, and analytics.

**Architecture:** Two-tab navigation (Today + Grids) with bottom sheet for habit details. Database schema extended for categories, numeric values, and weekly targets. All analytics computed locally.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Dexie.js 4, vite-plugin-pwa

## Global Constraints
- Offline-first, no external APIs
- PWA Lighthouse 90+, bundle under 200KB gzipped
- Target: Chrome 90+, Safari 15+, Firefox 90+
- Preserve existing themes and haptic feedback

## Phase 1: Foundation

### Task 1: Database Migration to v4
Files: Modify src/db.ts, src/types.ts
- Add fields: category, valueType, unit, targetFrequency, targetValue, color to Habit
- Add fields: onboardingCompleted, categories to UserProfile
- Version 4 schema with migration defaults
- New functions: updateHabit, getCategories, updateCategories, completeOnboarding
- Commit: feat: migrate database to v4

### Task 2: Tab Navigation Shell
Files: Create TabBar.tsx, TodayTab.tsx, GridsTab.tsx; Modify App.tsx
- Two-tab layout (Today + Grids)
- Placeholder content for each tab
- Commit: feat: add two-tab navigation shell

### Task 3: Summary Card
Files: Create SummaryCard.tsx; Modify TodayTab.tsx
- Progress dots (one per habit), best streak, weekly completion %
- Commit: feat: add SummaryCard

### Task 4: Empty State Component
Files: Create EmptyState.tsx
- Reusable component with icon, title, description, action
- Commit: feat: add EmptyState component

### Task 5: Category Groups
Files: Create CategoryGroup.tsx, HabitRow.tsx; Modify TodayTab.tsx
- Collapsible category headers with localStorage persistence
- Compact habit rows with colored left border
- Binary check-in toggle with optimistic updates
- Commit: feat: add category groups

### Task 6: Onboarding Flow
Files: Create OnboardingFlow.tsx; Modify TodayTab.tsx
- 3-step skippable onboarding: Welcome, Categories, First Habit
- Stores onboardingCompleted flag in UserProfile
- Commit: feat: add onboarding flow

### Task 7: Menu Integration
Files: Modify Header.tsx, App.tsx
- Menu with Weekly Review, Export CSV/JSON, Import CSV
- Move global grid to GridsTab
- Commit: feat: integrate menu

### Task 8: Grids Tab
Files: Modify GridsTab.tsx, Header.tsx
- Global activity grid + per-habit grids
- Category label and streak display
- Commit: feat: populate Grids tab

## Phase 2: Depth

### Task 9: Numeric Check-in
Files: Create NumericInput.tsx; Modify HabitRow.tsx, TodayTab.tsx, CategoryGroup.tsx
- Inline stepper with +/- buttons and value display
- Target display for numeric habits
- Commit: feat: add numeric check-in

### Task 10: Goal Setting
Files: Create AddHabitSheet.tsx, ColorPicker.tsx; Modify TodayTab.tsx
- Bottom sheet with name, category, value type, unit, weekly target, color
- 8 preset colors
- Commit: feat: add habit creation sheet

### Task 11: Habit Detail Sheet
Files: Create HabitDetailSheet.tsx, StatsCard.tsx, DayOfWeekHeatmap.tsx; Modify TodayTab.tsx, GridsTab.tsx
- Bottom sheet with grid, expanded stats, day-of-week heatmap
- Stats: streak, completion rate, weekly avg, total check-ins, best streak, trends, best/worst day
- Commit: feat: add Habit Detail Sheet

### Task 12: Category Filters
Files: Modify GridsTab.tsx
- Filter pills: All, Fitness, Mindfulness, etc.
- Commit: feat: add category filter pills

## Phase 3: Analytics

### Task 13: Trend Sparkline
Files: Create TrendSparkline.tsx; Modify HabitDetailSheet.tsx
- SVG line chart showing last 30 days
- Commit: feat: add trend sparkline

### Task 14: Analytics Utilities
Files: Create analytics.ts, insights.ts
- Streak calculation, completion rates, day-of-week stats
- Cross-habit correlations, monthly trends
- Commit: feat: add analytics utilities

### Task 15: Insights Panel
Files: Create InsightsPanel.tsx; Modify GridsTab.tsx
- Collapsible panel with 1-3 insights
- Commit: feat: add Insights Panel

### Task 16: New Achievements
Files: Modify gamification.ts
- 7 new: target-hacker, consistent-crusher, data-collector, data-master, multi-tracker, well-rounded, comeback-kid
- Commit: feat: add new achievements

### Task 17: Habit Colors in Grid Cards
Files: Modify HabitCard.tsx
- Apply habit.color to card left border
- Commit: feat: apply habit color

## Phase 4: Polish

### Task 18: Long-Press Reorder
Files: Modify CategoryGroup.tsx
- Basic drag state for reordering habits
- Commit: feat: add drag reorder

### Task 19: Performance Optimization
Files: Modify TodayTab.tsx, HabitRow.tsx
- useMemo for grouped habits, React.memo for HabitRow
- Commit: perf: add memoization

---

## Execution Options

**1. Subagent-Driven (recommended)** - Fresh subagent per task, review between tasks
**2. Inline Execution** - Execute in session with checkpoints

Which approach?