import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, EmptyState, type BadgeVariant } from '@/components/ui';
import { DetailHero, ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDate, formatMoney, mockPayments } from '@/data/mock';
import { PAYMENT_STATUS_LABEL, type PaymentStatus } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;
type Rt = RouteProp<AdminMoreStackParamList, 'AdminPaymentDetail'>;

const STATUS_VARIANT: Record<PaymentStatus, BadgeVariant> = {
  draft: 'outline',
  pending: 'warning',
  completed: 'success',
  overdue: 'destructive',
  cancelled: 'outline',
};

export function AdminPaymentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const payment = mockPayments.find((p) => p.id === params.id);

  if (!payment) {
    return (
      <MobileShell
        header={
          <AppHeader
            title="Pago"
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        }
      >
        <EmptyState
          icon="card"
          title="Pago no encontrado"
          description="No existe un pago con ese identificador."
        />
      </MobileShell>
    );
  }

  const settled = payment.status === 'completed' || payment.status === 'cancelled';

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Detalle de pago"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <DetailHero
        title={formatMoney(payment.amount, payment.currency)}
        subtitle={payment.pet_name ?? 'Pago'}
      >
        <Badge
          label={PAYMENT_STATUS_LABEL[payment.status]}
          variant={STATUS_VARIANT[payment.status]}
        />
      </DetailHero>

      <ListRow title="Mascota" subtitle={payment.pet_name ?? 'Sin asignar'} />
      <ListRow title="Dueño" subtitle={payment.owner_name ?? 'Sin asignar'} />
      <ListRow
        title="Método de pago"
        subtitle={payment.payment_method ?? 'Sin especificar'}
      />
      <ListRow title="Vence" subtitle={formatDate(payment.due_date)} />
      <ListRow title="Pagado el" subtitle={formatDate(payment.paid_at)} />
      <ListRow title="Notas" subtitle={payment.notes ?? 'Sin notas'} />

      <View style={{ gap: 8, marginTop: 8 }}>
        <Button
          label="Registrar pago"
          variant="primary"
          fullWidth
          disabled={settled}
          onPress={() => navigation.navigate('AdminPaymentRegister', { id: payment.id })}
        />
        {/* No-op: sin backend. */}
        <Button
          label="Actualizar estado"
          variant="secondary"
          fullWidth
          onPress={() => {}}
        />
      </View>
    </MobileShell>
  );
}
