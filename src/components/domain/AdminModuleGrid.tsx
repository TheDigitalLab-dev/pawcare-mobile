import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export interface AdminModuleTile {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
  onPress?: () => void;
}

export interface AdminModuleGridProps {
  modules: AdminModuleTile[];
}

export function AdminModuleGrid({ modules }: AdminModuleGridProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {modules.map((m) => (
        <Pressable
          key={m.id}
          accessibilityRole="button"
          accessibilityLabel={m.label}
          onPress={m.onPress}
          style={({ pressed }) => [
            styles.tile,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
            <Ionicons name={m.icon} size={24} color={colors.primary} />
          </View>
          <Text numberOfLines={2} style={[styles.label, { color: colors.foreground }]}>
            {m.label}
          </Text>
          {m.badge !== undefined ? (
            <Text style={[styles.badge, { color: colors.mutedForeground }]}>
              {m.badge}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 15, fontWeight: '600' },
  badge: { fontSize: 12 },
});
