import { useState, useEffect } from 'react';
import { ContributionGrid } from './ContributionGrid';
import { OnlineStatus } from './OnlineStatus';
import { getAllLogsForDateRange } from '../db';
import { getGridStartDate } from '../utils/grid-math';
import { formatDate, addDays } from '../utils/date-utils';

export function Header() {
  const [globalLogs, setGlobalLogs] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const start = getGridStartDate();
      const end = addDays(new Date(), 1);
      const logs = await getAllLogsForDateRange(formatDate(start), formatDate(end));
      if (cancelled) return;
      const totals = new Map<string, number>();
      for (const log of logs) {
        totals.set(log.date, (totals.get(log.date) ?? 0) + log.value);
      }
      setGlobalLogs(totals);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-white">Habit Tracker</h1>
        <OnlineStatus />
      </div>
      <div className="overflow-x-auto">
        <ContributionGrid logs={globalLogs} cellSize={11} cellGap={2} />
      </div>
    </header>
  );
}
