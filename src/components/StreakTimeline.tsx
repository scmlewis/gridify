import { useMemo } from 'react';

interface StreakTimelineProps {
  logs: Map<string, number>;
  color?: string;
}

interface StreakSegment {
  startDate: string;
  endDate: string;
  days: number;
  isActive: boolean;
}

export function StreakTimeline({ logs, color = '#2BA8A2' }: StreakTimelineProps) {
  const { segments, longestStreak } = useMemo(() => {
    const datesWithValue = [...logs.entries()]
      .filter(([, v]) => v > 0)
      .map(([d]) => d)
      .sort();

    if (datesWithValue.length === 0) return { segments: [], longestStreak: 0 };

    const segs: StreakSegment[] = [];
    let startIdx = 0;

    for (let i = 1; i <= datesWithValue.length; i++) {
      if (i < datesWithValue.length) {
        const curr = new Date(datesWithValue[i] + 'T00:00:00');
        const prev = new Date(datesWithValue[i - 1] + 'T00:00:00');
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) continue;
      }
      const days = i - startIdx;
      segs.push({
        startDate: datesWithValue[startIdx],
        endDate: datesWithValue[i - 1],
        days,
        isActive: i === datesWithValue.length,
      });
      startIdx = i;
    }

    const longest = Math.max(...segs.map(s => s.days), 0);

    return { segments: segs, longestStreak: longest };
  }, [logs]);

  if (segments.length === 0) return null;

  const maxDays = Math.max(...segments.map(s => s.days), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Streak Timeline</div>
        <div className="text-[10px] text-text-muted">Longest: <span className="font-bold text-text-primary">{longestStreak} days</span></div>
      </div>
      <div className="space-y-1">
        {segments.slice(-10).map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 h-4 rounded-sm bg-surface-elevated overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${seg.isActive ? 'opacity-100' : 'opacity-60'}`}
                style={{
                  width: `${(seg.days / maxDays) * 100}%`,
                  backgroundColor: seg.isActive ? color : '#6B7280',
                  minWidth: seg.days > 0 ? 4 : 0,
                }}
              />
            </div>
            <span className="w-14 text-right text-[10px] text-text-muted shrink-0">{seg.days}d</span>
          </div>
        ))}
      </div>
      {segments.length > 10 && (
        <div className="text-[10px] text-text-muted text-center">+ {segments.length - 10} earlier streaks</div>
      )}
    </div>
  );
}
