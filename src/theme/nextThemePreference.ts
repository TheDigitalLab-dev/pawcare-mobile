import type { ThemePreference } from './ThemeProvider';

const THEME_ORDER: ThemePreference[] = ['system', 'light', 'dark'];

/** Siguiente preferencia en el ciclo system → light → dark → system. */
export function nextThemePreference(current: ThemePreference): ThemePreference {
  const index = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(index + 1) % THEME_ORDER.length]!;
}
