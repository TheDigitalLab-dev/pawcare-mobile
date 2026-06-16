import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { TimelineItem } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { formatDate, mockDewormings } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function DewormingsScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Desparasitaciones"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 8, paddingBottom: 32 }}
    >
      {mockDewormings.length === 0 ? (
        <EmptyState
          icon="flask"
          title="Sin desparasitaciones"
          description="No hay desparasitaciones registradas."
        />
      ) : (
        <View>
          {mockDewormings.map((d, i) => (
            <TimelineItem
              key={d.id}
              title={d.product_name}
              date={formatDate(d.application_date)}
              description={
                d.next_due_date
                  ? `Próxima dosis: ${formatDate(d.next_due_date)}`
                  : undefined
              }
              last={i === mockDewormings.length - 1}
            />
          ))}
        </View>
      )}
    </MobileShell>
  );
}
