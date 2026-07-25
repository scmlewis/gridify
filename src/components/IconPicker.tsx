import { useState, useMemo } from 'react';
import { ICON_CATEGORIES, HabitIcon } from './icons';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(ICON_CATEGORIES[0]?.name ?? '');

  const allIcons = useMemo(() => ICON_CATEGORIES.flatMap((cat) => cat.icons), []);

  const filteredAll = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allIcons.filter((icon) => icon.label.toLowerCase().includes(q));
  }, [search, allIcons]);

  const displayIcons = filteredAll ?? ICON_CATEGORIES.find((c) => c.name === activeCategory)?.icons ?? [];

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons..."
        className="w-full rounded-lg border border-border/60 bg-surface-elevated px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary/50"
      />

      {!filteredAll && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {ICON_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCategory(cat.name)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 ${
                activeCategory === cat.name
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-elevated text-text-muted hover:bg-surface-hover'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

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
        {displayIcons.map((icon) => (
          <button
            key={icon.key}
            type="button"
            onClick={() => onChange(icon.key)}
            title={icon.label}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-150 ${
              value === icon.key
                ? 'border-primary bg-primary/15 scale-110'
                : 'border-border/60 bg-surface-elevated hover:border-primary/40 hover:scale-105'
            }`}
          >
            <HabitIcon name={icon.key} size={18} />
          </button>
        ))}
        {displayIcons.length === 0 && (
          <span className="text-xs text-text-muted py-2">No icons match &quot;{search}&quot;</span>
        )}
      </div>
    </div>
  );
}
