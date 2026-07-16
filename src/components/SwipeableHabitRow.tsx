import { motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface SwipeableHabitRowProps {
  id: string;
  name: string;
  icon: string;
  color?: string;
  isCompleted: boolean;
  streak?: number;
  onToggle: (id: string) => void;
  onSwipeDelete?: (id: string) => void;
  onSwipeFreeze?: (id: string) => void;
  children?: React.ReactNode;
}

export function SwipeableHabitRow({
  id,
  name,
  icon,
  isCompleted,
  streak,
  onToggle,
  onSwipeDelete,
}: SwipeableHabitRowProps) {
  const [swipeProgress, setSwipeProgress] = useState(0);

  const handleSwipeRight = useCallback(() => {
    onToggle(id);
    setSwipeProgress(0);
  }, [id, onToggle]);

  const handleSwipeLeft = useCallback(() => {
    onSwipeDelete?.(id);
    setSwipeProgress(0);
  }, [id, onSwipeDelete]);

  const { handlers, state, ref } = useSwipeGesture({
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft,
    onSwipeProgress: setSwipeProgress,
    threshold: 0.3,
  });

  return (
    <div
      ref={ref}
      data-swipeable
      className="relative overflow-hidden select-none touch-pan-y"
      {...handlers}
    >
      <motion.div
        className="flex items-center gap-3 rounded-xl p-3 bg-surface-card border border-border/60"
        animate={{ x: state.isSwiping ? state.deltaX : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          backgroundColor: isCompleted ? 'rgba(43, 168, 162, 0.1)' : undefined,
        }}
      >
        <button
          onClick={() => onToggle(id)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors ${
            isCompleted
              ? 'bg-primary text-white'
              : 'bg-surface-elevated border border-border/60'
          }`}
        >
          {isCompleted ? '✓' : icon}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-sm ${isCompleted ? 'opacity-60' : ''}`}>
            {name}
          </div>
        </div>
        {streak && streak > 0 && (
          <span className="text-xs font-medium text-secondary">
            {streak}d
          </span>
        )}
      </motion.div>

      {swipeProgress > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-start pl-4"
          style={{
            backgroundColor: swipeProgress > 0.3 ? 'rgba(43, 168, 162, 0.9)' : 'rgba(43, 168, 162, 0.3)',
            opacity: Math.min(swipeProgress * 2, 1),
          }}
        >
          <span className="text-white font-medium text-sm">Done ✓</span>
        </div>
      )}
    </div>
  );
}
