import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { formatDate, addDays, getSunday, parseDate } from '../utils/date-utils';
import type { Habit, HabitLog } from '../types';

interface AnalyticsBarChartProps {
  habits: Habit[];
  logs: HabitLog[];
}

type ViewMode = 'week' | 'month';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function AnalyticsBarChart({ habits, logs }: AnalyticsBarChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [offset, setOffset] = useState(0);

  const { startDate, endDate, label } = useMemo(() => {
    const now = new Date();
    if (viewMode === 'week') {
      const sunday = getSunday(now);
      const monday = addDays(sunday, 1);
      const weekStart = addDays(monday, offset * 7);
      const weekEnd = addDays(weekStart, 6);
      return {
        startDate: formatDate(weekStart),
        endDate: formatDate(weekEnd),
        label: `${formatShort(weekStart)} – ${formatShort(weekEnd)}`,
      };
    } else {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      return {
        startDate: formatDate(monthDate),
        endDate: formatDate(monthEnd),
        label: `${monthDate.toLocaleString('default', { month: 'long' })} ${monthDate.getFullYear()}`,
      };
    }
  }, [viewMode, offset]);

  const dailyData = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const days: { date: string; label: string; count: number; total: number }[] = [];

    if (viewMode === 'week') {
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i);
        const dateStr = formatDate(d);
        const dayLogs = logs.filter(l => l.date === dateStr && l.value > 0);
        days.push({
          date: dateStr,
          label: DAY_LETTERS[i],
          count: dayLogs.length,
          total: habits.length,
        });
      }
    } else {
      const current = new Date(start);
      while (current <= end) {
        const dateStr = formatDate(current);
        const dayLogs = logs.filter(l => l.date === dateStr && l.value > 0);
        days.push({
          date: dateStr,
          label: String(current.getDate()),
          count: dayLogs.length,
          total: habits.length,
        });
        current.setDate(current.getDate() + 1);
      }
    }
    return days;
  }, [startDate, endDate, viewMode, logs, habits]);



  const avgCompletion = useMemo(() => {
    if (dailyData.length === 0 || habits.length === 0) return 0;
    const total = dailyData.reduce((sum, d) => sum + (d.total > 0 ? d.count / d.total : 0), 0);
    return Math.round((total / dailyData.length) * 100);
  }, [dailyData, habits]);

  const perHabitData = useMemo(() => {
    return habits.map(habit => {
      const habitLogs = logs.filter(l => l.habitId === habit.id && l.value > 0);
      const completedDays = new Set(habitLogs.map(l => l.date)).size;
      const totalDays = dailyData.length;
      const pct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
      return { habit, completedDays, totalDays, pct };
    });
  }, [habits, logs, dailyData]);

  return (
    <div className="space-y-4">
      {/* Header with toggle and nav */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg bg-surface-elevated p-0.5">
          <button
            onClick={() => { setViewMode('week'); setOffset(0); }}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              viewMode === 'week'
                ? 'bg-primary text-surface-base shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => { setViewMode('month'); setOffset(0); }}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              viewMode === 'month'
                ? 'bg-primary text-surface-base shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Month
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset(o => o - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-semibold text-text-primary min-w-[140px] text-center">{label}</span>
          <button
            onClick={() => setOffset(o => Math.min(0, o + 1))}
            disabled={offset >= 0}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated text-text-muted hover:text-text-primary transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Avg completion */}
      <div>
        <span className="text-2xl font-extrabold text-text-primary">{avgCompletion}%</span>
        <span className="ml-2 text-xs text-text-secondary">avg. completion rate</span>
      </div>

      {/* Bar chart */}
      <div className={`flex items-end gap-1 ${viewMode === 'month' ? 'overflow-x-auto pb-1' : ''}`} style={{ height: viewMode === 'week' ? 100 : 80 }}>
        {dailyData.map((d) => {
          const heightPct = d.total > 0 ? (d.count / d.total) * 100 : 0;
          return (
            <div key={d.date} className={`flex flex-col items-center gap-1 h-full ${viewMode === 'month' ? 'min-w-[14px]' : 'flex-1'}`}>
              <div className="w-full flex justify-center" style={{ height: '100%' }}>
                <div
                  className="w-full max-w-[24px] rounded-t-md bg-primary/80 transition-all duration-300"
                  style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? 4 : 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className={`flex gap-1 ${viewMode === 'month' ? 'overflow-x-hidden' : ''}`}>
        {dailyData.map((d) => (
          <div key={d.date} className={`flex justify-center ${viewMode === 'month' ? 'min-w-[14px]' : 'flex-1'}`}>
            <span className="text-[9px] text-text-muted">{d.label}</span>
          </div>
        ))}
      </div>

      {/* Per-habit breakdown */}
      {perHabitData.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Per Habit</div>
          {perHabitData.map(({ habit, completedDays, totalDays, pct }) => (
            <div key={habit.id} className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center text-sm shrink-0">{habit.icon ? <span>{habit.icon}</span> : <Target className="h-3.5 w-3.5 text-text-muted" />}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-text-primary truncate">{habit.name}</div>
                <div className="text-[10px] text-text-muted">{completedDays}/{totalDays} days</div>
              </div>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border/40">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: habit.color || '#2BA8A2' }}
                />
              </div>
              <span className="w-8 text-right text-[10px] font-bold text-text-secondary">{pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatShort(date: Date): string {
  const month = date.toLocaleString('default', { month: 'short' });
  return `${month} ${date.getDate()}`;
}
