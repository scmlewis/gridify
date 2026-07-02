import { useMemo } from 'react';

interface ProgressHeroCardProps {
  habitsDoneToday: number;
  totalHabits: number;
  level: number;
}

export function ProgressHeroCard({ habitsDoneToday, totalHabits, level }: ProgressHeroCardProps) {
  const pct = useMemo(() => {
    if (totalHabits === 0) return 0;
    return Math.round((habitsDoneToday / totalHabits) * 100);
  }, [habitsDoneToday, totalHabits]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const message = pct === 0
    ? "Let's get started!"
    : pct === 100
      ? 'All done for today!'
      : pct >= 75
        ? 'Almost there!'
        : pct >= 50
          ? "You're halfway!"
          : "Keep going!";

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 border border-border/40"
      style={{
        background: 'linear-gradient(135deg, rgba(43,168,162,0.15) 0%, rgba(255,210,63,0.08) 50%, rgba(239,108,74,0.08) 100%)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold text-text-primary">{message}</p>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-extrabold text-primary">{habitsDoneToday}</span>
              <span className="text-sm text-text-muted">/{totalHabits}</span>
              <span className="ml-1 text-xs text-text-secondary">habits</span>
            </div>
            {level > 1 && (
              <div className="flex items-center gap-1 rounded-full bg-accent-gold/15 px-2 py-0.5">
                <span className="text-[10px] font-bold text-accent-gold">Lvl {level}</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex h-[90px] w-[90px] items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 90 90">
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-border/40"
            />
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-primary transition-all duration-700 ease-out"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-extrabold text-text-primary">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
