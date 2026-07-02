import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { View } from 'react-native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listDewormings } from '@/services/medical';
import { formatDate } from '@/utils/format';

export function DewormingsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'Dewormings'>>();
  const { petId } = route.params;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => listDewormings(petId));
  const items = data ?? [];

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Desparasitaciones" onBack={back} />}
      contentStyle={{ gap: 8, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="flask"
        emptyTitle="Sin desparasitaciones"
        emptyDescription="Esta mascota no tiene desparasitaciones registradas."
      >
        <View>
          {items.map((d, i) => (
            <TimelineItem
              key={d.id}
              title={d.product_name}
              date={formatDate(d.application_date)}
              description={
                [
                  d.next_due_date ? `Próxima: ${formatDate(d.next_due_date)}` : null,
                  d.veterinarian ? d.veterinarian.full_name : null,
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
