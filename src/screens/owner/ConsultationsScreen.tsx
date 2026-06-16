import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { formatDate, mockConsultations } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function ConsultationsScreen() {
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
      contentStyle={{ gap: 8, paddingBottom: 32 }}
    >
      {mockConsultations.length === 0 ? (
        <EmptyState
          icon="document-text"
          title="Sin consultas"
          description="No hay consultas registradas."
        />
      ) : (
        <View style={{ gap: 8 }}>
          {mockConsultations.map((c) => (
            <ListRow
              key={c.id}
              title={c.diagnosis ?? 'Consulta'}
              subtitle={`${formatDate(c.consultation_date)}${c.vet_name ? ` · ${c.vet_name}` : ''}`}
              onPress={() => navigation.navigate('ConsultationDetail', { id: c.id })}
            />
          ))}
        </View>
      )}
    </MobileShell>
  );
}
