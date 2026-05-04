import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider — manages light/dark mode preference.
 *
 * Persists user choice to localStorage and applies a
 * `data-theme` attribute on `<html>` so CSS variable
 * overrides kick in instantly (no flash).
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Check localStorage first, then OS preference
    const stored = localStorage.getItem('cura-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    // Respect system preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // Apply theme attribute to <html> on mount and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cura-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((t) => {
    if (t === 'dark' || t === 'light') setThemeState(t);
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme — access theme state and toggle from anywhere.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
