import { OnlineStatus } from './OnlineStatus';

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg className="h-7 w-7" viewBox="0 0 32 32" role="img" aria-label="Gridify" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="headerGridCell" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#34d399" />
              <stop offset="0.55" stop-color="#10b981" />
              <stop offset="1" stop-color="#059669" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#headerGridCell)" />
          <rect x="5" y="4.5" width="22" height="10" rx="5" fill="#ffffff" opacity="0.6" />
        </svg>
        <h1 className="text-xl font-extrabold tracking-wide text-primary font-display">Gridify</h1>
      </div>
      <OnlineStatus />
    </header>
  );
}
