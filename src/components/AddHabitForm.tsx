import { useState, type FormEvent } from 'react';

interface AddHabitFormProps {
  onAdd: (name: string) => void;
}

export function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New habit..."
        className="flex-1 rounded-md bg-surface-elevated px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-primary transition-colors"
      />
      <button
        type="submit"
        className="rounded-full bg-accent-gold px-5 py-2.5 text-sm font-bold text-surface-base hover:bg-accent-light active:scale-95 transition-all"
        style={{ boxShadow: '0 4px 20px rgba(255, 210, 63, 0.30)' }}
      >
        Add
      </button>
    </form>
  );
}
