import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, Fab, FilterChips, type BadgeVariant } from '@/components/ui';
import { AppointmentCard } from '@/components/domain';
import type { OwnerAppointmentsStackParamList } from '@/navigation/types';
import { formatDateTime, mockAppointments } from '@/data/mock';
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerAppointmentsStackParamList>;
type Filter = 'upcoming' | 'past';

const STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  confirmed: 'success',
  pending: 'warning',
  completed: 'primary',
  cancelled: 'destructive',
};

const FILTERS = [
  { id: 'upcoming', label: 'Próximas' },
  { id: 'past', label: 'Pasadas' },
];

export function AppointmentsListScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<Filter>('upcoming');

  const appointments = mockAppointments.filter((a) =>
    filter === 'upcoming'
      ? a.status === 'pending' || a.status === 'confirmed'
      : a.status === 'completed' || a.status === 'cancelled',
  );

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Citas" />}
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          icon="add"
          accessibilityLabel="Agendar cita"
          onPress={() => navigation.navigate('AppointmentWizard', {})}
        />
      }
    >
      <FilterChips
        options={FILTERS}
        selectedId={filter}
        onSelect={(id) => setFilter(id as Filter)}
      />

      {appointments.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Sin citas"
          description="No hay citas en esta categoría."
        />
      ) : (
        <View style={{ gap: 12 }}>
          {appointments.map((a) => (
            <AppointmentCard
              key={a.id}
              petName={a.pet_name ?? 'Mascota'}
              dateLabel={formatDateTime(a.scheduled_at)}
              vetName={a.vet_name}
              statusLabel={APPOINTMENT_STATUS_LABEL[a.status]}
              statusVariant={STATUS_VARIANT[a.status]}
              onPress={() => navigation.navigate('AppointmentDetail', { id: a.id })}
            />
          ))}
        </View>
      )}
    </MobileShell>
  );
}
