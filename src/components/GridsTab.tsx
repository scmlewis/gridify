import { useState, useEffect } from 'react';
import { ContributionGrid } from './ContributionGrid';
import { EmptyState } from './EmptyState';
import { HabitDetailSheet } from './HabitDetailSheet';
import { HabitCard } from './HabitCard';
import { getHabits, getHabitLogs, getAllLogsForDateRange } from '../db';
import type { Habit } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';
import { calculateStreak } from '../utils/streak';

interface GridsTabProps {
  refreshTrigger?: number;
  onRefresh: React.Dispatch<React.SetStateAction<number>>;
}

interface HabitGridData {
  habit: Habit;
  logs: Map<string, number>;
  streak: number;
}

export function GridsTab({ refreshTrigger, onRefresh: _onRefresh }: GridsTabProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [globalLogs, setGlobalLogs] = useState<Map<string, number>>(new Map());
  const [habitGrids, setHabitGrids] = useState<HabitGridData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

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
          streak: calculateStreak(logMap),
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

  const categories = Array.from(new Set(habits.map(h => h.category || 'uncategorized'))).sort();
  const filteredGrids = activeCategory === 'All'
    ? habitGrids
    : habitGrids.filter(g => (g.habit.category || 'uncategorized') === activeCategory);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-surface-card p-4 border border-border/60" style={{ boxShadow: '0 4px 16px rgba(43, 168, 162, 0.08)' }}>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Overall Activity</div>
        <p className="mb-3 text-[11px] text-text-muted">Your combined check-ins across all habits. Darker cells = more activity.</p>
        <div className="overflow-x-auto">
          <ContributionGrid logs={globalLogs} cellSize={11} cellGap={2} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('All')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === 'All'
              ? 'bg-primary text-white'
              : 'bg-surface-elevated text-text-muted hover:text-text-primary'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-surface-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredGrids.map(({ habit }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onArchived={() => _onRefresh(n => n + 1)}
            onCheckIn={() => _onRefresh(n => n + 1)}
            onTap={setSelectedHabit}
          />
        ))}
      </div>
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
