import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, type BadgeVariant } from '@/components/ui';
import { DetailHero, ListRow } from '@/components/domain';
import type { AdminAgendaStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminAppointments } from '@/services/admin';
import { formatDateTime } from '@/utils/format';
import {
  APPOINTMENT_STATUS_LABEL,
  type Appointment,
  type AppointmentStatus,
} from '@/types/models';

type Rt = RouteProp<AdminAgendaStackParamList, 'AdminAppointmentDetail'>;

const STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
  in_progress: 'info',
  completed: 'info',
  cancelled: 'destructive',
  rescheduled: 'warning',
};

function Body({ appointment }: { appointment: Appointment }) {
  const vet = appointment.assigned_to
    ? `${appointment.assigned_to.first_name} ${appointment.assigned_to.last_name}`
    : 'Sin asignar';
  return (
    <>
      <DetailHero
        title={appointment.pet?.name ?? 'Mascota'}
        subtitle={formatDateTime(appointment.scheduled_at)}
      >
        <Badge
          label={APPOINTMENT_STATUS_LABEL[appointment.status]}
          variant={STATUS_VARIANT[appointment.status]}
        />
      </DetailHero>

      <ListRow
        title="Servicio"
        subtitle={appointment.service?.name ?? 'Sin especificar'}
      />
      <ListRow title="Veterinario" subtitle={vet} />
      <ListRow title="Duración" subtitle={`${appointment.duration_minutes ?? 0} min`} />
      <ListRow title="Notas" subtitle={appointment.notes ?? 'Sin notas'} />
    </>
  );
}

export function AdminAppointmentDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<Rt>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => listAdminAppointments());
  const appointment = (data ?? []).find((a) => a.id === params.id) ?? null;

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Detalle de cita" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={data !== null && appointment === null}
        emptyIcon="calendar"
        emptyTitle="Cita no encontrada"
      >
        {appointment ? <Body appointment={appointment} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
