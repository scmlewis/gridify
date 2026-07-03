# Task 3: Sheet & Modal Animations

**Files:**
- Modify: `src/components/AddHabitSheet.tsx`
- Modify: `src/components/HabitDetailSheet.tsx`
- Modify: `src/components/CategoryManagement.tsx`
- Modify: `src/components/WeeklyReview.tsx`
- Modify: `src/index.css` (add backdrop + stagger keyframes)

**Interfaces:**
- Consumes: `.animate-slide-up-sheet`, `.transition-smooth` from Task 1

- [ ] **Step 1: Add sheet backdrop blur animation and stagger to `index.css`**

Append to `src/index.css` (after existing keyframes):

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

Find the outer backdrop `<div>` (the one with `bg-black/60` and `backdrop-blur-sm`). Add `animate-backdrop-in` to its className:

```tsx
<div
  className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-backdrop-in backdrop-blur-sm"
  onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
>
```

Find the inner sheet content `<div>` (the one with `rounded-t-2xl` and `animate-scale-in`). Replace `animate-scale-in` with `animate-slide-up-sheet` and add `sheet-open`:

```tsx
<div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-surface-card border border-border shadow-2xl p-5 animate-slide-up-sheet sheet-open">
```

- [ ] **Step 3: Update HabitDetailSheet.tsx**

Apply the same pattern as Step 2:
- Backdrop `<div>` gets `animate-backdrop-in`
- Inner sheet `<div>` gets `animate-slide-up-sheet sheet-open` (replace any existing `animate-scale-in`)

- [ ] **Step 4: Update CategoryManagement.tsx**

Apply the same pattern:
- Backdrop `<div>` gets `animate-backdrop-in`
- Inner sheet `<div>` gets `animate-slide-up-sheet sheet-open`

- [ ] **Step 5: Update WeeklyReview.tsx**

For the desktop modal, keep the scale-based entrance but ensure it uses the spring easing. Find the modal content div and verify it uses `animate-scale-in`. Update the `animate-scale-in` keyframe in `index.css` if it doesn't already use `var(--ease-spring)`:

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
