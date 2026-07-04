import { useMemo, useState } from 'react';
import { getYearComparison, type YearData } from '../utils/year-comparison';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface YearComparisonProps {
  logs: Map<string, number>;
}

function YearStatLine({ data, label }: { data: YearData; label: string }) {
  return (
    <div className="text-xs">
      <span className="text-text-muted">{label}: </span>
      <span className="font-bold text-text-primary">{data.completionRate}%</span>
      <span className="text-text-muted"> · {data.completedDays}/{data.totalDays}d · best streak {data.bestStreak}d</span>
    </div>
  );
}

export function YearComparison({ logs }: YearComparisonProps) {
  const [viewYear, setViewYear] = useState<'current' | 'previous'>('current');

  const comparison = useMemo(() => getYearComparison(logs), [logs]);

  if (!comparison.hasTwoYears && comparison.currentYear.totalDays === 0) return null;

  const showToggle = comparison.hasTwoYears;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Year Comparison</div>
        {showToggle && (
          <div className="flex rounded-md bg-surface-elevated p-0.5">
            <button
              onClick={() => setViewYear('current')}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                viewYear === 'current' ? 'bg-primary text-surface-base' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {comparison.currentYear.year}
            </button>
            <button
              onClick={() => setViewYear('previous')}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                viewYear === 'previous' ? 'bg-primary text-surface-base' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {comparison.previousYear?.year}
            </button>
          </div>
        )}
      </div>

      {viewYear === 'current' ? (
        <YearStatLine data={comparison.currentYear} label="This year" />
      ) : (
        comparison.previousYear && <YearStatLine data={comparison.previousYear} label="Last year" />
      )}

      {showToggle && comparison.previousYear && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted">vs last year:</span>
          {(() => {
            const diff = comparison.currentYear.completionRate - comparison.previousYear.completionRate;
            if (diff > 0) return <><TrendingUp className="h-3 w-3 text-green-500" /><span className="text-green-500 font-bold">+{diff}%</span></>;
            if (diff < 0) return <><TrendingDown className="h-3 w-3 text-red-500" /><span className="text-red-500 font-bold">{diff}%</span></>;
            return <><Minus className="h-3 w-3 text-text-muted" /><span className="text-text-muted">No change</span></>;
          })()}
        </div>
      )}
    </div>
  );
}
