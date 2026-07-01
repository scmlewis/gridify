import { useState, useEffect, type FormEvent } from 'react';
import { getCategories } from '../db';
import { ColorPicker } from './ColorPicker';
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
  }) => void;
  onShowCategories?: () => void;
}

export function AddHabitSheet({ isOpen, onClose, onAdd, onShowCategories }: AddHabitSheetProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('uncategorized');
  const [valueType, setValueType] = useState<'boolean' | 'numeric'>('boolean');
  const [unit, setUnit] = useState('');
  const [targetValue, setTargetValue] = useState(3);
  const [color, setColor] = useState('#6366f1');
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
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-2xl bg-surface-card p-6 pb-8 animate-slide-up mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">New Habit</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
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
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium border transition-all ${
                  valueType === 'boolean'
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border bg-surface-elevated text-text-muted hover:border-primary/50'
                }`}
              >
                Binary
              </button>
              <button
                type="button"
                onClick={() => setValueType('numeric')}
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium border transition-all ${
                  valueType === 'numeric'
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border bg-surface-elevated text-text-muted hover:border-primary/50'
                }`}
              >
                Numeric
              </button>
            </div>
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
                  Weekly Target: {targetValue} days
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
                  <span>7 days</span>
                </div>
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
            className="w-full rounded-full bg-accent-gold py-3 text-sm font-bold text-surface-base hover:bg-accent-light active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 4px 20px rgba(255, 210, 63, 0.30)' }}
          >
            Create Habit
          </button>
        </form>
      </div>
    </div>
  );
}