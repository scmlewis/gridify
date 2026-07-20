import { useState, useEffect, useMemo } from 'react';
import { getHabits, getAllLogsForDateRange } from '../db';
import type { Habit } from '../db';
import { BarChart3 } from 'lucide-react';
import { formatDate, addDays } from '../utils/date-utils';
import { generateGlobalObservations } from '../utils/observations';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { InsightsPanel } from './InsightsPanel';
import { ObservationCard } from './ObservationCard';
import { EmptyState } from './EmptyState';
import type { HabitLog } from '../types';

interface AnalyticsTabProps {
  refreshTrigger?: number;
}

interface HabitGridData {
  habit: Habit;
  logs: Map<string, number>;
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

  const observations = useMemo(() => {
    return generateGlobalObservations(habits, habitGrids);
  }, [habits, habitGrids]);

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
        icon={BarChart3}
        title="No data yet"
        description="Add some habits and start checking in to see your analytics."
      />
    );
  }

  return (
      <div className="space-y-6">
        <ObservationCard observations={observations} title="Overview" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-surface-card border border-white/5 p-6 shadow-2xl">
            <AnalyticsBarChart habits={habits} logs={logs} />
          </div>
          <div className="rounded-3xl bg-surface-card border border-white/5 p-6 shadow-2xl">
            <InsightsPanel habits={habits} habitGrids={habitGrids} globalLogs={globalLogs} />
          </div>
        </div>
      </div>
  );
}
