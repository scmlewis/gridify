import { getUserProfile, addXP, unlockAchievement, getHabits, db } from '../db';
import { formatDate, addDays, getSunday, parseDate } from './date-utils';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (context: AchievementContext) => Promise<boolean>;
}

export interface AchievementContext {
  streak: number;
  totalCheckIns: number;
  habitCount: number;
  momentum: { completed: number; total: number };
  weeklyTargetHit: number;
  consecutiveWeeksAtTarget: number;
  numericEntries: number;
  categoryCount: number;
  allCategoriesCheckedToday: boolean;
  isComeback: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', name: 'First Steps', description: 'Complete your first check-in', icon: '👣', xpReward: 50, condition: async (ctx) => ctx.totalCheckIns >= 1 },
  { id: 'week-warrior', name: 'Week Warrior', description: '7-day streak', icon: '⚔️', xpReward: 100, condition: async (ctx) => ctx.streak >= 7 },
  { id: 'two-weeks', name: 'Consistent', description: '14-day streak', icon: '🔥', xpReward: 150, condition: async (ctx) => ctx.streak >= 14 },
  { id: 'centurion', name: 'Centurion', description: '100-day streak', icon: '🛡️', xpReward: 500, condition: async (ctx) => ctx.streak >= 100 },
  { id: 'year-master', name: 'Year Master', description: '365-day streak', icon: '👑', xpReward: 2000, condition: async (ctx) => ctx.streak >= 365 },
  { id: 'habit-builder', name: 'Habit Builder', description: 'Create 3 habits', icon: '🏗️', xpReward: 75, condition: async (ctx) => ctx.habitCount >= 3 },
  { id: 'habit-master', name: 'Habit Master', description: 'Create 5 habits', icon: '🎯', xpReward: 150, condition: async (ctx) => ctx.habitCount >= 5 },
  { id: 'productive', name: 'Productive', description: 'Complete 10 check-ins total', icon: '✅', xpReward: 100, condition: async (ctx) => ctx.totalCheckIns >= 10 },
  { id: 'dedicated', name: 'Dedicated', description: 'Complete 50 check-ins total', icon: '💪', xpReward: 250, condition: async (ctx) => ctx.totalCheckIns >= 50 },
  { id: 'committed', name: 'Committed', description: 'Complete 100 check-ins total', icon: '🤝', xpReward: 400, condition: async (ctx) => ctx.totalCheckIns >= 100 },
  { id: 'legend', name: 'Legend', description: 'Complete 500 check-ins total', icon: '⭐', xpReward: 1000, condition: async (ctx) => ctx.totalCheckIns >= 500 },
  { id: 'momentum-master', name: 'Momentum Master', description: 'Complete 12 of last 14 days', icon: '📈', xpReward: 200, condition: async (ctx) => ctx.momentum.completed >= 12 },
  { id: 'perfect-week', name: 'Perfect Week', description: 'Complete all habits for 7 days straight', icon: '🌟', xpReward: 300, condition: async () => false },
  { id: 'early-bird', name: 'Early Bird', description: 'Check in before 8 AM', icon: '🌅', xpReward: 50, condition: async () => new Date().getHours() < 8 },
  { id: 'night-owl', name: 'Night Owl', description: 'Check in after 10 PM', icon: '🦉', xpReward: 50, condition: async () => new Date().getHours() >= 22 },
  { id: 'streak-freezer', name: 'Streak Freezer', description: 'Use a streak freeze', icon: '🧊', xpReward: 25, condition: async () => false },
  { id: 'marathon', name: 'Marathon', description: '30-day streak', icon: '🏃', xpReward: 300, condition: async (ctx) => ctx.streak >= 30 },
  { id: 'half-year', name: 'Half Year Hero', description: '180-day streak', icon: '🏆', xpReward: 1000, condition: async (ctx) => ctx.streak >= 180 },
  { id: 'on-fire', name: 'On Fire', description: '5-day streak', icon: '🔥', xpReward: 75, condition: async (ctx) => ctx.streak >= 5 },
  { id: 'target-hacker', name: 'Target Hacker', description: 'Hit weekly target for the first time', icon: '🎯', xpReward: 100, condition: async (ctx) => ctx.weeklyTargetHit >= 1 },
  { id: 'consistent-crusher', name: 'Consistent Crusher', description: 'Hit all weekly targets for 4 consecutive weeks', icon: '🔨', xpReward: 500, condition: async (ctx) => ctx.consecutiveWeeksAtTarget >= 4 },
  { id: 'data-collector', name: 'Data Collector', description: 'Log 100 numeric entries', icon: '📊', xpReward: 150, condition: async (ctx) => ctx.numericEntries >= 100 },
  { id: 'data-master', name: 'Data Master', description: 'Log 500 numeric entries', icon: '🧠', xpReward: 400, condition: async (ctx) => ctx.numericEntries >= 500 },
  { id: 'multi-tracker', name: 'Multi-Tracker', description: 'Track habits in 3+ categories', icon: '🗺️', xpReward: 100, condition: async (ctx) => ctx.categoryCount >= 3 },
  { id: 'well-rounded', name: 'Well-Rounded', description: 'Check in all categories in one day', icon: '🌈', xpReward: 200, condition: async (ctx) => ctx.allCategoriesCheckedToday },
  { id: 'comeback-kid', name: 'Comeback Kid', description: 'Return after 3+ day gap and reach 7-day streak', icon: '🔄', xpReward: 250, condition: async (ctx) => ctx.streak >= 7 && ctx.isComeback },
];
export function calculateCheckInXP(streak: number): number {
  const baseXP = 10;
  const streakBonus = Math.min(streak * 2, 50);
  return baseXP + streakBonus;
}

export async function processCheckIn(streak: number): Promise<{
  xpEarned: number;
  newAchievements: Achievement[];
  leveledUp: boolean;
  newLevel: number;
}> {
  const profile = await getUserProfile();
  const habits = await getHabits();
  const todayDate = new Date();
  const today = formatDate(todayDate);
  const allLogs = await db.table('habitLogs').toArray();
  const habitMap = new Map(habits.map((h) => [h.id, h]));

  // 1. Basic stats
  const totalCheckIns = allLogs.filter((l) => l.value > 0).length;
  const numericEntriesCount = allLogs.filter(
    (l) => habitMap.get(l.habitId)?.valueType === 'numeric' && l.value > 0
  ).length;

  // 2. Categories
  const categoriesWithHabits = new Set(habits.filter((h) => h.category).map((h) => h.category));
  const categoriesWithHabitsCount = categoriesWithHabits.size;

  const categoriesCheckedInToday = new Set(
    allLogs
      .filter((l) => l.date === today && l.value > 0)
      .map((l) => habitMap.get(l.habitId)?.category)
      .filter((c): c is string => !!c)
  );
  const categoriesCheckedInTodayCount = categoriesCheckedInToday.size;

  // 3. Momentum (last 14 days)
  const fourteenDaysAgo = formatDate(addDays(todayDate, -13));
  const daysWithCheckIn = new Set(
    allLogs
      .filter((l) => l.date >= fourteenDaysAgo && l.date <= today && l.value > 0)
      .map((l) => l.date)
  );
  const momentumCompleted = daysWithCheckIn.size;

  // 4. Weekly Target Hit
  const weeksWithLogs = new Set(
    allLogs.map((l) => formatDate(getSunday(parseDate(l.date))))
  );

  const weeklySuccesses: Map<string, boolean> = new Map();
  for (const sundayStr of weeksWithLogs) {
    const sunday = parseDate(sundayStr);
    const saturday = formatDate(addDays(sunday, 6));

    let allHabitsMet = true;
    const activeHabits = habits.filter((h) => !h.archived);

    if (activeHabits.length === 0) {
      allHabitsMet = false;
    } else {
      for (const habit of activeHabits) {
        let targetPerWeek = 7;
        if (habit.targetFrequency === 'weekly') {
          targetPerWeek = habit.targetValue ?? 1;
        } else if (habit.targetFrequency === 'monthly') {
          targetPerWeek = 1;
        }

        const countInWeek = allLogs.filter(
          (l) =>
            l.habitId === habit.id &&
            l.date >= sundayStr &&
            l.date <= saturday &&
            l.value > 0
        ).length;

        if (countInWeek < targetPerWeek) {
          allHabitsMet = false;
          break;
        }
      }
    }
    weeklySuccesses.set(sundayStr, allHabitsMet);
  }

  const successfulWeeksCount = Array.from(weeklySuccesses.values()).filter((v) => v).length;

  let consecutiveWeeklyTargetHits = 0;
  const sortedSundays = Array.from(weeklySuccesses.keys()).sort().reverse();
  for (const sundayStr of sortedSundays) {
    if (weeklySuccesses.get(sundayStr)) {
      consecutiveWeeklyTargetHits++;
    } else {
      break;
    }
  }

  // 5. Has Large Gap
  let hasLargeGap = false;
  if (streak > 0) {
    const gapDays = [];
    for (let i = 1; i <= 3; i++) {
      const d = formatDate(addDays(todayDate, -(streak + i)));
      gapDays.push(d);
    }
    const allGapDaysEmpty = gapDays.every(
      (d) => !allLogs.some((l) => l.date === d && l.value > 0)
    );
    if (allGapDaysEmpty) {
      hasLargeGap = true;
    }
  }

  const context: AchievementContext = {
    streak,
    totalCheckIns,
    habitCount: habits.length,
    momentum: { completed: momentumCompleted, total: 14 },
    weeklyTargetHit: successfulWeeksCount,
    consecutiveWeeksAtTarget: consecutiveWeeklyTargetHits,
    numericEntries: numericEntriesCount,
    categoryCount: categoriesWithHabitsCount,
    allCategoriesCheckedToday: categoriesCheckedInTodayCount === categoriesWithHabitsCount && categoriesWithHabitsCount > 0,
    isComeback: hasLargeGap,
  };

  const xpEarned = calculateCheckInXP(streak);
  const { level, leveledUp } = await addXP(xpEarned);

  const newAchievements: Achievement[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (profile.achievements.includes(achievement.id)) continue;

    const unlocked = await achievement.condition(context);
    if (unlocked) {
      const actuallyUnlocked = await unlockAchievement(achievement.id);
      if (actuallyUnlocked) {
        newAchievements.push(achievement);
        await addXP(achievement.xpReward);
      }
    }
  }

  return { xpEarned, newAchievements, leveledUp, newLevel: level };
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}
