import Dexie, { type Table } from 'dexie';
import { nanoid } from 'nanoid';
import type { Habit, HabitLog } from './types';

export class HabitDatabase extends Dexie {
  habits!: Table<Habit>;
  habitLogs!: Table<HabitLog>;

  constructor() {
    super('HabitTrackerDB');
    this.version(1).stores({
      habits: 'id, archived, sortOrder',
      habitLogs: 'id, habitId, date, [habitId+date]'
    });
  }
}

export const db = new HabitDatabase();

export async function createHabit(name: string): Promise<string> {
  const id = nanoid();
  const createdAt = new Date().toISOString();
  const lastSortOrder = await db.habits.orderBy('sortOrder').last();
  const sortOrder = lastSortOrder ? lastSortOrder.sortOrder + 1 : 0;
  
  await db.habits.add({
    id,
    name,
    createdAt,
    archived: false,
    sortOrder
  });
  
  return id;
}

export async function deleteHabit(id: string): Promise<void> {
  await db.transaction('rw', [db.habits, db.habitLogs], async () => {
    await db.habitLogs.where('habitId').equals(id).delete();
    await db.habits.delete(id);
  });
}

export async function archiveHabit(id: string): Promise<void> {
  await db.habits.update(id, { archived: true });
}

export async function logCheckIn(habitId: string, date: string, value: number = 1): Promise<string> {
  const existingLog = await db.habitLogs.where('[habitId+date]').equals([habitId, date]).first();
  
  if (existingLog) {
    await db.habitLogs.update(existingLog.id, { value });
    return existingLog.id;
  } else {
    const id = nanoid();
    await db.habitLogs.add({
      id,
      habitId,
      date,
      value
    });
    return id;
  }
}

export async function removeCheckIn(habitId: string, date: string): Promise<void> {
  await db.habitLogs.where('[habitId+date]').equals([habitId, date]).delete();
}

export async function getHabits(): Promise<Habit[]> {
  return db.habits.where('archived').equals(0).sortBy('sortOrder');
}

export async function getHabitLogs(habitId: string, startDate: string, endDate: string): Promise<HabitLog[]> {
  return db.habitLogs
    .where('habitId')
    .equals(habitId)
    .filter(log => log.date >= startDate && log.date <= endDate)
    .toArray();
}

export async function getAllLogsForDateRange(startDate: string, endDate: string): Promise<HabitLog[]> {
  return db.habitLogs
    .filter(log => log.date >= startDate && log.date <= endDate)
    .toArray();
}

export async function getDailyTotals(startDate: string, endDate: string): Promise<Map<string, number>> {
  const logs = await getAllLogsForDateRange(startDate, endDate);
  const dailyTotals = new Map<string, number>();
  
  for (const log of logs) {
    const currentTotal = dailyTotals.get(log.date) || 0;
    dailyTotals.set(log.date, currentTotal + log.value);
  }
  
  return dailyTotals;
}