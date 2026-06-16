import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Alert, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, Card, EmptyState, type BadgeVariant } from '@/components/ui';
import type { OwnerAppointmentsStackParamList } from '@/navigation/types';
import { formatDateTime, mockAppointments } from '@/data/mock';
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerAppointmentsStackParamList>;

const STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  confirmed: 'success',
  pending: 'warning',
  completed: 'primary',
  cancelled: 'destructive',
};

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.foreground,
          flexShrink: 1,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function AppointmentDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route =
    useRoute<RouteProp<OwnerAppointmentsStackParamList, 'AppointmentDetail'>>();
  const appointment = mockAppointments.find((a) => a.id === route.params.id);
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [status, setStatus] = useState<AppointmentStatus | undefined>(
    appointment?.status,
  );

  if (!appointment || !status) {
    return (
      <MobileShell header={<AppHeader title="Cita" onBack={back} />}>
        <EmptyState icon="calendar" title="Cita no encontrada" />
      </MobileShell>
    );
  }

  const active = status === 'pending' || status === 'confirmed';

  const cancel = () => {
    Alert.alert('Cancelar cita', '¿Seguro que deseas cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        // TODO: cancelar cita en el backend
        onPress: () => setStatus('cancelled'),
      },
    ]);
  };

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Detalle de cita" onBack={back} />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <View style={{ alignItems: 'flex-start' }}>
        <Badge
          label={APPOINTMENT_STATUS_LABEL[status]}
          variant={STATUS_VARIANT[status]}
        />
      </View>

      <Card style={{ gap: 10 }}>
        <Row label="Mascota" value={appointment.pet_name ?? '—'} />
        <Row label="Veterinario" value={appointment.vet_name ?? '—'} />
        <Row label="Servicio" value={appointment.service_name ?? '—'} />
        <Row label="Fecha" value={formatDateTime(appointment.scheduled_at)} />
      </Card>

      {appointment.notes ? (
        <Card>
          <Text style={{ fontSize: 14, color: colors.foreground }}>
            {appointment.notes}
          </Text>
        </Card>
      ) : null}

      {active ? (
        <View style={{ gap: 12 }}>
          {status === 'pending' ? (
            <Button
              label="Confirmar"
              fullWidth
              // TODO: confirmar cita en el backend
              onPress={() => setStatus('confirmed')}
            />
          ) : null}
          <Button label="Cancelar" variant="destructive" fullWidth onPress={cancel} />
        </View>
      ) : null}
    </MobileShell>
  );
}
