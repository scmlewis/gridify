import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './ThemeContext';

const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--color-surface-base': '#0f1f1e',
    '--color-surface-card': '#1a2e2d',
    '--color-surface-elevated': '#213837',
    '--color-text-primary': '#E8F6F5',
    '--color-text-secondary': '#8AB4B0',
    '--color-text-muted': '#5A8A86',
    '--color-border': '#2A4442',
  },
  light: {
    '--color-surface-base': '#F5F5F5',
    '--color-surface-card': '#FFFFFF',
    '--color-surface-elevated': '#E8E8E8',
    '--color-text-primary': '#1A1A1A',
    '--color-text-secondary': '#666666',
    '--color-text-muted': '#999999',
    '--color-border': '#E0E0E0',
  },
  oled: {
    '--color-surface-base': '#000000',
    '--color-surface-card': '#0A0A0A',
    '--color-surface-elevated': '#141414',
    '--color-text-primary': '#E8F6F5',
    '--color-text-secondary': '#8AB4B0',
    '--color-text-muted': '#5A8A86',
    '--color-border': '#222222',
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('habit-tracker-theme');
    return (saved as Theme) || 'dark';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('habit-tracker-theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    const vars = THEMES[theme];
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
