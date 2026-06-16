import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

export interface CardProps extends ViewProps {
  /** Padding interno (default 16). */
  padding?: number;
  /** Aplica sombra md. */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ padding = 16, elevated, style, children, ...rest }: CardProps) {
  const { colors, shadows } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.base,
        { backgroundColor: colors.card, borderColor: colors.border, padding },
        elevated && shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, borderRadius: 12 },
});
