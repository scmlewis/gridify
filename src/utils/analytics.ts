import { formatDate, addDays, parseDate } from './date-utils';

export function calculateCompletionRate(
  logs: Map<string, number>,
  startDate: string,
  endDate: string
): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  let totalDays = 0;
  let completedDays = 0;

  let current = new Date(start);
  while (current <= end) {
    totalDays++;
    const dateStr = formatDate(current);
    if (logs.has(dateStr) && logs.get(dateStr)! > 0) {
      completedDays++;
    }
    current = addDays(current, 1);
  }

  return totalDays === 0 ? 0 : (completedDays / totalDays) * 100;
}

export function calculateDayOfWeekStats(logs: Map<string, number>): Record<number, number> {
  const stats: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const [dateStr, value] of logs.entries()) {
    if (value > 0) {
      const date = parseDate(dateStr);
      const day = date.getDay();
      stats[day]++;
    }
  }
  return stats;
}
