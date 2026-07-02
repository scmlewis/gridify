import { useState, useEffect } from 'react';
import { getHabits, getAllLogsForDateRange } from '../db';
import type { Habit } from '../db';
import { formatDate, addDays } from '../utils/date-utils';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { EmptyState } from './EmptyState';
import type { HabitLog } from '../types';

interface AnalyticsTabProps {
  refreshTrigger?: number;
}

export function AnalyticsTab({ refreshTrigger }: AnalyticsTabProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const habitsList = await getHabits();
      if (cancelled) return;
      setHabits(habitsList);

      // Load last 90 days of data for analytics
      const start = formatDate(addDays(new Date(), -90));
      const end = formatDate(addDays(new Date(), 1));
      const allLogs = await getAllLogsForDateRange(start, end);
      if (cancelled) return;
      setLogs(allLogs);
      setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No data yet"
        description="Add some habits and start checking in to see your analytics."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-card p-4 border border-border/60">
        <AnalyticsBarChart habits={habits} logs={logs} />
      </div>
    </div>
  );
}
