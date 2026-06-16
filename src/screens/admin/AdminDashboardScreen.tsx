import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { SectionTitle } from '@/components/ui';
import { AdminModuleGrid, HeroCard, StatCard } from '@/components/domain';
import type { AdminHomeStackParamList } from '@/navigation/types';
import { mockAppointments, mockPayments, mockPets, mockStaff } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminHomeStackParamList>;

export function AdminDashboardScreen() {
  // El stack Home solo contiene AdminDashboard; el resto de módulos viven en
  // otros tabs/stacks (Pacientes, Agenda, Más). Esa navegación cruzada queda
  // como TODO porque requiere acceso al navigator raíz.
  useNavigation<Nav>();

  const today = new Date().toISOString().slice(0, 10);
  const todaysAppointments = mockAppointments.filter((a) =>
    a.scheduled_at.startsWith(today),
  );
  const pendingPayments = mockPayments.filter((p) => p.status === 'pending');

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Inicio" />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <HeroCard
        title={`Hola, ${mockStaff.full_name ?? mockStaff.first_name}`}
        subtitle="Panel del personal de Pawcare. Resumen de la jornada."
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard value={mockPets.length} label="Pacientes" />
        <StatCard value={todaysAppointments.length} label="Citas hoy" />
        <StatCard value={pendingPayments.length} label="Pagos pendientes" />
      </View>

      <View style={{ gap: 8 }}>
        <SectionTitle>Módulos</SectionTitle>
        <AdminModuleGrid
          modules={[
            {
              id: 'patients',
              label: 'Pacientes',
              icon: 'paw',
              badge: mockPets.length,
              // TODO: cross-tab nav al stack de Pacientes (PatientsTab)
              onPress: undefined,
            },
            {
              id: 'agenda',
              label: 'Agenda',
              icon: 'calendar',
              badge: todaysAppointments.length,
              // TODO: cross-tab nav al stack de Agenda (AgendaTab)
              onPress: undefined,
            },
            {
              id: 'consultations',
              label: 'Consultas',
              icon: 'medkit',
              // TODO: cross-tab nav al stack Más (MoreTab → AdminConsultationsList)
              onPress: undefined,
            },
            {
              id: 'vaccinations',
              label: 'Vacunas',
              icon: 'bandage',
              // TODO: cross-tab nav al stack Más (MoreTab → AdminVaccinationsList)
              onPress: undefined,
            },
            {
              id: 'payments',
              label: 'Pagos',
              icon: 'card',
              badge: pendingPayments.length,
              // TODO: cross-tab nav al stack Más (MoreTab → AdminPaymentsList)
              onPress: undefined,
            },
            {
              id: 'reports',
              label: 'Reportes',
              icon: 'document-text',
              // TODO: cross-tab nav al stack Más (MoreTab → AdminMedicalReportsList)
              onPress: undefined,
            },
          ]}
        />
      </View>
    </MobileShell>
  );
}
