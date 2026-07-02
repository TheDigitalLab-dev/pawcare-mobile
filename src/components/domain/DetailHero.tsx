import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export interface DetailHeroProps {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  children?: React.ReactNode;
}

export function DetailHero({ title, subtitle, avatar, children }: DetailHeroProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.base}>
      {avatar}
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      ) : null}
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', gap: 6, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center' },
  children: { marginTop: 8, alignItems: 'center' },
});
