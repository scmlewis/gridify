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

const MONTH_ABBRS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function formatTooltipDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const month = MONTH_ABBRS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
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
      el.scrollLeft = el.scrollWidth;
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

    for (let day = 0; day < 7; day++) {
      for (let week = 0; week < 53; week++) {
        const date = addDays(startDate, week * 7 + day);
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

  const monthLabels = useMemo(() => {
    const labels: { month: string; col: number }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < 53; week++) {
      const weekStart = addDays(startDate, week * 7);
      const month = weekStart.getMonth();

      if (month !== lastMonth) {
        labels.push({ month: MONTH_ABBRS[month], col: week });
        lastMonth = month;
      }
    }

    return labels;
  }, [startDate]);

  const labelWidth = showLabels ? 28 : 0;

  return (
    <div ref={scrollRef} className="w-full overflow-x-auto">
      <div className="inline-flex flex-col">
        {showLabels && (
          <div
            className="relative"
            style={{ marginLeft: labelWidth, marginBottom: 4, height: 16 }}
          >
            {monthLabels.map((label, i) => (
              <div
                key={`${label.month}-${i}`}
                className="absolute text-[10px] font-medium text-text-muted"
                style={{
                  left: label.col * (cellSize + cellGap),
                }}
              >
                {label.month}
              </div>
            ))}
          </div>
        )}

        <div className="flex">
          {showLabels && (
            <div
              className="flex flex-col justify-between shrink-0"
              style={{
                width: labelWidth,
                height: 7 * (cellSize + cellGap) - cellGap,
                paddingRight: 4,
              }}
            >
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-[10px] font-medium text-text-muted flex items-center"
                  style={{ height: cellSize }}
                >
                  {label}
                </div>
              ))}
            </div>
          )}

          <div
            className="grid shrink-0"
            style={{
              gridTemplateColumns: `repeat(53, ${cellSize}px)`,
              gridTemplateRows: `repeat(7, ${cellSize}px)`,
              gap: `${cellGap}px`,
            }}
          >
            {cells.map((cell) => (
              <div
                key={cell.key}
                className={`relative rounded-sm cursor-default group ${LEVEL_CLASSES[cell.level]}`}
                style={{ width: cellSize, height: cellSize }}
              >
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-elevated px-2.5 py-1.5 text-xs text-text-primary shadow-md border border-border group-hover:block">
                  <span className="font-semibold">{formatTooltipDate(cell.dateStr)}</span>
                  <span className="ml-1.5 text-text-secondary">
                    {LEVEL_LABELS[cell.level]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showLegend && (
          <div
            className="flex items-center gap-2 mt-2"
            style={{ marginLeft: labelWidth }}
          >
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
    </div>
  );
}
