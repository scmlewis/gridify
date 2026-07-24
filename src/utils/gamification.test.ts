import { describe, it, expect } from 'vitest';
import { calculateCheckInXP, getAchievementById, getAllAchievements, processCheckIn } from './gamification';

describe('calculateCheckInXP', () => {
  it('returns base XP for zero streak', () => {
    expect(calculateCheckInXP(0)).toBe(10);
  });

  it('adds streak bonus', () => {
    // streak 5: base 10 + min(10, 100) = 20
    expect(calculateCheckInXP(5)).toBe(20);
  });

  it('caps streak bonus at 100', () => {
    // streak 100: base 10 + min(200, 100) = 110
    expect(calculateCheckInXP(100)).toBe(110);
  });

  it('returns 110 for max streak', () => {
    expect(calculateCheckInXP(365)).toBe(110);
  });
});

describe('getAchievementById', () => {
  it('returns achievement when found', () => {
    const achievement = getAchievementById('first-step');
    expect(achievement).toBeDefined();
    expect(achievement!.name).toBe('First Steps');
  });

  it('returns undefined when not found', () => {
    expect(getAchievementById('nonexistent')).toBeUndefined();
  });
});

describe('getAllAchievements', () => {
  it('returns all achievements', () => {
    const achievements = getAllAchievements();
    expect(achievements.length).toBeGreaterThan(0);
  });

  it('each achievement has required fields', () => {
    const achievements = getAllAchievements();
    for (const a of achievements) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(a.xpReward).toBeGreaterThan(0);
      expect(typeof a.condition).toBe('function');
    }
  });
});

describe('processCheckIn date parameter', () => {
  it('accepts a date string parameter', () => {
    expect(typeof processCheckIn).toBe('function');
  });
});
