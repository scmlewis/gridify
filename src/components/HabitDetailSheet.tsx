import { useState, useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContributionGrid } from './ContributionGrid';
import { StatsCard } from './StatsCard';
import { DayOfWeekHeatmap } from './DayOfWeekHeatmap';
import { TrendSparkline } from './TrendSparkline';
import { StreakTimeline } from './StreakTimeline';
import { CompletionDistribution } from './CompletionDistribution';
import { YearComparison } from './YearComparison';
import { ColorPicker } from './ColorPicker';
import { getHabitLogs, deleteHabit, archiveHabit, unarchiveHabit, updateHabit, getCategories } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';
import type { Habit, Category } from '../types';
import { bottomSheet, backdrop, springTransition } from '../utils/animations';
import { haptic } from '../utils/haptics';

interface HabitDetailSheetProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRefresh?: () => void;
}

export function HabitDetailSheet({ habit, isOpen, onClose, onDelete, onArchive, onRefresh }: HabitDetailSheetProps) {
  const [logs, setLogs] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCategory, setEditCategory] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editValueType, setEditValueType] = useState<'boolean' | 'numeric'>('boolean');
  const [editUnit, setEditUnit] = useState('');
  const [editTargetFrequency, setEditTargetFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [editTargetValue, setEditTargetValue] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isOpen || !habit) return;
    let cancelled = false;
    setIsLoading(true);
    setConfirmDelete(false);
    setConfirmArchive(false);
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
      setEditValueType(habit!.valueType || 'boolean');
      setEditUnit(habit!.unit || '');
      setEditTargetFrequency(habit!.targetFrequency || 'daily');
      setEditTargetValue(habit!.targetValue ?? 1);
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
    haptic.heavy();
    await deleteHabit(habit.id);
    onDelete(habit.id);
    onClose();
    onRefresh?.();
  }, [habit, confirmDelete, onDelete, onClose, onRefresh]);

  const handleArchive = useCallback(async () => {
    if (!habit) return;
    if (!confirmArchive) {
      setConfirmArchive(true);
      return;
    }
    haptic.heavy();
    if (habit.archived) {
      await unarchiveHabit(habit.id);
    } else {
      await archiveHabit(habit.id);
    }
    onArchive?.(habit.id);
    onClose();
    onRefresh?.();
  }, [habit, confirmArchive, onArchive, onClose, onRefresh]);

  const handleSaveEdit = useCallback(async () => {
    if (!habit) return;
    haptic.success();
    await updateHabit(habit.id, {
      category: editCategory,
      color: editColor,
      valueType: editValueType,
      unit: editValueType === 'numeric' ? editUnit : '',
      targetFrequency: editTargetFrequency,
      targetValue: editValueType === 'numeric' ? editTargetValue : 1,
    });
    setEditing(false);
    onRefresh?.();
  }, [habit, editCategory, editColor, editValueType, editUnit, editTargetFrequency, editTargetValue, onRefresh]);

  if (!isOpen || !habit) return null;

  const color = editColor || habit.color || '#10b981';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl bg-surface-card overflow-hidden flex flex-col max-h-[85vh]"
            variants={bottomSheet}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springTransition}
          >
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <h2 className="text-lg font-bold text-text-primary truncate font-display">{habit.name}</h2>
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
                      onClick={() => {
                        setEditCategory(habit.category || 'uncategorized');
                        setEditColor(habit.color || '#2BA8A2');
                        setEditValueType(habit.valueType || 'boolean');
                        setEditUnit(habit.unit || '');
                        setEditTargetFrequency(habit.targetFrequency || 'daily');
                        setEditTargetValue(habit.targetValue ?? 1);
                        setEditing(true);
                      }}
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
                      <label className="mb-1 block text-[10px] text-text-muted">Type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditValueType('boolean')}
                          className={`flex-1 rounded-md border px-2 py-1.5 text-sm transition-colors ${
                            editValueType === 'boolean' ? 'border-primary bg-primary/20 text-primary' : 'border-border text-text-muted'
                          }`}
                        >
                          Binary
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditValueType('numeric')}
                          className={`flex-1 rounded-md border px-2 py-1.5 text-sm transition-colors ${
                            editValueType === 'numeric' ? 'border-primary bg-primary/20 text-primary' : 'border-border text-text-muted'
                          }`}
                        >
                          Numeric
                        </button>
                      </div>
                    </div>
                    {editValueType === 'numeric' && (
                      <>
                        <div>
                          <label className="mb-1 block text-[10px] text-text-muted">Unit</label>
                          <input
                            type="text"
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            placeholder="e.g., minutes, reps, pages"
                            className="w-full rounded-md bg-surface-card border border-border px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] text-text-muted">Target Frequency</label>
                          <select
                            value={editTargetFrequency}
                            onChange={(e) => setEditTargetFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                            className="w-full rounded-md bg-surface-card border border-border px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] text-text-muted">
                            {editTargetFrequency === 'daily'
                              ? 'Days per week'
                              : editTargetFrequency === 'weekly'
                                ? 'Times per week'
                                : 'Times per month'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={editTargetFrequency === 'monthly' ? 31 : 7}
                            value={editTargetValue}
                            onChange={(e) => setEditTargetValue(Math.max(1, Number(e.target.value) || 1))}
                            className="w-full rounded-md bg-surface-card border border-border px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </>
                    )}
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
                onClick={handleArchive}
                className={`w-full rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  confirmArchive
                    ? habit?.archived
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-coral text-white shadow-md shadow-coral/25'
                    : habit?.archived
                      ? 'bg-surface-elevated text-primary border border-primary/30 hover:bg-primary/10 hover:border-primary/50'
                      : 'bg-surface-elevated text-coral border border-coral/30 hover:bg-coral/10 hover:border-coral/50'
                }`}
              >
                {confirmArchive
                  ? habit?.archived ? 'Confirm Restore' : 'Confirm Archive'
                  : habit?.archived ? 'Restore Habit' : 'Archive Habit'}
              </button>

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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
