import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme';

export interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.text, { color: colors.mutedForeground }]}>
      {children.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
});
