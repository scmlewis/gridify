import { getUserProfile, addXP, unlockAchievement, getHabits, getAllLogsForDateRange } from '../db';
import { formatDate, addDays } from './date-utils';

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
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', name: 'First Steps', description: 'Complete your first check-in', icon: '👣', xpReward: 50, condition: async (ctx) => ctx.totalCheckIns >= 1 },
  { id: 'week-warrior', name: 'Week Warrior', description: '7-day streak', icon: '⚔️', xpReward: 100, condition: async (ctx) => ctx.streak >= 7 },
  { id: 'two-weeks', name: 'Consistent', description: '14-day streak', icon: '🔥', xpReward: 150, condition: async (ctx) => ctx.streak >= 14 },
  { id: 'centurion', name: 'Centurion', description: '100-day streak', icon: '🛡️', xpReward: 500, condition: async (ctx) => ctx.streak >= 100 },
  { id: 'year-master', name: 'Year Master', description: '365-day streak', icon: '👑', xpReward: 2000, condition: async (ctx) => ctx.streak >= 365 },
  { id: 'comeback-kid', name: 'Comeback Kid', description: 'Reach 7-day streak after losing one', icon: '🔄', xpReward: 200, condition: async () => false },
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
  const today = formatDate(new Date());
  const weekAgo = formatDate(addDays(new Date(), -6));
  const logs = await getAllLogsForDateRange(weekAgo, today);

  const totalCheckIns = logs.filter((l) => l.value > 0).length;
  let completed = 0;
  for (const log of logs) {
    if (log.value > 0) completed++;
  }

  const context: AchievementContext = {
    streak,
    totalCheckIns,
    habitCount: habits.length,
    momentum: { completed, total: 14 },
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
