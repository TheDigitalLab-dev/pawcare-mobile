import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export interface ActionTile {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export interface ActionTileGridProps {
  tiles: ActionTile[];
  /** Columnas (default 2). */
  columns?: number;
}

export function ActionTileGrid({ tiles, columns = 2 }: ActionTileGridProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
        <Pressable
          key={tile.id}
          accessibilityRole="button"
          accessibilityLabel={tile.label}
          onPress={tile.onPress}
          style={({ pressed }) => [
            styles.tile,
            {
              width: `${100 / columns - 2}%`,
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name={tile.icon} size={28} color={colors.primary} />
          <Text style={[styles.label, { color: colors.foreground }]}>{tile.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    aspectRatio: 1.4,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  label: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
