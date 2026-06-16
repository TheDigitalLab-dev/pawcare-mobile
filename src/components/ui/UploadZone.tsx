import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export interface UploadZoneProps {
  label?: string;
  hint?: string;
  onPress?: () => void;
  /** Nombre de archivo seleccionado, si ya hay uno. */
  selectedName?: string;
}

export function UploadZone({
  label = 'Subir archivo',
  hint = 'Toca para elegir foto o documento',
  onPress,
  selectedName,
}: UploadZoneProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons
        name={selectedName ? 'document-attach' : 'cloud-upload-outline'}
        size={28}
        color={colors.primary}
      />
      <View style={styles.texts}>
        <Text style={[styles.label, { color: colors.foreground }]}>
          {selectedName ?? label}
        </Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  texts: { alignItems: 'center', gap: 2 },
  label: { fontSize: 15, fontWeight: '600' },
  hint: { fontSize: 13, textAlign: 'center' },
});
