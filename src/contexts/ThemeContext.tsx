import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'oled';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', setTheme: () => {} });
