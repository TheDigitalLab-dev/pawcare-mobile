import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, EmptyState, Fab, UploadZone } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { mockLabExams } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;
type Rt = RouteProp<AdminMoreStackParamList, 'AdminLabExams'>;

export function AdminLabExamsScreen() {
  const navigation = useNavigation<Nav>();
  useRoute<Rt>();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Exámenes de laboratorio"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Agregar examen"
          // No-op: sin backend.
          onPress={() => {}}
        />
      }
    >
      <UploadZone
        label="Adjuntar resultado"
        hint="Toca para subir PDF o imagen del examen"
        // No-op: sin backend.
        onPress={() => {}}
      />

      {mockLabExams.length === 0 ? (
        <EmptyState
          icon="flask"
          title="Sin exámenes"
          description="No hay exámenes de laboratorio registrados."
        />
      ) : (
        mockLabExams.map((exam) => {
          const completed = exam.status === 'completed';
          return (
            <ListRow
              key={exam.id}
              title={exam.exam_name}
              subtitle={exam.results ?? 'Resultados pendientes'}
              trailing={
                <Badge
                  label={completed ? 'Completado' : 'Pendiente'}
                  variant={completed ? 'success' : 'warning'}
                />
              }
            />
          );
        })
      )}
    </MobileShell>
  );
}
