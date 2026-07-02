import { Avatar } from '@/components/ui';
import { useTheme, type ThemePreference } from '@/theme';

import { ListRow } from './ListRow';

const THEME_ORDER: ThemePreference[] = ['system', 'light', 'dark'];

const THEME_LABEL: Record<ThemePreference, string> = {
  system: 'Automático (sistema)',
  light: 'Claro',
  dark: 'Oscuro',
};

const THEME_ICON: Record<ThemePreference, string> = {
  system: '🌓',
  light: '☀️',
  dark: '🌙',
};

/** Siguiente preferencia en el ciclo system → light → dark → system. */
export function nextThemePreference(current: ThemePreference): ThemePreference {
  const index = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(index + 1) % THEME_ORDER.length]!;
}

/**
 * Fila reutilizable de selección de tema (modo claro/oscuro/automático).
 * Cicla entre las tres opciones al pulsar. Se usa en owner, admin y público.
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  return (
    <ListRow
      title="Tema"
      subtitle={THEME_LABEL[preference]}
      leading={<Avatar fallback={THEME_ICON[preference]} />}
      showChevron={false}
      onPress={() => setPreference(nextThemePreference(preference))}
    />
  );
}
