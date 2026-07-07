import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, Fab } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminConsultations } from '@/services/admin';
import { formatDateTime } from '@/utils/format';
import type { Consultation } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

// Badges estáticos compartidos por todas las filas (evita recrear JSX por render).
const BADGE_COMPLETED = <Badge label="Completada" variant="success" />;
const BADGE_IN_PROGRESS = <Badge label="En curso" variant="warning" />;

export function AdminConsultationsListScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, reload } = useAsync(() => listAdminConsultations());
  const items = data ?? [];

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const fab = useMemo(
    () => (
      <Fab
        accessibilityLabel="Nueva consulta"
        onPress={() => navigation.navigate('AdminConsultationForm', {})}
      />
    ),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item: c }: ListRenderItemInfo<Consultation>) => (
      <ListRow
        title={c.diagnosis ?? 'Consulta'}
        subtitle={`${c.veterinarian.full_name} · ${formatDateTime(c.consultation_date)}`}
        trailing={c.treatment_completed_at ? BADGE_COMPLETED : BADGE_IN_PROGRESS}
        onPress={() => navigation.navigate('AdminConsultationDetail', { id: c.id })}
      />
    ),
    [navigation],
  );

  return (
    <MobileShell
      header={
        <AppHeader
          title="Consultas"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={styles.content}
      fab={fab}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="medkit"
        emptyTitle="Sin consultas"
        emptyDescription="No hay consultas registradas."
      >
        <FlatList
          data={items}
          keyExtractor={(c) => String(c.id)}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  list: { flex: 1 },
  listContent: { gap: 12, paddingBottom: 96 },
});
