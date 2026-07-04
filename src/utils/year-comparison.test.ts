import { describe, it, expect } from 'vitest';
import { getYearComparison } from './year-comparison';

function makeLogs(dates: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of dates) {
    map.set(d, 1);
  }
  return map;
}

describe('getYearComparison', () => {
  it('returns current year data when only current year has data', () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const logs = makeLogs([todayStr]);
    const result = getYearComparison(logs);

    expect(result.currentYear.year).toBe(today.getFullYear());
    expect(result.currentYear.completedDays).toBe(1);
    expect(result.currentYear.completionRate).toBeGreaterThan(0);
    expect(result.hasTwoYears).toBe(false);
    expect(result.previousYear).toBeNull();
  });

  it('detects two years of data', () => {
    const currentYear = new Date().getFullYear();
    const logs = makeLogs([
      `${currentYear}-06-15`,
      `${currentYear - 1}-06-15`,
    ]);
    const result = getYearComparison(logs);

    expect(result.hasTwoYears).toBe(true);
    expect(result.previousYear).not.toBeNull();
    expect(result.previousYear!.year).toBe(currentYear - 1);
  });

  it('returns zero completion rate for empty logs', () => {
    const result = getYearComparison(new Map());
    expect(result.currentYear.completionRate).toBe(0);
    expect(result.currentYear.completedDays).toBe(0);
    expect(result.hasTwoYears).toBe(false);
  });

  it('computes best streak within each year', () => {
    const currentYear = new Date().getFullYear();
    const logs = makeLogs([
      `${currentYear}-01-01`,
      `${currentYear}-01-02`,
      `${currentYear}-01-03`,
      `${currentYear}-01-05`, // gap here, streak breaks
      `${currentYear}-01-06`,
    ]);
    const result = getYearComparison(logs);
    expect(result.currentYear.bestStreak).toBe(3);
  });
});
