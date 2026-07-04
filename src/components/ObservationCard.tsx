import { Lightbulb } from 'lucide-react';
import type { Observation } from '../utils/observations';

interface ObservationCardProps {
  observations: Observation[];
  title?: string;
}

export function ObservationCard({ observations, title = 'Observations' }: ObservationCardProps) {
  if (observations.length === 0) return null;

  return (
    <div className="rounded-xl bg-surface-card border border-border/60 p-4 space-y-3" style={{ boxShadow: '0 4px 16px rgba(43, 168, 162, 0.06)' }}>
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-accent-gold" />
        <span className="text-sm font-bold text-text-primary">{title}</span>
        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
          {observations.length}
        </span>
      </div>
      <div className="space-y-2">
        {observations.map((obs) => (
          <div key={obs.id} className="flex items-start gap-2.5 text-xs text-text-secondary">
            <span className="mt-0.5 shrink-0 text-sm leading-none">{obs.icon}</span>
            <span>{obs.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
