import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const THEMES = [
  { id: 'dark' as const, label: 'Dark', icon: Moon },
  { id: 'light' as const, label: 'Light', icon: Sun },
  { id: 'oled' as const, label: 'OLED', icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-surface-elevated p-1">
      {THEMES.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
              theme === t.id
                ? 'bg-primary text-surface-base'
                : 'text-text-muted hover:text-text-primary'
            }`}
            title={t.label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
