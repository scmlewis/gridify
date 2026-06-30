import { Header } from './Header';
import { AddHabitForm } from './AddHabitForm';
import { HabitCard } from './HabitCard';
import { useHabits } from '../hooks/useHabits';

export function Dashboard() {
  const { habits, addHabit, archiveHabit, isLoading } = useHabits();

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Header />
        <AddHabitForm onAdd={addHabit} />
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="text-sm text-gray-500">No habits yet. Add one above!</div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onArchived={archiveHabit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
