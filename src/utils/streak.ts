import { formatDate, addDays } from './date-utils';

/**
 * Calculate current streak with grace period.
 * Grace period: 1 missed day is allowed without breaking the streak.
 * Returns { streak, lastMissedDate } where streak counts consecutive days including today.
 */
export function calculateStreak(logs: Map<string, number>): number {
  let streak = 0;
  let graceUsed = false;
  const today = new Date();
  let checkDate = new Date(today);

  while (true) {
    const dateStr = formatDate(checkDate);
    const hasLog = logs.has(dateStr) && logs.get(dateStr)! > 0;

    if (hasLog) {
      streak++;
      graceUsed = false;
      checkDate = addDays(checkDate, -1);
    } else if (!graceUsed) {
      graceUsed = true;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate momentum: "X of last Y days"
 * Shows a rolling window count instead of just streak.
 */
export function calculateMomentum(logs: Map<string, number>, windowDays: number = 14): { completed: number; total: number } {
  let completed = 0;
  const today = new Date();

  for (let i = 0; i < windowDays; i++) {
    const date = addDays(today, -i);
    const dateStr = formatDate(date);
    if (logs.has(dateStr) && logs.get(dateStr)! > 0) {
      completed++;
    }
  }

  return { completed, total: windowDays };
}

/**
 * Check if a streak hits a milestone.
 * Returns the milestone threshold if hit, or null.
 */
export function getMilestone(streak: number): number | null {
  const milestones = [7, 14, 21, 30, 50, 66, 100, 150, 200, 365];
  for (const m of milestones) {
    if (streak === m) return m;
  }
  return null;
}
