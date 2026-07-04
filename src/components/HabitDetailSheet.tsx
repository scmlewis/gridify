import { useState, useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { ContributionGrid } from './ContributionGrid';
import { StatsCard } from './StatsCard';
import { DayOfWeekHeatmap } from './DayOfWeekHeatmap';
import { TrendSparkline } from './TrendSparkline';
import { StreakTimeline } from './StreakTimeline';
import { CompletionDistribution } from './CompletionDistribution';
import { YearComparison } from './YearComparison';
import { ColorPicker } from './ColorPicker';
import { getHabitLogs, deleteHabit, updateHabit, getCategories } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';
import type { Habit, Category } from '../types';

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
  const [editing, setEditing] = useState(false);
  const [editCategory, setEditCategory] = useState('');
  const [editColor, setEditColor] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isOpen || !habit) return;
    let cancelled = false;
    setIsLoading(true);
    setConfirmDelete(false);
    setEditing(false);

    async function load() {
      const start = getGridStartDate();
      const end = addDays(new Date(), 1);
      const raw = await getHabitLogs(habit!.id, formatDate(start), formatDate(end));
      if (cancelled) return;
      const map = new Map<string, number>();
      for (const log of raw) map.set(log.date, log.value);
      setLogs(map);
      setEditCategory(habit!.category || 'uncategorized');
      setEditColor(habit!.color || '#2BA8A2');
      setCategories(await getCategories());
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

  const handleSaveEdit = useCallback(async () => {
    if (!habit) return;
    await updateHabit(habit.id, { category: editCategory, color: editColor });
    setEditing(false);
    onRefresh?.();
  }, [habit, editCategory, editColor, onRefresh]);

  if (!isOpen || !habit) return null;

  const color = editColor || habit.color || '#2BA8A2';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/60 animate-backdrop-in backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl bg-surface-card animate-slide-up-sheet sheet-open overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <h2 className="text-lg font-bold text-text-primary truncate">{habit.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
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
                  <ContributionGrid logs={logs} cellSize={10} cellGap={2} showLabels={false} showLegend={false} />
              </div>

              <div className="rounded-lg bg-surface-elevated p-4 border border-border">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Trend</div>
                <TrendSparkline logs={logs} color={color} />
              </div>

              <div className="rounded-lg bg-surface-elevated p-4 border border-border">
                <StreakTimeline logs={logs} color={color} />
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Statistics</div>
                <StatsCard logs={logs} createdAt={habit.createdAt} color={color} />
              </div>

              <div className="rounded-lg bg-surface-elevated p-4 border border-border">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Day of Week</div>
                <DayOfWeekHeatmap logs={logs} color={color} />
              </div>

              <div className="rounded-lg bg-surface-elevated p-4 border border-border">
                <CompletionDistribution logs={logs} />
              </div>

              <div className="rounded-lg bg-surface-elevated p-4 border border-border">
                <YearComparison logs={logs} />
              </div>

              {/* Edit Section */}
              <div className="rounded-lg bg-surface-elevated p-4 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">Settings</div>
                  {!editing && (
                    <button
                      onClick={() => { setEditCategory(habit.category || 'uncategorized'); setEditColor(habit.color || '#2BA8A2'); setEditing(true); }}
                      className="text-xs text-primary font-semibold hover:opacity-80 transition-opacity"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editing ? (
                  <>
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full rounded-md bg-surface-card border border-border px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
                      >
                        <option value="uncategorized">Uncategorized</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-text-muted">Color</label>
                      <ColorPicker value={editColor} onChange={setEditColor} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-surface-base hover:opacity-90 transition-opacity"
                      >
                        <Check className="h-3 w-3" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="rounded-full px-4 py-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-text-secondary">
                    Category: <span className="font-medium text-text-primary">{habit.category || 'Uncategorized'}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDelete}
                className={`w-full rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
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
