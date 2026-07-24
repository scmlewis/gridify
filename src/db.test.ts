import { describe, it, expect, beforeEach } from 'vitest';
import { db, createHabit, archiveHabit, getArchivedHabits } from './db';

beforeEach(async () => {
  await db.table('habits').clear();
  await db.table('habitLogs').clear();
});

describe('getArchivedHabits', () => {
  it('returns only archived habits', async () => {
    await createHabit('Active Habit');
    const id2 = await createHabit('Archived Habit');
    await archiveHabit(id2);

    const archived = await getArchivedHabits();
    expect(archived.length).toBe(1);
    expect(archived[0].id).toBe(id2);
    expect(archived[0].archived).toBe(true);
  });

  it('returns empty array when no archived habits', async () => {
    await createHabit('Active Habit');
    const archived = await getArchivedHabits();
    expect(archived).toEqual([]);
  });

  it('returns empty array when no habits exist', async () => {
    const archived = await getArchivedHabits();
    expect(archived).toEqual([]);
  });
});
