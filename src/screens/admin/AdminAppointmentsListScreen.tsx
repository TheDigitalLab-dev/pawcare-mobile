import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Fab, FilterChips, type BadgeVariant } from '@/components/ui';
import { AppointmentCard } from '@/components/domain';
import type { AdminAgendaStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminAppointments } from '@/services/admin';
import { formatDateTime } from '@/utils/format';
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminAgendaStackParamList>;

const STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
  in_progress: 'info',
  completed: 'info',
  cancelled: 'destructive',
  rescheduled: 'warning',
};

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'completed', label: 'Completadas' },
  { id: 'cancelled', label: 'Canceladas' },
];

export function AdminAppointmentsListScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState('all');
  const { data, loading, error, reload } = useAsync(() => listAdminAppointments());

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const appointments = useMemo(() => {
    const list = data ?? [];
    return filter === 'all' ? list : list.filter((a) => a.status === filter);
  }, [data, filter]);

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Agenda" />}
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Agendar cita"
          onPress={() => navigation.navigate('AdminAppointmentWizard', {})}
        />
      }
    >
      <FilterChips options={FILTERS} selectedId={filter} onSelect={setFilter} />

      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={appointments.length === 0}
        emptyIcon="calendar"
        emptyTitle="Sin citas"
        emptyDescription="No hay citas para este filtro."
      >
        {appointments.map((a) => (
          <AppointmentCard
            key={a.id}
            petName={a.pet?.name ?? 'Mascota'}
            dateLabel={formatDateTime(a.scheduled_at)}
            vetName={
              a.assigned_to
                ? `${a.assigned_to.first_name} ${a.assigned_to.last_name}`
                : undefined
            }
            statusLabel={APPOINTMENT_STATUS_LABEL[a.status]}
            statusVariant={STATUS_VARIANT[a.status]}
            onPress={() => navigation.navigate('AdminAppointmentDetail', { id: a.id })}
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
