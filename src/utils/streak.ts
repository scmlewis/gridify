import { formatDate } from './date-utils';

export function calculateStreak(logs: Map<string, number>): number {
  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);

  while (true) {
    const dateStr = formatDate(checkDate);
    if (logs.has(dateStr) && logs.get(dateStr)! > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
