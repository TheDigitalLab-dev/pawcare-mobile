import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Alert, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, EmptyState, type BadgeVariant } from '@/components/ui';
import { DetailHero, ListRow } from '@/components/domain';
import type { AdminAgendaStackParamList } from '@/navigation/types';
import { formatDateTime, mockAppointments } from '@/data/mock';
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminAgendaStackParamList>;
type Rt = RouteProp<AdminAgendaStackParamList, 'AdminAppointmentDetail'>;

const STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
  in_progress: 'info',
  completed: 'info',
  cancelled: 'destructive',
  rescheduled: 'warning',
};

export function AdminAppointmentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const appointment = mockAppointments.find((a) => a.id === params.id);

  const onCancel = () => {
    Alert.alert('Cancelar cita', '¿Deseas cancelar esta cita?', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar cita',
        style: 'destructive',
        onPress: () => (navigation.canGoBack() ? navigation.goBack() : undefined),
      },
    ]);
  };

  if (!appointment) {
    return (
      <MobileShell
        header={
          <AppHeader
            title="Cita"
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        }
      >
        <EmptyState
          icon="calendar"
          title="Cita no encontrada"
          description="No existe una cita con ese identificador."
        />
      </MobileShell>
    );
  }

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Detalle de cita"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
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
      <ListRow
        title="Veterinario"
        subtitle={
          appointment.assigned_to
            ? `${appointment.assigned_to.first_name} ${appointment.assigned_to.last_name}`
            : 'Sin asignar'
        }
      />
      <ListRow title="Duración" subtitle={`${appointment.duration_minutes ?? 0} min`} />
      <ListRow title="Notas" subtitle={appointment.notes ?? 'Sin notas'} />

      <View style={{ gap: 8, marginTop: 8 }}>
        {/* No-op: sin backend. */}
        <Button label="Editar estado" variant="primary" fullWidth onPress={() => {}} />
        <Button
          label="Cancelar cita"
          variant="destructive"
          fullWidth
          onPress={onCancel}
        />
      </View>
    </MobileShell>
  );
}
