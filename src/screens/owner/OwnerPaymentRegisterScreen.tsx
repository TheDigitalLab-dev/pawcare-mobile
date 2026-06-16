import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, Card, EmptyState, TextField, UploadZone } from '@/components/ui';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import { formatDate, formatMoney, mockPayments } from '@/data/mock';
import { PAYMENT_STATUS_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerHomeStackParamList>;

export function OwnerPaymentRegisterScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerHomeStackParamList, 'OwnerPaymentRegister'>>();
  const payment = mockPayments.find((p) => p.id === route.params.id);

  const [reference, setReference] = useState('');
  const [hasProof, setHasProof] = useState(false);

  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  if (!payment) {
    return (
      <MobileShell header={<AppHeader title="Registrar pago" onBack={back} />}>
        <EmptyState icon="card" title="Pago no encontrado" />
      </MobileShell>
    );
  }

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Registrar pago" onBack={back} />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <Card style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
            {payment.concept ?? 'Pago'}
          </Text>
          <Badge label={PAYMENT_STATUS_LABEL[payment.status]} variant="warning" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground }}>
          {formatMoney(payment.amount, payment.currency)}
        </Text>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
          Vence: {formatDate(payment.due_date)}
        </Text>
      </Card>

      <UploadZone
        label="Comprobante de pago"
        hint="Toca para adjuntar la foto o el documento del comprobante"
        selectedName={hasProof ? 'comprobante.jpg' : undefined}
        onPress={() => setHasProof(true)}
      />

      <TextField
        label="Referencia"
        placeholder="N.º de referencia o transacción"
        value={reference}
        onChangeText={setReference}
      />

      <Button
        label="Registrar pago"
        fullWidth
        // TODO: enviar comprobante al backend
        onPress={back}
      />
    </MobileShell>
  );
}
