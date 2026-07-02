import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.base, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
  },
  value: { fontSize: 28, fontWeight: '700' },
  label: { fontSize: 12, textAlign: 'center' },
});
