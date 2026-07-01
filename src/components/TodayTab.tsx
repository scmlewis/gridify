import { useState, useEffect } from 'react';
import { useHabits } from '../hooks/useHabits';
import { getUserProfile } from '../db';
import { SummaryCard } from './SummaryCard';
import { CategoryGroup } from './CategoryGroup';
import { OnboardingFlow } from './OnboardingFlow';
import { AddHabitSheet } from './AddHabitSheet';
import type { CreateHabitOptions } from '../db';

interface TodayTabProps {
  onRefresh: React.Dispatch<React.SetStateAction<number>>;
  refreshKey?: number;
}

export function TodayTab({ onRefresh: _onRefresh, refreshKey }: TodayTabProps) {
  const { habits, isLoading, addHabit } = useHabits();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);

  useEffect(() => {
    getUserProfile().then(p => setOnboardingCompleted(p.onboardingCompleted));
  }, []);

  function handleOnboardingComplete() {
    setOnboardingCompleted(true);
    _onRefresh(n => n + 1);
  }

  function handleAddHabit(options: CreateHabitOptions) {
    addHabit(options);
    _onRefresh(n => n + 1);
  }

  if (onboardingCompleted === false) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (isLoading || onboardingCompleted === null) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  const grouped = new Map<string, typeof habits>();
  for (const habit of habits) {
    const cat = habit.category || 'uncategorized';
    const list = grouped.get(cat);
    if (list) {
      list.push(habit);
    } else {
      grouped.set(cat, [habit]);
    }
  }

  const sortedCategories = [...grouped.entries()].sort(([a], [b]) => {
    if (a === 'uncategorized') return 1;
    if (b === 'uncategorized') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-3">
      <SummaryCard habits={habits} refreshKey={refreshKey} />
      {sortedCategories.map(([category, catHabits]) => (
        <CategoryGroup
          key={category}
          categoryName={category}
          habits={catHabits}
        />
      ))}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent-gold text-surface-base shadow-lg transition-all hover:scale-105 active:scale-95 md:hidden"
        style={{ boxShadow: '0 4px 20px rgba(255, 210, 63, 0.4)' }}
        title="Add new habit"
      >
        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>
      <AddHabitSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddHabit}
      />
    </div>
  );
}
