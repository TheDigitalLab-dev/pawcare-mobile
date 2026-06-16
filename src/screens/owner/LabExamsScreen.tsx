import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { View } from 'react-native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, type BadgeVariant } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listConsultations } from '@/services/medical';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  completed: 'Completado',
};
const STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
};

export function LabExamsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'LabExams'>>();
  const { petId, consultationId } = route.params;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => listConsultations(petId));
  const consultation = (data ?? []).find((c) => c.id === consultationId);
  const exams = consultation?.lab_exams ?? [];

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Exámenes de laboratorio" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={exams.length === 0}
        emptyIcon="flask"
        emptyTitle="Sin exámenes"
        emptyDescription="Esta consulta no tiene exámenes de laboratorio."
      >
        <View style={{ gap: 8 }}>
          {exams.map((e) => (
            <ListRow
              key={e.id}
              title={e.exam_name}
              subtitle={e.results ?? undefined}
              showChevron={false}
              trailing={
                <Badge
                  label={STATUS_LABEL[e.status] ?? e.status}
                  variant={STATUS_VARIANT[e.status] ?? 'outline'}
                />
              }
            />
          ))}
        </View>
      </AsyncBoundary>
    </MobileShell>
  );
}
