import { getSunday, parseDate, addDays } from './date-utils';

const MS_PER_DAY = 86_400_000;

/**
 * Returns the Sunday of the week exactly 52 weeks before the current week's Sunday.
 * This is the top-left cell of the grid (column 0, row 0).
 */
export function getGridStartDate(): Date {
  const now = new Date();
  const currentSunday = getSunday(now);
  return addDays(currentSunday, -52 * 7);
}

/**
 * Maps a date string (YYYY-MM-DD) to a grid coordinate { col, row }.
 * Col ranges 0–52, row ranges 0–6 (Sun–Sat).
 * Returns null if the date is outside the grid range.
 */
export function getGridCoordinates(
  dateStr: string,
  startDate: Date
): { col: number; row: number } | null {
  const logDate = parseDate(dateStr);

  const logTime = new Date(logDate).setHours(0, 0, 0, 0);
  const startTime = new Date(startDate).setHours(0, 0, 0, 0);

  const deltaDays = Math.round((logTime - startTime) / MS_PER_DAY);

  if (deltaDays < 0 || deltaDays >= 53 * 7) {
    return null;
  }

  return {
    col: Math.floor(deltaDays / 7),
    row: deltaDays % 7,
  };
}

/**
 * Maps a day's total value to a log level 0–4.
 * q1=1, q2=2, q3=3 (fixed thresholds).
 */
export function getLogLevel(value: number): number {
  if (value <= 0) return 0;
  if (value <= 1) return 1;
  if (value <= 2) return 2;
  if (value <= 3) return 3;
  return 4;
}
