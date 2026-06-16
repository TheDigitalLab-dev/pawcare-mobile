import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, FilterChips, type BadgeVariant } from '@/components/ui';
import { PaymentCard } from '@/components/domain';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import { formatDate, formatMoney, mockPayments } from '@/data/mock';
import { PAYMENT_STATUS_LABEL, type PaymentStatus } from '@/types/models';

const STATUS_VARIANT: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'outline',
};

type Nav = NativeStackNavigationProp<OwnerHomeStackParamList>;
type Filter = 'all' | 'pending' | 'paid';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'paid', label: 'Pagados' },
];

export function OwnerPaymentsScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<Filter>('all');

  const payments = mockPayments.filter((p) => {
    if (filter === 'pending') return p.status === 'pending' || p.status === 'overdue';
    if (filter === 'paid') return p.status === 'paid';
    return true;
  });

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Pagos"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <FilterChips
        options={FILTERS}
        selectedId={filter}
        onSelect={(id) => setFilter(id as Filter)}
      />

      {payments.length === 0 ? (
        <EmptyState
          icon="card"
          title="Sin pagos"
          description="No hay pagos en esta categoría."
        />
      ) : (
        <View style={{ gap: 12 }}>
          {payments.map((p) => (
            <PaymentCard
              key={p.id}
              concept={p.concept ?? 'Pago'}
              amountLabel={formatMoney(p.amount, p.currency)}
              statusLabel={PAYMENT_STATUS_LABEL[p.status]}
              statusVariant={STATUS_VARIANT[p.status]}
              dueLabel={
                p.status === 'paid'
                  ? `Pagado: ${formatDate(p.paid_at)}`
                  : `Vence: ${formatDate(p.due_date)}`
              }
              onRegister={
                p.status === 'pending' || p.status === 'overdue'
                  ? () => navigation.navigate('OwnerPaymentRegister', { id: p.id })
                  : undefined
              }
            />
          ))}
        </View>
      )}
    </MobileShell>
  );
}
