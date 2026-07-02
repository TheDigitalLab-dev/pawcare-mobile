import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export interface MobileShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  fab?: React.ReactNode;
  /** Si true, el contenido va dentro de un ScrollView. */
  scroll?: boolean;
  /** Padding del área de contenido (default 16). */
  contentPadding?: number;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
}

export function MobileShell({
  children,
  header,
  footer,
  fab,
  scroll = false,
  contentPadding = 16,
  contentStyle,
  edges = ['top', 'left', 'right'],
}: MobileShellProps) {
  const { colors, scheme } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[{ padding: contentPadding }, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, { padding: contentPadding }, contentStyle]}>
          {children}
        </View>
      )}
      {footer}
      {fab}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
});
