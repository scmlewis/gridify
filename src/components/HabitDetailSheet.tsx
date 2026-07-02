import { useState, useEffect, useCallback } from 'react';
import { ContributionGrid } from './ContributionGrid';
import { StatsCard } from './StatsCard';
import { DayOfWeekHeatmap } from './DayOfWeekHeatmap';
import { TrendSparkline } from './TrendSparkline';
import { getHabitLogs, deleteHabit } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';
import type { Habit } from '../types';

interface HabitDetailSheetProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

export function HabitDetailSheet({ habit, isOpen, onClose, onDelete, onRefresh }: HabitDetailSheetProps) {
  const [logs, setLogs] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen || !habit) return;
    let cancelled = false;
    setIsLoading(true);
    setConfirmDelete(false);

    async function load() {
      const start = getGridStartDate();
      const end = addDays(new Date(), 1);
      const raw = await getHabitLogs(habit!.id, formatDate(start), formatDate(end));
      if (cancelled) return;
      const map = new Map<string, number>();
      for (const log of raw) map.set(log.date, log.value);
      setLogs(map);
      setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [isOpen, habit]);

  const handleDelete = useCallback(async () => {
    if (!habit) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteHabit(habit.id);
    onDelete(habit.id);
    onClose();
    onRefresh?.();
  }, [habit, confirmDelete, onDelete, onClose, onRefresh]);

  if (!isOpen || !habit) return null;

  const color = habit.color || '#2BA8A2';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] rounded-t-2xl bg-surface-card animate-slide-up overflow-hidden flex flex-col left-1/2 -translate-x-1/2">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <h2 className="text-lg font-bold text-text-primary truncate">{habit.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 min-h-[400px]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-surface-elevated p-4 border border-border">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Activity Grid</div>
                <div className="overflow-x-auto">
                  <ContributionGrid logs={logs} cellSize={10} cellGap={2} showLabels={false} showLegend={false} />
                </div>
              </div>

              <div className="rounded-lg bg-surface-elevated p-4 border border-border">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Trend</div>
                <TrendSparkline logs={logs} color={color} />
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Statistics</div>
                <StatsCard logs={logs} createdAt={habit.createdAt} color={color} />
              </div>

              <div className="rounded-lg bg-surface-elevated p-4 border border-border">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Day of Week</div>
                <DayOfWeekHeatmap logs={logs} color={color} />
              </div>

              <button
                onClick={handleDelete}
                className={`w-full rounded-xl py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  confirmDelete
                    ? 'bg-error text-white shadow-md shadow-error/25'
                    : 'bg-surface-elevated text-coral border border-coral/30 hover:bg-coral/10 hover:border-coral/50'
                }`}
              >
                {confirmDelete ? 'Confirm Delete' : 'Delete Habit'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
