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
  categoryIcon?: string;
  categoryColor?: string;
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
  categoryIcon,
  categoryColor,
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
    <div className={`rounded-3xl bg-surface-card border border-white/5 overflow-hidden shadow-xl ${className}`} style={style}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 bg-white/3 hover:bg-white/5 border-b border-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {categoryColor && (
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: categoryColor }} />
          )}
          <span className="text-xl">{categoryIcon || '📁'}</span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">
            {displayName}
          </span>
          <span className="text-[10px] text-text-muted ml-0.5">{habits.length}</span>
        </div>
        <svg
          className={`h-4 w-4 text-text-muted transition-transform ${collapsed ? '' : 'rotate-90'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      {!collapsed && (
        <div className="divide-y divide-white/5">
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
