import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Check, Circle, Snowflake, Archive } from 'lucide-react';
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
      message: `${newChecked ? 'Checked in!' : 'Unchecked'}${streakMsg}`,
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
      if (newStreak > streak) {
        setStreakAnimating(true);
        setTimeout(() => setStreakAnimating(false), 300);
      }
    } catch (err) {
      console.error('Failed to toggle check-in:', err);
      // Rollback optimistic update
      setTodayChecked(prevChecked);
      setLogs(prevLogs);
    }
    onCheckIn?.();
  }, [todayChecked, logs, todayStr, habit.id, onCheckIn, streak]);

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
        onClick={() => onTap?.(habit)}
        className={`rounded-xl bg-surface-card p-4 border border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] ${onTap ? 'cursor-pointer' : ''}`}
        style={{ borderLeft: `3px solid ${habit.color ?? '#6366f1'}` }}
      >
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
            <div className="truncate text-sm font-bold text-text-primary">{habit.name}</div>
            <div className="flex items-center gap-2 text-xs font-medium">
              {streak > 0 ? (
                <span className={`text-primary ${streakAnimating ? 'animate-streak-up' : ''}`}>{streak} day streak</span>
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
