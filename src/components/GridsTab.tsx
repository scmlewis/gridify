import { useState, useEffect } from 'react';
import { ContributionGrid } from './ContributionGrid';
import { EmptyState } from './EmptyState';
import { HabitDetailSheet } from './HabitDetailSheet';
import { getHabits, getHabitLogs, getAllLogsForDateRange } from '../db';
import type { Habit } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';

interface GridsTabProps {
  refreshTrigger?: number;
  onRefresh: React.Dispatch<React.SetStateAction<number>>;
}

interface HabitGridData {
  habit: Habit;
  logs: Map<string, number>;
  streak: number;
}

function computeCurrentStreak(logs: Map<string, number>): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const date = addDays(today, -i);
    const dateStr = formatDate(date);
    if (logs.has(dateStr) && (logs.get(dateStr) ?? 0) > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export function GridsTab({ refreshTrigger, onRefresh: _onRefresh }: GridsTabProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [globalLogs, setGlobalLogs] = useState<Map<string, number>>(new Map());
  const [habitGrids, setHabitGrids] = useState<HabitGridData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const start = getGridStartDate();
      const end = addDays(new Date(), 1);
      const startStr = formatDate(start);
      const endStr = formatDate(end);

      const allLogs = await getAllLogsForDateRange(startStr, endStr);
      if (cancelled) return;

      const totals = new Map<string, number>();
      for (const log of allLogs) {
        totals.set(log.date, (totals.get(log.date) ?? 0) + log.value);
      }
      setGlobalLogs(totals);

      const habitsList = await getHabits();
      if (cancelled) return;
      setHabits(habitsList);

      const grids: HabitGridData[] = [];
      for (const habit of habitsList) {
        if (cancelled) return;
        const logs = await getHabitLogs(habit.id, startStr, endStr);
        const logMap = new Map<string, number>();
        for (const log of logs) {
          logMap.set(log.date, log.value);
        }
        grids.push({
          habit,
          logs: logMap,
          streak: computeCurrentStreak(logMap),
        });
      }
      if (!cancelled) {
        setHabitGrids(grids);
        setIsLoading(false);
      }
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
        title="No habits yet"
        description="Add your first habit to start tracking your activity grids."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-surface-card p-4 border border-border" style={{ boxShadow: '0 4px 16px rgba(43, 168, 162, 0.08)' }}>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Overall Activity</div>
        <div className="overflow-x-auto">
          <ContributionGrid logs={globalLogs} cellSize={11} cellGap={2} />
        </div>
      </div>

      {habitGrids.map(({ habit, logs, streak }) => (
        <div key={habit.id} onClick={() => setSelectedHabit(habit)} className="rounded-lg bg-surface-card p-4 border border-border cursor-pointer hover:border-primary/30 transition-all" style={{ boxShadow: '0 4px 16px rgba(43, 168, 162, 0.08)' }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color || '#6366f1' }} />
                <span className="text-sm font-bold text-text-primary">{habit.name}</span>
              </div>
              <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-medium text-text-muted">
                {habit.category || 'uncategorized'}
              </span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-accent-gold/10 px-2 py-0.5">
                <span className="text-[10px] text-accent-gold">🔥</span>
                <span className="text-xs font-bold text-accent-gold">{streak}d</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <ContributionGrid logs={logs} cellSize={10} cellGap={2} />
          </div>
        </div>
      ))}
      <HabitDetailSheet
        habit={selectedHabit}
        isOpen={selectedHabit !== null}
        onClose={() => setSelectedHabit(null)}
        onDelete={() => _onRefresh(n => n + 1)}
        onRefresh={() => _onRefresh(n => n + 1)}
      />
    </div>
  );
}
