import { useState, useEffect, useMemo } from 'react';
import { Plus, Target } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { getUserProfile, getLogsForDate, getAllLogsForDateRange, getCategories, unarchiveHabit } from '../db';
import { WeekStrip } from './WeekStrip';
import { ProgressHeroCard } from './ProgressHeroCard';
import { EmptyState } from './EmptyState';
import { CategoryGroup } from './CategoryGroup';
import { OnboardingFlow } from './OnboardingFlow';
import { AddHabitSheet } from './AddHabitSheet';
import { HabitDetailSheet } from './HabitDetailSheet';
import { formatDate } from '../utils/date-utils';
import type { CreateHabitOptions, Category } from '../db';
import type { Habit } from '../types';

interface TodayTabProps {
  onRefresh: React.Dispatch<React.SetStateAction<number>>;
  refreshKey?: number;
  onShowCategories?: () => void;
}

export function TodayTab({ onRefresh: _onRefresh, refreshKey, onShowCategories }: TodayTabProps) {
  const { habits, isLoading, addHabit, reorder, archiveHabit } = useHabits(refreshKey);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [todayLogs, setTodayLogs] = useState<Map<string, number>>(new Map());
  const [weekLogs, setWeekLogs] = useState<Map<string, number>>(new Map());
  const [dragOverHabitId, setDragOverHabitId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getUserProfile().then(p => {
      setOnboardingCompleted(p.onboardingCompleted);
      setLevel(p.level);
    });
    getCategories().then(setCategories);
  }, [refreshKey]);

  useEffect(() => {
    async function loadLogs() {
      const todayStr = formatDate(new Date());
      const todayData = await getLogsForDate(todayStr);
      const map = new Map<string, number>();
      for (const log of todayData) {
        map.set(log.habitId, log.value);
      }
      setTodayLogs(map);

      // Load week logs for WeekStrip
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(monday.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      const weekData = await getAllLogsForDateRange(formatDate(monday), formatDate(sunday));
      const weekMap = new Map<string, number>();
      for (const log of weekData) {
        weekMap.set(log.date, (weekMap.get(log.date) ?? 0) + log.value);
      }
      setWeekLogs(weekMap);
    }
    if (onboardingCompleted) loadLogs();
  }, [onboardingCompleted, refreshKey]);

  const habitsDoneToday = useMemo(() => {
    let count = 0;
    for (const habit of habits) {
      if ((todayLogs.get(habit.id) ?? 0) > 0) count++;
    }
    return count;
  }, [habits, todayLogs]);

  function handleOnboardingComplete() {
    setOnboardingCompleted(true);
    _onRefresh(n => n + 1);
  }

  function handleAddHabit(options: CreateHabitOptions) {
    addHabit(options);
    _onRefresh(n => n + 1);
  }

  const handleDragStart = (e: React.DragEvent, habitId: string) => {
    e.dataTransfer.setData('habitId', habitId);
  };

  const handleDragOver = (e: React.DragEvent, habitId: string) => {
    e.preventDefault();
    setDragOverHabitId(habitId);
  };

  const handleDragLeave = () => {
    setDragOverHabitId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetHabitId: string) => {
    e.preventDefault();
    setDragOverHabitId(null);
    const draggedId = e.dataTransfer.getData('habitId');
    if (draggedId === targetHabitId) return;

    const draggedHabit = habits.find(h => h.id === draggedId);
    const targetHabit = habits.find(h => h.id === targetHabitId);

    if (!draggedHabit || !targetHabit || draggedHabit.category !== targetHabit.category) {
      return;
    }

    const category = targetHabit.category;
    const categoryHabits = habits
      .filter(h => h.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const draggedIndex = categoryHabits.findIndex(h => h.id === draggedId);
    const targetIndex = categoryHabits.findIndex(h => h.id === targetHabitId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...categoryHabits];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    const updates = newOrder.map((h, index) => ({
      id: h.id,
      sortOrder: index
    }));

    await reorder(updates);
  };

  const sortedCategories = useMemo(() => {
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
    return [...grouped.entries()].sort(([a], [b]) => {
      if (a === 'uncategorized') return 1;
      if (b === 'uncategorized') return -1;
      return a.localeCompare(b);
    });
  }, [habits]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) {
      map.set(cat.name, cat);
    }
    return map;
  }, [categories]);

  if (onboardingCompleted === false) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (isLoading || onboardingCompleted === null) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-shimmer rounded-xl h-20 w-full" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Target}
          title="No habits yet"
          description="Create your first habit to start building consistency."
          action={{ label: 'Add Your First Habit', onClick: () => setShowAddSheet(true) }}
        />
        <AddHabitSheet
          isOpen={showAddSheet}
          onClose={() => setShowAddSheet(false)}
          onAdd={handleAddHabit}
          onShowCategories={onShowCategories}
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 space-y-6">
            <ProgressHeroCard habitsDoneToday={habitsDoneToday} totalHabits={habits.length} level={level} />
            <WeekStrip logs={weekLogs} />
          </div>
          <div className="md:col-span-7 space-y-4">
            {sortedCategories.map(([category, catHabits], index) => {
              const catData = categoryMap.get(category);
              return (
                <CategoryGroup
                  key={category}
                  categoryName={category}
                  categoryIcon={catData?.icon}
                  categoryColor={catData?.color}
                  habits={catHabits}
                  onCheckIn={() => _onRefresh(n => n + 1)}
                  onHabitTap={setSelectedHabit}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  refreshKey={refreshKey}
                  dragOverHabitId={dragOverHabitId}
                  onDragLeave={handleDragLeave}
                  className="animate-group-enter"
                  style={{ animationDelay: `${index * 60}ms` }}
                />
              );
            })}
          </div>
        </div>
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-24 right-4 md:bottom-28 z-40 h-14 w-14 flex items-center justify-center rounded-full bg-accent-gold text-surface-base shadow-accent-glow transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-accent-gold/50 active:scale-95"
        style={{ right: 'max(1rem, calc((100vw - 1024px) / 2 - 4.5rem))' }}
        title="Add new habit"
      >
        <Plus className="h-6 w-6" />
      </button>
      <AddHabitSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddHabit}
        onShowCategories={onShowCategories}
      />
      <HabitDetailSheet
        habit={selectedHabit}
        isOpen={selectedHabit !== null}
        onClose={() => setSelectedHabit(null)}
        onDelete={() => _onRefresh(n => n + 1)}
        onArchive={async (id, isNowArchived) => {
          if (isNowArchived) {
            await archiveHabit(id);
          } else {
            await unarchiveHabit(id);
          }
          _onRefresh(n => n + 1);
        }}
        onRefresh={() => _onRefresh(n => n + 1)}
      />
    </>
  );
}
