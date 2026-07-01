import { useState, useEffect } from 'react';
import { useHabits } from '../hooks/useHabits';
import { getUserProfile } from '../db';
import { SummaryCard } from './SummaryCard';
import { CategoryGroup } from './CategoryGroup';
import { OnboardingFlow } from './OnboardingFlow';

interface TodayTabProps {
  onRefresh: React.Dispatch<React.SetStateAction<number>>;
  refreshKey?: number;
}

export function TodayTab({ onRefresh: _onRefresh, refreshKey }: TodayTabProps) {
  const { habits, isLoading } = useHabits();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    getUserProfile().then(p => setOnboardingCompleted(p.onboardingCompleted));
  }, []);

  function handleOnboardingComplete() {
    setOnboardingCompleted(true);
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
    </div>
  );
}
