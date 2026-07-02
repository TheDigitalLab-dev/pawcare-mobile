import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance } from 'react-native';

import { tokens, type ColorScheme, type Colors } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeContextValue {
  /** Esquema efectivo aplicado (resuelto de la preferencia + sistema). */
  scheme: ColorScheme;
  /** Preferencia elegida por el usuario. */
  preference: ThemePreference;
  /** Paleta de colores del esquema activo. */
  colors: Colors;
  /** Tokens completos (spacing, radius, etc.). */
  tokens: typeof tokens;
  /** Sombras del esquema activo. */
  shadows: (typeof tokens.shadows)[ColorScheme];
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveScheme(
  preference: ThemePreference,
  systemScheme: ColorScheme,
): ColorScheme {
  return preference === 'system' ? systemScheme : preference;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Preferencia inicial (en el futuro se hidrata desde redux-persist). */
  initialPreference?: ThemePreference;
  onPreferenceChange?: (preference: ThemePreference) => void;
}

export function ThemeProvider({
  children,
  initialPreference = 'system',
  onPreferenceChange,
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference);
  const [systemScheme, setSystemScheme] = useState<ColorScheme>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      onPreferenceChange?.(next);
    },
    [onPreferenceChange],
  );

  const scheme = resolveScheme(preference, systemScheme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      preference,
      colors: tokens.colors[scheme],
      tokens,
      shadows: tokens.shadows[scheme],
      setPreference,
    }),
    [scheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  }
  return ctx;
}
