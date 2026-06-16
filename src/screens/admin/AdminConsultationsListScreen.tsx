import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, Fab } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminConsultations } from '@/services/admin';
import { formatDateTime } from '@/utils/format';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminConsultationsListScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, reload } = useAsync(() => listAdminConsultations());
  const items = data ?? [];

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Consultas"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Nueva consulta"
          onPress={() => navigation.navigate('AdminConsultationForm', {})}
        />
      }
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
        {items.map((c) => (
          <ListRow
            key={c.id}
            title={c.diagnosis ?? 'Consulta'}
            subtitle={`${c.veterinarian.full_name} · ${formatDateTime(c.consultation_date)}`}
            trailing={
              c.treatment_completed_at ? (
                <Badge label="Completada" variant="success" />
              ) : (
                <Badge label="En curso" variant="warning" />
              )
            }
            onPress={() => navigation.navigate('AdminConsultationDetail', { id: c.id })}
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
