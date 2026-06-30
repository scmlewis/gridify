import { useState, useEffect, useCallback } from 'react';
import { getHabits, createHabit, deleteHabit, archiveHabit } from '../db';
import type { Habit } from '../types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getHabits().then((data) => {
      if (!cancelled) {
        setHabits(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const addHabit = useCallback(async (name: string) => {
    await createHabit(name);
    const updated = await getHabits();
    setHabits(updated);
  }, []);

  const removeHabit = useCallback(async (id: string) => {
    await deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const archive = useCallback(async (id: string) => {
    await archiveHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { habits, addHabit, deleteHabit: removeHabit, archiveHabit: archive, isLoading };
}
