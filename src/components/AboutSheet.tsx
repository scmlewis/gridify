import { X } from 'lucide-react';

interface AboutSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

const FEATURES = [
  'GitHub-style contribution grids',
  'Streaks with grace periods & freezes',
  'Deep analytics & cross-habit insights',
  'XP, achievements & level progression',
  'Offline-first PWA — works without internet',
];

export function AboutSheet({ isOpen, onClose }: AboutSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/60 animate-backdrop-in backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl bg-surface-card p-6 pb-8 animate-slide-up-sheet sheet-open max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">About</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-primary">Gridify</h3>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              A high-density, offline-first habit tracker with GitHub-style contribution grids, deep analytics, and rich gamification.
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Key Features</h4>
            <ul className="space-y-1.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border/50 pt-4 space-y-3">
            <a
              href="https://github.com/scmlewis"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg p-2 -m-2 hover:bg-surface-elevated transition-colors"
            >
              <GitHubIcon className="h-5 w-5 text-text-muted" />
              <div>
                <div className="text-sm font-medium text-text-primary">scmlewis</div>
                <div className="text-xs text-text-muted">Author</div>
              </div>
            </a>
            <a
              href="https://github.com/scmlewis/gridify"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg p-2 -m-2 hover:bg-surface-elevated transition-colors"
            >
              <GitHubIcon className="h-5 w-5 text-text-muted" />
              <div>
                <div className="text-sm font-medium text-text-primary">scmlewis/gridify</div>
                <div className="text-xs text-text-muted">Source Code</div>
              </div>
            </a>
          </div>

          <div className="border-t border-border/50 pt-4 flex items-center justify-between text-xs text-text-muted">
            <span>v0.0.0</span>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </div>
  );
}
