import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listMedicalReports } from '@/services/medical';
import { formatDate } from '@/utils/format';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function MedicalReportsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'MedicalReports'>>();
  const { petId } = route.params;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => listMedicalReports(petId));
  const items = data ?? [];

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Reportes médicos" onBack={back} />}
      contentStyle={{ gap: 8, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="reader"
        emptyTitle="Sin reportes"
        emptyDescription="Esta mascota no tiene reportes médicos."
      >
        <View style={{ gap: 8 }}>
          {items.map((r) => (
            <ListRow
              key={r.id}
              title={r.title}
              subtitle={formatDate(r.generated_at ?? r.created_at)}
              onPress={() =>
                navigation.navigate('MedicalReportDetail', { petId, id: r.id })
              }
            />
          ))}
        </View>
      </AsyncBoundary>
    </MobileShell>
  );
}
