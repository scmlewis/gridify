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

  const radius = 50;
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
    <div className="relative overflow-hidden rounded-3xl p-6 border border-white/5 bg-[#111] shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm font-bold text-text-primary">{message}</p>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-3xl font-extrabold text-primary font-display">{habitsDoneToday}</span>
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

        <div className="relative flex h-[132px] w-[132px] items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 132 132">
            <circle
              cx="66"
              cy="66"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/5"
            />
            <circle
              cx="66"
              cy="66"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-primary transition-all duration-700 ease-out"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-text-primary font-display">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
