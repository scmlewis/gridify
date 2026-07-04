import { useState, useEffect, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { getCategories } from '../db';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import type { Category } from '../types';

interface AddHabitSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (options: {
    name: string;
    category: string;
    valueType: 'boolean' | 'numeric';
    unit: string;
    targetValue: number;
    color: string;
    icon: string;
  }) => void;
  onShowCategories?: () => void;
}

export function AddHabitSheet({ isOpen, onClose, onAdd, onShowCategories }: AddHabitSheetProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('uncategorized');
  const [valueType, setValueType] = useState<'boolean' | 'numeric'>('boolean');
  const [unit, setUnit] = useState('');
  const [targetValue, setTargetValue] = useState(3);
  const [color, setColor] = useState('#2BA8A2');
  const [icon, setIcon] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isOpen) {
      getCategories().then(setCategories);
      setName('');
      setCategory('uncategorized');
      setValueType('boolean');
      setUnit('');
      setTargetValue(3);
      setColor('#6366f1');
      setIcon('');
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      name: trimmed,
      category,
      valueType,
      unit: valueType === 'numeric' ? unit : '',
      targetValue: valueType === 'numeric' ? targetValue : 1,
      color,
      icon,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/60 animate-backdrop-in backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl bg-surface-card p-6 pb-8 animate-slide-up-sheet sheet-open max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">New Habit</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Read, Meditate"
              className="w-full rounded-md bg-surface-elevated px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Icon
            </label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary">Category</label>
              <button
                type="button"
                onClick={() => { onClose(); onShowCategories?.(); }}
                className="text-xs text-primary hover:opacity-80 transition-opacity"
              >
                + Manage categories
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md bg-surface-elevated px-4 py-2.5 text-sm text-text-primary outline-none border border-border focus:border-primary transition-colors"
            >
              <option value="uncategorized">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValueType('boolean')}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-medium border transition-all min-h-[44px] ${
                  valueType === 'boolean'
                    ? 'border-primary bg-primary/20 text-primary shadow-teal-glow'
                    : 'border-border bg-surface-elevated text-text-muted hover:border-primary/50'
                }`}
              >
                Binary
              </button>
              <button
                type="button"
                onClick={() => setValueType('numeric')}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-medium border transition-all min-h-[44px] ${
                  valueType === 'numeric'
                    ? 'border-primary bg-primary/20 text-primary shadow-teal-glow'
                    : 'border-border bg-surface-elevated text-text-muted hover:border-primary/50'
                }`}
              >
                Numeric
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-text-muted">
              {valueType === 'boolean'
                ? 'Yes/No — did you do it today?'
                : 'Track a number — like minutes, reps, or pages.'}
            </p>
          </div>

          {valueType === 'numeric' && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Unit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., minutes, reps, pages"
                  className="w-full rounded-md bg-surface-elevated px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Weekly Target: {targetValue} {targetValue === 1 ? 'day' : 'days'}
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>1 day</span>
                  <span>Every day</span>
                </div>
                <p className="mt-1 text-[11px] text-text-muted">
                  How many days per week you aim to do this habit.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Color
            </label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full rounded-full bg-accent-gold py-3.5 text-sm font-bold text-surface-base hover:bg-accent-light active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-accent-glow hover:shadow-lg hover:shadow-accent-gold/50 min-h-[48px]"
          >
            Create Habit
          </button>
        </form>
      </div>
    </div>
  );
}