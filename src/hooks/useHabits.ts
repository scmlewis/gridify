import { useState, useEffect, useCallback } from 'react';
import { getHabits, createHabit, deleteHabit, archiveHabit } from '../db';
import type { Habit } from '../types';

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

  const addHabit = useCallback(async (name: string) => {
    try {
      await createHabit(name);
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

  return { habits, addHabit, deleteHabit: removeHabit, archiveHabit: archive, isLoading };
}
