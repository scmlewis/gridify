# Task 6: Toast Spring Curve

## Summary
Replaced `animate-slide-up` with `animate-slide-up-sheet` on the Toast component's root div to use a spring-curve entrance animation.

## Changes
- `src/components/Toast.tsx:30` — swapped `animate-slide-up` → `animate-slide-up-sheet`

## Verification
- `npx tsc --noEmit` — passed (no errors)
- `npx vitest run` — 7 files, 89 tests, all passing

## Commit
- SHA: `f98b49363c14dfe804903cd01c5d2edd04ee7c82`
- Message: `feat: toast spring curve entrance animation`
