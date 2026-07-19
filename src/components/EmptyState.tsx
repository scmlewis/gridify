import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-surface-card py-14 px-6 text-center">
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" className="text-border/40" />
          <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="0.5" className="text-border/30" />
          <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="0.5" className="text-border/20" />
        </svg>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h3 className="mb-1 text-base font-bold text-text-primary font-display">{title}</h3>
      <p className="mb-5 max-w-xs text-sm text-text-secondary">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-[0.97]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
