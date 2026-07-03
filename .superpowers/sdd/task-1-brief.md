# Task 1: Motion Tokens & Utility Classes

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
