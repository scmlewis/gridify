# Task 2: HabitCard Interactions

**Files:**
- Modify: `src/components/HabitCard.tsx`
- Modify: `src/index.css` (add glow-pulse keyframe)

**Interfaces:**
- Consumes: `.transition-spring`, `.animate-ripple`, `.animate-streak-up` from Task 1

- [ ] **Step 1: Add glow-pulse keyframe to `index.css`**

Append to `src/index.css` (after the existing keyframes section):

```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 0%, transparent); }
  50% { box-shadow: 0 0 12px 2px color-mix(in srgb, var(--color-primary) 25%, transparent); }
}
.animate-glow-pulse {
  animation: glow-pulse 0.6s var(--ease-smooth) 2;
}
```

- [ ] **Step 2: Add ripple effect to check-in button in HabitCard.tsx**

Replace the check-in `<button>` element (the one with the Check/Circle icons) with a version that includes a ripple span. The ripple div is absolutely positioned and animated on click:

```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    toggleToday();
  }}
  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 ${
    todayChecked
      ? 'animate-glow-pulse border-primary bg-primary text-surface-base shadow-teal-glow'
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

- [ ] **Step 3: Add streak animation state**

Add a `streakAnimating` state to track when the streak changes:

```tsx
const [streakAnimating, setStreakAnimating] = useState(false);
```

In the `toggleToday` function, after the DB write succeeds, if the streak changed, trigger the animation. Add this logic inside the try block, before `onCheckIn?.()`:

```tsx
const newStreak = calculateStreak(updatedLogs);
if (newStreak > streak) {
  setStreakAnimating(true);
  setTimeout(() => setStreakAnimating(false), 300);
}
```

Update the streak display in JSX to use the animation class:

```tsx
{streak > 0 ? (
  <span className={`text-primary ${streakAnimating ? 'animate-streak-up' : ''}`}>{streak} day streak</span>
) : (
  <span className="text-text-muted">{momentum.completed} of last {momentum.total} days</span>
)}
```

- [ ] **Step 4: Add card hover/press states**

Update the card wrapper `<div>` (the one with `rounded-xl bg-surface-card p-4`) to include hover/press transitions. Add `hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]` to the className:

```tsx
className={`rounded-xl bg-surface-card p-4 border border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] ${onTap ? 'cursor-pointer' : ''}`}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/HabitCard.tsx src/index.css
git commit -m "feat: HabitCard ripple, glow pulse, streak animation, hover states"
```
