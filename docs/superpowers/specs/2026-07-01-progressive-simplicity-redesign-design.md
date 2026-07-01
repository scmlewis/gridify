# Design Spec: Progressive Simplicity Redesign

**Date:** 2026-07-01  
**Status:** Approved  
**Approach:** Progressive Simplicity — simple surface, power-user depth behind gestures

---

## 1. Overview

### Problem
Gridify currently offers a GitHub-contribution-grid-centric experience that's visually interesting but lacks daily workflow efficiency, analytics depth, and personalization. All habits are a flat list with binary check-ins — no categories, no numeric tracking, no goal-setting, and no trend analysis.

### Goal
Transform Gridify into a retention-focused, data-rich, personalized habit tracker that serves both casual users (simple checklist) and power users (deep analytics), while maintaining the offline-first PWA architecture.

### Target Audience
Multi-purpose: fitness, wellness, learning, productivity, and personal development.

### Key Metrics
- Daily active usage (retention)
- Average habits per user (engagement)
- Weekly completion rate (depth of tracking)

---

## 2. User Personas & JTBDs

### Sarah — Wellness Enthusiast (28)
- **JTBD:** "Help me track habits with qualitative outcomes — not just binary checkmarks."
- **Needs:** Numeric values (mood 1-10, glasses of water, minutes meditated), correlation insights.

### James — Software Engineer (32)
- **JTBD:** "Help me analyze my habit data to find patterns and make data-driven decisions."
- **Needs:** Trend charts, completion rates over time, best/worst days, month-over-month comparison.

### Mia — Busy Parent (35)
- **JTBD:** "Help me quickly check in on ALL my habits in 30 seconds."
- **Needs:** Daily batch view, progress bar, no scrolling through grids during daily check-in.

### Alex — Student (20)
- **JTBD:** "Help me stay motivated through visible progress and small wins."
- **Needs:** Today's progress bar, weekly targets, streak visibility.

### David — Fitness Coach (40)
- **JTBD:** "Help me group related habits and see how they interact."
- **Needs:** Categories, filtering, cross-habit insights.

### Priya — Self-Improvement Devotee (25)
- **JTBD:** "Help me restart without feeling like a failure."
- **Needs:** Streak recovery coaching, comeback patterns.

---

## 3. Data Model Changes

### Updated `Habit` Schema

```typescript
interface Habit {
  id: string;
  name: string;
  createdAt: string;
  archived: boolean;
  sortOrder: number;
  freezesUsed: number;
  maxFreezes: number;
  // NEW
  category: string;                    // User-defined category (e.g., "Fitness")
  valueType: 'binary' | 'numeric';     // Check-in type
  unit: string;                        // Unit label for numeric (e.g., "glasses")
  targetFrequency: number;             // Target check-ins per week (1-7)
  targetValue: number;                 // Optional: target numeric value per check-in
  color: string;                       // User-assigned accent color
}
```

### Updated `HabitLog` Schema
No changes needed — `value` field already supports numeric values (1 for binary, actual count for numeric).

### Updated `UserProfile` Schema
```typescript
interface UserProfile {
  id: string;
  xp: number;
  level: number;
  achievements: string[];
  createdAt: string;
  // NEW
  onboardingCompleted: boolean;        // Flag to skip onboarding
  categories: string[];                // User-defined category list
}
```

### Dexie Indexes
- Add index on `habits.category` for filtering

### Migration Strategy
- Version 4 of the database
- Existing habits get defaults: `category: 'Uncategorized'`, `valueType: 'binary'`, `unit: ''`, `targetFrequency: 7`, `targetValue: 1`, `color: '#2BA8A2'`
- Existing user profiles get defaults: `onboardingCompleted: false`, `categories: ['Fitness', 'Mindfulness', 'Learning', 'Productivity', 'Health']`

---

## 4. UI Architecture

### Navigation: Two-Tab Layout

```
┌─────────────────────────────────────┐
│  Gridify          [≡ menu]          │
├─────────────────────────────────────┤
│  [Today]    [Grids]                 │  ← Tab bar
├─────────────────────────────────────┤
│                                     │
│   (Tab content area)                │
│                                     │
└─────────────────────────────────────┘
```

**Tab 1: Today** (default)
- Summary card with progress indicator
- Category-grouped habit checklist
- FAB for adding habits

**Tab 2: Grids**
- Category filter pills
- Contribution grid per habit (existing layout, enhanced)

**Habit Detail Sheet**
- Bottom sheet opens from either tab
- Full analytics: grid, stats, trends, day-of-week heatmap

---

## 5. Today Tab Design

### Summary Card
```
┌──────────────────────────────────────┐
│  📅 Wed, Jul 1                       │
│                                      │
│  ●●●●○○○  4/7 done                   │  ← Segmented progress dots
│  🔥 Best streak: 12 days             │
│  📊 This week: 82% completion        │
└──────────────────────────────────────┘
```

- **Progress dots:** Each dot = one habit. Filled = done, empty = pending.
- **Tap summary card:** Expands to show category breakdown ("Fitness: 2/3, Mindfulness: 1/2")

### Category Groups
```
┌─ FITNESS ──────────────────────────┐
│  ✓ Morning Run              🔥 5d  │  ← Dimmed after check-in
│  ○ Gym Session                     │  ← Prominent, ready for action
│  ✓ Stretching               🔥 12d │
├─ MINDFULNESS ──────────────────────┤
│  ✓ Meditation                🔥 3d │
│  ○ Journaling                      │
├─ LEARNING ─────────────────────────┤
│  ○ Read 30 min                     │
│  ✓ Anki Review              🔥 8d  │
└────────────────────────────────────┘
```

### Interaction Patterns

**Binary check-in:**
- Tap checkbox → haptic feedback → habit dims, progress updates, streak recalculates
- Undo toast with 5-second window

**Numeric check-in:**
- Tap shows inline stepper: `[-] 3 of 8 glasses [+]`
- Direct tap on number opens numeric input
- Value persists as the check-in value

**Category collapse:**
- Tap category header to collapse/expand
- State persists in localStorage

**Reorder:**
- Long-press drag to reorder habits within or across categories

**Add habit:**
- FAB opens bottom sheet with: name, category (dropdown), value type (binary/numeric), unit (if numeric), weekly target, color picker

### Empty States

**No habits:**
```
┌──────────────────────────────────────┐
│       🌱 Start your first habit      │
│                                      │
│  Good habits compound over time.     │
│  Add your first habit to begin       │
│  tracking your progress.             │
│                                      │
│       [+ Add Habit]                  │
└──────────────────────────────────────┘
```

**All done today:**
```
┌──────────────────────────────────────┐
│       🎉 All done for today!         │
│                                      │
│  You completed all 5 habits.         │
│  Keep the momentum going —          │
│  check back tomorrow.                │
│                                      │
│  [View Grids →]                      │
└──────────────────────────────────────┘
```

---

## 6. Grids Tab Design

### Category Filter Pills
```
[All] [Fitness] [Mindfulness] [Learning]  ← Scrollable horizontal pills
```

- "All" is default
- Active pill highlighted with primary color
- Filters the habit grid list below

### Habit Grid Cards
Same as current layout — each card shows:
- Habit name + streak
- Full 53-week contribution grid
- Checkbox for today (same as Today tab — state syncs)

### "View Analytics" Entry Point
- Tap card body (not checkbox) → opens Habit Detail Bottom Sheet

---

## 7. Habit Detail Bottom Sheet

### Header
```
  Morning Run                🔥 5 day streak
  Fitness · 4x/week target  · ⬤ Green
```

### Grid + Trend
- Full 53-week contribution grid (existing component)
- Below it: 30-day trend sparkline (simple line chart, SVG-based)

### Expanded Stats Card
```
┌──────────────────────────────────────┐
│  📊 Stats                            │
│                                      │
│  CURRENT                             │
│  Current streak       5 days         │
│  Completion rate      72%            │
│  Weekly average       3.2 / 4 target │
│                                      │
│  ALL TIME                             │
│  Total check-ins      87             │
│  Best streak          23 days        │
│  Consistency score    68%            │
│                                      │
│  TRENDS                              │
│  This week            80%            │
│  Last week            65%            │
│  Change               ↑ 15%          │
│  Best day             Tuesday        │
│  Worst day            Sunday         │
└──────────────────────────────────────┘
```

### Day-of-Week Heatmap
```
Mon  ████████░░  80%
Tue  ██████████  100%
Wed  ███████░░░  70%
Thu  ██████░░░░  60%
Fri  ████████░░  80%
Sat  ████░░░░░░  40%
Sun  ███░░░░░░░  30%
```

### Edit/Delete Actions
- "Edit Habit" button → opens edit form (same as add form, pre-filled)
- "Archive Habit" button → soft-delete
- "Delete Habit" button → hard delete with confirmation dialog

---

## 8. Global Insights

Accessible from Grids tab header via "Insights" button.

```
┌──────────────────────────────────────┐
│  💡 Insights                         │
│                                      │
│  • You're 35% more consistent on     │
│    days you meditate                 │
│  • Your most productive day: Tuesday │
│  • You've improved 12% this month    │
│    vs last month                     │
└──────────────────────────────────────┘
```

### Computation Logic (all local, no API)
1. **Correlation:** For each habit pair, compare completion rates on days habit A was done vs not done
2. **Best day:** Aggregate completion counts by day-of-week across all habits
3. **Monthly trend:** Compare this month's total completion rate vs last month's

---

## 9. Goal Setting

### Per-Habit Configuration
- **Weekly target:** 1-7 times per week
- **Daily toggle:** Quick-set to 7x/week (daily)
- **Target value:** For numeric habits, optional target per check-in (e.g., 8 glasses)

### Weekly Target UI
In Today tab, each habit shows: `3/4 this week` badge.
When target met for the week: ✓ badge appears, habit can optionally be hidden (user toggle in settings).

### Summary Card Adaptation
- If any habits have weekly targets, the summary card shows "weekly progress" mode
- Progress dots reflect weekly completion, not just today

---

## 10. Onboarding (Skippable)

### Step 1: Welcome
```
┌──────────────────────────────────────┐
│         🎯 Welcome to Gridify        │
│                                      │
│  Build better habits with data.      │
│  Track, analyze, and improve.        │
│                                      │
│         [Get Started →]  [Skip]      │
└──────────────────────────────────────┘
```

### Step 2: Suggested Categories
```
[✓] Fitness
[✓] Mindfulness  
[ ] Learning
[ ] Productivity
[ ] Health
[✓] Custom...
```
User toggles categories. "Custom..." opens text input.

### Step 3: First Habit
```
What's one habit you want to build?
[Exercise daily          ]
Category: [Fitness ▼]
Track: (●) Yes/No  (○) Numeric
```

### Completion
- Store `onboardingCompleted: true` in UserProfile
- If skipped, set flag immediately and go to Today tab
- Onboarding only shows once

---

## 11. Gamification Updates

### New Achievements

| ID | Name | Description | XP |
|----|------|-------------|-----|
| `target-hacker` | Target Hacker | Hit weekly target for the first time | 100 |
| `consistent-crusher` | Consistent Crusher | Hit all weekly targets for 4 consecutive weeks | 500 |
| `data-collector` | Data Collector | Log 100 numeric entries | 150 |
| `data-master` | Data Master | Log 500 numeric entries | 400 |
| `multi-tracker` | Multi-Tracker | Track habits in 3+ categories | 100 |
| `well-rounded` | Well-Rounded | Check in all categories in one day | 200 |
| `comeback-kid` | Comeback Kid | Return after 3+ day gap and reach 7-day streak | 250 |

### Existing Achievements
No changes to existing achievement logic.

### Level System
No changes — XP thresholds remain the same.

---

## 12. Visual Design

### Color Palette
No changes to existing theme — keep dark/light/OLED modes.

### Habit Colors
- Each habit gets a configurable accent color
- Default: primary (#2BA8A2)
- Used for: left border on cards, colored dot next to name, progress indicators
- Color picker: simple palette of 8-10 preset colors

### Typography
No changes — keep existing font stack.

### Spacing & Layout
- Today tab: tighter spacing, more compact cards (less padding than current HabitCard)
- Grids tab: same as current
- Bottom sheet: standard 8px rounded corners, drag handle

---

## 13. Technical Constraints

- **Offline-first:** All new features must work without internet
- **No external APIs:** All analytics computed from local IndexedDB data
- **PWA:** Maintain Lighthouse PWA score
- **Performance:** Charts/sparklines rendered via SVG (no chart library dependency)
- **Bundle size:** Keep under 200KB gzipped (currently ~150KB)
- **Compatibility:** Target modern browsers (Chrome 90+, Safari 15+, Firefox 90+)

---

## 14. Implementation Priority

### Phase 1: Foundation (Must-have)
1. Database migration (v4) with new fields + defaults
2. Two-tab navigation layout
3. Today tab with summary card + category grouping
4. Binary check-in flow (existing logic, new UI)
5. Onboarding (skippable)

### Phase 2: Depth (Should-have)
6. Numeric check-in with inline stepper
7. Goal setting per habit (weekly targets)
8. Habit Detail Bottom Sheet with stats
9. Day-of-week heatmap
10. Category filter pills on Grids tab

### Phase 3: Analytics (Nice-to-have)
11. Trend sparkline (30-day)
12. Global Insights panel
13. New achievements (7 new)
14. Habit color customization

### Phase 4: Polish
15. Empty state designs
16. Long-press reorder
17. Category collapse persistence
18. Performance optimization for large datasets

---

## 15. Success Criteria

- User can check in on all habits in under 30 seconds from opening the app
- User can see today's completion progress at a glance
- User can view per-habit stats (streak, completion rate, trends)
- User can set weekly frequency targets
- User can organize habits by category
- User can view cross-habit insights
- All features work offline
- PWA Lighthouse score remains 90+
- Bundle size stays under 200KB gzipped
