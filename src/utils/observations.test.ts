import { describe, it, expect } from 'vitest';
import { generateGlobalObservations, generateHabitObservations } from './observations';
import type { Habit } from '../types';

function makeLogs(dates: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of dates) {
    map.set(d, 1);
  }
  return map;
}

function makeHabit(id: string, name: string): Habit {
  return {
    id,
    name,
    createdAt: '2025-01-01',
    archived: false,
    sortOrder: 0,
    freezesUsed: 0,
    maxFreezes: 2,
    category: 'Test',
    valueType: 'boolean',
    unit: '',
    targetFrequency: 'daily',
    targetValue: 1,
    color: '#2BA8A2',
  };
}

describe('generateGlobalObservations', () => {
  it('returns empty array for no habits', () => {
    const result = generateGlobalObservations([], []);
    expect(result).toEqual([]);
  });

  it('returns empty array when no habits have data', () => {
    const habit = makeHabit('1', 'Test');
    const result = generateGlobalObservations([habit], [{ habit, logs: new Map() }]);
    expect(result).toEqual([]);
  });

  it('reports active habit count when data exists', () => {
    const habit = makeHabit('1', 'Test');
    const logs = makeLogs(['2025-01-01', '2025-01-02']);
    const result = generateGlobalObservations([habit], [{ habit, logs }]);
    expect(result.some(o => o.text.includes('1 of 1 habits'))).toBe(true);
  });

  it('reports today progress when today has check-ins', () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const habit = makeHabit('1', 'Test');
    const logs = makeLogs([todayStr]);
    const result = generateGlobalObservations([habit], [{ habit, logs }]);
    expect(result.some(o => o.text.includes('All habits done today'))).toBe(true);
  });
});

describe('generateHabitObservations', () => {
  it('returns empty array for empty logs', () => {
    const habit = makeHabit('1', 'Test');
    const result = generateHabitObservations(habit, new Map(), [], new Map());
    expect(result).toEqual([]);
  });

  it('returns observations for habits with data', () => {
    const habit = makeHabit('1', 'Exercise');
    const logs = makeLogs([
      '2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04',
      '2025-06-07', '2025-06-08', '2025-06-09', '2025-06-10',
    ]);
    const result = generateHabitObservations(habit, logs, [], new Map());
    expect(result.length).toBeGreaterThan(0);
  });

  it('does not exceed 5 observations', () => {
    const habit = makeHabit('1', 'Exercise');
    const logs = makeLogs(Array.from({ length: 100 }, (_, i) => {
      const d = new Date(2025, 0, 1);
      d.setDate(d.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }));
    const result = generateHabitObservations(habit, logs, [], new Map());
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('includes correlation observation when correlated habits exist', () => {
    const habitA = makeHabit('a', 'Exercise');
    const habitB = makeHabit('b', 'Meditation');
    const sharedDates = ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04'];
    const logsA = makeLogs(sharedDates);
    const logsB = makeLogs(sharedDates);
    const allHabitLogs = new Map<string, Map<string, number>>();
    allHabitLogs.set('b', logsB);
    const result = generateHabitObservations(habitA, logsA, [habitA, habitB], allHabitLogs);
    expect(result.some(o => o.id.startsWith('correlation-'))).toBe(true);
  });
});
