# Gridify

A high-density, offline-first Progressive Web App for habit tracking with a GitHub-style contribution grid.

**Live Demo:** https://scmlewis.github.io/gridify/

---

## Features

### Core
- **Contribution Grid** — 53-week heatmap showing daily habit completion intensity
- **One-Tap Check-in** — Toggle habits with haptic feedback on mobile
- **Offline-First** — Works completely without internet via IndexedDB (Dexie.js)
- **PWA** — Installable on any device with service worker caching

### Streaks & Resilience
- **Grace Period** — 1 missed day allowed without breaking streaks
- **Streak Freeze** — 2 freeze days per habit to protect progress
- **Momentum Framing** — "X of last 14 days" instead of "streak broken"
- **Milestone Celebrations** — Confetti at 7, 14, 21, 30, 50, 100, 365 days

### Gamification
- **XP System** — Earn XP for check-ins with streak multipliers
- **20 Achievements** — "First Steps", "Week Warrior", "Centurion", and more
- **Level Progression** — 15 levels with increasing XP thresholds

### Data Management
- **CSV/JSON Export** — Download all your habit data
- **CSV Import** — Migrate from other apps with auto-habit creation
- **Weekly Review** — Visual summary of your weekly completion rates

### Customization
- **3 Themes** — Dark, Light, and OLED modes
- **Flexible Scheduling** — Track daily or custom frequencies

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Database | Dexie.js 4 (IndexedDB) |
| PWA | vite-plugin-pwa + Workbox |
| Linting | OxLint |

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

---

## Project Structure

```
gridify/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AchievementToast.tsx
│   │   ├── AddHabitForm.tsx
│   │   ├── Confetti.tsx
│   │   ├── ContributionGrid.tsx
│   │   ├── Dashboard.tsx
│   │   ├── HabitCard.tsx
│   │   ├── Header.tsx
│   │   ├── OnlineStatus.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Toast.tsx
│   │   ├── UpdatePrompt.tsx
│   │   └── WeeklyReview.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks/
│   │   ├── useHabits.ts
│   │   └── useTheme.ts
│   ├── utils/
│   │   ├── date-utils.ts
│   │   ├── export.ts
│   │   ├── gamification.ts
│   │   ├── grid-math.ts
│   │   └── streak.ts
│   ├── App.tsx
│   ├── db.ts
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .github/
│   └── workflows/
│       └── deploy.yml
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Database Schema

### Habits
```typescript
interface Habit {
  id: string;
  name: string;
  createdAt: string;
  archived: boolean;
  sortOrder: number;
  freezesUsed: number;
  maxFreezes: number;
}
```

### Habit Logs
```typescript
interface HabitLog {
  id: string;
  habitId: string;
  date: string;        // YYYY-MM-DD
  value: number;       // 0 = missed, 1+ = completed
}
```

### User Profile
```typescript
interface UserProfile {
  id: string;
  xp: number;
  level: number;
  achievements: string[];
}
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- Inspired by GitHub's contribution graph
- Built with React, Vite, and Tailwind CSS
- Gamification patterns from Habitica, Loop Habit Tracker, and Streaks
