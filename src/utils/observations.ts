import { calculateDayOfWeekStats } from './analytics';
import { getMonthlyTrends, getCrossHabitCorrelations } from './insights';
import { calculateStreak, calculateMomentum } from './streak';
import { formatDate, addDays } from './date-utils';
import type { Habit } from '../types';

export interface Observation {
  id: string;
  text: string;
  icon: string;
}

const DAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function findBestDay(stats: Record<number, number>): { day: string; count: number } | null {
  let bestDay = -1;
  let bestCount = 0;
  for (let i = 0; i < 7; i++) {
    if (stats[i] > bestCount) {
      bestCount = stats[i];
      bestDay = i;
    }
  }
  if (bestDay === -1) return null;
  return { day: DAY_NAMES[bestDay], count: bestCount };
}

function findWeakestDay(stats: Record<number, number>): { day: string; count: number } | null {
  let worstDay = -1;
  let worstCount = Infinity;
  for (let i = 0; i < 7; i++) {
    if (stats[i] < worstCount) {
      worstCount = stats[i];
      worstDay = i;
    }
  }
  if (worstDay === -1 || worstCount === Infinity) return null;
  return { day: DAY_NAMES[worstDay], count: worstCount };
}

function findBestMonth(trends: Record<string, number>): { month: string; count: number } | null {
  let bestMonth = '';
  let bestCount = 0;
  for (const [month, count] of Object.entries(trends)) {
    if (count > bestCount) {
      bestCount = count;
      bestMonth = month;
    }
  }
  if (!bestMonth) return null;
  const [y, m] = bestMonth.split('-');
  return { month: `${SHORT_MONTHS[parseInt(m) - 1]} ${y}`, count: bestCount };
}

function findWorstMonth(trends: Record<string, number>): { month: string; count: number } | null {
  let worstMonth = '';
  let worstCount = Infinity;
  for (const [month, count] of Object.entries(trends)) {
    if (count < worstCount) {
      worstCount = count;
      worstMonth = month;
    }
  }
  if (!worstMonth) return null;
  const [y, m] = worstMonth.split('-');
  return { month: `${SHORT_MONTHS[parseInt(m) - 1]} ${y}`, count: worstCount };
}

export function generateHabitObservations(
  habit: Habit,
  logs: Map<string, number>,
  allHabits: Habit[],
  allHabitLogs: Map<string, Map<string, number>>
): Observation[] {
  const obs: Observation[] = [];

  if (logs.size === 0) return obs;

  const stats = calculateDayOfWeekStats(logs);
  const bestDay = findBestDay(stats);
  const weakestDay = findWeakestDay(stats);

  const trends = getMonthlyTrends(logs);
  const bestMonth = findBestMonth(trends);
  const worstMonth = findWorstMonth(trends);

  const streak = calculateStreak(logs);
  const momentum = calculateMomentum(logs);

  const totalDays = logs.size;
  const completedDays = [...logs.values()].filter(v => v > 0).length;
  const completionPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);
  const thirtyDaysAgoStr = formatDate(thirtyDaysAgo);
  let recentCount = 0;
  let recentTotal = 0;
  for (const [dateStr, value] of logs.entries()) {
    if (dateStr >= thirtyDaysAgoStr) {
      recentTotal++;
      if (value > 0) recentCount++;
    }
  }
  const recentPct = recentTotal > 0 ? Math.round((recentCount / recentTotal) * 100) : 0;

  if (bestDay && bestDay.count >= 3) {
    obs.push({
      id: 'best-day',
      text: `Most consistent on ${bestDay.day}`,
      icon: '📈',
    });
  }

  if (weakestDay && weakestDay.count >= 1 && bestDay && weakestDay.count < bestDay.count * 0.7) {
    obs.push({
      id: 'weakest-day',
      text: `Tend to skip on ${weakestDay.day}`,
      icon: '⚠️',
    });
  }

  if (bestMonth && bestMonth.count >= 5) {
    obs.push({
      id: 'best-month',
      text: `Best month: ${bestMonth.month} (${bestMonth.count} days)`,
      icon: '🏆',
    });
  }

  if (worstMonth && worstMonth.count >= 1 && bestMonth && worstMonth.count < bestMonth.count * 0.7) {
    obs.push({
      id: 'worst-month',
      text: `Toughest month: ${worstMonth.month} (${worstMonth.count} days)`,
      icon: '📉',
    });
  }

  if (recentPct > 0) {
    const overallPct = completionPct;
    if (recentPct > overallPct + 10) {
      obs.push({
        id: 'improving',
        text: `Consistency up ${recentPct - overallPct}% in the last 30 days`,
        icon: '🚀',
      });
    } else if (recentPct < overallPct - 10) {
      obs.push({
        id: 'declining',
        text: `Consistency down ${overallPct - recentPct}% in the last 30 days`,
        icon: '⚠️',
      });
    }
  }

  if (momentum.completed >= 10) {
    obs.push({
      id: 'strong-momentum',
      text: `${momentum.completed} of last ${momentum.total} days — strong momentum`,
      icon: '🔥',
    });
  }

  if (streak >= 7) {
    obs.push({
      id: 'streak',
      text: `On a ${streak}-day streak`,
      icon: '⚡',
    });
  }

  const weeklyAvg = (completedDays / Math.max(1, totalDays)) * 7;
  if (weeklyAvg >= 5) {
    obs.push({
      id: 'weekly-avg-high',
      text: `Averaging ${weeklyAvg.toFixed(1)} days per week`,
      icon: '📊',
    });
  }

  const allHabitLogSets = new Map<string, Set<string>>();
  for (const [habitId, habitLogMap] of allHabitLogs.entries()) {
    const dateSet = new Set<string>();
    for (const [dateStr, value] of habitLogMap.entries()) {
      if (value > 0) dateSet.add(dateStr);
    }
    allHabitLogSets.set(habitId, dateSet);
  }

  const myDateSet = new Set<string>();
  for (const [dateStr, value] of logs.entries()) {
    if (value > 0) myDateSet.add(dateStr);
  }
  allHabitLogSets.set(habit.id, myDateSet);

  const correlations = getCrossHabitCorrelations(allHabitLogSets);
  for (const corr of correlations) {
    if (corr.habitA === habit.id || corr.habitB === habit.id) {
      const otherId = corr.habitA === habit.id ? corr.habitB : corr.habitA;
      const otherHabit = allHabits.find(h => h.id === otherId);
      if (otherHabit && corr.correlation > 0.5) {
        obs.push({
          id: `correlation-${otherId}`,
          text: `On days you ${otherHabit.name}, you're ${Math.round(corr.correlation * 100)}% more consistent here too`,
          icon: '🔗',
        });
      }
    }
  }

  return obs.slice(0, 5);
}

export function generateGlobalObservations(
  habits: Habit[],
  habitGrids: { habit: Habit; logs: Map<string, number> }[]
): Observation[] {
  const obs: Observation[] = [];

  if (habits.length === 0) return obs;

  const totalHabits = habits.length;
  const activeHabits = habitGrids.filter(g => g.logs.size > 0).length;

  if (activeHabits === 0) return obs;

  obs.push({
    id: 'active-habits',
    text: `${activeHabits} of ${totalHabits} habits have data`,
    icon: '📋',
  });

  const now = new Date();
  const todayStr = formatDate(now);
  let doneToday = 0;
  for (const grid of habitGrids) {
    if (grid.logs.get(todayStr) && grid.logs.get(todayStr)! > 0) {
      doneToday++;
    }
  }
  if (doneToday > 0) {
    obs.push({
      id: 'today-progress',
      text: doneToday === totalHabits
        ? 'All habits done today!'
        : `${doneToday} of ${totalHabits} habits done today`,
      icon: '✅',
    });
  }

  let totalStreakDays = 0;
  let habitsWithStreak = 0;
  for (const grid of habitGrids) {
    const s = calculateStreak(grid.logs);
    if (s > 0) {
      totalStreakDays += s;
      habitsWithStreak++;
    }
  }
  if (habitsWithStreak > 0) {
    const avgStreak = Math.round(totalStreakDays / habitsWithStreak);
    obs.push({
      id: 'avg-streak',
      text: `Average streak: ${avgStreak} days across ${habitsWithStreak} habits`,
      icon: '🔥',
    });
  }

  return obs.slice(0, 4);
}
