import { useCallback } from 'react';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, PetAvatar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import { useAsync } from '@/hooks/useAsync';
import { listAdminAdoptions, type AdoptionRecord } from '@/services/admin';
import { formatDate } from '@/utils/format';

// Avatar estático compartido por todas las filas (evita recrear JSX por render).
const PAW_AVATAR = <PetAvatar fallback="🐾" size="md" />;

export function AdminAdoptionsListScreen() {
  const navigation = useNavigation();
  const { data, loading, error, reload } = useAsync(() => listAdminAdoptions());
  const items = data ?? [];

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const renderItem = useCallback(
    ({ item: record }: ListRenderItemInfo<AdoptionRecord>) => (
      <ListRow
        title={record.pet?.name ?? 'Mascota'}
        subtitle={[
          record.adoption_date ? formatDate(record.adoption_date) : null,
          record.adopter?.full_name ? `Adoptante: ${record.adopter.full_name}` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
        leading={PAW_AVATAR}
        showChevron={false}
      />
    ),
    [],
  );

  return (
    <MobileShell
      header={
        <AppHeader
          title="Adopciones"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={styles.content}
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
        <FlatList
          data={items}
          keyExtractor={(record) => String(record.id)}
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
  listContent: { gap: 12, paddingBottom: 32 },
});
