import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContributionGrid } from './ContributionGrid';
import { Confetti } from './Confetti';
import { Toast } from './Toast';
import { AchievementToast } from './AchievementToast';
import { getHabitLogs, logCheckIn, removeCheckIn, applyStreakFreeze, getHabit } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';
import { calculateStreak, calculateMomentum, getMilestone } from '../utils/streak';
import { processCheckIn, type Achievement } from '../utils/gamification';
import type { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onArchived: (id: string) => void;
  onCheckIn?: () => void;
  onTap?: (habit: Habit) => void;
}

function triggerHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

export function HabitCard({ habit, onArchived, onCheckIn, onTap }: HabitCardProps) {
  const [logs, setLogs] = useState<Map<string, number>>(new Map());
  const [todayChecked, setTodayChecked] = useState(false);
  const streak = useMemo(() => calculateStreak(logs), [logs]);
  const momentum = useMemo(() => calculateMomentum(logs), [logs]);
  const [freezesUsed, setFreezesUsed] = useState(0);
  const [maxFreezes, setMaxFreezes] = useState(2);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);

  // Effect to handle milestone detection and trigger confetti when streak reaches a new milestone
  useEffect(() => {
    const m = getMilestone(streak);
    if (m && m !== milestone) {
      setMilestone(m);
      setShowConfetti(true);
    }
  }, [streak, milestone]);
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const todayStr = formatDate(new Date());

  // Load habit logs once on mount or when habit.id changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const start = getGridStartDate();
      const end = addDays(new Date(), 1);
      const raw = await getHabitLogs(habit.id, formatDate(start), formatDate(end));
      if (cancelled) return;
      const map = new Map<string, number>();
      raw.forEach((log) => map.set(log.date, log.value));
      setLogs(map);
      setTodayChecked((map.get(todayStr) ?? 0) > 0);

      // Derive streak and momentum from the loaded logs
      // streak & momentum are now derived via useMemo

      // Load habit meta data
      const habitData = await getHabit(habit.id);
      if (habitData && !cancelled) {
        setFreezesUsed(habitData.freezesUsed);
        setMaxFreezes(habitData.maxFreezes);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [habit.id, todayStr, getGridStartDate, addDays, formatDate]);

  const toggleToday = useCallback(async () => {
    const newChecked = !todayChecked;
    triggerHaptic();

    // Optimistically update UI state
    setTodayChecked(newChecked);
    // Update logs map
    const updatedLogs = new Map(logs);
    if (newChecked) {
      updatedLogs.set(todayStr, 1);
    } else {
      updatedLogs.delete(todayStr);
    }
    setLogs(updatedLogs);
    // No additional calculations needed

    setToast({
      message: newChecked ? 'Checked in!' : 'Unchecked',
      action: {
        label: 'Undo',
        onClick: async () => {
          // Revert UI state first
          setTodayChecked((prev) => !prev);
          setLogs((prev) => {
            const reverted = new Map(prev);
            if (todayChecked) {
              reverted.delete(todayStr);
            } else {
              reverted.set(todayStr, 1);
            }
            return reverted;
          });
          // Sync with DB
          if (todayChecked) {
            await removeCheckIn(habit.id, todayStr);
          } else {
            await logCheckIn(habit.id, todayStr, 1);
          }
          onCheckIn?.();
        },
      },
    });

    try {
      if (newChecked) {
        await logCheckIn(habit.id, todayStr, 1);
        const result = await processCheckIn(calculateStreak(new Map(logs).set(todayStr, 1)));
        if (result.newAchievements.length > 0) {
          setCurrentAchievement(result.newAchievements[0]);
        }
        if (result.leveledUp) {
          setToast({
            message: `Level up! You're now level ${result.newLevel}`,
          });
        }
      } else {
        await removeCheckIn(habit.id, todayStr);
      }
    } catch (err) {
      console.error('Failed to toggle check-in:', err);
    }
    onCheckIn?.();
  }, [todayChecked, logs, todayStr, habit.id, onCheckIn]);

  const handleFreeze = useCallback(async () => {
    if (freezesUsed >= maxFreezes) return;
    const success = await applyStreakFreeze(habit.id);
    if (success) {
      setFreezesUsed((prev) => prev + 1);
    }
  }, [habit.id, freezesUsed, maxFreezes]);

  const handleArchive = useCallback(async () => {
    try {
      onArchived(habit.id);
    } catch (err) {
      console.error('Failed to archive habit:', err);
    }
  }, [habit.id, onArchived]);

  return (
    <>
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AchievementToast achievement={currentAchievement} onDismiss={() => setCurrentAchievement(null)} />
      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          onDismiss={() => setToast(null)}
        />
      )}
      <div
        onClick={() => onTap?.(habit)}
        className={`rounded-lg bg-surface-card p-4 border border-border transition-all hover:border-primary/30 ${onTap ? 'cursor-pointer' : ''}`}
        style={{ borderLeft: `3px solid ${habit.color ?? '#6366f1'}`, boxShadow: '0 4px 20px rgba(43, 168, 162, 0.06)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleToday();
            }}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
              todayChecked
                ? 'border-primary bg-primary text-surface-base'
                : 'border-border bg-transparent text-text-muted hover:border-primary hover:text-primary'
            }`}
            style={todayChecked ? { boxShadow: '0 4px 16px rgba(43, 168, 162, 0.25)' } : undefined}
            title={todayChecked ? 'Uncheck in' : 'Check in'}
          >
            {todayChecked ? (
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10" cy="10" r="7" />
              </svg>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-text-primary">{habit.name}</div>
            <div className="flex items-center gap-2 text-xs font-medium">
              {streak > 0 ? (
                <span className="text-primary">{streak} day streak</span>
              ) : (
                <span className="text-text-muted">{momentum.completed} of last {momentum.total} days</span>
              )}
              {milestone && (
                <span className="inline-flex items-center rounded-full bg-accent-gold/20 px-2 py-0.5 text-[10px] font-bold text-accent-gold">
                  {milestone} days!
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {freezesUsed < maxFreezes && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFreeze();
                }}
                className="shrink-0 rounded-md p-1.5 text-text-muted hover:bg-sky-blue/10 hover:text-sky-blue transition-colors"
                title={`Use streak freeze (${maxFreezes - freezesUsed} remaining)`}
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 2v16M2 10h16M4.93 4.93l10.14 10.14M15.07 4.93L4.93 15.07" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleArchive();
              }}
              className="shrink-0 rounded-md p-1.5 text-text-muted hover:bg-coral/10 hover:text-coral transition-colors"
              title="Archive habit"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 5h10M8 5V3h4v2M6 5v10h8V5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <ContributionGrid logs={logs} cellSize={10} cellGap={2} showLabels={false} showLegend={false} />
        </div>
      </div>
    </>
  );
}
