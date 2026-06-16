import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, PetAvatar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import { useAsync } from '@/hooks/useAsync';
import { listAdminAdoptions } from '@/services/admin';
import { formatDate } from '@/utils/format';

export function AdminAdoptionsListScreen() {
  const navigation = useNavigation();
  const { data, loading, error, reload } = useAsync(() => listAdminAdoptions());
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
          title="Adopciones"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="paw"
        emptyTitle="Sin adopciones"
        emptyDescription="Aún no hay adopciones registradas."
      >
        {items.map((record) => (
          <ListRow
            key={record.id}
            title={record.pet?.name ?? 'Mascota'}
            subtitle={[
              record.adoption_date ? formatDate(record.adoption_date) : null,
              record.adopter?.full_name ? `Adoptante: ${record.adopter.full_name}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            leading={<PetAvatar fallback="🐾" size="md" />}
            showChevron={false}
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
