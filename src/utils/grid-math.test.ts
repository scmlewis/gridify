import { describe, it, expect } from 'vitest';
import { getGridCoordinates, getLogLevel, computeQuartileThresholds, getLogLevelDynamic } from './grid-math';
import { formatDate, addDays } from './date-utils';

describe('getGridCoordinates', () => {
  const startDate = new Date(2024, 5, 16); // Sunday

  it('returns col 0, row 0 for start date (Sunday, week 0)', () => {
    const result = getGridCoordinates(formatDate(startDate), startDate);
    expect(result).toEqual({ col: 0, row: 0 });
  });

  it('returns col 1, row 0 for Monday (day 1, week 0)', () => {
    const monday = addDays(startDate, 1);
    const result = getGridCoordinates(formatDate(monday), startDate);
    expect(result).toEqual({ col: 1, row: 0 });
  });

  it('returns col 0, row 1 for next Sunday (day 0, week 1)', () => {
    const nextSunday = addDays(startDate, 7);
    const result = getGridCoordinates(formatDate(nextSunday), startDate);
    expect(result).toEqual({ col: 0, row: 1 });
  });

  it('returns null for date before grid start', () => {
    const before = addDays(startDate, -1);
    const result = getGridCoordinates(formatDate(before), startDate);
    expect(result).toBeNull();
  });

  it('returns null for date beyond grid range (53 weeks)', () => {
    const beyond = addDays(startDate, 53 * 7);
    const result = getGridCoordinates(formatDate(beyond), startDate);
    expect(result).toBeNull();
  });

  it('returns col 6, row 52 at 52 weeks + 6 days (Saturday, last week)', () => {
    const lastDay = addDays(startDate, 53 * 7 - 1);
    const result = getGridCoordinates(formatDate(lastDay), startDate);
    expect(result).not.toBeNull();
    expect(result!.col).toBe(6);
    expect(result!.row).toBe(52);
  });
});

describe('getLogLevel', () => {
  it('returns 0 for value 0', () => {
    expect(getLogLevel(0)).toBe(0);
  });

  it('returns 0 for negative values', () => {
    expect(getLogLevel(-5)).toBe(0);
  });

  it('returns 1 for value 1', () => {
    expect(getLogLevel(1)).toBe(1);
  });

  it('returns 2 for value 2', () => {
    expect(getLogLevel(2)).toBe(2);
  });

  it('returns 3 for value 3', () => {
    expect(getLogLevel(3)).toBe(3);
  });

  it('returns 4 for value 4+', () => {
    expect(getLogLevel(4)).toBe(4);
    expect(getLogLevel(10)).toBe(4);
  });
});

describe('computeQuartileThresholds', () => {
  it('returns default [1, 2, 3] for empty logs', () => {
    expect(computeQuartileThresholds(new Map())).toEqual([1, 2, 3]);
  });

  it('returns default [1, 2, 3] for all-zero logs', () => {
    const logs = new Map([['2025-01-01', 0], ['2025-01-02', 0]]);
    expect(computeQuartileThresholds(logs)).toEqual([1, 2, 3]);
  });

  it('computes quartiles from actual data', () => {
    const logs = new Map([
      ['2025-01-01', 1],
      ['2025-01-02', 2],
      ['2025-01-03', 3],
      ['2025-01-04', 4],
    ]);
    const [q1, q2, q3] = computeQuartileThresholds(logs);
    expect(q1).toBeGreaterThanOrEqual(1);
    expect(q2).toBeGreaterThanOrEqual(q1);
    expect(q3).toBeGreaterThanOrEqual(q2);
  });

  it('ignores zero values in computation', () => {
    const logs = new Map([
      ['2025-01-01', 0],
      ['2025-01-02', 0],
      ['2025-01-03', 5],
    ]);
    const [q1, q2, q3] = computeQuartileThresholds(logs);
    // Only one non-zero value: all quartiles should be 5
    expect(q1).toBe(5);
    expect(q2).toBe(5);
    expect(q3).toBe(5);
  });
});

describe('getLogLevelDynamic', () => {
  const thresholds: [number, number, number] = [2, 4, 6];

  it('returns 0 for value 0', () => {
    expect(getLogLevelDynamic(0, thresholds)).toBe(0);
  });

  it('returns 1 for value <= q1', () => {
    expect(getLogLevelDynamic(1, thresholds)).toBe(1);
    expect(getLogLevelDynamic(2, thresholds)).toBe(1);
  });

  it('returns 2 for value <= q2', () => {
    expect(getLogLevelDynamic(3, thresholds)).toBe(2);
    expect(getLogLevelDynamic(4, thresholds)).toBe(2);
  });

  it('returns 3 for value <= q3', () => {
    expect(getLogLevelDynamic(5, thresholds)).toBe(3);
    expect(getLogLevelDynamic(6, thresholds)).toBe(3);
  });

  it('returns 4 for value > q3', () => {
    expect(getLogLevelDynamic(7, thresholds)).toBe(4);
    expect(getLogLevelDynamic(100, thresholds)).toBe(4);
  });
});
