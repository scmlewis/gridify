import { useState, useMemo } from 'react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const ICON_DATA: [string, string][] = [
  ['🏃', 'run'],
  ['📖', 'read'],
  ['🧘', 'meditate'],
  ['💪', 'strength'],
  ['🎯', 'goal'],
  ['📝', 'write'],
  ['💤', 'sleep'],
  ['🥗', 'salad'],
  ['💧', 'water'],
  ['🧠', 'brain'],
  ['🎨', 'art'],
  ['🎵', 'music'],
  ['📱', 'phone'],
  ['⏰', 'alarm'],
  ['🌿', 'nature'],
  ['🧹', 'clean'],
  ['💰', 'money'],
  ['❤️', 'heart'],
  ['🏋️', 'gym'],
  ['🚴', 'bike'],
  ['📚', 'books'],
  ['✍️', 'pencil'],
  ['🗂️', 'organize'],
  ['🗣️', 'speak'],
  ['🌅', 'sunrise'],
  ['🚿', 'shower'],
  ['🍎', 'apple'],
  ['🩺', 'health'],
  ['🐕', 'dog'],
  ['🎮', 'game'],
  ['📸', 'photo'],
  ['✈️', 'travel'],
  ['🎸', 'guitar'],
  ['🧑‍💻', 'code'],
  ['📊', 'data'],
  ['🧑‍🎓', 'study'],
  ['🧑‍🍳', 'cook'],
  ['🧑‍⚕️', 'doctor'],
  ['💤', 'rest'],
  ['🧹', 'tidy'],
];

function getUniqueIcons(): [string, string][] {
  const seen = new Set<string>();
  const unique: [string, string][] = [];
  for (const [icon, label] of ICON_DATA) {
    if (!seen.has(icon)) {
      seen.add(icon);
      unique.push([icon, label]);
    }
  }
  return unique;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const uniqueIcons = useMemo(getUniqueIcons, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return uniqueIcons;
    const q = search.toLowerCase();
    return uniqueIcons.filter(([, label]) => label.includes(q));
  }, [search, uniqueIcons]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons..."
        className="w-full rounded-lg border border-border/60 bg-surface-elevated px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary/50"
      />
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange('')}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-all duration-150 ${
            value === ''
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border/60 bg-surface-elevated text-text-muted hover:border-primary/40'
          }`}
        >
          —
        </button>
        {filtered.map(([icon, label]) => (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            title={label}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all duration-150 ${
              value === icon
                ? 'border-primary bg-primary/15 scale-110'
                : 'border-border/60 bg-surface-elevated hover:border-primary/40 hover:scale-105'
            }`}
          >
            {icon}
          </button>
        ))}
        {filtered.length === 0 && (
          <span className="text-xs text-text-muted py-2">No icons match "{search}"</span>
        )}
      </div>
    </div>
  );
}
