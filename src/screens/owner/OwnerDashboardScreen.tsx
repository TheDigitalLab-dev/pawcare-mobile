import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { SectionTitle } from '@/components/ui';
import {
  ActionTileGrid,
  AppointmentCard,
  HeroCard,
  PaymentCard,
  StatCard,
} from '@/components/domain';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import {
  formatDateTime,
  formatMoney,
  mockAppointments,
  mockOwner,
  mockPayments,
} from '@/data/mock';
import { APPOINTMENT_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerHomeStackParamList>;

export function OwnerDashboardScreen() {
  const navigation = useNavigation<Nav>();

  const nextAppointment = mockAppointments.find(
    (a) => a.status === 'pending' || a.status === 'confirmed',
  );
  const pendingPayments = mockPayments.filter((p) => p.status === 'pending');
  const firstPending = pendingPayments[0];

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Inicio" />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <HeroCard
        title={`Hola, ${mockOwner.first_name}`}
        subtitle="Bienvenida a Pawcare. Aquí tienes un resumen de tus mascotas."
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard value={2} label="Mascotas" />
        <StatCard
          value={
            mockAppointments.filter(
              (a) => a.status === 'pending' || a.status === 'confirmed',
            ).length
          }
          label="Citas próximas"
        />
        <StatCard value={pendingPayments.length} label="Pagos pendientes" />
      </View>

      {nextAppointment ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Próxima cita</SectionTitle>
          <AppointmentCard
            petName={nextAppointment.pet?.name ?? 'Mascota'}
            dateLabel={formatDateTime(nextAppointment.scheduled_at)}
            vetName={
              nextAppointment.assigned_to
                ? `${nextAppointment.assigned_to.first_name} ${nextAppointment.assigned_to.last_name}`
                : undefined
            }
            statusLabel={APPOINTMENT_STATUS_LABEL[nextAppointment.status]}
            statusVariant={nextAppointment.status === 'confirmed' ? 'success' : 'warning'}
          />
        </View>
      ) : null}

      {firstPending ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Pagos pendientes</SectionTitle>
          <PaymentCard
            concept={firstPending.pet_name ?? 'Pago'}
            amountLabel={formatMoney(firstPending.amount, firstPending.currency)}
            statusLabel={PAYMENT_STATUS_LABEL[firstPending.status]}
            statusVariant="warning"
            dueLabel={`Vence: ${formatDateTime(firstPending.due_date)}`}
            onRegister={() =>
              navigation.navigate('OwnerPaymentRegister', { id: firstPending.id })
            }
          />
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <SectionTitle>Accesos rápidos</SectionTitle>
        <ActionTileGrid
          tiles={[
            {
              id: 'pets',
              label: 'Mis mascotas',
              icon: 'paw',
              // TODO: cross-tab nav al stack de mascotas (PetsTab)
              onPress: () => navigation.navigate('OwnerMedicalHistory'),
            },
            {
              id: 'appointments',
              label: 'Citas',
              icon: 'calendar',
              // TODO: cross-tab nav al stack de citas (AppointmentsTab)
              onPress: () => navigation.navigate('OwnerMedicalHistory'),
            },
            {
              id: 'history',
              label: 'Historial',
              icon: 'document-text',
              onPress: () => navigation.navigate('OwnerMedicalHistory'),
            },
            {
              id: 'payments',
              label: 'Pagos',
              icon: 'card',
              onPress: () => navigation.navigate('OwnerPayments'),
            },
          ]}
        />
      </View>
    </MobileShell>
  );
}
