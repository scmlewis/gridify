import { useMemo } from 'react';

interface DayOfWeekHeatmapProps {
  logs: Map<string, number>;
  color?: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DayOfWeekHeatmap({ logs, color = '#2BA8A2' }: DayOfWeekHeatmapProps) {
  const dayStats = useMemo(() => {
    const counts: number[] = [0, 0, 0, 0, 0, 0, 0];
    const totals: number[] = [0, 0, 0, 0, 0, 0, 0];

    for (const [dateStr, value] of logs.entries()) {
      if (value <= 0) continue;
      const date = new Date(dateStr + 'T00:00:00');
      const day = date.getDay();
      totals[day]++;
      if (value > 0) counts[day]++;
    }

    return counts.map((count, i) => ({
      day: DAY_LABELS[i],
      count,
      pct: totals[i] > 0 ? Math.round((count / totals[i]) * 100) : 0,
      intensity: totals[i] > 0 ? count / Math.max(...totals.filter(t => t > 0), 1) : 0,
    }));
  }, [logs]);

  const maxCount = Math.max(...dayStats.map(d => d.count), 1);

  return (
    <div className="space-y-2">
      {dayStats.map(({ day, count, pct, intensity }) => (
        <div key={day} className="flex items-center gap-3">
          <span className="w-8 text-right text-xs font-medium text-text-muted">{day}</span>
          <div className="flex-1 h-3 rounded-full bg-surface-elevated overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
                backgroundColor: color,
                opacity: 0.3 + intensity * 0.7,
              }}
            />
          </div>
          <span className="w-10 text-right text-xs text-text-muted">{pct}%</span>
        </div>
      ))}
    </div>
  );
}
