import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { SectionTitle } from '@/components/ui';
import { AdminModuleGrid } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminModulesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Más" />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <SectionTitle>Módulos clínicos y administrativos</SectionTitle>
      <AdminModuleGrid
        modules={[
          {
            id: 'consultations',
            label: 'Consultas',
            icon: 'medkit',
            onPress: () => navigation.navigate('AdminConsultationsList'),
          },
          {
            id: 'vaccinations',
            label: 'Vacunas',
            icon: 'bandage',
            onPress: () => navigation.navigate('AdminVaccinationsList'),
          },
          {
            id: 'dewormings',
            label: 'Desparasitaciones',
            icon: 'flask',
            onPress: () => navigation.navigate('AdminDewormingsList'),
          },
          {
            id: 'payments',
            label: 'Pagos',
            icon: 'card',
            onPress: () => navigation.navigate('AdminPaymentsList'),
          },
          {
            id: 'reports',
            label: 'Reportes',
            icon: 'document-text',
            onPress: () => navigation.navigate('AdminMedicalReportsList'),
          },
        ]}
      />
    </MobileShell>
  );
}
