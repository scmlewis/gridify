import { describe, it, expect } from 'vitest';
import { calculateStreak, calculateMomentum, getMilestone } from './streak';
import { formatDate, addDays } from './date-utils';

function makeLogs(dates: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of dates) {
    map.set(d, 1);
  }
  return map;
}

function todayStr(): string {
  return formatDate(new Date());
}

function daysAgo(n: number): string {
  return formatDate(addDays(new Date(), -n));
}

describe('calculateStreak', () => {
  it('returns 0 for empty logs', () => {
    expect(calculateStreak(new Map())).toBe(0);
  });

  it('counts streak including today', () => {
    const logs = makeLogs([todayStr()]);
    expect(calculateStreak(logs)).toBe(1);
  });

  it('counts consecutive days', () => {
    const logs = makeLogs([todayStr(), daysAgo(1), daysAgo(2)]);
    expect(calculateStreak(logs)).toBe(3);
  });

  it('allows 1 missed day (grace period)', () => {
    // Checked in today, missed yesterday, checked in 2 days ago
    const logs = makeLogs([todayStr(), daysAgo(2)]);
    expect(calculateStreak(logs)).toBe(2);
  });

  it('breaks streak after 2 missed days', () => {
    // Checked in today, missed yesterday and 2 days ago, checked in 3 days ago
    const logs = makeLogs([todayStr(), daysAgo(3)]);
    expect(calculateStreak(logs)).toBe(1);
  });

  it('does not count grace day toward streak length', () => {
    // Checked in today and 2 days ago (missed yesterday = grace)
    const logs = makeLogs([todayStr(), daysAgo(2)]);
    // streak = 2 (today + 2 days ago), grace day skipped
    expect(calculateStreak(logs)).toBe(2);
  });

  it('handles streak starting before today with grace', () => {
    // Missed today (grace), checked in yesterday, 2 days ago, 3 days ago
    const logs = makeLogs([daysAgo(1), daysAgo(2), daysAgo(3)]);
    expect(calculateStreak(logs)).toBe(3);
  });

  it('breaks if today and yesterday both missed (no grace left for 2nd miss)', () => {
    // Only checked in 3 days ago
    const logs = makeLogs([daysAgo(3)]);
    expect(calculateStreak(logs)).toBe(0);
  });
});

describe('calculateMomentum', () => {
  it('counts completed days in window', () => {
    const logs = makeLogs([todayStr(), daysAgo(1), daysAgo(5)]);
    const result = calculateMomentum(logs, 7);
    expect(result.completed).toBe(3);
    expect(result.total).toBe(7);
  });

  it('defaults to 14-day window', () => {
    const logs = makeLogs([todayStr()]);
    const result = calculateMomentum(logs);
    expect(result.total).toBe(14);
  });

  it('returns 0 for empty logs', () => {
    const result = calculateMomentum(new Map(), 7);
    expect(result.completed).toBe(0);
  });
});

describe('getMilestone', () => {
  it('returns milestone number when hit', () => {
    expect(getMilestone(7)).toBe(7);
    expect(getMilestone(30)).toBe(30);
    expect(getMilestone(100)).toBe(100);
  });

  it('returns null when not a milestone', () => {
    expect(getMilestone(5)).toBeNull();
    expect(getMilestone(13)).toBeNull();
    expect(getMilestone(99)).toBeNull();
  });
});
