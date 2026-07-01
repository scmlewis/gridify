import { useState, useEffect } from 'react';
import { ContributionGrid } from './ContributionGrid';
import { getAllLogsForDateRange } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';

interface GridsTabProps {
  refreshTrigger?: number;
  onRefresh: React.Dispatch<React.SetStateAction<number>>;
}

export function GridsTab({ refreshTrigger, onRefresh: _onRefresh }: GridsTabProps) {
  const [globalLogs, setGlobalLogs] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const start = getGridStartDate();
      const end = addDays(new Date(), 1);
      const logs = await getAllLogsForDateRange(formatDate(start), formatDate(end));
      if (cancelled) return;
      const totals = new Map<string, number>();
      for (const log of logs) {
        totals.set(log.date, (totals.get(log.date) ?? 0) + log.value);
      }
      setGlobalLogs(totals);
    }
    load();
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-surface-card p-4 border border-border" style={{ boxShadow: '0 4px 16px rgba(43, 168, 162, 0.08)' }}>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Overall Activity</div>
        <div className="overflow-x-auto">
          <ContributionGrid logs={globalLogs} cellSize={11} cellGap={2} />
        </div>
      </div>
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-text-primary">Habit Grids</h3>
        <p className="text-sm text-text-secondary">Coming soon - view your contribution grids.</p>
      </div>
    </div>
  );
}
