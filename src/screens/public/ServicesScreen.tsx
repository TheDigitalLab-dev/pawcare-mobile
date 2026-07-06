import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, ListRow } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { listPublicServices } from '@/services/public';
import { formatMoney } from '@/utils/format';
import type { LandingService } from '@/types/models';
import type { PublicStackParamList } from '@/navigation/types';

export function ServicesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const { data, loading, error, reload } = useAsync(() => listPublicServices());
  const items = data ?? [];

  const renderItem = useCallback(({ item: s }: ListRenderItemInfo<LandingService>) => {
    const price = s.price != null ? formatMoney(Number(s.price)) : 'Consultar';
    const duration = s.duration_minutes ? ` · ${s.duration_minutes} min` : '';
    return (
      <ListRow title={s.name} subtitle={`${price}${duration}`} showChevron={false} />
    );
  }, []);

  return (
    <MobileShell
      header={
        <AppHeader
          title="Servicios"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={styles.content}
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
        <FlatList
          data={items}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  list: { flex: 1 },
  listContent: { gap: 8 },
});
