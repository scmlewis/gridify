import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Circle } from 'lucide-react';
import { getHabitLogs, logCheckIn, removeCheckIn } from '../db';
import { formatDate, addDays } from '../utils/date-utils';
import { calculateStreak } from '../utils/streak';
import { NumericInput } from './NumericInput';
import type { Habit } from '../types';

interface HabitRowProps {
  habit: Habit;
  onCheckIn?: () => void;
  onTap?: (habit: Habit) => void;
  onDragStart?: (e: React.DragEvent, habitId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, habitId: string) => void;
  refreshKey?: number;
}

function triggerHaptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

export function HabitRow({ habit, onCheckIn, onTap, onDragStart, onDragOver, onDrop, refreshKey }: HabitRowProps) {
  const [checked, setChecked] = useState(false);
  const [numericValue, setNumericValue] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const todayStr = formatDate(new Date());
  const isNumeric = habit.valueType === 'numeric';
  const isLongPressRef = useRef(false);
  const timerRef = useRef<number | null>(null);

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

      // Calculate this week's count
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = addDays(now, -((dayOfWeek + 6) % 7));
      const mondayStr = formatDate(monday);
      let count = 0;
      for (const log of raw) {
        if (log.date >= mondayStr && log.date <= todayStr && log.value > 0) count++;
      }
      setWeekCount(count);
    }
    load();
    return () => { cancelled = true; };
  }, [habit.id, todayStr, refreshKey]);

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

  const handleTouchStart = (_e: React.TouchEvent) => {
    isLongPressRef.current = false;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      triggerHaptic();
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart?.(e, habit.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    onDragOver?.(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    onDrop?.(e, habit.id);
    isLongPressRef.current = false;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      return;
    }
    onTap?.(habit);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
className={`group flex items-center gap-3 rounded-xl bg-surface-card px-3.5 py-3 border transition-all duration-200 border-border/60 hover:border-primary/30 hover:bg-surface-card/80 cursor-pointer hover:shadow-md hover:shadow-primary/5`}
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
          onClick={(e) => {
            e.stopPropagation();
            if (isLongPressRef.current) {
              return;
            }
            toggle();
          }}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 ${
            checked
              ? 'border-primary bg-primary text-surface-base shadow-sm shadow-primary/25'
              : 'border-border bg-transparent text-text-muted hover:border-primary/60 hover:text-primary'
          }`}
          title={checked ? 'Uncheck' : 'Check in'}
        >
          {checked ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <Circle className="h-3.5 w-3.5" strokeWidth={1.8} />
          )}
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {habit.icon && <span className="text-sm shrink-0">{habit.icon}</span>}
          <span className="truncate text-sm font-medium text-text-primary">{habit.name}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-text-muted">
            {weekCount}/{habit.targetValue || 7} days this week
          </span>
          <span className="ml-auto text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">hold to reorder</span>
        </div>
      </div>
      {streak > 0 && (
        <span className="shrink-0 text-xs font-bold text-primary">{streak}d</span>
      )}
    </div>
  );
}
