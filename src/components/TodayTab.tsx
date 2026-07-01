import { useHabits } from '../hooks/useHabits';
import { SummaryCard } from './SummaryCard';

interface TodayTabProps {
  onRefresh: React.Dispatch<React.SetStateAction<number>>;
  refreshKey?: number;
}

export function TodayTab({ onRefresh: _onRefresh, refreshKey }: TodayTabProps) {
  const { habits, isLoading } = useHabits();

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SummaryCard habits={habits} refreshKey={refreshKey} />
    </div>
  );
}
