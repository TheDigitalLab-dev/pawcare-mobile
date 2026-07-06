import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Fab } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminVaccinations } from '@/services/admin';
import { formatDate } from '@/utils/format';
import type { Vaccination } from '@/types/models';

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

  const fab = useMemo(
    () => (
      <Fab
        accessibilityLabel="Agregar vacuna"
        onPress={() => navigation.navigate('AdminVaccinationForm', {})}
      />
    ),
    [navigation],
  );

  const count = items.length;
  const renderItem = useCallback(
    ({ item: v, index }: ListRenderItemInfo<Vaccination>) => (
      <TimelineItem
        title={v.vaccine_name}
        date={`Aplicada: ${formatDate(v.application_date)}`}
        description={`${v.manufacturer ?? 'Fabricante desconocido'} · Próxima: ${formatDate(v.next_due_date)}`}
        last={index === count - 1}
      />
    ),
    [count],
  );

  return (
    <MobileShell
      header={
        <AppHeader
          title="Vacunas"
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
        emptyIcon="bandage"
        emptyTitle="Sin vacunas"
        emptyDescription="No hay vacunas registradas."
      >
        <FlatList
          data={items}
          keyExtractor={(v) => String(v.id)}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 4 },
  list: { flex: 1 },
  listContent: { gap: 4, paddingBottom: 96 },
});
