import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, EmptyState } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import { formatMoney, mockSponsorships } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerHomeStackParamList>;

export function OwnerSponsorshipsScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Apadrinamientos"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      {mockSponsorships.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Sin apadrinamientos"
          description="Aún no apadrinas a ninguna mascota."
        />
      ) : (
        <View style={{ gap: 8 }}>
          {mockSponsorships.map((s) => (
            <ListRow
              key={s.id}
              title={s.pet_name ?? `Apadrinamiento #${s.id}`}
              subtitle={formatMoney(s.amount)}
              leading={
                <Badge
                  label={s.status === 'active' ? 'Activo' : s.status}
                  variant={s.status === 'active' ? 'success' : 'outline'}
                />
              }
              onPress={() => navigation.navigate('OwnerSponsorshipDetail', { id: s.id })}
            />
          ))}
        </View>
      )}
    </MobileShell>
  );
}
