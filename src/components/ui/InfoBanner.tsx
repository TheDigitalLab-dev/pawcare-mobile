import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type InfoBannerTone = 'info' | 'warning' | 'success' | 'destructive';

export interface InfoBannerProps {
  message: string;
  tone?: InfoBannerTone;
}

const ICONS: Record<InfoBannerTone, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  warning: 'warning',
  success: 'checkmark-circle',
  destructive: 'alert-circle',
};

export function InfoBanner({ message, tone = 'info' }: InfoBannerProps) {
  const { colors } = useTheme();
  const toneColor = colors[tone];
  return (
    <View style={[styles.base, { backgroundColor: colors.card, borderColor: toneColor }]}>
      <Ionicons name={ICONS[tone]} size={18} color={toneColor} />
      <Text style={[styles.text, { color: colors.foreground }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  text: { flex: 1, fontSize: 14 },
});
