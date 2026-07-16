# Today Tab Motion & Gestures — Design Spec

## Overview

Transform the Today tab from a static list into a fluid, gesture-driven interface using `motion/react`. Priority: feel and responsiveness over visual flash.

## Decisions

- **Library:** motion/react (formerly framer-motion)
- **Gesture model:** Swipe right to complete, swipe left for actions
- **Reordering:** Long-press (500ms) + drag handle
- **Animations:** Full spring physics (`stiffness: 300, damping: 25`)
- **Scope:** Today tab first, other tabs later

## Components

### 1. `useSwipeGesture` hook
- Tracks pointer events (down/move/up/cancel)
- Calculates horizontal delta vs threshold (30% of row width)
- Callbacks: `onSwipeRight`, `onSwipeLeft`, `onSwipeComplete`
- Haptic feedback at threshold crossing
- Cancels on vertical scroll (deltaY > deltaX)

### 2. `useLongPress` hook
- Starts timer on pointerdown (500ms)
- Cancels on pointerup before threshold, movement > 10px, or pointercancel
- Fires `onLongPress` callback
- Returns `isPressed` state for visual feedback

### 3. `AnimatedRing` component
- SVG circle with `stroke-dasharray` / `stroke-dashoffset`
- `progress` prop (0-1) drives offset via spring animation
- `color` prop for fill
- Triggers `onComplete` when progress reaches 1

### 4. `ParticleBurst` component
- Accepts `trigger` (boolean) and `color` (string)
- On trigger: spawns 8-12 particles with random angles
- Each particle: small circle, radial trajectory, 400ms lifetime
- Uses `motion.div` with `animate` for each particle
- Cleans up after animation completes

### 5. `ReactiveHero` component (replaces `ProgressHeroCard`)
- `AnimatedRing` centered, showing today's completion ratio
- Momentum counter below ring (slides up on first completion)
- `ParticleBurst` layered on top, triggered on completion
- Spring-animated number display for count

### 6. `SwipeableHabitRow` component
- Wraps `HabitRow` with swipe gesture
- Swipe right: teal background slides in, habit completes at threshold
- Swipe left: gold "Freeze" + coral "Delete" buttons revealed
- Spring physics on snap-back and snap-to-action
- Long-press activates reorder mode (lift + shadow + drag handle)

### 7. `TodayTab` updates
- Wraps habit list in `Reorder.Group` from motion/react
- Each item is `Reorder.Item` with spring layout animations
- Category groups use spring-animated collapse

## Test Plan

### Infrastructure
- Add `jsdom` environment to vitest
- Add `@testing-library/react` + `@testing-library/jest-dom`
- Update vitest.config.ts for `.test.tsx` files
- Create `src/test-setup.ts` with motion mock

### Test Files
1. `useSwipeGesture.test.tsx` — swipe detection, thresholds, haptics
2. `useLongPress.test.tsx` — timer, cancellation, movement
3. `AnimatedRing.test.tsx` — SVG rendering, progress animation
4. `ParticleBurst.test.tsx` — particle spawn/cleanup
5. `ReactiveHero.test.tsx` — integration, completion flow
6. `SwipeableHabitRow.test.tsx` — gesture + component integration

### Test Approach
- Simulate pointer events via `fireEvent` / `userEvent`
- Use `motionValue` for animation state assertions
- Use `nextFrame()` utility for async animation checks
- Mock `navigator.vibrate` for haptic tests
