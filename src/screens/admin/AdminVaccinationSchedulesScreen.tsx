import { useNavigation } from '@react-navigation/native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, type BadgeVariant } from '@/components/ui';
import { ListRow } from '@/components/domain';
import { useAsync } from '@/hooks/useAsync';
import { listVaccinationSchedules } from '@/services/admin';
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
  const items = data ?? [];

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Esquemas de vacunación" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
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
        {items.map((s) => (
          <ListRow
            key={s.id}
            title={s.pet?.name ?? `Esquema #${s.id}`}
            subtitle={`${s.schedule_type}${s.start_date ? ` · ${formatDate(s.start_date)}` : ''}`}
            showChevron={false}
            trailing={
              <Badge label={s.status} variant={STATUS_VARIANT[s.status] ?? 'outline'} />
            }
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
