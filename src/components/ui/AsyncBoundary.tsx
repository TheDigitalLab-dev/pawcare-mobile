import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';
import type { ApiError } from '@/types/api';
import { EmptyState } from './EmptyState';

export interface AsyncBoundaryProps {
  /** Mostrar el spinner (normalmente solo en la carga inicial). */
  loading: boolean;
  error: ApiError | null;
  onRetry?: () => void;
  /** Si true (y sin loading/error), muestra el estado vacío. */
  empty?: boolean;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
}

/**
 * Envuelve contenido que depende de una carga remota y resuelve de forma
 * consistente los estados de carga, error (con reintento) y vacío.
 */
export function AsyncBoundary({
  loading,
  error,
  onRetry,
  empty = false,
  emptyIcon = 'file-tray-outline',
  emptyTitle = 'Nada por aquí',
  emptyDescription,
  children,
}: AsyncBoundaryProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="cloud-offline"
        title="No se pudo cargar"
        description={error.message}
        actionLabel={onRetry ? 'Reintentar' : undefined}
        onAction={onRetry}
      />
    );
  }

  if (empty) {
    return (
      <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
});
