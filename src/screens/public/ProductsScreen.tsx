import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, ProductCard, SearchBar } from '@/components';
import { formatMoney, mockProducts } from '@/data/mock';
import type { PublicStackParamList } from '@/navigation/types';

/** Tienda: búsqueda + grid de productos. */
export function ProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockProducts;
    return mockProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

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

      {filtered.length === 0 ? (
        <EmptyState
          icon="cart"
          title="Sin resultados"
          description="No encontramos productos para tu búsqueda."
        />
      ) : (
        <View style={styles.grid}>
          {filtered.map((product) => {
            const priceLabel =
              product.sale_price !== undefined
                ? formatMoney(product.sale_price, product.currency)
                : 'Consultar';
            const inStock = (product.current_stock ?? 0) > 0;
            return (
              <ProductCard
                key={product.id}
                name={product.name}
                priceLabel={priceLabel}
                imageUri={product.photo_url}
                inStock={inStock}
                onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
              />
            );
          })}
        </View>
      )}
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
