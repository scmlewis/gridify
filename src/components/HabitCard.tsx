import { useState, useEffect, useCallback } from 'react';
import { ContributionGrid } from './ContributionGrid';
import { getHabitLogs, logCheckIn, removeCheckIn, archiveHabit } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';
import { calculateStreak } from '../utils/streak';
import type { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onArchived: (id: string) => void;
}

export function HabitCard({ habit, onArchived }: HabitCardProps) {
  const [logs, setLogs] = useState<Map<string, number>>(new Map());
  const [todayChecked, setTodayChecked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showArchive, setShowArchive] = useState(false);

  const todayStr = formatDate(new Date());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const start = getGridStartDate();
      const end = addDays(new Date(), 1);
      const raw = await getHabitLogs(habit.id, formatDate(start), formatDate(end));
      if (cancelled) return;
      const map = new Map<string, number>();
      for (const log of raw) {
        map.set(log.date, log.value);
      }
      setLogs(map);
      setTodayChecked((map.get(todayStr) ?? 0) > 0);
      setStreak(calculateStreak(map));
    }
    load();
    return () => { cancelled = true; };
  }, [habit.id, todayStr]);

  const toggleToday = useCallback(async () => {
    const newChecked = !todayChecked;
    // Optimistic update
    setTodayChecked(newChecked);
    const newLogs = new Map(logs);
    if (newChecked) {
      newLogs.set(todayStr, 1);
    } else {
      newLogs.delete(todayStr);
    }
    setLogs(newLogs);
    setStreak(calculateStreak(newLogs));

    try {
      if (newChecked) {
        await logCheckIn(habit.id, todayStr, 1);
      } else {
        await removeCheckIn(habit.id, todayStr);
      }
    } catch (err) {
      console.error('Failed to toggle check-in:', err);
      // Revert on failure
      setTodayChecked(todayChecked);
      setLogs(logs);
      setStreak(calculateStreak(logs));
    }
  }, [todayChecked, logs, todayStr, habit.id]);

  const handleArchive = useCallback(async () => {
    try {
      await archiveHabit(habit.id);
      onArchived(habit.id);
    } catch (err) {
      console.error('Failed to archive habit:', err);
    }
  }, [habit.id, onArchived]);

  return (
    <div
      className="flex items-center gap-3 rounded bg-gray-800 px-3 py-2"
      onMouseEnter={() => setShowArchive(true)}
      onMouseLeave={() => setShowArchive(false)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          onClick={toggleToday}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            todayChecked
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-gray-600 bg-transparent text-gray-500 hover:border-emerald-600 hover:text-emerald-500'
          }`}
          title={todayChecked ? 'Uncheck in' : 'Check in'}
        >
          {todayChecked ? (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="10" r="7" />
            </svg>
          )}
        </button>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-200">{habit.name}</div>
          <div className="text-xs text-gray-500">
            {streak > 0 ? `${streak} day streak` : 'No streak'}
          </div>
        </div>
        {showArchive && (
          <button
            onClick={handleArchive}
            className="ml-auto shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-gray-300 transition-colors"
            title="Archive habit"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5h10M8 5V3h4v2M6 5v10h8V5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <div className="shrink-0">
        <ContributionGrid logs={logs} cellSize={8} cellGap={1} />
      </div>
    </div>
  );
}
