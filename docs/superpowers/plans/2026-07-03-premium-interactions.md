# Premium Interactions & Motion Design — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rich CSS-only micro-interactions and transitions across the habit tracker to create a premium feel — covering check-in feedback, sheet animations, tab transitions, and drag polish.

**Architecture:** Foundation-first approach: Task 1 adds all CSS tokens/utilities, then Tasks 2-6 consume them in their respective components. Each task is a self-contained feature area that can be built and verified independently.

**Tech Stack:** React, TypeScript, Tailwind CSS, vanilla CSS keyframes (no animation libraries)

## Global Constraints

- CSS-only — zero new dependencies
- All hover effects desktop-only (no `hover:` on touch devices)
- Animations must respect `prefers-reduced-motion` media query
- Use existing Tailwind utility patterns; new CSS goes in `src/index.css`
- Existing animation keyframes in `index.css` may be replaced if superseded

---

### Task 1: Motion Tokens & Utility Classes

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: CSS custom properties (`--ease-spring`, `--ease-smooth`, `--ease-out`, `--duration-*`, `--stagger-step`) and utility classes (`.transition-spring`, `.transition-smooth`, `.animate-ripple`, `.animate-bounce-in`, `.animate-slide-up-sheet`) consumed by all subsequent tasks

- [ ] **Step 1: Add CSS custom properties to `:root`**

Open `src/index.css`. Inside the existing `:root` block (or create one if missing), add the motion tokens:

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

- [ ] **Step 2: Add utility classes**

Append the following to `src/index.css` (after existing keyframes):

```css
/* Motion utility classes */
.transition-spring {
  transition: all var(--duration-normal) var(--ease-spring);
}
.transition-smooth {
  transition: all var(--duration-normal) var(--ease-smooth);
}

/* Ripple feedback on tap */
@keyframes ripple {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}
.animate-ripple {
  animation: ripple var(--duration-normal) var(--ease-out) forwards;
}

/* Spring-scale entrance for new elements */
@keyframes bounce-in {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in var(--duration-slow) var(--ease-spring) forwards;
}

/* Sheet slide-up with spring overshoot */
@keyframes slide-up-sheet {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-slide-up-sheet {
  animation: slide-up-sheet var(--duration-slow) var(--ease-spring) forwards;
}

/* Streak number slide-up */
@keyframes streak-up {
  0% { transform: translateY(-8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-streak-up {
  animation: streak-up var(--duration-normal) var(--ease-spring) forwards;
}

/* Category group stagger entrance */
@keyframes group-enter {
  0% { transform: translateY(12px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-group-enter {
  animation: group-enter var(--duration-slow) var(--ease-spring) forwards;
}

/* Skeleton shimmer for loading states */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  background: linear-gradient(90deg, var(--surface-elevated) 25%, var(--surface-card) 50%, var(--surface-elevated) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Drop zone pulse */
@keyframes drop-pulse {
  0%, 100% { border-color: color-mix(in srgb, var(--primary) 30%, transparent); }
  50% { border-color: color-mix(in srgb, var(--primary) 60%, transparent); }
}
.animate-drop-pulse {
  animation: drop-pulse 1s ease-in-out infinite;
}

/* Prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Verify CSS compiles**

Run: `npm run build`
Expected: Build completes without CSS errors

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: add motion tokens, utility classes, and keyframe animations"
```

---

### Task 2: HabitCard Interactions

**Files:**
- Modify: `src/components/HabitCard.tsx`

**Interfaces:**
- Consumes: `.transition-spring`, `.animate-ripple`, `.animate-streak-up` from Task 1

- [ ] **Step 1: Add ripple effect to check-in button**

In `HabitCard.tsx`, add a ripple span inside the check-in button. The ripple div is absolutely positioned and animated on click.

Replace the `<button>` for the check-in toggle (around line 186-203) with:

```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    toggleToday();
  }}
  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 ${
    todayChecked
      ? 'border-primary bg-primary text-surface-base shadow-teal-glow'
      : 'border-border bg-transparent text-text-muted hover:border-primary/60 hover:text-primary hover:shadow-sm hover:shadow-primary/10'
  }`}
  title={todayChecked ? 'Uncheck in' : 'Check in'}
>
  <span className="ripple-container absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
    {todayChecked && <span className="animate-ripple absolute h-full w-full rounded-full bg-white/30" />}
  </span>
  {todayChecked ? (
    <Check className="h-5 w-5 relative z-10" strokeWidth={2.5} />
  ) : (
    <Circle className="h-5 w-5 relative z-10" strokeWidth={1.8} />
  )}
</button>
```

- [ ] **Step 2: Add streak animation**

Add a `streakAnimating` state to track when the streak changes:

```tsx
const [streakAnimating, setStreakAnimating] = useState(false);
```

In the `toggleToday` function, after the DB write succeeds, if the streak changed, trigger the animation:

```tsx
// After the try block succeeds, before onCheckIn:
const newStreak = calculateStreak(updatedLogs);
if (newStreak > streak) {
  setStreakAnimating(true);
  setTimeout(() => setStreakAnimating(false), 300);
}
```

Update the streak display in JSX (around line 207-208) to use the animation class:

```tsx
{streak > 0 ? (
  <span className={`text-primary ${streakAnimating ? 'animate-streak-up' : ''}`}>{streak} day streak</span>
) : (
  <span className="text-text-muted">{momentum.completed} of last {momentum.total} days</span>
)}
```

- [ ] **Step 3: Add card hover/press states**

Update the card wrapper `<div>` (around line 180-183) to include hover/press transitions:

```tsx
<div
  onClick={() => onTap?.(habit)}
  className={`rounded-xl bg-surface-card p-4 border border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] ${onTap ? 'cursor-pointer' : ''}`}
  style={{ borderLeft: `3px solid ${habit.color ?? '#6366f1'}` }}
>
```

- [ ] **Step 4: Add glow pulse to checked state**

Add a CSS keyframe for the glow pulse. In `index.css`, add:

```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 0%, transparent); }
  50% { box-shadow: 0 0 12px 2px color-mix(in srgb, var(--primary) 25%, transparent); }
}
.animate-glow-pulse {
  animation: glow-pulse 0.6s var(--ease-smooth) 2;
}
```

Then in `HabitCard.tsx`, add the class to the check-in button when checked:

```tsx
className={`... ${todayChecked ? 'animate-glow-pulse border-primary bg-primary text-surface-base shadow-teal-glow' : '...'}`}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/HabitCard.tsx src/index.css
git commit -m "feat: HabitCard ripple, glow pulse, streak animation, hover states"
```

---

### Task 3: Sheet & Modal Animations

**Files:**
- Modify: `src/components/AddHabitSheet.tsx`
- Modify: `src/components/HabitDetailSheet.tsx`
- Modify: `src/components/CategoryManagement.tsx`
- Modify: `src/components/WeeklyReview.tsx`
- Modify: `src/index.css` (additional keyframes)

**Interfaces:**
- Consumes: `.animate-slide-up-sheet`, `.transition-smooth` from Task 1

- [ ] **Step 1: Add sheet backdrop blur animation to `index.css`**

Append to `src/index.css`:

```css
@keyframes backdrop-in {
  0% { opacity: 0; backdrop-filter: blur(0); }
  100% { opacity: 1; backdrop-filter: blur(4px); }
}
@keyframes backdrop-out {
  0% { opacity: 1; backdrop-filter: blur(4px); }
  100% { opacity: 0; backdrop-filter: blur(0); }
}
.animate-backdrop-in {
  animation: backdrop-in 200ms var(--ease-smooth) forwards;
}
.animate-backdrop-out {
  animation: backdrop-out 150ms var(--ease-smooth) forwards;
}

/* Sheet child stagger */
.sheet-open > * {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity var(--duration-normal) var(--ease-smooth),
              transform var(--duration-normal) var(--ease-smooth);
}
.sheet-open > *:nth-child(1) { transition-delay: 0ms; opacity: 1; transform: translateY(0); }
.sheet-open > *:nth-child(2) { transition-delay: 50ms; opacity: 1; transform: translateY(0); }
.sheet-open > *:nth-child(3) { transition-delay: 100ms; opacity: 1; transform: translateY(0); }
.sheet-open > *:nth-child(4) { transition-delay: 150ms; opacity: 1; transform: translateY(0); }
.sheet-open > *:nth-child(5) { transition-delay: 200ms; opacity: 1; transform: translateY(0); }
.sheet-open > *:nth-child(6) { transition-delay: 250ms; opacity: 1; transform: translateY(0); }
```

- [ ] **Step 2: Update AddHabitSheet.tsx**

Find the sheet container `<div>` with `animate-scale-in` (likely the inner content wrapper). Replace the animation class with `animate-slide-up-sheet`. Find the backdrop `<div>` and add `animate-backdrop-in`.

The backdrop (the outer fixed div with `bg-black/60`) should become:

```tsx
<div
  className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-backdrop-in backdrop-blur-sm"
  onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
>
```

The inner sheet div should change from `animate-scale-in` to `animate-slide-up-sheet`:

```tsx
<div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-surface-card border border-border shadow-2xl p-5 animate-slide-up-sheet">
```

Add `sheet-open` class to the inner sheet div to trigger stagger:

```tsx
<div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-surface-card border border-border shadow-2xl p-5 animate-slide-up-sheet sheet-open">
```

- [ ] **Step 3: Update HabitDetailSheet.tsx**

Apply the same pattern as Step 2 — backdrop gets `animate-backdrop-in`, inner sheet gets `animate-slide-up-sheet sheet-open`.

- [ ] **Step 4: Update CategoryManagement.tsx**

Apply the same pattern — backdrop gets `animate-backdrop-in`, inner sheet gets `animate-slide-up-sheet sheet-open`.

- [ ] **Step 5: Update WeeklyReview.tsx**

For the desktop modal, keep the scale-based entrance but improve the curve. Find the modal content div and ensure it uses `animate-scale-in` (already does) but verify the CSS keyframe uses `var(--ease-spring)`. Update `animate-scale-in` in `index.css`:

```css
@keyframes scale-in {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
  animation: scale-in var(--duration-normal) var(--ease-spring) forwards;
}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/components/AddHabitSheet.tsx src/components/HabitDetailSheet.tsx src/components/CategoryManagement.tsx src/components/WeeklyReview.tsx src/index.css
git commit -m "feat: sheet & modal spring animations with backdrop blur and stagger"
```

---

### Task 4: Tab & Page Transitions

**Files:**
- Modify: `src/components/TodayTab.tsx`
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `.animate-group-enter`, `.animate-shimmer` from Task 1

- [ ] **Step 1: Add tab transition keyframes to `index.css`**

Append to `src/index.css`:

```css
@keyframes tab-enter-left {
  0% { transform: translateX(-12px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes tab-enter-right {
  0% { transform: translateX(12px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
.animate-tab-enter-left {
  animation: tab-enter-left 200ms var(--ease-smooth) forwards;
}
.animate-tab-enter-right {
  animation: tab-enter-right 200ms var(--ease-smooth) forwards;
}
```

- [ ] **Step 2: Add tab direction state to TodayTab**

In `TodayTab.tsx`, this component doesn't control tab switching — `App.tsx` does. The tab transition needs to be handled at the `App.tsx` level where `activeTab` state lives. Let's handle it there instead.

**Move to App.tsx for this step.**

In `App.tsx`, add a `tabDirection` state and pass it to tab content:

```tsx
const [tabDirection, setTabDirection] = useState<'left' | 'right'>('right');
```

When `activeTab` changes, determine direction based on tab order:

```tsx
const tabOrder = { today: 0, grids: 1, analytics: 2 };
// In the tab change handler:
const prevIndex = tabOrder[prevTab];
const nextIndex = tabOrder[newTab];
setTabDirection(nextIndex > prevIndex ? 'right' : 'left');
```

Pass `tabDirection` as a prop to each tab component.

- [ ] **Step 3: Apply direction class to tab content**

In each tab component (`TodayTab`, `GridsTab`, `AnalyticsTab`), wrap the return content in a div with the direction class:

```tsx
return (
  <div className={tabDirection === 'right' ? 'animate-tab-enter-right' : 'animate-tab-enter-left'}>
    {/* existing content */}
  </div>
);
```

Note: The animation should only trigger on tab switch, not on initial mount. Use a `useEffect` with a key that changes on tab switch to force re-mount, or use a `key={activeTab}` on the wrapper div.

- [ ] **Step 4: Add category group stagger to TodayTab**

In `TodayTab.tsx`, the `sortedCategories` map already exists. Add `animationDelay` to each `CategoryGroup`:

```tsx
{sortedCategories.map(([category, catHabits], index) => (
  <CategoryGroup
    key={category}
    categoryName={category}
    habits={catHabits}
    onCheckIn={() => _onRefresh(n => n + 1)}
    onHabitTap={setSelectedHabit}
    onDragStart={handleDragStart}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
    refreshKey={refreshKey}
    className="animate-group-enter"
    style={{ animationDelay: `${index * 60}ms` }}
  />
))}
```

This requires `CategoryGroup` to accept and forward `className` and `style` props. Update `CategoryGroup.tsx`:

```tsx
interface CategoryGroupProps {
  // ... existing props
  className?: string;
  style?: React.CSSProperties;
}

export function CategoryGroup({ ..., className, style }: CategoryGroupProps) {
  return (
    <div className={`space-y-2 ${className ?? ''}`} style={style}>
      {/* existing content */}
    </div>
  );
}
```

- [ ] **Step 5: Add skeleton shimmer for loading state**

In `TodayTab.tsx`, the loading spinner (around line 129-135) can be enhanced with skeleton cards. Replace the simple spinner with:

```tsx
if (isLoading || onboardingCompleted === null) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-shimmer rounded-xl h-20 w-full" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/components/TodayTab.tsx src/components/BottomNav.tsx src/components/CategoryGroup.tsx src/index.css
git commit -m "feat: tab crossfade transitions, category stagger, skeleton loading"
```

---

### Task 5: Drag & Drop Polish

**Files:**
- Modify: `src/components/HabitRow.tsx`
- Modify: `src/components/TodayTab.tsx`

**Interfaces:**
- Consumes: `.transition-spring`, `.animate-drop-pulse` from Task 1

- [ ] **Step 1: Add drag state CSS to `index.css`**

Append to `src/index.css`:

```css
/* Drag and drop states */
.dragging {
  transform: scale(1.02);
  box-shadow: 0 8px 25px -5px color-mix(in srgb, var(--primary) 25%, transparent);
  opacity: 0.9;
  z-index: 10;
}
.drop-target {
  border: 2px dashed color-mix(in srgb, var(--primary) 40%, transparent);
  animation: drop-pulse 1s ease-in-out infinite;
}
```

- [ ] **Step 2: Apply drag classes in HabitRow.tsx**

In `HabitRow.tsx`, the component has `draggable={true}` already. Add a `isDragging` state to track when this row is being dragged:

```tsx
const [isDragging, setIsDragging] = useState(false);
```

Update the drag handlers:

```tsx
const handleDragStart = (e: React.DragEvent) => {
  setIsDragging(true);
  onDragStart?.(e, habit.id);
};

// Add onDragEnd to clear the state
const handleDragEnd = () => {
  setIsDragging(false);
};
```

Add `onDragEnd={handleDragEnd}` to the wrapper div, and apply the `dragging` class conditionally:

```tsx
<div
  draggable={true}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onDragEnd={handleDragEnd}
  onClick={handleClick}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  className={`group flex items-center gap-3 rounded-xl bg-surface-card px-3.5 py-3 border transition-all duration-200 border-border/60 hover:border-primary/30 hover:bg-surface-card/80 cursor-pointer hover:shadow-md hover:shadow-primary/5 ${isDragging ? 'dragging' : ''}`}
  style={{ borderLeft: `3px solid ${color}` }}
>
```

- [ ] **Step 3: Add drop-target class in TodayTab.tsx**

In `TodayTab.tsx`, the `handleDragOver` and `handleDrop` functions need to also manage a `dragOverHabitId` state to highlight the drop target:

```tsx
const [dragOverHabitId, setDragOverHabitId] = useState<string | null>(null);
```

Update handlers:

```tsx
const handleDragOver = (e: React.DragEvent, habitId: string) => {
  e.preventDefault();
  setDragOverHabitId(habitId);
};

const handleDrop = async (e: React.DragEvent, targetHabitId: string) => {
  e.preventDefault();
  setDragOverHabitId(null);
  // ... existing reorder logic
};

// Add a handleDragLeave to clear the highlight
const handleDragLeave = () => {
  setDragOverHabitId(null);
};
```

Pass `dragOverHabitId` to `CategoryGroup` which forwards it to `HabitRow`:

```tsx
<CategoryGroup
  // ... existing props
  dragOverHabitId={dragOverHabitId}
  onDragLeave={handleDragLeave}
/>
```

In `CategoryGroup.tsx`, pass `isDropTarget={dragOverHabitId === habit.id}` to each `HabitRow`, and in `HabitRow.tsx`, apply the `drop-target` class when `isDropTarget` is true.

- [ ] **Step 4: Add reorder transition to HabitRow**

Add `transition: transform 250ms var(--ease-spring)` to the HabitRow wrapper div so when order changes, the element animates to its new position:

```tsx
className={`... ${isDragging ? 'dragging' : ''}`}
style={{ borderLeft: `3px solid ${color}`, transition: 'transform 250ms var(--ease-spring), box-shadow 200ms ease, opacity 200ms ease' }}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/HabitRow.tsx src/components/TodayTab.tsx src/components/CategoryGroup.tsx src/index.css
git commit -m "feat: drag & drop polish — ghost lift, drop zone pulse, reorder transition"
```

---

### Task 6: Toast Spring Curve

**Files:**
- Modify: `src/components/Toast.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `--ease-spring` from Task 1

- [ ] **Step 1: Update Toast entrance animation**

In `Toast.tsx`, find the container div that uses `animate-slide-up`. Replace it with the new `animate-slide-up-sheet` (which uses spring curve):

```tsx
<div className="animate-slide-up-sheet ...">
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/Toast.tsx
git commit -m "feat: toast spring curve entrance animation"
```

---

### Task 7: Final Integration & Polish

**Files:**
- Modify: `src/components/HabitCard.tsx` (verify all Task 2 changes)
- Modify: `src/index.css` (cleanup any superseded keyframes)

**Interfaces:**
- Consumes: All tasks 1-6

- [ ] **Step 1: Verify all animations work together**

Run the dev server: `npm run dev`
Manually test:
- Check-in a habit → ripple + glow pulse on circle
- Streak increments → number slides up
- Hover cards on desktop → lift + shadow
- Open AddHabitSheet → slide up with stagger
- Switch tabs → crossfade
- Drag to reorder → ghost lifts, drop zone pulses
- Toast appears → spring entrance

- [ ] **Step 2: Remove superseded keyframes**

Review `index.css` — if the old `slide-up` keyframe is now fully replaced by `slide-up-sheet`, remove it. Keep only active keyframes.

- [ ] **Step 3: Run full verification**

Run: `npm run lint && npx tsc --noEmit && npx vitest run && npm run build`
Expected: All pass, no errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: premium interactions — final polish and cleanup"
```

- [ ] **Step 5: Push and deploy**

```bash
git push
```
