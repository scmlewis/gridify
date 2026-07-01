## Task 6: Onboarding Flow — COMPLETE

**Status:** DONE
**Commit:** `f6dfcd5` — feat: add onboarding flow

### Files Created/Modified
- `src/components/OnboardingFlow.tsx` — 3-step onboarding: Welcome, Category Selection, First Habit
- `src/components/TodayTab.tsx` — Checks `onboardingCompleted` and renders OnboardingFlow if needed

### What's Implemented
- **Step 1:** Welcome screen with "Get Started" and "Skip" buttons
- **Step 2:** Category selection with 5 defaults (Fitness, Mindfulness, Learning, Productivity, Health) + custom input
- **Step 3:** First habit creation (name, category dropdown, binary/numeric toggle)
- Uses `completeOnboarding()` to persist completion state
- Uses `createHabit()` to create first habit if provided
- Skip at any step saves empty categories and marks onboarding complete
- Shows loading state while fetching profile

### Build
- `npm run build` passes (tsc + vite)

### Concerns
- None
