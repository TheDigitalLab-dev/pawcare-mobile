import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, ProductCard, SearchBar } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { listProducts } from '@/services/public';
import { formatMoney } from '@/utils/format';
import type { PublicStackParamList } from '@/navigation/types';

export function ProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useAsync(() => listProducts());

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
  }, [data, query]);

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Tienda"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar productos…" />

      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={filtered.length === 0}
        emptyIcon="cart"
        emptyTitle={query ? 'Sin resultados' : 'Sin productos'}
        emptyDescription={
          query ? 'No encontramos productos para tu búsqueda.' : 'Aún no hay productos.'
        }
      >
        <View style={styles.grid}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              priceLabel={formatMoney(Number(product.sale_price))}
              imageUri={product.image_url ?? undefined}
              inStock={product.in_stock ?? false}
              onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
            />
          ))}
        </View>
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
});
