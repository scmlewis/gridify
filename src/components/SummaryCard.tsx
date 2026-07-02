import { useState, useEffect } from 'react';
import { getAllLogsForDateRange } from '../db';
import { formatDate, addDays } from '../utils/date-utils';
import { calculateStreak } from '../utils/streak';
import type { Habit } from '../types';

interface SummaryCardProps {
  habits: Habit[];
  refreshKey?: number;
}

export function SummaryCard({ habits, refreshKey }: SummaryCardProps) {
  const [doneToday, setDoneToday] = useState<Set<string>>(new Set());
  const [bestStreak, setBestStreak] = useState(0);
  const [weeklyPct, setWeeklyPct] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const today = formatDate(new Date());
      const weekAgo = formatDate(addDays(new Date(), -6));
      const allLogs = await getAllLogsForDateRange(weekAgo, today);

      if (cancelled) return;

      const doneSet = new Set<string>();
      for (const log of allLogs) {
        if (log.date === today && log.value > 0) {
          doneSet.add(log.habitId);
        }
      }
      setDoneToday(doneSet);

      let maxStreak = 0;
      for (const habit of habits) {
        const habitLogs = allLogs.filter((l) => l.habitId === habit.id);
        const logMap = new Map<string, number>();
        for (const l of habitLogs) logMap.set(l.date, l.value);
        const streak = calculateStreak(logMap);
        if (streak > maxStreak) maxStreak = streak;
      }
      setBestStreak(maxStreak);

      const activeHabits = habits.filter((h) => !h.archived).length;
      if (activeHabits === 0) {
        setWeeklyPct(0);
        return;
      }

      const daysActive = new Set<string>();
      for (const log of allLogs) {
        if (log.value > 0) daysActive.add(log.date);
      }
      let activeDays = 0;
      const d = new Date();
      for (let i = 0; i < 7; i++) {
        const ds = formatDate(d);
        if (daysActive.has(ds)) activeDays++;
        d.setDate(d.getDate() - 1);
      }
      setWeeklyPct(Math.round((activeDays / 7) * 100));
    }
    load();
    return () => { cancelled = true; };
  }, [habits, refreshKey]);

  const activeHabits = habits.filter((h) => !h.archived);

  return (
    <div className="rounded-xl bg-surface-card p-4 border border-border/60">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">Today's Progress</h3>
        <span className="text-xs font-medium text-text-secondary">
          {doneToday.size}/{activeHabits.length} done
        </span>
      </div>
      <div className="flex gap-1.5 mb-3">
        {activeHabits.map((h) => (
          <div
            key={h.id}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              doneToday.has(h.id) ? 'bg-primary' : 'bg-border'
            }`}
            title={h.name}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-accent-gold" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-text-secondary">Best: <span className="font-bold text-text-primary">{bestStreak}d</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span className="text-text-secondary">Active: <span className="font-bold text-text-primary">{weeklyPct}%</span></span>
        </div>
      </div>
    </div>
  );
}
