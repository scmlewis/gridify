# Gridify

A high-density, offline-first Progressive Web App for habit tracking with a GitHub-style contribution grid, deep analytics, and rich gamification.

**Live Demo:** https://scmlewis.github.io/gridify/

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Dexie.js](https://img.shields.io/badge/Dexie.js-4-018EFF?logo=javascript&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)
![OxLint](https://img.shields.io/badge/OxLint-Linting-FA9D3E?logo=rust&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)

</div>

---

## Features

### Core
- **3-Tab Navigation** — Today, Grids, and Analytics tabs for focused workflows
- **Contribution Grid** — 53-week heatmap showing daily habit completion intensity
- **One-Tap Check-in** — Toggle habits with haptic feedback on mobile
- **Boolean & Numeric Habits** — Track yes/no habits or numeric values with units and weekly targets
- **Offline-First** — Works completely without internet via IndexedDB (Dexie.js)
- **PWA** — Installable on any device with service worker caching

### Today Tab
- **WeekStrip** — Mon–Sun strip showing check-in status at a glance
- **ProgressHeroCard** — Circular progress ring with level badge
- **Categorized Habits** — Habits grouped by category with collapsible sections
- **Drag-and-Drop Reorder** — Rearrange habits within categories
- **Quick Add** — Bottom sheet with icon picker, color picker, habit type, and category selection

### Grids Tab
- **Global Contribution Grid** — Overview of all habits combined
- **Per-Habit Grids** — Individual heatmaps for each habit
- **Category Filtering** — Filter grids by category

### Analytics Tab
- **Bar Charts** — Week and month breakdowns with per-habit breakdown
- **Insights Panel** — Cross-habit correlations, monthly trends, and pattern detection
- **Observations** — Automated insights (best day, momentum, streaks, correlations)

### Habit Detail
- **Detail Sheet** — Full bottom sheet with grid, trend sparkline, streak timeline, stats, and more
- **30-Day Trend Sparkline** — SVG line chart with area fill
- **Streak Timeline** — Visual timeline of past streaks
- **Day-of-Week Heatmap** — Horizontal bar chart showing activity by day
- **Completion Distribution** — Stacked bar showing activity levels
- **Year-over-Year Comparison** — Compare current year vs previous year
- **6-Stat Card** — Streak, best streak, completion rate, weekly avg, total check-ins, trend

### Streaks & Resilience
- **Grace Period** — 1 missed day allowed without breaking streaks
- **Streak Freeze** — 2 freeze days per habit to protect progress
- **Momentum Framing** — "X of last 14 days" instead of "streak broken"
- **Milestone Celebrations** — Confetti at 7, 14, 21, 30, 50, 66, 100, 150, 200, 365 days

### Gamification
- **XP System** — Earn XP for check-ins with streak multipliers
- **26 Achievements** — "First Steps", "Week Warrior", "Centurion", "Momentum Master", and more
- **Level Progression** — 15 levels with increasing XP thresholds

### Categories
- **Category System** — Organize habits with custom categories
- **Default Categories** — Fitness, Mindfulness, Learning, Productivity, Health
- **Full CRUD** — Create, edit, and delete categories with custom colors and icons
- **Collapsible Groups** — Expand/collapse categories (state persisted in localStorage)

### Customization
- **3 Themes** — Dark, Light, and OLED modes
- **Custom Icons** — Searchable emoji picker with 37 icons
- **Custom Colors** — 12-color preset picker for habits and categories
- **Flexible Scheduling** — Daily, weekly, or monthly target frequencies

### Data Management
- **CSV/JSON Export** — Download all your habit data
- **CSV Import** — Migrate from other apps with auto-habit creation
- **Weekly Review** — Visual summary of your weekly completion rates

### UX Polish
- **Onboarding Flow** — 3-step wizard for new users
- **Skeleton Shimmer Loading** — Animated loading placeholders
- **Tab Transition Animations** — Slide animations between tabs
- **Reduced Motion Support** — Respects `prefers-reduced-motion`
- **Error Boundary** — Graceful error handling with retry
- **Toast Notifications** — With undo action for accidental check-ins
- **Online/Offline Indicator** — Status dot in the header
- **About Sheet** — App info, author links, and version display

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Database | Dexie.js 4 (IndexedDB) |
| PWA | vite-plugin-pwa + Workbox |
| Testing | Vitest + coverage-v8 |
| Linting | OxLint |
| Icons | lucide-react |
| ID Generation | nanoid |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/scmlewis/gridify.git
cd gridify
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```
gridify/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AboutSheet.tsx
│   │   ├── AchievementToast.tsx
│   │   ├── AddHabitForm.tsx
│   │   ├── AddHabitSheet.tsx
│   │   ├── AnalyticsBarChart.tsx
│   │   ├── AnalyticsTab.tsx
│   │   ├── BottomNav.tsx
│   │   ├── CategoryGroup.tsx
│   │   ├── CategoryManagement.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── CompletionDistribution.tsx
│   │   ├── Confetti.tsx
│   │   ├── ContributionGrid.tsx
│   │   ├── DayOfWeekHeatmap.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── GridsTab.tsx
│   │   ├── HabitCard.tsx
│   │   ├── HabitDetailSheet.tsx
│   │   ├── HabitRow.tsx
│   │   ├── Header.tsx
│   │   ├── IconPicker.tsx
│   │   ├── InsightsPanel.tsx
│   │   ├── NumericInput.tsx
│   │   ├── ObservationCard.tsx
│   │   ├── OnlineStatus.tsx
│   │   ├── OnboardingFlow.tsx
│   │   ├── ProgressHeroCard.tsx
│   │   ├── StatsCard.tsx
│   │   ├── StreakTimeline.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Toast.tsx
│   │   ├── TodayTab.tsx
│   │   ├── TrendSparkline.tsx
│   │   ├── UpdatePrompt.tsx
│   │   ├── WeekStrip.tsx
│   │   ├── WeeklyReview.tsx
│   │   └── YearComparison.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks/
│   │   ├── useHabits.ts
│   │   └── useTheme.ts
│   ├── utils/
│   │   ├── analytics.ts
│   │   ├── csv.test.ts
│   │   ├── date-utils.ts
│   │   ├── date-utils.test.ts
│   │   ├── export.ts
│   │   ├── gamification.ts
│   │   ├── gamification.test.ts
│   │   ├── grid-math.ts
│   │   ├── grid-math.test.ts
│   │   ├── insights.ts
│   │   ├── insights.test.ts
│   │   ├── observations.ts
│   │   ├── observations.test.ts
│   │   ├── streak.ts
│   │   ├── streak.test.ts
│   │   ├── year-comparison.ts
│   │   └── year-comparison.test.ts
│   ├── App.tsx
│   ├── db.ts
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
├── .oxlintrc.json
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Database Schema

Gridify uses Dexie.js (IndexedDB) with the following stores and schema versions:

### Stores

| Store | Indexes |
|-------|---------|
| `habits` | `id`, `archived`, `sortOrder`, `category` |
| `habitLogs` | `id`, `habitId`, `date`, `[habitId+date]` (compound) |
| `userProfile` | `id` |

### Interfaces

```typescript
interface Habit {
  id: string;
  name: string;
  createdAt: string;
  archived: boolean;
  sortOrder: number;
  freezesUsed: number;
  maxFreezes: number;
  category?: string;
  valueType?: 'boolean' | 'numeric';
  unit?: string;
  targetFrequency?: 'daily' | 'weekly' | 'monthly';
  targetValue?: number;
  color?: string;
  icon?: string;
}

interface HabitLog {
  id: string;
  habitId: string;
  date: string;        // YYYY-MM-DD
  value: number;       // 0 = missed, 1+ = completed
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface UserProfile {
  id: string;
  xp: number;
  level: number;
  achievements: string[];
  createdAt: string;
  onboardingCompleted: boolean;
  categories: Category[];
}
```

### Schema Versions

| Version | Changes |
|---------|---------|
| 3 | Added `freezesUsed` and `maxFreezes` to habits |
| 4 | Added `category`, `valueType`, `unit`, `targetFrequency`, `targetValue`, `color` to habits; added `onboardingCompleted` and `categories` to userProfile |
| 5 | Added compound index `[habitId+date]` to habitLogs |
| 6 | Added `icon` to habits |

---

## CI/CD

Gridify uses GitHub Actions for automated deployment to GitHub Pages.

- **Trigger:** Push to `master` branch or manual dispatch
- **Build:** Node.js 20, `npm install`, `npm run build`
- **Deploy:** Uploads `dist/` to GitHub Pages via `actions/deploy-pages`

The workflow is defined in `.github/workflows/deploy.yml`.

---

## Browser Support

Gridify works in all modern browsers that support IndexedDB and Service Workers:

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

### PWA Support

The app is fully installable on:
- Desktop (Chrome, Edge, Firefox)
- iOS (Safari)
- Android (Chrome)

---

## Performance

- **Bundle:** Tree-shaken with Vite, lazy-loaded where applicable
- **Offline:** Full functionality without network via service worker
- **Storage:** IndexedDB for persistence, no server required
- **Rendering:** Optimized React re-renders with memoized hooks
- **Animations:** Respects `prefers-reduced-motion` for accessibility

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Run `npm run lint` before committing
- Run `npm run test` to verify tests pass
- Follow existing code style and patterns
- Components use React 19 + TypeScript
- Styling uses Tailwind CSS 4 utility classes

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- Inspired by GitHub's contribution graph
- Built with React, Vite, and Tailwind CSS
- Gamification patterns from Habitica, Loop Habit Tracker, and Streaks
