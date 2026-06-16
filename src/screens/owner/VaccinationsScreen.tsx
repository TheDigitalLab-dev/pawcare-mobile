import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { formatDate, mockVaccinations } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function VaccinationsScreen() {
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
      contentStyle={{ gap: 8, paddingBottom: 32 }}
    >
      {mockVaccinations.length === 0 ? (
        <EmptyState
          icon="bandage"
          title="Sin vacunas"
          description="No hay vacunas registradas."
        />
      ) : (
        <View>
          {mockVaccinations.map((v, i) => (
            <TimelineItem
              key={v.id}
              tone="success"
              title={v.vaccine_name}
              date={formatDate(v.application_date)}
              description={
                v.next_due_date
                  ? `Próxima dosis: ${formatDate(v.next_due_date)}`
                  : undefined
              }
              last={i === mockVaccinations.length - 1}
            />
          ))}
        </View>
      )}
    </MobileShell>
  );
}
