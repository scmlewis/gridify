import { useState, useEffect } from 'react';
import { Star, Calendar } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-3xl bg-surface-card p-6 border border-white/5 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary font-display">Today's Progress</h3>
          <span className="text-xs font-medium text-text-secondary">
            {doneToday.size}/{activeHabits.length} done
          </span>
        </div>
        <div className="flex gap-2 mb-4">
          {activeHabits.map((h) => (
            <div
              key={h.id}
              className={`h-3 w-3 rounded-full transition-colors ${
                doneToday.has(h.id) ? 'bg-primary' : 'bg-white/10'
              }`}
              title={h.name}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-accent-gold" fill="currentColor" />
            <span className="text-text-secondary">Best: <span className="font-bold text-text-primary">{bestStreak}d</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-text-secondary">Active: <span className="font-bold text-text-primary">{weeklyPct}%</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
