import { useState, useCallback } from 'react';
import { Header } from './Header';
import { AddHabitForm } from './AddHabitForm';
import { HabitCard } from './HabitCard';
import { useHabits } from '../hooks/useHabits';

export function Dashboard() {
  const { habits, addHabit, archiveHabit, isLoading } = useHabits();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCheckIn = useCallback(() => {
    setRefreshTrigger((n) => n + 1);
  }, []);

  return (
    <div className="min-h-screen bg-surface-base px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <Header refreshTrigger={refreshTrigger} />
        <AddHabitForm onAdd={addHabit} />
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm font-medium text-text-muted">Loading habits...</div>
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-surface-card/30 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-text-primary">Start your journey</h3>
            <p className="mb-4 text-sm text-text-secondary">
              Build better habits one day at a time. Add your first habit above to begin tracking.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary-bg" />
                <span>No activity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary-dark" />
                <span>Light</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary-light" />
                <span>Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-accent-gold" />
                <span>Very active</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onArchived={archiveHabit}
                onCheckIn={handleCheckIn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
