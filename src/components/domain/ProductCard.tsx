import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { Badge } from '@/components/ui';

export interface ProductCardProps {
  name: string;
  priceLabel: string;
  imageUri?: string | null;
  inStock?: boolean;
  onPress?: () => void;
}

export function ProductCard({
  name,
  priceLabel,
  imageUri,
  inStock = true,
  onPress,
}: ProductCardProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.thumb, { backgroundColor: colors.muted }]}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.thumbImg} /> : null}
      </View>
      <Text numberOfLines={2} style={[styles.name, { color: colors.foreground }]}>
        {name}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.price, { color: colors.primary }]}>{priceLabel}</Text>
        {!inStock ? <Badge label="Agotado" variant="destructive" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 6, width: '47%' },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  name: { fontSize: 14, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 15, fontWeight: '700' },
});
