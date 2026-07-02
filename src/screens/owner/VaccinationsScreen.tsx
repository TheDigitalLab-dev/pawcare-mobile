import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { View } from 'react-native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listVaccinations } from '@/services/medical';
import { formatDate } from '@/utils/format';

export function VaccinationsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'Vaccinations'>>();
  const { petId } = route.params;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => listVaccinations(petId));
  const items = data ?? [];

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Vacunas" onBack={back} />}
      contentStyle={{ gap: 8, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="bandage"
        emptyTitle="Sin vacunas"
        emptyDescription="Esta mascota no tiene vacunas registradas."
      >
        <View>
          {items.map((v, i) => (
            <TimelineItem
              key={v.id}
              tone="success"
              title={v.vaccine_name}
              date={formatDate(v.application_date)}
              description={
                [
                  v.next_due_date ? `Próxima: ${formatDate(v.next_due_date)}` : null,
                  v.veterinarian ? v.veterinarian.full_name : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || undefined
              }
              last={i === items.length - 1}
            />
          ))}
        </View>
      </AsyncBoundary>
    </MobileShell>
  );
}
