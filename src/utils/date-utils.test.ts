import { describe, it, expect } from 'vitest';
import { formatDate, parseDate, getSunday, addDays } from './date-utils';

describe('formatDate', () => {
  it('formats date with zero-padded month and day', () => {
    expect(formatDate(new Date(2025, 0, 5))).toBe('2025-01-05');
  });

  it('formats date with single-digit month and day', () => {
    expect(formatDate(new Date(2025, 11, 31))).toBe('2025-12-31');
  });

  it('formats January 1st', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('parseDate', () => {
  it('parses YYYY-MM-DD to local midnight', () => {
    const d = parseDate('2025-06-15');
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(0);
  });

  it('round-trips with formatDate', () => {
    const original = new Date(2025, 2, 10);
    const roundTripped = parseDate(formatDate(original));
    expect(roundTripped.getFullYear()).toBe(original.getFullYear());
    expect(roundTripped.getMonth()).toBe(original.getMonth());
    expect(roundTripped.getDate()).toBe(original.getDate());
  });
});

describe('getSunday', () => {
  it('returns same date if already Sunday', () => {
    // 2025-06-15 is a Sunday
    const sunday = new Date(2025, 5, 15);
    const result = getSunday(sunday);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('returns previous Sunday for a Wednesday', () => {
    // 2025-06-18 is a Wednesday
    const wed = new Date(2025, 5, 18);
    const result = getSunday(wed);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('returns previous Sunday for a Monday', () => {
    // 2025-06-16 is a Monday
    const mon = new Date(2025, 5, 16);
    const result = getSunday(mon);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('sets time to midnight', () => {
    const withTime = new Date(2025, 5, 18, 14, 30, 0);
    const result = getSunday(withTime);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const base = new Date(2025, 0, 1);
    const result = addDays(base, 10);
    expect(result.getDate()).toBe(11);
  });

  it('subtracts days with negative value', () => {
    const base = new Date(2025, 0, 15);
    const result = addDays(base, -10);
    expect(result.getDate()).toBe(5);
  });

  it('does not mutate original', () => {
    const base = new Date(2025, 0, 1);
    addDays(base, 5);
    expect(base.getDate()).toBe(1);
  });

  it('crosses month boundaries', () => {
    const base = new Date(2025, 0, 30);
    const result = addDays(base, 3);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(2);
  });
});
