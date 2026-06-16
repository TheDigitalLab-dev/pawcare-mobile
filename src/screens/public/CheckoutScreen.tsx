import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, Card, InfoBanner, SectionTitle, TextField } from '@/components';
import { formatMoney, mockProducts } from '@/data/mock';
import type { PublicStackParamList } from '@/navigation/types';

/** Resumen de pedido + datos de contacto antes de pagar. */
export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Resumen mock: tomamos los primeros productos como items del carrito.
  const items = mockProducts.slice(0, 2);
  const total = items.reduce((sum, item) => sum + (item.sale_price ?? 0), 0);
  const currency = items[0]?.currency;

  const canSubmit =
    name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0;

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Pago"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <SectionTitle>Resumen del pedido</SectionTitle>
      <Card style={styles.summary}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={[styles.itemName, { color: colors.foreground }]}>
              {item.name}
            </Text>
            <Text style={{ color: colors.mutedForeground }}>
              {item.sale_price !== undefined
                ? formatMoney(item.sale_price, item.currency)
                : '—'}
            </Text>
          </View>
        ))}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.total, { color: colors.foreground }]}>Total</Text>
          <Text style={[styles.total, { color: colors.primary }]}>
            {formatMoney(total, currency)}
          </Text>
        </View>
      </Card>

      <SectionTitle>Datos de contacto</SectionTitle>
      <TextField label="Nombre" value={name} onChangeText={setName} />
      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <InfoBanner message="Al confirmar aceptas nuestros Términos y condiciones." />

      <Button
        label="Confirmar pedido"
        fullWidth
        disabled={!canSubmit}
        onPress={() => navigation.navigate('UploadProof', { orderId: 1 })}
        style={styles.submit}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  summary: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontWeight: '500', flex: 1, marginRight: 8 },
  divider: { height: 1, marginVertical: 4 },
  total: { fontSize: 16, fontWeight: '700' },
  submit: { marginTop: 8 },
});
