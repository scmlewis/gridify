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
    <div className="rounded-3xl bg-[#111] border border-white/5 p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Week Review</span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const hasCheckIn = d.value > 0;
          return (
            <button
              key={d.dateStr}
              onClick={() => onDayTap?.(d.dateStr)}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${
                d.isToday
                  ? 'bg-primary/10 border-2 border-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'border border-transparent hover:bg-white/3'
              }`}
            >
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                d.isToday ? 'text-primary' : 'text-slate-500'
              }`}>
                {d.day}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                d.isToday
                  ? 'bg-primary text-surface-base'
                  : hasCheckIn
                    ? 'bg-primary/20 text-primary'
                    : 'bg-white/5 text-slate-400'
              }`}>
                {d.date.getDate()}
              </div>
              {hasCheckIn && (
                <div className="mt-1.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
