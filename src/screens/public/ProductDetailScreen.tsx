import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, Card, EmptyState } from '@/components';
import { formatMoney, mockProducts } from '@/data/mock';
import type { PublicStackParamList } from '@/navigation/types';

/** Detalle de un producto de la tienda. */
export function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const route = useRoute<RouteProp<PublicStackParamList, 'ProductDetail'>>();
  const { colors } = useTheme();

  const product = mockProducts.find((p) => p.id === route.params.id);

  if (!product) {
    return (
      <MobileShell
        header={
          <AppHeader
            title="Producto"
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        }
      >
        <EmptyState
          icon="cart"
          title="Producto no encontrado"
          description="Este producto ya no está disponible."
        />
      </MobileShell>
    );
  }

  const stock = product.current_stock ?? 0;
  const inStock = stock > 0;
  const priceLabel =
    product.sale_price !== undefined
      ? formatMoney(product.sale_price, product.currency)
      : 'Consultar';

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title={product.name}
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <View style={[styles.thumb, { backgroundColor: colors.muted }]} />

      <Card style={styles.card}>
        <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>
        {product.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            {product.description}
          </Text>
        ) : null}
        <Text style={[styles.price, { color: colors.primary }]}>{priceLabel}</Text>
        <View style={styles.badges}>
          <Badge
            label={inStock ? `En stock (${stock})` : 'Agotado'}
            variant={inStock ? 'success' : 'destructive'}
          />
          {product.requires_prescription ? (
            <Badge label="Requiere receta" variant="warning" />
          ) : null}
        </View>
      </Card>

      <Button
        label="Comprar"
        fullWidth
        disabled={!inStock}
        onPress={() => navigation.navigate('Checkout')}
      />
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
