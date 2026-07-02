import { describe, it, expect } from 'vitest';
import { calculateCompletionRate, calculateDayOfWeekStats } from './analytics';

function makeLogs(entries: [string, number][]): Map<string, number> {
  return new Map(entries);
}

describe('calculateCompletionRate', () => {
  it('returns 0 for empty logs', () => {
    const rate = calculateCompletionRate(new Map(), '2025-01-01', '2025-01-07');
    expect(rate).toBe(0);
  });

  it('returns 100% when all days have logs', () => {
    const logs = makeLogs([
      ['2025-01-01', 1],
      ['2025-01-02', 1],
      ['2025-01-03', 1],
    ]);
    const rate = calculateCompletionRate(logs, '2025-01-01', '2025-01-03');
    expect(rate).toBe(100);
  });

  it('returns 50% for 3 of 6 days', () => {
    const logs = makeLogs([
      ['2025-01-01', 1],
      ['2025-01-03', 1],
      ['2025-01-05', 1],
    ]);
    const rate = calculateCompletionRate(logs, '2025-01-01', '2025-01-06');
    expect(rate).toBe(50);
  });

  it('returns 0 for single day with no log', () => {
    const rate = calculateCompletionRate(new Map(), '2025-01-01', '2025-01-01');
    expect(rate).toBe(0);
  });

  it('returns 100 for single day with log', () => {
    const logs = makeLogs([['2025-01-01', 1]]);
    const rate = calculateCompletionRate(logs, '2025-01-01', '2025-01-01');
    expect(rate).toBe(100);
  });

  it('ignores zero-value logs', () => {
    const logs = makeLogs([['2025-01-01', 0], ['2025-01-02', 1]]);
    const rate = calculateCompletionRate(logs, '2025-01-01', '2025-01-02');
    expect(rate).toBe(50);
  });

  it('returns 0 for invalid date range', () => {
    const rate = calculateCompletionRate(new Map(), 'invalid', '2025-01-01');
    expect(rate).toBe(0);
  });
});

describe('calculateDayOfWeekStats', () => {
  it('returns all zeros for empty logs', () => {
    const stats = calculateDayOfWeekStats(new Map());
    expect(stats).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
  });

  it('counts check-ins per day of week', () => {
    // 2025-01-01 is Wednesday (3)
    // 2025-01-02 is Thursday (4)
    // 2025-01-05 is Sunday (0)
    const logs = makeLogs([
      ['2025-01-01', 1],
      ['2025-01-02', 1],
      ['2025-01-05', 1],
    ]);
    const stats = calculateDayOfWeekStats(logs);
    expect(stats[0]).toBe(1); // Sunday
    expect(stats[3]).toBe(1); // Wednesday
    expect(stats[4]).toBe(1); // Thursday
    expect(stats[1]).toBe(0); // Monday - no logs
  });

  it('ignores zero-value logs', () => {
    const logs = makeLogs([['2025-01-01', 0]]);
    const stats = calculateDayOfWeekStats(logs);
    expect(stats[3]).toBe(0);
  });
});
