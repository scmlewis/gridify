import { useMemo } from 'react';
import { formatDate, addDays } from '../utils/date-utils';
import { calculateStreak } from '../utils/streak';

interface StatsCardProps {
  logs: Map<string, number>;
  createdAt: string;
  color?: string;
}

function computeBestStreak(logs: Map<string, number>): number {
  const dates = [...logs.entries()]
    .filter(([, v]) => v > 0)
    .map(([d]) => d)
    .sort();

  if (dates.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      current++;
      best = Math.max(best, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return best;
}

function computeDayOfWeekStats(logs: Map<string, number>): { best: string; worst: string } {
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const counts: number[] = [0, 0, 0, 0, 0, 0, 0];
  const totals: number[] = [0, 0, 0, 0, 0, 0, 0];

  for (const [dateStr, value] of logs.entries()) {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    totals[day]++;
    if (value > 0) counts[day]++;
  }

  let bestDay = 0;
  let worstDay = 0;
  let bestPct = -1;
  let worstPct = 101;

  for (let i = 0; i < 7; i++) {
    if (totals[i] === 0) continue;
    const pct = (counts[i] / totals[i]) * 100;
    if (pct > bestPct) {
      bestPct = pct;
      bestDay = i;
    }
    if (pct < worstPct) {
      worstPct = pct;
      worstDay = i;
    }
  }

  return {
    best: totals[bestDay] > 0 ? DAY_NAMES[bestDay] : '-',
    worst: totals[worstDay] > 0 ? DAY_NAMES[worstDay] : '-',
  };
}

export function StatsCard({ logs, createdAt, color = '#2BA8A2' }: StatsCardProps) {
  const stats = useMemo(() => {
    const streak = calculateStreak(logs);
    const bestStreak = computeBestStreak(logs);

    let totalCheckIns = 0;
    for (const [, value] of logs.entries()) {
      if (value > 0) totalCheckIns++;
    }

    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysSinceCreation = Math.max(1, Math.round((now.getTime() - createdDate.getTime()) / 86400000));
    const completionRate = Math.round((totalCheckIns / daysSinceCreation) * 100);

    const weeksSinceCreation = Math.max(1, daysSinceCreation / 7);
    const weeklyAvg = +(totalCheckIns / weeksSinceCreation).toFixed(1);

    const { best: bestDay, worst: worstDay } = computeDayOfWeekStats(logs);

    const twoWeeksAgo = addDays(now, -14);
    const fourWeeksAgo = addDays(now, -28);
    const recentStart = formatDate(twoWeeksAgo);
    const prevStart = formatDate(fourWeeksAgo);
    const prevEnd = formatDate(twoWeeksAgo);

    let recentCount = 0;
    let prevCount = 0;
    for (const [dateStr, value] of logs.entries()) {
      if (value <= 0) continue;
      if (dateStr >= recentStart) recentCount++;
      else if (dateStr >= prevStart && dateStr < prevEnd) prevCount++;
    }

    const trend = recentCount - prevCount;

    return {
      streak,
      bestStreak,
      completionRate: Math.min(completionRate, 100),
      weeklyAvg,
      totalCheckIns,
      bestDay,
      worstDay,
      trend,
      daysSinceCreation,
    };
  }, [logs, createdAt]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatBox label="Streak" value={`${stats.streak}`} sub="days" color={color} />
      <StatBox label="Best Streak" value={`${stats.bestStreak}`} sub="days" color={color} />
      <StatBox label="Completion" value={`${stats.completionRate}%`} sub={`of ${stats.daysSinceCreation}d`} color={color} />
      <StatBox label="Weekly Avg" value={`${stats.weeklyAvg}`} sub="per week" color={color} />
      <StatBox label="Total" value={`${stats.totalCheckIns}`} sub="check-ins" color={color} />
      <StatBox
        label="Trend"
        value={stats.trend > 0 ? `+${stats.trend}` : `${stats.trend}`}
        sub="vs prev 2wk"
        color={stats.trend > 0 ? '#27AE60' : stats.trend < 0 ? '#E74C3C' : color}
      />
      <div className="col-span-2 rounded-lg bg-surface-elevated p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">Day Analysis</div>
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Best day: <span className="font-bold text-text-primary">{stats.bestDay}</span></span>
          <span className="text-text-secondary">Worst day: <span className="font-bold text-text-primary">{stats.worstDay}</span></span>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-lg bg-surface-elevated p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-1 text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-text-muted">{sub}</div>
    </div>
  );
}
