import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export interface StepIndicatorProps {
  steps: number;
  /** Índice del paso actual (0-based). */
  current: number;
  labels?: string[];
}

export function StepIndicator({ steps, current, labels }: StepIndicatorProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: steps }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        const bg = done || active ? colors.primary : colors.muted;
        const fg = done || active ? colors.primaryForeground : colors.mutedForeground;
        return (
          <View key={i} style={styles.stepWrap}>
            <View style={styles.stepRow}>
              <View style={[styles.dot, { backgroundColor: bg }]}>
                <Text style={[styles.dotText, { color: fg }]}>{i + 1}</Text>
              </View>
              {i < steps - 1 ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: done ? colors.primary : colors.border },
                  ]}
                />
              ) : null}
            </View>
            {labels?.[i] ? (
              <Text
                numberOfLines={1}
                style={[styles.label, { color: colors.mutedForeground }]}
              >
                {labels[i]}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  stepWrap: { flex: 1, alignItems: 'flex-start' },
  stepRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { fontSize: 13, fontWeight: '700' },
  line: { flex: 1, height: 2, marginHorizontal: 4 },
  label: { fontSize: 11, marginTop: 4 },
});
