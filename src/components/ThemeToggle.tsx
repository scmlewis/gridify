import { useTheme } from '../hooks/useTheme';

const THEMES = [
  { id: 'dark' as const, label: 'Dark', icon: '🌙' },
  { id: 'light' as const, label: 'Light', icon: '☀️' },
  { id: 'oled' as const, label: 'OLED', icon: '⚫' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-surface-elevated p-1">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
            theme === t.id
              ? 'bg-primary text-surface-base'
              : 'text-text-muted hover:text-text-primary'
          }`}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
