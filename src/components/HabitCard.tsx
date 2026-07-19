import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Check, Circle, Snowflake, Archive } from 'lucide-react';
import { ContributionGrid } from './ContributionGrid';
import { Confetti } from './Confetti';
import { Toast } from './Toast';
import { AchievementToast } from './AchievementToast';
import { getHabitLogs, logCheckIn, removeCheckIn, applyStreakFreeze, canApplyStreakFreeze, getHabit } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';
import { calculateStreak, calculateMomentum, getMilestone } from '../utils/streak';
import { processCheckIn, type Achievement } from '../utils/gamification';
import { haptic } from '../utils/haptics';
import type { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onArchived: (id: string) => void;
  onCheckIn?: () => void;
  onTap?: (habit: Habit) => void;
  onDragStart?: (e: React.DragEvent, habitId: string) => void;
  onDragOver?: (e: React.DragEvent, habitId: string) => void;
  onDrop?: (e: React.DragEvent, habitId: string) => void;
  onDragLeave?: () => void;
  isDropTarget?: boolean;
}

function triggerHaptic() {
  haptic.light();
}

export function HabitCard({ habit, onArchived, onCheckIn, onTap, onDragStart, onDragOver, onDrop, onDragLeave, isDropTarget }: HabitCardProps) {
  const [logs, setLogs] = useState<Map<string, number>>(new Map());
  const [todayChecked, setTodayChecked] = useState(false);
  const streak = useMemo(() => calculateStreak(logs), [logs]);
  const momentum = useMemo(() => calculateMomentum(logs), [logs]);
  const [freezesUsed, setFreezesUsed] = useState(0);
  const [maxFreezes, setMaxFreezes] = useState(2);
  const [canFreeze, setCanFreeze] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
  const [streakAnimating, setStreakAnimating] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
  const [justChecked, setJustChecked] = useState(false);
  const todayCheckedRef = useRef(todayChecked);
  todayCheckedRef.current = todayChecked;

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

      // Load habit meta data
      const habitData = await getHabit(habit.id);
      if (habitData && !cancelled) {
        setFreezesUsed(habitData.freezesUsed);
        setMaxFreezes(habitData.maxFreezes);
        const freezeCheck = await canApplyStreakFreeze(habit.id);
        if (!cancelled) setCanFreeze(freezeCheck.allowed);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [habit.id, todayStr]);

  const toggleToday = useCallback(async () => {
    const newChecked = !todayChecked;
    triggerHaptic();

    // Save previous state for rollback
    const prevChecked = todayChecked;
    const prevLogs = new Map(logs);

    // Optimistically update UI state
    setTodayChecked(newChecked);
    if (newChecked) {
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 1200);
    }
    const updatedLogs = new Map(logs);
    if (newChecked) {
      updatedLogs.set(todayStr, 1);
    } else {
      updatedLogs.delete(todayStr);
    }
    setLogs(updatedLogs);

    // Detect first-ever check-in for this habit
    const isFirstCheckIn = newChecked && logs.size === 0;

    // Calculate what the streak would be after this action
    const newStreak = calculateStreak(updatedLogs);
    const streakDelta = newStreak - streak;
    const streakMsg = newChecked
      ? streakDelta > 0
        ? ` — ${newStreak} day streak${newStreak > 1 ? 's' : ''}!`
        : streakDelta === 0 && newStreak > 0
          ? ` — ${newStreak} day streak maintained`
          : ''
      : '';

    setToast({
      message: isFirstCheckIn ? 'First square! They add up.' : `${newChecked ? 'Checked in!' : 'Unchecked'}${streakMsg}`,
      action: {
        label: 'Undo',
        onClick: async () => {
          const wasChecked = todayCheckedRef.current;
          setTodayChecked(!wasChecked);
          setLogs((prev) => {
            const reverted = new Map(prev);
            if (wasChecked) {
              reverted.delete(todayStr);
            } else {
              reverted.set(todayStr, 1);
            }
            return reverted;
          });
          if (wasChecked) {
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
      } else {
        await removeCheckIn(habit.id, todayStr);
      }
    } catch (err) {
      console.error('Failed to toggle check-in:', err);
      setTodayChecked(prevChecked);
      setLogs(prevLogs);
      return;
    }

    try {
      if (newChecked) {
        const result = await processCheckIn(calculateStreak(new Map(logs).set(todayStr, 1)));
        if (result.newAchievements.length > 0) {
          setToast(null);
          setCurrentAchievement(result.newAchievements[0]);
        }
        if (result.leveledUp) {
          setCurrentAchievement(null);
          setToast({
            message: `Level up! You're now level ${result.newLevel}`,
          });
        }
      }
      if (newStreak > streak) {
        setStreakAnimating(true);
        setTimeout(() => setStreakAnimating(false), 300);
      }
    } catch (err) {
      console.error('Gamification processing failed:', err);
    }
    onCheckIn?.();
  }, [todayChecked, logs, todayStr, habit.id, onCheckIn, streak]);

  const handleFreeze = useCallback(async () => {
    if (freezesUsed >= maxFreezes || !canFreeze) return;
    const result = await applyStreakFreeze(habit.id);
    if (result.success) {
      setFreezesUsed((prev) => prev + 1);
      setCanFreeze(false);
      setToast({ message: 'Streak freeze applied' });
    } else if (result.reason) {
      setToast({ message: result.reason });
    }
  }, [habit.id, freezesUsed, maxFreezes, canFreeze]);

  const handleArchive = useCallback(async () => {
    try {
      onArchived(habit.id);
    } catch (err) {
      console.error('Failed to archive habit:', err);
    }
  }, [habit.id, onArchived]);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart?.(e, habit.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver?.(e, habit.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    onDrop?.(e, habit.id);
  };

  return (
    <>
      {showConfetti && <Confetti trigger={true} onComplete={() => setShowConfetti(false)} />}
      <AchievementToast achievement={currentAchievement} onDismiss={() => setCurrentAchievement(null)} />
      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          onDismiss={() => setToast(null)}
        />
      )}
      <div
        draggable={true}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        onDragLeave={onDragLeave}
        onClick={() => onTap?.(habit)}
        className={`relative overflow-hidden rounded-3xl bg-surface-card p-5 border border-white/5 transition-all duration-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98] shadow-xl ${onTap ? 'cursor-pointer' : ''} ${isDragging ? 'opacity-50 scale-[0.98]' : ''} ${isDropTarget ? 'ring-2 ring-primary/50' : ''}`}
        style={{ borderLeft: `3px solid ${habit.color ?? '#10b981'}` }}
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!todayChecked) setRippleKey((prev) => prev + 1);
              toggleToday();
            }}
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 ${
              todayChecked && justChecked
                ? 'animate-glow-pulse border-primary bg-primary text-surface-base shadow-teal-glow'
                : todayChecked
                  ? 'border-primary bg-primary text-surface-base shadow-teal-glow'
                  : 'border-border bg-transparent text-text-muted hover:border-primary/60 hover:text-primary hover:shadow-sm hover:shadow-primary/10'
            }`}
            title={todayChecked ? 'Uncheck in' : 'Check in'}
          >
            <span className="ripple-container absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
              <span key={rippleKey} className="animate-ripple absolute h-full w-full rounded-full bg-white/30" />
            </span>
            {todayChecked ? (
              <Check className="h-5 w-5 relative z-10" strokeWidth={2.5} />
            ) : (
              <Circle className="h-5 w-5 relative z-10" strokeWidth={1.8} />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-text-primary font-display">{habit.name}</div>
            <div className="flex items-center gap-2 text-xs font-medium">
              {streak > 0 ? (
                <span className={`text-primary ${streakAnimating ? 'animate-streak-up' : ''}`}>{streak} day streak</span>
              ) : momentum.completed > 0 ? (
                <span className="text-text-muted">{momentum.completed} of last {momentum.total} days</span>
              ) : (
                <span className="text-text-muted">Start your streak today</span>
              )}
              {milestone && (
                <span className="inline-flex items-center rounded-full bg-accent-gold/20 px-2 py-0.5 text-[10px] font-bold text-accent-gold">
                  {milestone} days!
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {canFreeze && freezesUsed < maxFreezes && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFreeze();
                }}
                className="shrink-0 rounded-full p-2 text-text-muted hover:bg-sky-blue/10 hover:text-sky-blue transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={`Use streak freeze (${maxFreezes - freezesUsed} remaining)`}
              >
                <Snowflake className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleArchive();
              }}
              className="shrink-0 rounded-full p-2 text-text-muted hover:bg-coral/10 hover:text-coral transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Archive habit"
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3">
          <ContributionGrid logs={logs} cellSize={10} cellGap={2} showLabels={false} showLegend={false} />
        </div>
      </div>
    </>
  );
}
