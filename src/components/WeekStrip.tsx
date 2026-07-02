import { useMemo } from 'react';
import { formatDate, addDays } from '../utils/date-utils';

interface WeekStripProps {
  logs: Map<string, number>;
  onDayTap?: (date: string) => void;
}

const DAY_ABBRS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeekStrip({ logs, onDayTap }: WeekStripProps) {
  const days = useMemo(() => {
    const today = new Date();
    const todayDay = today.getDay();
    const monday = addDays(today, -((todayDay + 6) % 7));

    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(monday, i);
      const dateStr = formatDate(date);
      const value = logs.get(dateStr) ?? 0;
      const isToday = dateStr === formatDate(today);
      const isPast = date < new Date(formatDate(today));
      return { date, dateStr, value, isToday, isPast, day: DAY_ABBRS[i] };
    });
  }, [logs]);

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((d) => {
        const hasCheckIn = d.value > 0;
        return (
          <button
            key={d.dateStr}
            onClick={() => onDayTap?.(d.dateStr)}
            className="flex flex-1 flex-col items-center gap-1.5 py-1"
          >
            <span className={`text-[10px] font-semibold tracking-wide ${
              d.isToday ? 'text-primary' : 'text-text-muted'
            }`}>
              {d.day}
            </span>
            <div className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
              d.isToday
                ? 'bg-primary text-surface-base shadow-md shadow-primary/30'
                : hasCheckIn
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : d.isPast
                    ? 'bg-surface-elevated text-text-muted border border-border/40'
                    : 'bg-surface-elevated text-text-muted border border-border/40'
            }`}>
              {d.date.getDate()}
              {hasCheckIn && !d.isToday && (
                <div className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
