import { useState, useEffect, useCallback } from 'react';
import { getHabitLogs, logCheckIn, removeCheckIn } from '../db';
import { formatDate, addDays } from '../utils/date-utils';
import { calculateStreak } from '../utils/streak';
import { NumericInput } from './NumericInput';
import type { Habit } from '../types';

interface HabitRowProps {
  habit: Habit;
  onCheckIn?: () => void;
}

function triggerHaptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

export function HabitRow({ habit, onCheckIn }: HabitRowProps) {
  const [checked, setChecked] = useState(false);
  const [numericValue, setNumericValue] = useState(0);
  const [streak, setStreak] = useState(0);
  const todayStr = formatDate(new Date());
  const isNumeric = habit.valueType === 'numeric';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const end = addDays(new Date(), 1);
      const weekAgo = formatDate(addDays(new Date(), -30));
      const raw = await getHabitLogs(habit.id, weekAgo, formatDate(end));
      if (cancelled) return;
      const map = new Map<string, number>();
      for (const log of raw) map.set(log.date, log.value);
      const todayVal = map.get(todayStr) ?? 0;
      setChecked(todayVal > 0);
      setNumericValue(todayVal);
      setStreak(calculateStreak(map));
    }
    load();
    return () => { cancelled = true; };
  }, [habit.id, todayStr]);

  const toggle = useCallback(async () => {
    const next = !checked;
    triggerHaptic();
    setChecked(next);
    try {
      if (next) {
        await logCheckIn(habit.id, todayStr, 1);
      } else {
        await removeCheckIn(habit.id, todayStr);
      }
    } catch (err) {
      console.error('Toggle failed:', err);
      setChecked(checked);
    }
    onCheckIn?.();
  }, [checked, habit.id, todayStr, onCheckIn]);

  const handleNumericChange = useCallback((_value: number) => {
    setNumericValue(_value);
    setChecked(_value > 0);
    onCheckIn?.();
  }, [onCheckIn]);

  const color = habit.color || '#6366f1';

  return (
    <div
      className="flex items-center gap-3 rounded-md bg-surface-card px-3 py-2.5 border border-border transition-all hover:border-primary/20"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {isNumeric ? (
        <NumericInput
          habitId={habit.id}
          value={numericValue}
          unit={habit.unit}
          targetValue={habit.targetValue}
          onChange={handleNumericChange}
        />
      ) : (
        <button
          onClick={toggle}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
            checked
              ? 'border-primary bg-primary text-surface-base'
              : 'border-border bg-transparent text-text-muted hover:border-primary hover:text-primary'
          }`}
          title={checked ? 'Uncheck' : 'Check in'}
        >
          {checked ? (
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="10" r="7" />
            </svg>
          )}
        </button>
      )}
      <div className="min-w-0 flex-1">
        <span className="truncate text-sm font-medium text-text-primary">{habit.name}</span>
      </div>
      {streak > 0 && (
        <span className="shrink-0 text-xs font-bold text-primary">{streak}d</span>
      )}
    </div>
  );
}
