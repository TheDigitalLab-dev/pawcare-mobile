import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, EmptyState, Fab } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDateTime, mockConsultations } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminConsultationsListScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Consultas"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Nueva consulta"
          onPress={() => navigation.navigate('AdminConsultationForm', {})}
        />
      }
    >
      {mockConsultations.length === 0 ? (
        <EmptyState
          icon="medkit"
          title="Sin consultas"
          description="No hay consultas registradas."
        />
      ) : (
        mockConsultations.map((c) => (
          <ListRow
            key={c.id}
            title={c.diagnosis ?? 'Consulta'}
            subtitle={`${c.veterinarian.full_name} · ${formatDateTime(c.consultation_date)}`}
            trailing={
              c.treatment_completed_at ? (
                <Badge label="Completada" variant="success" />
              ) : (
                <Badge label="En curso" variant="warning" />
              )
            }
            onPress={() => navigation.navigate('AdminConsultationDetail', { id: c.id })}
          />
        ))
      )}
    </MobileShell>
  );
}
