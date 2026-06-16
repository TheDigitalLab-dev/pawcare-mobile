import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

export interface FabProps {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Distancia desde abajo; por defecto sobre la tab bar. */
  bottom?: number;
}

export function Fab({ icon = 'add', onPress, accessibilityLabel, bottom }: FabProps) {
  const { colors, shadows, tokens } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        shadows.lg,
        {
          backgroundColor: colors.primary,
          bottom: bottom ?? tokens.layout.bottomNavHeight + 16,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={28} color={colors.primaryForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
