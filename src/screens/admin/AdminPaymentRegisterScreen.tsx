import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, FilterChips, InfoBanner, TextField, UploadZone } from '@/components/ui';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatMoney, mockPayments } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;
type Rt = RouteProp<AdminMoreStackParamList, 'AdminPaymentRegister'>;

const METHOD_OPTIONS = [
  { id: 'cash', label: 'Efectivo' },
  { id: 'transfer', label: 'Transferencia' },
  { id: 'card', label: 'Tarjeta' },
];

export function AdminPaymentRegisterScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const payment = mockPayments.find((p) => p.id === params.id);

  const [amount, setAmount] = useState(payment ? String(payment.amount) : '');
  const [method, setMethod] = useState(METHOD_OPTIONS[0]?.id ?? '');
  const [reference, setReference] = useState('');

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Registrar pago"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      {payment ? (
        <InfoBanner
          message={`${payment.concept ?? 'Pago'} · ${formatMoney(payment.amount, payment.currency)}`}
          tone="info"
        />
      ) : null}

      <TextField
        label="Monto"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <View>
        <Text style={[styles.label, { color: colors.foreground }]}>Método</Text>
        <FilterChips options={METHOD_OPTIONS} selectedId={method} onSelect={setMethod} />
      </View>

      <TextField
        label="Referencia"
        value={reference}
        onChangeText={setReference}
        placeholder="N.° de transacción"
      />

      <UploadZone
        label="Comprobante"
        hint="Toca para subir el comprobante de pago"
        // No-op: sin backend.
        onPress={() => {}}
      />

      <Button
        label="Confirmar pago"
        fullWidth
        disabled={!amount.trim()}
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
});
