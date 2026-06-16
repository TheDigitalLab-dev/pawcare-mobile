import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export interface HeroCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function HeroCard({ title, subtitle, children }: HeroCardProps) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.primary, colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.base}
    >
      <Text style={[styles.title, { color: colors.primaryForeground }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.primaryForeground }]}>
          {subtitle}
        </Text>
      ) : null}
      {children ? <View style={styles.children}>{children}</View> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 16, padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4, opacity: 0.9 },
  children: { marginTop: 12 },
});
