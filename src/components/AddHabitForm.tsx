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
        className="flex-1 rounded bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <button
        type="submit"
        className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
      >
        Add
      </button>
    </form>
  );
}
