# Gridify Revamp Plan

## Overview

Transform Gridify from a clean, traditional habit tracker into a terminal/hacker-aesthetic PWA with high-density information display, inspired by the Google AI Studio prototype.

**Target:** Terminal/hacker aesthetic with emerald green accent, monospace-heavy typography, 5-tab navigation, and Motion animations.

---

## Phase 1: Typography & Color System

### 1.1 Add Google Fonts

Add to `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
```

### 1.2 Update Theme Tokens in `src/index.css`

Replace current typography tokens:
```css
@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

### 1.3 Shift Color Palette to Emerald

Update `src/index.css` theme tokens:

**Dark theme (default):**
- Background: `#0a0a0a` (near-black)
- Card: `#111111`
- Elevated: `#1a1a1a`
- Primary: `#10b981` (emerald-500)
- Primary light: `#34d399` (emerald-400)
- Primary dark: `#059669` (emerald-600)
- Primary bg: `#064e3b` (emerald-900/30)
- Text primary: `#f5f5f5`
- Text secondary: `#a1a1aa` (zinc-400)
- Text muted: `#52525b` (zinc-600)
- Border: `rgba(255, 255, 255, 0.05)`

**Light theme:**
- Background: `#fafafa`
- Card: `#ffffff`
- Primary: `#059669` (emerald-600)

**OLED theme:**
- Background: `#000000`
- Card: `#0a0a0a`

### 1.4 Apply Typography Classes

Update all components to use new font families:
- Headings: `font-display` (Space Grotesk)
- Body: `font-sans` (Inter)
- Data/labels: `font-mono` (JetBrains Mono)
- Labels: Add `uppercase tracking-widest text-[10px]` for terminal aesthetic

---

## Phase 2: Animation Upgrade

### 2.1 Install Motion Package

```bash
npm install motion
```

### 2.2 Create Animation Utilities

Create `src/utils/animations.ts`:
```typescript
export const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};
```

### 2.3 Replace CSS Animations with Motion Components

Key replacements:
- **Tab transitions:** `AnimatePresence` with `mode="wait"`
- **Bottom sheets:** Spring-physics `motion.div`
- **Card entrances:** Staggered `motion.div` with `slideUp`
- **Modal backdrops:** `motion.div` with `fadeIn`
- **Achievement unlocks:** `motion.div` with `scaleIn` + spring

### 2.4 Add Micro-Interactions

- Haptic feedback on check-in: `navigator.vibrate(10)`
- Button press: `whileTap={{ scale: 0.98 }}`
- Card hover: `whileHover={{ y: -2 }}`

---

## Phase 3: Layout Restructure (5 Tabs)

### 3.1 Update Navigation Structure

**New tab order:**
1. Today (checklist)
2. Grids (contribution heatmaps)
3. Analytics (charts & insights)
4. Achievements (gallery)
5. Settings (configuration)

### 3.2 Create `src/components/AchievementsView.tsx`

New component with:
- Achievement gallery grid
- Filter by category (milestone, streak, category, system)
- Filter by status (locked/unlocked)
- Achievement detail modal
- Total XP and level display

### 3.3 Create `src/components/SettingsPanel.tsx`

New component with:
- Theme switcher (Light/Dark/OLED)
- Category management (CRUD)
- Import/Export (JSON, CSV)
- Data statistics
- About section
- Version info

### 3.4 Update `src/components/BottomNav.tsx`

Add 2 new nav items:
```typescript
const navItems = [
  { id: 'today', label: 'Today', icon: CheckCircle },
  { id: 'grids', label: 'Grids', icon: Grid3x3 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'achievements', label: 'Awards', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings }
];
```

### 3.5 Update `src/App.tsx`

- Add `activeTab` states for 'achievements' and 'settings'
- Render `AchievementsView` and `SettingsPanel` components
- Update tab transition logic

---

## Phase 4: Component Polish

### 4.1 Replace Drag-and-Drop with Arrow Buttons

In `src/components/HabitRow.tsx` and `src/components/CategoryGroup.tsx`:
- Remove HTML5 drag-and-drop
- Add up/down arrow buttons for reordering
- Simpler, more reliable on mobile

### 4.2 Enhance Cards with Ambient Gradients

Add subtle gradient orbs inside cards:
```tsx
<div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#111] p-5">
  {/* Ambient gradient */}
  <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
  
  {/* Card content */}
  <div className="relative z-10">
    {/* ... */}
  </div>
</div>
```

### 4.3 Refine Contribution Grid

Update `src/components/ContributionGrid.tsx`:
- Add month labels (Jan, Feb, Mar, etc.)
- Add day-of-week labels (Mon, Wed, Fri)
- 5 intensity levels for better granularity
- Hover tooltips with date and value

### 4.4 Add Haptic Feedback

Create `src/utils/haptics.ts`:
```typescript
export const haptic = {
  light: () => navigator.vibrate(10),
  medium: () => navigator.vibrate(20),
  heavy: () => navigator.vibrate(40),
  success: () => navigator.vibrate([10, 50, 10]),
  error: () => navigator.vibrate([50, 50, 50])
};
```

Apply to:
- Check-in toggles
- Achievement unlocks
- Button presses
- Error states

### 4.5 Update Icon Usage

Keep Lucide React but ensure consistent stroke width:
- All icons: `strokeWidth={1.5}`
- Size consistency: 16px for nav, 20px for cards, 24px for headers

---

## Phase 5: Code Quality & Polish

### 5.1 Semantic HTML

Update components to use semantic elements:
- `<nav>` for BottomNav
- `<main>` for tab content
- `<article>` for habit cards
- `<section>` for category groups
- `<aside>` for detail sheets

### 5.2 Accessibility Improvements

- Add `aria-label` to all interactive elements
- Ensure `focus-visible` rings are visible
- Add `role` attributes where needed
- Test with screen reader

### 5.3 Performance Optimization

- Memoize expensive computations (correlations, analytics)
- Use `React.lazy` for tab components
- Optimize re-renders with `useMemo` and `useCallback`

### 5.4 Update Meta Tags

Update `index.html`:
```html
<title>Gridify — Habit Tracker</title>
<meta name="description" content="High-density habit tracking with GitHub-style contribution grids">
<meta property="og:title" content="Gridify — Habit Tracker">
<meta property="og:description" content="Track habits with contribution grids and deep analytics">
```

---

## Implementation Order

1. **Phase 1: Typography & Color** (1-2 hours)
   - Add Google Fonts
   - Update theme tokens
   - Apply font classes to components

2. **Phase 2: Animation Upgrade** (2-3 hours)
   - Install Motion
   - Create animation utilities
   - Replace CSS animations

3. **Phase 3: Layout Restructure** (2-3 hours)
   - Create AchievementsView
   - Create SettingsPanel
   - Update navigation

4. **Phase 4: Component Polish** (2-3 hours)
   - Replace drag-and-drop
   - Add ambient gradients
   - Add haptic feedback

5. **Phase 5: Code Quality** (1-2 hours)
   - Semantic HTML
   - Accessibility
   - Performance

**Total estimated time:** 8-13 hours

---

## Files to Modify

### Core Files
- `index.html` — Add Google Fonts
- `src/index.css` — Update theme tokens, add font families
- `src/App.tsx` — Add 5-tab routing
- `src/components/BottomNav.tsx` — Add 2 new nav items

### New Files
- `src/components/AchievementsView.tsx` — Achievement gallery
- `src/components/SettingsPanel.tsx` — Settings panel
- `src/utils/animations.ts` — Motion animation presets
- `src/utils/haptics.ts` — Haptic feedback utilities

### Component Updates
- `src/components/HabitCard.tsx` — Add ambient gradient, font classes
- `src/components/HabitRow.tsx` — Replace drag-and-drop with arrows
- `src/components/CategoryGroup.tsx` — Add arrows, ambient gradient
- `src/components/ProgressHeroCard.tsx` — Update fonts, add gradient
- `src/components/ContributionGrid.tsx` — Add labels, refine colors
- `src/components/WeekStrip.tsx` — Update styling
- `src/components/AnalyticsBarChart.tsx` — Update colors
- `src/components/TrendSparkline.tsx` — Update colors
- `src/components/StatsCard.tsx` — Update fonts
- `src/components/InsightsPanel.tsx` — Update styling
- `src/components/ObservationCard.tsx` — Update styling
- `src/components/OnboardingFlow.tsx` — Update styling
- `src/components/EmptyState.tsx` — Update styling
- `src/components/Header.tsx` — Update styling
- `src/components/AddHabitSheet.tsx` — Update styling
- `src/components/HabitDetailSheet.tsx` — Update styling

---

## Success Criteria

- [ ] Custom fonts loaded (Space Grotesk, Inter, JetBrains Mono)
- [ ] Emerald green primary color throughout
- [ ] Terminal aesthetic (uppercase labels, monospace data, dense layout)
- [ ] Motion animations on all transitions
- [ ] 5-tab navigation working
- [ ] AchievementsView component created
- [ ] SettingsPanel component created
- [ ] Ambient gradients on cards
- [ ] Haptic feedback on interactions
- [ ] No regression in existing functionality
- [ ] All tests passing

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | High | Test after each phase, keep changes focused |
| Animation performance on mobile | Medium | Use `will-change`, respect `prefers-reduced-motion` |
| Font loading flash | Low | Use `font-display: swap`, preload fonts |
| Color contrast issues | Medium | Test WCAG AA compliance for all text |
| Motion sickness | Low | Respect `prefers-reduced-motion`, disable animations |

---

## Next Steps

1. Review this plan and approve
2. Start with Phase 1 (Typography & Color)
3. Test and commit after each phase
4. Iterate based on feedback
