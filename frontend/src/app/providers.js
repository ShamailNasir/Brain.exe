'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const THEMES = [
  { id: 'dark', name: 'Refined Zen', icon: '🌌', description: 'Deep midnight • Refined Zen' },
  { id: 'light', name: 'Daylight', icon: '☀️', description: 'Clean & minimal' },
  { id: 'nord', name: 'Nord', icon: '❄️', description: 'Arctic serenity' },
  { id: 'rose-pine', name: 'Rosé Pine', icon: '🌸', description: 'Poetic warmth' },
  { id: 'catppuccin', name: 'Catppuccin', icon: '🍵', description: 'Warm pastels' },
];

export function Providers({ children }) {
  return (
    <NextThemesProvider 
      attribute="data-theme" 
      defaultTheme="dark" 
      themes={THEMES.map(t => t.id)}
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
