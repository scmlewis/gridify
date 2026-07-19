import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getHabits, getAllLogsForDateRange } from '../db';
import { formatDate, addDays } from '../utils/date-utils';
import type { Habit, HabitLog } from '../types';

interface WeeklyReviewProps {
  onClose: () => void;
}

export function WeeklyReview({ onClose }: WeeklyReviewProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date();
      const weekAgo = addDays(today, -6);
      const habitsData = await getHabits();
      const logsData = await getAllLogsForDateRange(formatDate(weekAgo), formatDate(today));
      setHabits(habitsData);
      setLogs(logsData);
      setLoading(false);
    }
    load();
  }, []);

  const getHabitCompletedDays = (habitId: string): number => {
    return logs.filter((l) => l.habitId === habitId && l.value > 0).length;
  };

  const totalCompleted = habits.reduce((sum, h) => sum + getHabitCompletedDays(h.id), 0);
  const totalPossible = habits.length * 7;
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="rounded-lg bg-surface-card p-6 animate-scale-in">Loading...</div>
      </div>
    );
  }

  return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 animate-backdrop-in backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-surface-card p-6 shadow-xl border border-border animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary font-display">Weekly Review</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-primary/10 p-4 text-center">
          <div className="text-3xl font-extrabold text-primary">{completionRate}%</div>
          <div className="text-sm text-text-secondary">
            {totalCompleted} of {totalPossible} possible check-ins this week
          </div>
        </div>

        <div className="space-y-3">
          {habits.map((habit) => {
            const days = getHabitCompletedDays(habit.id);
            const pct = Math.round((days / 7) * 100);
            return (
              <div key={habit.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text-primary truncate">{habit.name}</div>
                  <div className="text-xs text-text-muted">{days}/7 days</div>
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-primary-bg">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-text-secondary">{pct}%</span>
              </div>
            );
          })}
        </div>

        {habits.length === 0 && (
          <p className="py-4 text-center text-sm text-text-muted">No habits to review yet.</p>
        )}
      </div>
    </div>
  );
}
