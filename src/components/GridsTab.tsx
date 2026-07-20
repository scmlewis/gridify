import { useState, useEffect, useCallback } from 'react';
import { Grid3x3 } from 'lucide-react';
import { ContributionGrid } from './ContributionGrid';
import { EmptyState } from './EmptyState';
import { HabitDetailSheet } from './HabitDetailSheet';
import { HabitCard } from './HabitCard';
import { getHabits, getHabitLogs, getAllLogsForDateRange, reorderHabits } from '../db';
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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

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

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, overId: string) => {
    e.preventDefault();
    setOverId(overId);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === dropId) {
      setDraggedId(null);
      setOverId(null);
      return;
    }

    const sorted = [...habits].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const fromIdx = sorted.findIndex(h => h.id === draggedId);
    const toIdx = sorted.findIndex(h => h.id === dropId);
    if (fromIdx === -1 || toIdx === -1) return;

    const moved = sorted[fromIdx];
    sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved);

    const reorderUpdates = sorted.map((h, i) => ({ id: h.id, sortOrder: i }));
    await reorderHabits(reorderUpdates);

    setHabits(prev => {
      const updated = [...prev].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const fromI = updated.findIndex(h => h.id === draggedId);
      const toI = updated.findIndex(h => h.id === dropId);
      if (fromI === -1 || toI === -1) return updated;
      const m = updated[fromI];
      updated.splice(fromI, 1);
      updated.splice(toI, 0, m);
      return updated;
    });

    setDraggedId(null);
    setOverId(null);
  }, [draggedId, habits]);

  const handleDragLeave = useCallback(() => {
    setOverId(null);
  }, []);

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
        icon={Grid3x3}
        title="No habits yet"
        description="Add your first habit to start tracking your activity grids."
      />
    );
  }

  const categories = Array.from(new Set(habits.map(h => h.category || 'uncategorized'))).sort();
  const sortedGrids = [...habitGrids].sort((a, b) => (a.habit.sortOrder ?? 0) - (b.habit.sortOrder ?? 0));
  const filteredGrids = activeCategory === 'All'
    ? sortedGrids
    : sortedGrids.filter(g => (g.habit.category || 'uncategorized') === activeCategory);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-surface-card p-4 border border-border/60" style={{ boxShadow: '0 4px 16px rgba(43, 168, 162, 0.08)' }}>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Overall Activity</div>
        <p className="mb-3 text-[11px] text-text-muted">Your combined check-ins across all habits. Darker cells = more activity.</p>
        <div className="flex items-center gap-1.5 mb-3 justify-end">
          <span className="text-[10px] text-text-muted">Less</span>
          {[0, 1, 2, 3, 4].map((level) => {
            const classes = ['rounded-sm', 'w-2.5', 'h-2.5'];
            if (level === 0) classes.push('bg-primary-bg');
            else if (level === 1) classes.push('bg-primary-dark');
            else if (level === 2) classes.push('bg-primary');
            else if (level === 3) classes.push('bg-primary-light');
            else if (level === 4) classes.push('bg-accent-gold');
            return <div key={level} className={classes.join(' ')} />;
          })}
          <span className="text-[10px] text-text-muted">More</span>
        </div>
        <ContributionGrid logs={globalLogs} cellSize={11} cellGap={2} showLegend={false} />
      </div>

      <div className="sticky top-[52px] z-30 bg-surface-base py-3 -mx-4 px-4 border-b border-border/30">
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
      </div>

      <div className="space-y-4">
        {filteredGrids.map(({ habit }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onArchived={() => _onRefresh(n => n + 1)}
            onCheckIn={() => _onRefresh(n => n + 1)}
            onTap={setSelectedHabit}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            isDropTarget={overId === habit.id && draggedId !== habit.id}
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
