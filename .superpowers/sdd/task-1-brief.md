### Task 1: Database Migration to v4
Files: Modify src/db.ts, src/types.ts
- Add fields: category, valueType, unit, targetFrequency, targetValue, color to Habit
- Add fields: onboardingCompleted, categories to UserProfile
- Version 4 schema with migration defaults
- New functions: updateHabit, getCategories, updateCategories, completeOnboarding
- Commit: feat: migrate database to v4


