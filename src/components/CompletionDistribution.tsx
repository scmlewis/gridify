import { useMemo } from 'react';
import { getLogLevel } from '../utils/grid-math';

interface CompletionDistributionProps {
  logs: Map<string, number>;
}

const LEVEL_COLORS = ['bg-primary-bg', 'bg-primary-dark', 'bg-primary', 'bg-primary-light', 'bg-accent-gold'];
const LEVEL_LABELS = ['None', 'Light', 'Moderate', 'Active', 'Highly Active'];

export function CompletionDistribution({ logs }: CompletionDistributionProps) {
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];

    if (logs.size === 0) {
      return { counts, percentages: [100, 0, 0, 0, 0], totalDays: 0 };
    }

    for (const [, value] of logs.entries()) {
      const level = getLogLevel(value);
      counts[level]++;
    }

    const totalDays = logs.size;
    const percentages = counts.map(c => Math.round((c / totalDays) * 100));

    return { counts, percentages, totalDays };
  }, [logs]);

  if (distribution.totalDays === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Completion Distribution</div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
        {distribution.percentages.map((pct, i) =>
          pct > 0 ? (
            <div
              key={i}
              className={`${LEVEL_COLORS[i]} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${pct}%` }}
            />
          ) : null
        )}
      </div>
      <div className="space-y-1">
        {LEVEL_LABELS.map((label, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-sm ${LEVEL_COLORS[i]}`} />
              <span className="text-text-muted">{label}</span>
            </div>
            <span className="text-text-secondary font-medium">
              {distribution.counts[i]}<span className="text-text-muted font-normal"> ({distribution.percentages[i]}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
