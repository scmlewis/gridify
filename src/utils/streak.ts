import { formatDate, addDays } from './date-utils';

/**
 * Calculate current streak with a single grace day.
 * At most ONE missed day is allowed anywhere in the trailing window without
 * breaking the streak; that missed day does not count toward the streak
 * length. Once the grace has been used, the next missed day ends the streak.
 * Returns the count of consecutive days with check-ins.
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
      checkDate = addDays(checkDate, -1);
    } else if (!graceUsed) {
      // Allow a single missed day — skip it without counting it toward streak
      graceUsed = true;
      checkDate = addDays(checkDate, -1);
    } else {
      // A second missed day (or the first, once grace is spent) breaks it
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
 * Get a qualitative label for momentum score.
 * momentum.completed / momentum.total as a percentage.
 */
export function getMomentumLabel(completed: number, total: number): { label: string; color: string } {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  if (pct >= 90) return { label: 'Excellent', color: '#27AE60' };
  if (pct >= 70) return { label: 'Good', color: '#2BA8A2' };
  if (pct >= 40) return { label: 'Recovering', color: '#F39C12' };
  return { label: 'Needs Attention', color: '#E74C3C' };
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
