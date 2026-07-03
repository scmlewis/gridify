import { useState, useCallback } from 'react';
import { HabitRow } from './HabitRow';
import type { Habit } from '../types';

const STORAGE_KEY = 'habit-tracker-collapsed-categories';

function getCollapsedCategories(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsedCategories(collapsed: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]));
}

interface CategoryGroupProps {
  categoryName: string;
  habits: Habit[];
  onCheckIn?: () => void;
  onHabitTap?: (habit: Habit) => void;
  onDragStart?: (e: React.DragEvent, habitId: string) => void;
  onDragOver?: (e: React.DragEvent, habitId: string) => void;
  onDrop?: (e: React.DragEvent, habitId: string) => void;
  refreshKey?: number;
  dragOverHabitId?: string | null;
  onDragLeave?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CategoryGroup({
  categoryName,
  habits,
  onCheckIn,
  onHabitTap,
  onDragStart,
  onDragOver,
  onDrop,
  refreshKey,
  dragOverHabitId,
  onDragLeave,
  className,
  style,
}: CategoryGroupProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => getCollapsedCategories().has(categoryName));

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      const set = getCollapsedCategories();
      if (next) {
        set.add(categoryName);
      } else {
        set.delete(categoryName);
      }
      saveCollapsedCategories(set);
      return next;
    });
  }, [categoryName]);

  const displayName = categoryName === 'uncategorized' ? 'Uncategorized' : categoryName;

  return (
    <div className={className} style={style}>
      <button
        onClick={toggle}
        className="flex w-full items-center gap-2 py-2.5 px-1 text-left group"
      >
        <svg
          className={`h-4 w-4 text-text-muted transition-transform ${collapsed ? '' : 'rotate-90'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary group-hover:text-text-primary transition-colors">
          {displayName}
        </span>
        <span className="text-[10px] text-text-muted ml-0.5">{habits.length}</span>
      </button>
      {!collapsed && (
        <div className="space-y-2 pb-2">
          {habits.map((habit) => (
            <HabitRow 
              key={habit.id} 
              habit={habit} 
              onCheckIn={onCheckIn} 
              onTap={onHabitTap}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              refreshKey={refreshKey}
              isDropTarget={dragOverHabitId === habit.id}
              onDragLeave={onDragLeave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
