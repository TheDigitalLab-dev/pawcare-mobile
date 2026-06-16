import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import { useAsync } from '@/hooks/useAsync';
import { listAdminDewormings } from '@/services/admin';
import { formatDate } from '@/utils/format';

export function AdminDewormingsListScreen() {
  const navigation = useNavigation();
  const { data, loading, error, reload } = useAsync(() => listAdminDewormings());
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
          title="Desparasitaciones"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 4, paddingBottom: 96 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="flask"
        emptyTitle="Sin desparasitaciones"
        emptyDescription="No hay desparasitaciones registradas."
      >
        {items.map((d, index) => (
          <TimelineItem
            key={d.id}
            title={d.product_name}
            date={`Aplicada: ${formatDate(d.application_date)}`}
            description={`${d.dose ?? 'Dosis no especificada'} · Próxima: ${formatDate(d.next_due_date)}`}
            last={index === items.length - 1}
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
