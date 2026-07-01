import { logCheckIn, removeCheckIn } from '../db';
import { formatDate } from '../utils/date-utils';

interface NumericInputProps {
  habitId: string;
  value: number;
  unit?: string;
  targetValue?: number;
  onChange?: (value: number) => void;
}

function triggerHaptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

export function NumericInput({ habitId, value, unit, targetValue, onChange }: NumericInputProps) {
  const todayStr = formatDate(new Date());

  async function handleChange(newValue: number) {
    triggerHaptic();
    try {
      if (newValue > 0) {
        await logCheckIn(habitId, todayStr, newValue);
      } else {
        await removeCheckIn(habitId, todayStr);
      }
      onChange?.(newValue);
    } catch (err) {
      console.error('Numeric check-in failed:', err);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleChange(Math.max(0, value - 1));
        }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-transparent text-text-muted transition-all hover:border-primary hover:text-primary active:scale-90"
        aria-label="Decrease"
      >
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <span className="min-w-[2rem] text-center text-sm font-bold text-text-primary">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-text-muted">{unit}</span>}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleChange(value + 1);
        }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-transparent text-text-muted transition-all hover:border-primary hover:text-primary active:scale-90"
        aria-label="Increase"
      >
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>
      {targetValue !== undefined && targetValue > 0 && (
        <span className="ml-1 text-[10px] text-text-muted">/ {targetValue}</span>
      )}
    </div>
  );
}
