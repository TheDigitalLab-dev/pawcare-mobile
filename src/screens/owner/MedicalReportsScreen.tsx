import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { formatDateTime, mockReports } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function MedicalReportsScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Reportes médicos"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 8, paddingBottom: 32 }}
    >
      {mockReports.length === 0 ? (
        <EmptyState
          icon="reader"
          title="Sin reportes"
          description="No hay reportes médicos generados."
        />
      ) : (
        <View style={{ gap: 8 }}>
          {mockReports.map((r) => (
            <ListRow
              key={r.id}
              title={r.title}
              subtitle={formatDateTime(r.generated_at)}
              onPress={() => navigation.navigate('MedicalReportDetail', { id: r.id })}
            />
          ))}
        </View>
      )}
    </MobileShell>
  );
}
