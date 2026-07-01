import { useState, useEffect, useCallback } from 'react';
import { getHabits, createHabit, deleteHabit, archiveHabit, reorderHabits } from '../db';
import type { Habit } from '../types';
import type { CreateHabitOptions } from '../db';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getHabits()
      .then((data) => {
        if (!cancelled) {
          setHabits(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load habits:', err);
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const addHabit = useCallback(async (nameOrOptions: string | CreateHabitOptions) => {
    try {
      await createHabit(nameOrOptions);
      const updated = await getHabits();
      setHabits(updated);
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  }, []);

  const removeHabit = useCallback(async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  }, []);

  const archive = useCallback(async (id: string) => {
    try {
      await archiveHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  }, []);

  const reorder = useCallback(async (updates: {id: string, sortOrder: number}[]) => {
    try {
      await reorderHabits(updates);
      const updated = await getHabits();
      setHabits(updated);
    } catch (err) {
      console.error('Failed to reorder habits:', err);
    }
  }, []);

  return { habits, addHabit, deleteHabit: removeHabit, archiveHabit: archive, reorder, isLoading };
}
