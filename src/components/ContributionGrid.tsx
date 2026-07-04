import { useMemo, useRef, useEffect } from 'react';
import { formatDate, addDays } from '../utils/date-utils';
import { getGridStartDate, getLogLevel } from '../utils/grid-math';

export interface ContributionGridProps {
  logs: Map<string, number>;
  cellSize?: number;
  cellGap?: number;
  showLabels?: boolean;
  showLegend?: boolean;
}

const LEVEL_CLASSES: Record<number, string> = {
  0: 'bg-primary-bg',
  1: 'bg-primary-dark',
  2: 'bg-primary',
  3: 'bg-primary-light',
  4: 'bg-accent-gold',
};

const LEVEL_LABELS = ['No activity', '1 check-in', '2 check-ins', '3 check-ins', '4+ check-ins'];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatTooltipDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function ContributionGrid({
  logs,
  cellSize = 10,
  cellGap = 2,
  showLabels = true,
  showLegend = true,
}: ContributionGridProps) {
  const startDate = useMemo(() => getGridStartDate(), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

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
        const date = addDays(startDate, week * 7 + day);
        const dateStr = formatDate(date);
        const value = logs.get(dateStr) ?? 0;
        const level = getLogLevel(value);

        grid.push({
          key: dateStr,
          col: day,    // CSS column (weekday: 0=Sun .. 6=Sat)
          row: week,   // CSS row (week index: 0..52)
          level,
          dateStr,
          value,
        });
      }
    }

    return grid;
  }, [startDate, logs]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; row: number }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < 53; week++) {
      const weekStart = addDays(startDate, week * 7);
      const month = weekStart.getMonth();

      if (month !== lastMonth) {
        labels.push({ month: MONTHS[month], row: week });
        lastMonth = month;
      }
    }

    return labels;
  }, [startDate]);

  const labelWidth = showLabels ? 24 : 0;
  const rowHeight = cellSize + cellGap;

  return (
    <div className="flex flex-col">
      {/* Weekday headers */}
      {showLabels && (
        <div className="flex" style={{ marginLeft: labelWidth + 4, marginBottom: 2 }}>
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[9px] font-medium text-text-muted flex items-end justify-center"
              style={{ width: rowHeight }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      <div className="flex">
        {/* Month labels on left */}
        {showLabels && (
          <div className="flex flex-col shrink-0 relative" style={{ width: labelWidth, marginRight: 4 }}>
            {monthLabels.map((label, i) => (
              <div
                key={`${label.month}-${i}`}
                className="absolute text-[9px] font-medium text-text-muted leading-none"
                style={{ top: label.row * rowHeight }}
              >
                {label.month}
              </div>
            ))}
          </div>
        )}

        {/* Scrollable grid */}
        <div
          ref={scrollRef}
          className="overflow-y-auto"
          style={{ maxHeight: 8 * rowHeight }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(7, ${cellSize}px)`,
              gridTemplateRows: `repeat(53, ${cellSize}px)`,
              gap: `${cellGap}px`,
            }}
          >
            {cells.map((cell) => (
              <div
                key={cell.key}
                className={`relative rounded-sm cursor-default group ${LEVEL_CLASSES[cell.level]}`}
                style={{ width: cellSize, height: cellSize }}
              >
                <div className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-surface-elevated px-2.5 py-1.5 text-xs text-text-primary shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-semibold">{formatTooltipDate(cell.dateStr)}</span>
                  <span className="ml-1.5 text-text-secondary">
                    {LEVEL_LABELS[cell.level]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="flex items-center gap-2 mt-2" style={{ marginLeft: labelWidth + 4 }}>
          <span className="text-[10px] text-text-muted">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`rounded-sm ${LEVEL_CLASSES[level]}`}
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
          <span className="text-[10px] text-text-muted">More</span>
        </div>
      )}
    </div>
  );
}
