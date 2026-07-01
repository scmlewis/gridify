import Dexie from 'dexie';
import { nanoid } from 'nanoid';

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  archived: boolean;
  sortOrder: number;
  freezesUsed: number;
  maxFreezes: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
}

export interface UserProfile {
  id: string;
  xp: number;
  level: number;
  achievements: string[];
  createdAt: string;
}

const db = new Dexie('HabitTrackerDB');
db.version(3).stores({
  habits: 'id, archived, sortOrder',
  habitLogs: 'id, habitId, date',
  userProfile: 'id'
}).upgrade(async (tx) => {
  await tx.table('habits').toCollection().modify((habit: any) => {
    habit.freezesUsed = habit.freezesUsed ?? 0;
    habit.maxFreezes = habit.maxFreezes ?? 2;
  });
  const profileCount = await tx.table('userProfile').count();
  if (profileCount === 0) {
    await tx.table('userProfile').add({
      id: 'default',
      xp: 0,
      level: 1,
      achievements: [],
      createdAt: new Date().toISOString()
    });
  }
});

export { db };

export async function createHabit(name: string): Promise<string> {
  const id = nanoid();
  const createdAt = new Date().toISOString();
  const count = await db.table('habits').count();
  await db.table('habits').add({
    id,
    name,
    createdAt,
    archived: false,
    sortOrder: count,
    freezesUsed: 0,
    maxFreezes: 2
  });
  return id;
}

export async function deleteHabit(id: string): Promise<void> {
  await db.table('habitLogs').where('habitId').equals(id).delete();
  await db.table('habits').delete(id);
}

export async function archiveHabit(id: string): Promise<void> {
  await db.table('habits').update(id, { archived: true });
}

export async function applyStreakFreeze(id: string): Promise<boolean> {
  const habit = await db.table('habits').get(id) as Habit | undefined;
  if (!habit || habit.freezesUsed >= habit.maxFreezes) return false;
  await db.table('habits').update(id, { freezesUsed: habit.freezesUsed + 1 });
  return true;
}

export async function getHabit(id: string): Promise<Habit | undefined> {
  return await db.table('habits').get(id) as Habit | undefined;
}

export async function logCheckIn(habitId: string, date: string, value: number = 1): Promise<string> {
  const existing = await db.table('habitLogs')
    .where('habitId').equals(habitId)
    .filter((log: any) => log.date === date)
    .first();
  if (existing) {
    await db.table('habitLogs').update(existing.id, { value });
    return existing.id;
  }
  const id = nanoid();
  await db.table('habitLogs').add({ id, habitId, date, value });
  return id;
}

export async function removeCheckIn(habitId: string, date: string): Promise<void> {
  const log = await db.table('habitLogs')
    .where('habitId').equals(habitId)
    .filter((l: any) => l.date === date)
    .first();
  if (log) {
    await db.table('habitLogs').delete(log.id);
  }
}

export async function getHabits(): Promise<Habit[]> {
  const all = await db.table('habits').toArray();
  return all
    .filter((h: any) => !h.archived)
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
}

export async function getHabitLogs(habitId: string, startDate: string, endDate: string): Promise<HabitLog[]> {
  const all = await db.table('habitLogs').where('habitId').equals(habitId).toArray();
  return all.filter((log: any) => log.date >= startDate && log.date <= endDate);
}

export async function getAllLogsForDateRange(startDate: string, endDate: string): Promise<HabitLog[]> {
  const all = await db.table('habitLogs').toArray();
  return all.filter((log: any) => log.date >= startDate && log.date <= endDate);
}

export async function getDailyTotals(startDate: string, endDate: string): Promise<Map<string, number>> {
  const logs = await getAllLogsForDateRange(startDate, endDate);
  const totals = new Map<string, number>();
  for (const log of logs) {
    totals.set(log.date, (totals.get(log.date) || 0) + log.value);
  }
  return totals;
}

export async function getUserProfile(): Promise<UserProfile> {
  const profile = await db.table('userProfile').get('default') as UserProfile | undefined;
  if (!profile) {
    const newProfile: UserProfile = {
      id: 'default',
      xp: 0,
      level: 1,
      achievements: [],
      createdAt: new Date().toISOString()
    };
    await db.table('userProfile').add(newProfile);
    return newProfile;
  }
  return profile;
}

export async function addXP(amount: number): Promise<{ level: number; leveledUp: boolean }> {
  const profile = await getUserProfile();
  const newXP = profile.xp + amount;
  const newLevel = getLevelForXP(newXP);
  const leveledUp = newLevel > profile.level;

  await db.table('userProfile').update('default', {
    xp: newXP,
    level: newLevel
  });

  return { level: newLevel, leveledUp };
}

export async function unlockAchievement(achievementId: string): Promise<boolean> {
  const profile = await getUserProfile();
  if (profile.achievements.includes(achievementId)) return false;

  await db.table('userProfile').update('default', {
    achievements: [...profile.achievements, achievementId]
  });

  return true;
}

function getLevelForXP(xp: number): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}
