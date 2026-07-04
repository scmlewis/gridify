import { formatDate } from './date-utils';

export interface YearComparison {
  hasTwoYears: boolean;
  currentYear: YearData;
  previousYear: YearData | null;
}

export interface YearData {
  year: number;
  completedDays: number;
  totalDays: number;
  completionRate: number;
  bestStreak: number;
}

function computeBestStreak(logs: Map<string, number>, startDate: string, endDate: string): number {
  const dates = [...logs.entries()]
    .filter(([, v]) => v > 0)
    .map(([d]) => d)
    .filter(d => d >= startDate && d <= endDate)
    .sort();

  if (dates.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

export function getYearComparison(logs: Map<string, number>): YearComparison {
  const now = new Date();
  const currentYear = now.getFullYear();

  const currentYearStart = formatDate(new Date(currentYear, 0, 1));
  const currentYearEnd = formatDate(now);

  let currentCompleted = 0;
  let currentTotal = 0;

  for (const [dateStr, value] of logs.entries()) {
    if (dateStr >= currentYearStart && dateStr <= currentYearEnd) {
      currentTotal++;
      if (value > 0) currentCompleted++;
    }
  }

  const currentYearData: YearData = {
    year: currentYear,
    completedDays: currentCompleted,
    totalDays: currentTotal,
    completionRate: currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0,
    bestStreak: computeBestStreak(logs, currentYearStart, currentYearEnd),
  };

  // Check for previous year data
  const previousYearStart = formatDate(new Date(currentYear - 1, 0, 1));
  const previousYearEnd = formatDate(new Date(currentYear - 1, 11, 31));

  let prevCompleted = 0;
  let prevTotal = 0;

  for (const [dateStr, value] of logs.entries()) {
    if (dateStr >= previousYearStart && dateStr <= previousYearEnd) {
      prevTotal++;
      if (value > 0) prevCompleted++;
    }
  }

  const hasTwoYears = prevTotal > 0;

  const previousYearData: YearData | null = hasTwoYears
    ? {
        year: currentYear - 1,
        completedDays: prevCompleted,
        totalDays: prevTotal,
        completionRate: Math.round((prevCompleted / prevTotal) * 100),
        bestStreak: computeBestStreak(logs, previousYearStart, previousYearEnd),
      }
    : null;

  return {
    hasTwoYears,
    currentYear: currentYearData,
    previousYear: previousYearData,
  };
}
