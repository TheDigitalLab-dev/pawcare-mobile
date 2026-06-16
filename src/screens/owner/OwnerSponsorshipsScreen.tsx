import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listSponsorships } from '@/services/sponsorships';
import { formatMoney } from '@/utils/format';

type Nav = NativeStackNavigationProp<OwnerHomeStackParamList>;

export function OwnerSponsorshipsScreen() {
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;
  const { data, loading, error, reload } = useAsync(() => listSponsorships());
  const items = data ?? [];

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Apadrinamientos" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="heart"
        emptyTitle="Sin apadrinamientos"
        emptyDescription="Aún no apadrinas a ninguna mascota."
      >
        <View style={{ gap: 8 }}>
          {items.map((s) => (
            <ListRow
              key={s.id}
              title={s.pet?.name ?? `Apadrinamiento #${s.id}`}
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
      </AsyncBoundary>
    </MobileShell>
  );
}
