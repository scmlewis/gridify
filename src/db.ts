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
  category?: string;
  valueType?: 'boolean' | 'numeric';
  unit?: string;
  targetFrequency?: 'daily' | 'weekly' | 'monthly';
  targetValue?: number;
  color?: string;
  icon?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface UserProfile {
  id: string;
  xp: number;
  level: number;
  achievements: string[];
  createdAt: string;
  onboardingCompleted: boolean;
  categories: Category[];
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

db.version(4).stores({
  habits: 'id, archived, sortOrder, category',
  habitLogs: 'id, habitId, date',
  userProfile: 'id'
}).upgrade(async (tx) => {
  await tx.table('habits').toCollection().modify((habit: any) => {
    habit.category = habit.category ?? 'uncategorized';
    habit.valueType = habit.valueType ?? 'boolean';
    habit.unit = habit.unit ?? '';
    habit.targetFrequency = habit.targetFrequency ?? 'daily';
    habit.targetValue = habit.targetValue ?? 1;
    habit.color = habit.color ?? '#6366f1';
  });
  await tx.table('userProfile').toCollection().modify((profile: any) => {
    profile.onboardingCompleted = profile.onboardingCompleted ?? false;
    profile.categories = profile.categories ?? [];
  });
});

db.version(5).stores({
  habits: 'id, archived, sortOrder, category',
  habitLogs: 'id, habitId, date, [habitId+date]',
  userProfile: 'id'
});

db.version(6).stores({
  habits: 'id, archived, sortOrder, category',
  habitLogs: 'id, habitId, date, [habitId+date]',
  userProfile: 'id'
}).upgrade(async (tx) => {
  await tx.table('habits').toCollection().modify((habit: any) => {
    habit.icon = habit.icon ?? '';
  });
});

export { db };

export interface CreateHabitOptions {
  name: string;
  category?: string;
  valueType?: 'boolean' | 'numeric';
  unit?: string;
  targetFrequency?: 'daily' | 'weekly' | 'monthly';
  targetValue?: number;
  color?: string;
  icon?: string;
}

export async function createHabit(nameOrOptions: string | CreateHabitOptions): Promise<string> {
  const options = typeof nameOrOptions === 'string'
    ? { name: nameOrOptions }
    : nameOrOptions;

  const id = nanoid();
  const createdAt = new Date().toISOString();
  const count = await db.table('habits').count();
  await db.table('habits').add({
    id,
    name: options.name,
    createdAt,
    archived: false,
    sortOrder: count,
    freezesUsed: 0,
    maxFreezes: 2,
    category: options.category ?? 'uncategorized',
    valueType: options.valueType ?? 'boolean',
    unit: options.unit ?? '',
    targetFrequency: options.targetFrequency ?? 'daily',
    targetValue: options.targetValue ?? 1,
    color: options.color ?? '#6366f1',
    icon: options.icon ?? ''
  });
  return id;
}

export async function updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): Promise<void> {
  await db.table('habits').update(id, updates);
}

export async function archiveHabit(id: string): Promise<void> {
  await db.table('habits').update(id, { archived: true });
}

export async function reorderHabits(updates: {id: string, sortOrder: number}[]): Promise<void> {
  await db.transaction('rw', db.table('habits'), async () => {
    for (const update of updates) {
      await db.table('habits').update(update.id, { sortOrder: update.sortOrder });
    }
  });
}

export async function deleteHabit(id: string): Promise<void> {
  await db.transaction('rw', db.table('habits'), db.table('habitLogs'), async () => {
    await db.table('habitLogs').where('habitId').equals(id).delete();
    await db.table('habits').delete(id);
  });
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
    .where('[habitId+date]').equals([habitId, date])
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
    .where('[habitId+date]').equals([habitId, date])
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
  return await db.table('habitLogs')
    .where('[habitId+date]').between([habitId, startDate], [habitId, endDate], true, true)
    .toArray();
}

export async function getAllLogsForDateRange(startDate: string, endDate: string): Promise<HabitLog[]> {
  return await db.table('habitLogs')
    .where('date').between(startDate, endDate, true, true)
    .toArray();
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
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      categories: []
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

export async function getCategories(): Promise<Category[]> {
  const profile = await getUserProfile();
  return profile.categories;
}

export async function updateCategories(categories: Category[]): Promise<void> {
  await db.table('userProfile').update('default', { categories });
}

export async function completeOnboarding(categories: Category[]): Promise<void> {
  await db.table('userProfile').update('default', {
    onboardingCompleted: true,
    categories
  });
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

export async function getTotalCheckInCount(): Promise<number> {
  return await db.table('habitLogs').where('value').above(0).count();
}

export async function getNumericEntryCount(): Promise<number> {
  const habits = await getHabits();
  const numericHabitIds = new Set(habits.filter(h => h.valueType === 'numeric').map(h => h.id));
  if (numericHabitIds.size === 0) return 0;
  let count = 0;
  for (const id of numericHabitIds) {
    count += await db.table('habitLogs').where('habitId').equals(id).count();
  }
  return count;
}

export async function getLogsForDate(date: string): Promise<HabitLog[]> {
  return await db.table('habitLogs').where('date').equals(date).toArray();
}

export async function getHabitLogsCount(habitId: string): Promise<number> {
  return await db.table('habitLogs').where('habitId').equals(habitId).count();
}
