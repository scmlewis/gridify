# Task 7: Final Integration & Polish

**Files:**
- Modify: `src/index.css` (cleanup superseded keyframes)

**Interfaces:**
- Consumes: All tasks 1-6

- [ ] **Step 1: Remove superseded keyframes**

Review `src/index.css`. The old `slide-up` keyframe may now be superseded by `slide-up-sheet`. Check if `animate-slide-up` (the old class) is still used anywhere:

```bash
grep -r "animate-slide-up" src/ --include="*.tsx" --include="*.ts"
```

If only `animate-slide-up-sheet` is used, remove the old `slide-up` keyframe and `animate-slide-up` class. Keep all other existing keyframes (confetti-fall, slide-down, fade-in, scale-in) as they may still be used by other components.

- [ ] **Step 2: Verify everything works together**

Run the dev server: `npm run dev`
Manually verify (or review code for):
- Check-in a habit → ripple + glow pulse on circle
- Streak increments → number slides up
- Hover cards on desktop → lift + shadow
- Open AddHabitSheet → slide up with stagger
- Switch tabs → crossfade
- Drag to reorder → ghost lifts, drop zone pulses
- Toast appears → spring entrance

- [ ] **Step 3: Run full verification**

Run: `npm run lint && npx tsc --noEmit && npx vitest run && npm run build`
Expected: All pass, no errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: premium interactions — final polish and cleanup"
```
