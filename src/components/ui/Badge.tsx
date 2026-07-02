import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'outline';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  const { colors } = useTheme();

  const bgMap: Record<BadgeVariant, string> = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    destructive: colors.destructive,
    info: colors.info,
    outline: 'transparent',
  };
  const fgMap: Record<BadgeVariant, string> = {
    primary: colors.primaryForeground,
    success: colors.successForeground,
    warning: colors.warningForeground,
    destructive: colors.destructiveForeground,
    info: colors.infoForeground,
    outline: colors.foreground,
  };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bgMap[variant],
          borderColor: variant === 'outline' ? colors.border : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
        },
      ]}
    >
      <Text style={[styles.text, { color: fgMap[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  text: { fontSize: 12, fontWeight: '600' },
});
