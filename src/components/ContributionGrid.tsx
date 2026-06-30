import { useMemo } from 'react';
import { formatDate } from '../utils/date-utils';
import { getGridStartDate, getLogLevel } from '../utils/grid-math';

export interface ContributionGridProps {
  logs: Map<string, number>;
  cellSize?: number;
  cellGap?: number;
}

const LEVEL_CLASSES: Record<number, string> = {
  0: 'bg-gray-800',
  1: 'bg-emerald-900',
  2: 'bg-emerald-700',
  3: 'bg-emerald-500',
  4: 'bg-emerald-300',
};

const LEVEL_BORDER_CLASSES: Record<number, string> = {
  0: 'border-gray-700',
  1: 'border-emerald-950',
  2: 'border-emerald-800',
  3: 'border-emerald-600',
  4: 'border-emerald-400',
};

export function ContributionGrid({
  logs,
  cellSize = 12,
  cellGap = 2,
}: ContributionGridProps) {
  const startDate = useMemo(() => getGridStartDate(), []);

  const cells = useMemo(() => {
    const grid: {
      key: string;
      col: number;
      row: number;
      level: number;
      dateStr: string;
      value: number;
    }[] = [];

    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7 + day);
        const dateStr = formatDate(date);
        const value = logs.get(dateStr) ?? 0;
        const level = getLogLevel(value);

        grid.push({
          key: dateStr,
          col: week,
          row: day,
          level,
          dateStr,
          value,
        });
      }
    }

    return grid;
  }, [startDate, logs]);

  return (
    <div
      className="inline-flex gap-0"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(53, ${cellSize}px)`,
        gridTemplateRows: `repeat(7, ${cellSize}px)`,
        gap: `${cellGap}px`,
      }}
    >
      {cells.map((cell) => (
        <div
          key={cell.key}
          className={`relative rounded-sm border ${LEVEL_CLASSES[cell.level]} ${LEVEL_BORDER_CLASSES[cell.level]} cursor-default group`}
          style={{ width: cellSize, height: cellSize }}
        >
          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-gray-200 shadow-lg group-hover:block">
            <span className="font-medium">{cell.dateStr}</span>
            <span className="ml-1.5 text-gray-400">
              {cell.value === 0 ? 'No activity' : `${cell.value} check-in${cell.value !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
