import { useState } from 'react';
import type { Habit } from '../db';
import { getCrossHabitCorrelations, getMonthlyTrends } from '../utils/insights';
import { calculateDayOfWeekStats } from '../utils/analytics';

interface InsightGridData {
  habit: Habit;
  logs: Map<string, number>;
}

interface InsightsPanelProps {
  habits: Habit[];
  habitGrids: InsightGridData[];
  globalLogs: Map<string, number>;
}

export function InsightsPanel({ habits, habitGrids, globalLogs }: InsightsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Correlation Insight
  // "You're X% more likely to do [Habit B] on days you [Habit A]"
  const correlationInsight = () => {
    const allHabitLogsMap = new Map<string, Set<string>>();
    for (const grid of habitGrids) {
      const dateSet = new Set<string>();
      for (const dateStr of grid.logs.keys()) {
        if (grid.logs.get(dateStr)! > 0) {
          dateSet.add(dateStr);
        }
      }
      allHabitLogsMap.set(grid.habit.id, dateSet);
    }

    const correlations = getCrossHabitCorrelations(allHabitLogsMap);
    if (correlations.length === 0) return null;

    // Find the best correlation based on P(B|A)
    let bestPBA: number = 0;
    let bestA: Habit | null = null;
    let bestB: Habit | null = null;

    for (const corr of correlations) {
      const setA = allHabitLogsMap.get(corr.habitA)!;
      const setB = allHabitLogsMap.get(corr.habitB)!;
      
      const intersection = new Set([...setA].filter(x => setB.has(x)));
      
      // P(B|A)
      const pBA = intersection.size / setA.size;
      if (pBA > bestPBA) {
        bestPBA = pBA;
        bestA = habits.find(h => h.id === corr.habitA) || null;
        bestB = habits.find(h => h.id === corr.habitB) || null;
      }

      // P(A|B)
      const pAB = intersection.size / setB.size;
      if (pAB > bestPBA) {
        bestPBA = pAB;
        bestA = habits.find(h => h.id === corr.habitB) || null;
        bestB = habits.find(h => h.id === corr.habitA) || null;
      }
    }

    if (bestA && bestB && bestPBA > 0.5) {
      return `You're ${Math.round(bestPBA * 100)}% more likely to do ${bestB.name} on days you ${bestA.name}`;
    }
    return null;
  };

  // 2. Trend Insight
  // "You've [improved/declined] X% this month vs last month"
  const trendInsight = () => {
    const trends = getMonthlyTrends(globalLogs);
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const currentVal = trends[currentMonthStr] || 0;
    const prevVal = trends[prevMonthStr] || 0;

    if (prevVal > 0) {
      const diff = ((currentVal - prevVal) / prevVal) * 100;
      if (Math.abs(diff) >= 5) {
        return `You've ${diff > 0 ? 'improved' : 'declined'} ${Math.abs(Math.round(diff))}% this month vs last month`;
      }
    }
    return null;
  };

  // 3. Pattern Insight
  // "Your most productive day: [Day]"
  const patternInsight = () => {
    const stats = calculateDayOfWeekStats(globalLogs);
    let maxVal = 0;
    let bestDay = -1;
    for (let i = 0; i < 7; i++) {
      if (stats[i] > maxVal) {
        maxVal = stats[i];
        bestDay = i;
      }
    }

    if (bestDay !== -1) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Your most productive day: ${days[bestDay]}`;
    }
    return null;
  };

  const insights = [correlationInsight(), trendInsight(), patternInsight()].filter(i => i !== null) as string[];

  if (insights.length === 0) return null;

  return (
    <div className="rounded-lg bg-surface-card border border-border overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(43, 168, 162, 0.08)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface-elevated transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">Insights</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
            {insights.length}
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 space-y-2">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="mt-0.5 text-primary">✨</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
