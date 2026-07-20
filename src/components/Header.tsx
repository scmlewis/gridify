import { OnlineStatus } from './OnlineStatus';

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-xl font-extrabold tracking-wide text-primary font-display">Gridify</h1>
      <OnlineStatus />
    </header>
  );
}
