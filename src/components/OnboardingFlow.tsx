import { useState } from 'react';
import { completeOnboarding, createHabit, type Category } from '../db';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'fitness', name: 'Fitness', color: '#ef4444', icon: '💪' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#8b5cf6', icon: '🧘' },
  { id: 'learning', name: 'Learning', color: '#3b82f6', icon: '📚' },
  { id: 'productivity', name: 'Productivity', color: '#f59e0b', icon: '⚡' },
  { id: 'health', name: 'Health', color: '#10b981', icon: '🏥' },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [customCategory, setCustomCategory] = useState('');
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('');
  const [habitValueType, setHabitValueType] = useState<'boolean' | 'numeric'>('boolean');

  const allCategories = [...DEFAULT_CATEGORIES];
  for (const name of selectedCategories) {
    if (!DEFAULT_CATEGORIES.find(c => c.name === name)) {
      allCategories.push({ id: name.toLowerCase(), name, color: '#6366f1' });
    }
  }

  function toggleCategory(name: string) {
    const next = new Set(selectedCategories);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelectedCategories(next);
  }

  function addCustomCategory() {
    const trimmed = customCategory.trim();
    if (!trimmed || selectedCategories.has(trimmed)) return;
    const next = new Set(selectedCategories);
    next.add(trimmed);
    setSelectedCategories(next);
    setCustomCategory('');
  }

  async function handleComplete() {
    const cats: Category[] = [];
    for (const name of selectedCategories) {
      const existing = DEFAULT_CATEGORIES.find(c => c.name === name);
      cats.push(existing || { id: name.toLowerCase(), name, color: '#6366f1' });
    }
    await completeOnboarding(cats);

    if (habitName.trim()) {
      await createHabit(habitName.trim());
    }

    onComplete();
  }

  const canProceedFromCategories = selectedCategories.size > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-card border border-border/60 p-6 shadow-2xl shadow-black/20 animate-scale-in">
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="text-5xl">🎯</div>
            <h1 className="text-2xl font-bold text-text-primary font-display">Welcome to Gridify</h1>
            <p className="text-sm text-text-secondary">Build better habits, one day at a time.</p>
            <div className="rounded-lg bg-surface-elevated p-3 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">📅</span>
                <span className="text-xs font-semibold text-text-primary">Your year, visualized</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Each square is one day. Over time, the contribution graph becomes a 
                visual record of your entire year — a snapshot of your consistency at a glance.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setStep(1)}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => completeOnboarding([]).then(onComplete)}
                className="w-full rounded-lg bg-surface-elevated px-4 py-3 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-text-primary font-display">Choose Categories</h2>
              <p className="text-xs text-text-secondary">Select at least one. Categories group your habits for easier tracking.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.name)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium border transition-all ${
                    selectedCategories.has(cat.name)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface-elevated text-text-secondary hover:border-border/80'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
                placeholder="Custom category..."
                className="flex-1 rounded-lg bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-primary transition-colors"
              />
              <button
                onClick={addCustomCategory}
                className="rounded-lg bg-surface-elevated px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Add
              </button>
            </div>
            {selectedCategories.size > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {[...selectedCategories].map(name => (
                  <span
                    key={name}
                    onClick={() => toggleCategory(name)}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    {name}
                    <span className="ml-0.5">×</span>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="flex-1 rounded-lg bg-surface-elevated px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedFromCategories}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-text-primary font-display">Create Your First Habit</h2>
              <p className="text-xs text-text-secondary">You can skip and add one later.</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g. Drink 8 glasses of water"
                className="w-full rounded-lg bg-surface-elevated px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-primary transition-colors"
              />
              <select
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value)}
                className="w-full rounded-lg bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none border border-border focus:border-primary transition-colors"
              >
                <option value="">Select category...</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setHabitValueType('boolean')}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium border transition-all ${
                    habitValueType === 'boolean'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface-elevated text-text-secondary hover:border-border/80'
                  }`}
                >
                  ☑ Yes / No
                </button>
                <button
                  onClick={() => setHabitValueType('numeric')}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium border transition-all ${
                    habitValueType === 'numeric'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface-elevated text-text-secondary hover:border-border/80'
                  }`}
                >
                  🔢 Numeric
                </button>
              </div>
              <p className="text-[11px] text-text-muted">
                {habitValueType === 'boolean'
                  ? 'Track whether you did or didn\'t do the habit each day.'
                  : 'Track a number each day — like minutes exercised, pages read, or glasses of water.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg bg-surface-elevated px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
              >
                {habitName.trim() ? 'Create & Finish' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
