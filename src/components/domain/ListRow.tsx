import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

/**
 * Contenido de un slot: un nodo ya construido (útil para JSX estático hoisteado)
 * o una función que lo construye (útil para contenido por fila en listas).
 */
export type ListRowSlot = React.ReactNode | (() => React.ReactNode);

export interface ListRowProps {
  title: string;
  subtitle?: string;
  leading?: ListRowSlot;
  trailing?: ListRowSlot;
  /** Muestra chevron a la derecha (default true si hay onPress). */
  showChevron?: boolean;
  onPress?: () => void;
}

function resolveSlot(slot: ListRowSlot): React.ReactNode {
  return typeof slot === 'function' ? slot() : slot;
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  showChevron,
  onPress,
}: ListRowProps) {
  const { colors } = useTheme();
  const chevron = showChevron ?? !!onPress;
  const leadingNode = resolveSlot(leading);
  const trailingNode = resolveSlot(trailing);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.85 : 1,
        },
      ]}
    >
      {leadingNode}
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={2}
            style={[styles.subtitle, { color: colors.mutedForeground }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailingNode}
      {chevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 13 },
});
