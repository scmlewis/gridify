# Task 6: Toast Spring Curve

**Files:**
- Modify: `src/components/Toast.tsx`

**Interfaces:**
- Consumes: `.animate-slide-up-sheet` from Task 1

- [ ] **Step 1: Update Toast entrance animation**

In `Toast.tsx`, find the container `<div>` that uses `animate-slide-up`. Replace it with `animate-slide-up-sheet` (which uses spring curve with overshoot).

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: TypeScript clean, all tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/Toast.tsx
git commit -m "feat: toast spring curve entrance animation"
```
