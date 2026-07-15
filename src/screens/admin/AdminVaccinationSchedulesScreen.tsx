import { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, type BadgeVariant } from '@/components/ui';
import { ListRow } from '@/components/domain';
import { useAsync } from '@/hooks/useAsync';
import { syncReminders } from '@/services/reminderAlarms';
import { vaccinationScheduleReminders } from '@/utils/reminders';
import { listVaccinationSchedules, type VaccinationSchedule } from '@/services/admin';
import { formatDate } from '@/utils/format';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: 'success',
  completed: 'info',
  overdue: 'destructive',
  pending: 'warning',
};

export function AdminVaccinationSchedulesScreen() {
  const navigation = useNavigation();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;
  const { data, loading, error, reload } = useAsync(() => listVaccinationSchedules());

  // A10 del plan: aviso el día previo a cada vacunación programada.
  useEffect(() => {
    if (!data) return;
    void syncReminders(vaccinationScheduleReminders(data, new Date().toISOString()));
  }, [data]);
  const items = data ?? [];

  const renderItem = useCallback(
    ({ item: s }: ListRenderItemInfo<VaccinationSchedule>) => (
      <ListRow
        title={s.pet?.name ?? `Esquema #${s.id}`}
        subtitle={`${s.schedule_type}${s.start_date ? ` · ${formatDate(s.start_date)}` : ''}`}
        showChevron={false}
        trailing={() => (
          <Badge label={s.status} variant={STATUS_VARIANT[s.status] ?? 'outline'} />
        )}
      />
    ),
    [],
  );

  return (
    <MobileShell
      header={<AppHeader title="Esquemas de vacunación" onBack={back} />}
      contentStyle={styles.content}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="clipboard"
        emptyTitle="Sin esquemas"
        emptyDescription="No hay esquemas de vacunación registrados."
      >
        <FlatList
          data={items}
          keyExtractor={(s) => String(s.id)}
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
