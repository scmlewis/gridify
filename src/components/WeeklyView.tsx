import { useMemo } from 'react';
import { calculateStreak } from '../utils/streak';
import { formatDate, addDays } from '../utils/date-utils';
import type { Habit } from '../db';

interface HabitGridData {
  habit: Habit;
  logs: Map<string, number>;
  streak: number;
}

interface WeeklyViewProps {
  habitGrids: HabitGridData[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getWeekDays(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  // Adjust so Monday is start of week
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = addDays(today, mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function WeeklyView({ habitGrids }: WeeklyViewProps) {
  const weekDays = useMemo(() => getWeekDays(), []);
  const todayStr = formatDate(new Date());

  return (
    <div className="space-y-3">
      {habitGrids.map(({ habit, logs }) => {
        const streak = calculateStreak(logs);
        return (
          <div
            key={habit.id}
            className="rounded-2xl bg-surface-card p-4 border border-white/5 shadow-xl"
            style={{ borderLeft: `3px solid ${habit.color ?? '#10b981'}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              {habit.icon && <span className="text-sm">{habit.icon}</span>}
              <span className="text-sm font-bold text-text-primary font-display truncate">{habit.name}</span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-orange/10 px-2 py-0.5 text-accent-orange text-xs">
                  🔥 {streak}
                </span>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAY_LABELS.map((label, idx) => {
                const date = weekDays[idx];
                const dateStr = formatDate(date);
                const isChecked = (logs.get(dateStr) ?? 0) > 0;
                const isFuture = date > new Date();
                const isToday = dateStr === todayStr;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-muted font-medium">{label}</span>
                    <div
                      className={`relative w-full aspect-square rounded-md transition-colors ${
                        isChecked
                          ? 'opacity-100'
                          : isFuture
                            ? 'opacity-30 bg-primary-bg'
                            : 'bg-primary-bg'
                      }`}
                      style={isChecked ? { backgroundColor: habit.color ?? '#10b981' } : undefined}
                    >
                      {isToday && !isChecked && (
                        <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      {isToday && isChecked && (
                        <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}