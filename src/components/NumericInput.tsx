import { Minus, Plus } from 'lucide-react';
import { logCheckIn, removeCheckIn } from '../db';
import { formatDate } from '../utils/date-utils';

interface NumericInputProps {
  habitId: string;
  value: number;
  unit?: string;
  targetValue?: number;
  date?: string;
  onChange?: (value: number) => void;
}

function triggerHaptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

export function NumericInput({ habitId, value, unit, targetValue, date, onChange }: NumericInputProps) {
  const todayStr = date ?? formatDate(new Date());

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
        <Minus className="h-3 w-3" />
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
        <Plus className="h-3 w-3" />
      </button>
      {targetValue !== undefined && targetValue > 0 && (
        <span className="ml-1 text-[10px] text-text-muted">/ {targetValue}</span>
      )}
    </div>
  );
}
