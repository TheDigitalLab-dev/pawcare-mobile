import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, Button, Card } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { getProduct } from '@/services/public';
import { formatMoney } from '@/utils/format';
import type { Product } from '@/types/models';
import type { PublicStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<PublicStackParamList>;

function Body({ product }: { product: Product }) {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const stock = product.stock_quantity ?? 0;
  const inStock = product.in_stock ?? stock > 0;

  return (
    <>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: colors.muted }]} />
      )}

      <Card style={styles.card}>
        <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>
        {product.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            {product.description}
          </Text>
        ) : null}
        <Text style={[styles.price, { color: colors.primary }]}>
          {formatMoney(Number(product.sale_price))}
        </Text>
        <View style={styles.badges}>
          <Badge
            label={inStock ? `En stock (${stock})` : 'Agotado'}
            variant={inStock ? 'success' : 'destructive'}
          />
        </View>
      </Card>

      <Button
        label="Comprar"
        fullWidth
        disabled={!inStock}
        onPress={() => navigation.navigate('Checkout')}
      />
    </>
  );
}

export function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<PublicStackParamList, 'ProductDetail'>>();
  const id = route.params.id;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => getProduct(id));

  return (
    <MobileShell
      scroll
      header={<AppHeader title={data?.name ?? 'Producto'} onBack={back} />}
      contentStyle={{ gap: 12 }}
    >
      <AsyncBoundary loading={loading && data === null} error={error} onRetry={reload}>
        {data ? <Body product={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  thumb: { width: '100%', aspectRatio: 1, borderRadius: 12 },
  card: { gap: 8 },
  name: { fontSize: 18, fontWeight: '700' },
  desc: { fontSize: 14 },
  price: { fontSize: 20, fontWeight: '700' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
