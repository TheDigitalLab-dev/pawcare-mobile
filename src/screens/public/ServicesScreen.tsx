import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, ListRow } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { listPublicServices } from '@/services/public';
import { formatMoney } from '@/utils/format';
import type { PublicStackParamList } from '@/navigation/types';

export function ServicesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const { data, loading, error, reload } = useAsync(() => listPublicServices());
  const items = data ?? [];

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Servicios"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={items.length === 0}
        emptyIcon="medkit"
        emptyTitle="Sin servicios"
        emptyDescription="Aún no hay servicios publicados."
      >
        <View style={{ gap: 8 }}>
          {items.map((s) => {
            const price = s.price != null ? formatMoney(Number(s.price)) : 'Consultar';
            const duration = s.duration_minutes ? ` · ${s.duration_minutes} min` : '';
            return (
              <ListRow
                key={s.id}
                title={s.name}
                subtitle={`${price}${duration}`}
                showChevron={false}
              />
            );
          })}
        </View>
      </AsyncBoundary>
    </MobileShell>
  );
}
