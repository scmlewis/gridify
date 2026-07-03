# Premium Interactions & Motion Design

## Goal

Elevate the habit tracker from functional to premium through a rich micro-interaction layer. CSS-only approach — no animation libraries. All motion should feel intentional, consistent, and delightful on both desktop and mobile.

## Scope

Four areas (gamification effects excluded):
1. HabitCard interactions
2. Sheet & modal animations
3. Tab & page transitions
4. Drag & drop polish

---

## 1. Motion Tokens & Utility Classes

All animation values live as CSS custom properties in `index.css` for consistency.

### Custom Properties

```css
:root {
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --stagger-step: 50ms;
}
```

### Utility Classes (add to `index.css`)

| Class | Purpose |
|-------|---------|
| `.transition-spring` | `transition: all var(--duration-normal) var(--ease-spring)` — bouncy, playful transitions |
| `.transition-smooth` | `transition: all var(--duration-normal) var(--ease-smooth)` — clean, professional transitions |
| `.animate-ripple` | Scale 0→1 + opacity fade — tap feedback on interactive elements |
| `.animate-bounce-in` | Spring-scale entrance for newly added elements |
| `.animate-slide-up-sheet` | Replaces current `slide-up` with spring curve and slight overshoot |

---

## 2. HabitCard Interactions

**File:** `src/components/HabitCard.tsx`

### Check-in circle
- On tap: ripple outward from center (`@keyframes ripple` — scale 0→1, opacity 1→0)
- Checked state: subtle pulsing glow via `box-shadow` animation (2 cycles, then stops — not infinite)
- Uncheck: quick scale-down bounce (reverse of entrance)

### Streak counter
- When streak increments: number slides up and fades in (`translateY(-8px) → 0`, `opacity 0 → 1`)
- CSS `@keyframes streak-up` triggered by adding a class via state change

### Card hover/press
- **Desktop hover:** `translateY(-2px)` + `shadow-lg` over 250ms spring curve
- **Press (both):** `scale(0.98)` via `active:` — standardize to spring curve
- Checked cards get left-border glow transition (`border-border` → `primary/30`)

### Toast
- Already slides up — improve with spring curve + slight overshoot

### Desktop/mobile balance
- Hover states use `hover:` media query — no effect on touch devices
- All press feedback uses `active:` which works on both platforms
- Glow pulse is purely visual, works everywhere

---

## 3. Sheet & Modal Animations

**Files:** `AddHabitSheet.tsx`, `HabitDetailSheet.tsx`, `CategoryManagement.tsx`, `WeeklyReview.tsx`

### Bottom sheet entrance
- Replace `animate-scale-in` with slide-up + spring overshoot
- Sheet: `translateY(100%)` → `translateY(0)` with `var(--ease-spring)`
- Backdrop: fades in at 200ms with `backdrop-blur-sm` animating `blur(0)` → `blur(4px)`

### Nested content stagger
- Sheet children (header, form fields, buttons) animate in with staggered delay
- Each child: `opacity: 0; transform: translateY(8px)` → visible
- CSS approach: parent gets `.sheet-open` class, children use `:nth-child` with `transition-delay` (50ms steps)

### Sheet exit
- Reverse of entrance — slides down with `var(--ease-smooth)` (no spring on exit)
- Backdrop fades out at 150ms

### Desktop modals
- Scale 0.95→1 + opacity, reuse `animate-scale-in` with spring easing

---

## 4. Tab & Page Transitions

**Files:** `TodayTab.tsx`, `GridsTab.tsx`, `AnalyticsTab.tsx`, `App.tsx`

### Tab switch crossfade
- Outgoing: fades out + slides slightly in navigation direction (left = earlier tab, right = later)
- Incoming: fades in from opposite direction
- CSS: direction-aware classes (`tab-slide-left`, `tab-slide-right`)
- Duration: 200ms fade, 150ms slide

### Category group stagger
- On TodayTab load or after adding habit, category groups stagger in
- Each `CategoryGroup` gets `animation-delay` based on index (0ms, 60ms, 120ms...)
- `@keyframes group-enter`: `opacity 0→1` + `translateY(12px)→0` with spring easing
- Implementation: inline `style={{ animationDelay }}` on mapped element

### Loading states
- Skeleton shimmer for habit cards while loading (CSS gradient animation on placeholder div)
- Existing spinner kept, use spring curve for rotation

---

## 5. Drag & Drop Polish

**Files:** `HabitRow.tsx`, `TodayTab.tsx`, `CategoryGroup.tsx`

### Drag ghost
- Lifted element gets `shadow-lg` + `scale(1.02)` via CSS `dragging` class

### Drop zone
- Target row shows dashed border animation (color pulses `primary/30` ↔ `primary/60`)

### Reorder animation
- Habits animate to new positions via `transition: transform 250ms var(--ease-spring)`
- CSS `order` property changes trigger the shift

### Drag end
- Ghost settles back with small bounce

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add motion tokens, utility classes, new keyframes |
| `src/components/HabitCard.tsx` | Ripple, glow pulse, streak animation, hover states |
| `src/components/HabitRow.tsx` | Drag ghost, drop zone highlight, reorder transition |
| `src/components/TodayTab.tsx` | Category group stagger, tab content transition |
| `src/components/CategoryGroup.tsx` | Stagger animation support |
| `src/components/AddHabitSheet.tsx` | Sheet entrance/exit with spring curve |
| `src/components/HabitDetailSheet.tsx` | Sheet entrance/exit with spring curve |
| `src/components/CategoryManagement.tsx` | Sheet entrance/exit with spring curve |
| `src/components/BottomNav.tsx` | Tab indicator transition |
| `src/components/Toast.tsx` | Spring curve on entrance |

## Constraints

- CSS-only — no framer-motion, react-spring, or other animation libraries
- All hover effects desktop-only (no `hover:` on touch)
- Animations must respect `prefers-reduced-motion` media query
- Bundle impact: zero new dependencies
