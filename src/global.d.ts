/**
 * Type declarations for the ThemeProvider client-side API.
 * Exposed on `window.__ASTRO_THEMES__` by the ThemeProvider inline script.
 */
interface AstroThemesAPI {
  /** Current theme setting: 'light', 'dark', or 'system' */
  readonly theme: 'light' | 'dark' | 'system';
  /** Resolved theme (system is resolved to 'light' or 'dark') */
  readonly resolvedTheme: 'light' | 'dark';
  /** Current OS color scheme preference */
  readonly systemTheme: 'light' | 'dark';
  /** Change the active theme and persist to localStorage */
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  /** Available theme options */
  readonly themes: readonly ['light', 'dark', 'system'];
}

interface Window {
  __ASTRO_THEMES__: AstroThemesAPI;
  __searchKeydownHandler?: ((e: KeyboardEvent) => void) | null;
}
