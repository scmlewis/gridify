import { parseDate } from './date-utils';

export interface Correlation {
  habitA: string;
  habitB: string;
  correlation: number;
}

export function calculateJaccardSimilarity(
  logsA: Set<string>,
  logsB: Set<string>
): number {
  if (logsA.size === 0 && logsB.size === 0) return 1;
  
  const intersection = new Set([...logsA].filter(x => logsB.has(x)));
  const union = new Set([...logsA, ...logsB]);
  
  return intersection.size / union.size;
}

export function getCrossHabitCorrelations(
  allHabitLogs: Map<string, Set<string>>
): Correlation[] {
  const habitIds = Array.from(allHabitLogs.keys());
  const correlations: Correlation[] = [];

  for (let i = 0; i < habitIds.length; i++) {
    for (let j = i + 1; j < habitIds.length; j++) {
      const habitA = habitIds[i];
      const habitB = habitIds[j];
      const similarity = calculateJaccardSimilarity(
        allHabitLogs.get(habitA)!,
        allHabitLogs.get(habitB)!
      );
      
      if (similarity > 0) {
        correlations.push({ habitA, habitB, correlation: similarity });
      }
    }
  }

  return correlations;
}

export function getMonthlyTrends(allLogs: Map<string, number>): Record<string, number> {
  const trends: Record<string, number> = {};
  for (const [dateStr, value] of allLogs.entries()) {
    const date = parseDate(dateStr);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    trends[month] = (trends[month] || 0) + value;
  }
  return trends;
}
