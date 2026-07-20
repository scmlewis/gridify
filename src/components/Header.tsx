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
          <rect x="5.5" y="5.5" width="21" height="9" rx="4" fill="#a7f3d0" opacity="0.35" />
        </svg>
        <h1 className="text-xl font-extrabold tracking-wide text-primary font-display">Gridify</h1>
      </div>
      <OnlineStatus />
    </header>
  );
}
