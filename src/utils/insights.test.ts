import { describe, it, expect } from 'vitest';
import { calculateJaccardSimilarity, getCrossHabitCorrelations, getMonthlyTrends } from './insights';

describe('calculateJaccardSimilarity', () => {
  it('returns 1 for identical empty sets', () => {
    expect(calculateJaccardSimilarity(new Set(), new Set())).toBe(1);
  });

  it('returns 1 for identical sets', () => {
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['a', 'b', 'c']);
    expect(calculateJaccardSimilarity(a, b)).toBe(1);
  });

  it('returns 0 for disjoint sets', () => {
    const a = new Set(['a', 'b']);
    const b = new Set(['c', 'd']);
    expect(calculateJaccardSimilarity(a, b)).toBe(0);
  });

  it('computes correct similarity for partial overlap', () => {
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['b', 'c', 'd']);
    // intersection = {b, c} = 2, union = {a, b, c, d} = 4
    expect(calculateJaccardSimilarity(a, b)).toBe(0.5);
  });
});

describe('getCrossHabitCorrelations', () => {
  it('returns empty for no habits', () => {
    expect(getCrossHabitCorrelations(new Map())).toEqual([]);
  });

  it('returns empty for single habit', () => {
    const logs = new Map([['h1', new Set(['2025-01-01'])]]);
    expect(getCrossHabitCorrelations(logs)).toEqual([]);
  });

  it('computes correlation between two habits', () => {
    const logs = new Map([
      ['h1', new Set(['2025-01-01', '2025-01-02'])],
      ['h2', new Set(['2025-01-01', '2025-01-03'])],
    ]);
    const correlations = getCrossHabitCorrelations(logs);
    expect(correlations).toHaveLength(1);
    expect(correlations[0].habitA).toBe('h1');
    expect(correlations[0].habitB).toBe('h2');
    expect(correlations[0].correlation).toBeGreaterThan(0);
  });

  it('excludes zero-correlation pairs', () => {
    const logs = new Map([
      ['h1', new Set(['2025-01-01'])],
      ['h2', new Set(['2025-01-05'])],
    ]);
    const correlations = getCrossHabitCorrelations(logs);
    expect(correlations).toHaveLength(0); // no overlap = 0 similarity, excluded
  });
});

describe('getMonthlyTrends', () => {
  it('returns empty for no logs', () => {
    expect(getMonthlyTrends(new Map())).toEqual({});
  });

  it('aggregates values by month', () => {
    const logs = new Map([
      ['2025-01-01', 2],
      ['2025-01-15', 3],
      ['2025-02-01', 1],
    ]);
    const trends = getMonthlyTrends(logs);
    expect(trends['2025-01']).toBe(5);
    expect(trends['2025-02']).toBe(1);
  });
});
