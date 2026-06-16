import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Fab } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminVaccinations } from '@/services/admin';
import { formatDate } from '@/utils/format';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminVaccinationsListScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, reload } = useAsync(() => listAdminVaccinations());
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
          title="Vacunas"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 4, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Agregar vacuna"
          onPress={() => navigation.navigate('AdminVaccinationForm', {})}
        />
      }
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="bandage"
        emptyTitle="Sin vacunas"
        emptyDescription="No hay vacunas registradas."
      >
        {items.map((v, index) => (
          <TimelineItem
            key={v.id}
            title={v.vaccine_name}
            date={`Aplicada: ${formatDate(v.application_date)}`}
            description={`${v.manufacturer ?? 'Fabricante desconocido'} · Próxima: ${formatDate(v.next_due_date)}`}
            last={index === items.length - 1}
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
