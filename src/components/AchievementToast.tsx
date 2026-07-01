import { useEffect, useState } from 'react';
import type { Achievement } from '../utils/gamification';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement || !visible) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-slide-down">
      <div className="flex items-center gap-3 rounded-lg bg-accent-gold/20 border border-accent-gold/30 px-4 py-3 shadow-lg">
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-accent-gold">Achievement Unlocked!</div>
          <div className="text-sm font-bold text-text-primary">{achievement.name}</div>
          <div className="text-xs text-text-secondary">{achievement.description}</div>
        </div>
        <span className="ml-2 text-xs font-bold text-accent-gold">+{achievement.xpReward} XP</span>
      </div>
    </div>
  );
}
