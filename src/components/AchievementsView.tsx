import { useState, useEffect, useMemo } from 'react';
import { Trophy, Filter, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getAllAchievements } from '../utils/gamification';
import { getUserProfile } from '../db';
import type { Achievement } from '../utils/gamification';
import { staggerContainer, staggerItem } from '../utils/animations';

type FilterType = 'all' | 'unlocked' | 'locked';

export function AchievementsView() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    async function load() {
      const allAchievements = getAllAchievements();
      setAchievements(allAchievements);

      const profile = await getUserProfile();
      setUnlockedIds(new Set(profile.achievements));

      const xp = allAchievements
        .filter((a) => profile.achievements.includes(a.id))
        .reduce((sum, a) => sum + a.xpReward, 0);
      setTotalXP(xp);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'unlocked':
        return achievements.filter((a) => unlockedIds.has(a.id));
      case 'locked':
        return achievements.filter((a) => !unlockedIds.has(a.id));
      default:
        return achievements;
    }
  }, [achievements, unlockedIds, filter]);

  const unlockedCount = achievements.filter((a) => unlockedIds.has(a.id)).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary font-display">Achievements</h2>
          <p className="text-xs text-text-muted font-mono">
            {unlockedCount}/{achievements.length} unlocked
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent-gold/15 px-3 py-1">
          <Trophy className="h-3.5 w-3.5 text-accent-gold" />
          <span className="text-xs font-bold text-accent-gold font-mono">{totalXP} XP</span>
        </div>
      </div>

      <div className="sticky top-[52px] z-30 bg-surface-base py-3 -mx-4 px-4 border-b border-border/30">
        <div className="flex gap-2">
        {(['all', 'unlocked', 'locked'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              filter === f
                ? 'bg-primary text-surface-base'
                : 'bg-surface-elevated text-text-muted hover:text-text-secondary'
            }`}
          >
            {f === 'all' && <Filter className="h-3 w-3" />}
            {f === 'unlocked' && <CheckCircle className="h-3 w-3" />}
            {f === 'locked' && <Lock className="h-3 w-3" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        </div>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {filtered.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          return (
            <motion.div
              key={achievement.id}
              variants={staggerItem}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                isUnlocked
                  ? 'border-primary/20 bg-surface-card'
                  : 'border-border/30 bg-surface-elevated/50 opacity-60'
              }`}
            >
              {isUnlocked && (
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/10 blur-2xl" />
              )}
              <div className="relative z-10">
                <div className="mb-2 text-2xl">{achievement.icon}</div>
                <div className="text-sm font-bold text-text-primary font-display">
                  {achievement.name}
                </div>
                <div className="mt-1 text-[11px] text-text-secondary leading-relaxed">
                  {achievement.description}
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-accent-gold font-mono">
                    +{achievement.xpReward} XP
                  </span>
                  {isUnlocked && (
                    <CheckCircle className="h-3 w-3 text-primary" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="mb-3 h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-muted">
            {filter === 'unlocked'
              ? 'No achievements unlocked yet'
              : 'All achievements unlocked!'}
          </p>
        </div>
      )}
    </div>
  );
}
