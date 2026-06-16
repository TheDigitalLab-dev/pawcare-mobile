import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, Fab } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDate, mockVaccinations } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminVaccinationsListScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Vacunas"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 4, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Agregar vacuna"
          onPress={() => navigation.navigate('AdminVaccinationForm', {})}
        />
      }
    >
      {mockVaccinations.length === 0 ? (
        <EmptyState
          icon="bandage"
          title="Sin vacunas"
          description="No hay vacunas registradas."
        />
      ) : (
        mockVaccinations.map((v, index) => (
          <TimelineItem
            key={v.id}
            title={v.vaccine_name}
            date={`Aplicada: ${formatDate(v.application_date)}`}
            description={`${v.manufacturer ?? 'Fabricante desconocido'} · Próxima: ${formatDate(v.next_due_date)}`}
            last={index === mockVaccinations.length - 1}
          />
        ))
      )}
    </MobileShell>
  );
}
