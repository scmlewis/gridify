import { useState, useEffect, useMemo } from 'react';
import { getHabits, getAllLogsForDateRange } from '../db';
import type { Habit } from '../db';
import { formatDate, addDays } from '../utils/date-utils';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { InsightsPanel } from './InsightsPanel';
import { EmptyState } from './EmptyState';
import type { HabitLog } from '../types';

interface AnalyticsTabProps {
  refreshTrigger?: number;
  tabDirection?: 'left' | 'right';
}

interface HabitGridData {
  habit: Habit;
  logs: Map<string, number>;
}

export function AnalyticsTab({ refreshTrigger, tabDirection = 'right' }: AnalyticsTabProps) {
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

  const habitGrids = useMemo<HabitGridData[]>(() => {
    return habits.map(habit => {
      const habitLogs = logs.filter(l => l.habitId === habit.id);
      const logMap = new Map<string, number>();
      for (const log of habitLogs) {
        logMap.set(log.date, (logMap.get(log.date) ?? 0) + log.value);
      }
      return { habit, logs: logMap };
    });
  }, [habits, logs]);

  const globalLogs = useMemo(() => {
    const totals = new Map<string, number>();
    for (const log of logs) {
      totals.set(log.date, (totals.get(log.date) ?? 0) + log.value);
    }
    return totals;
  }, [logs]);

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
    <div className={tabDirection === 'right' ? 'animate-tab-enter-right' : 'animate-tab-enter-left'}>
      <div className="space-y-4">
        <InsightsPanel habits={habits} habitGrids={habitGrids} globalLogs={globalLogs} />
        <div className="rounded-xl bg-surface-card p-4 border border-border/60">
          <AnalyticsBarChart habits={habits} logs={logs} />
        </div>
      </div>
    </div>
  );
}
