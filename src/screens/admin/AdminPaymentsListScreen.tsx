import { useState } from 'react';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, FilterChips, type BadgeVariant } from '@/components/ui';
import { PaymentCard } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDate, formatMoney, mockPayments } from '@/data/mock';
import { PAYMENT_STATUS_LABEL, type PaymentStatus } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

const STATUS_VARIANT: Record<PaymentStatus, BadgeVariant> = {
  draft: 'outline',
  pending: 'warning',
  completed: 'success',
  overdue: 'destructive',
  cancelled: 'outline',
};

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'paid', label: 'Pagados' },
  { id: 'overdue', label: 'Vencidos' },
  { id: 'cancelled', label: 'Cancelados' },
];

export function AdminPaymentsListScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState('all');

  const payments =
    filter === 'all' ? mockPayments : mockPayments.filter((p) => p.status === filter);

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
      <FilterChips options={FILTERS} selectedId={filter} onSelect={setFilter} />

      {payments.length === 0 ? (
        <EmptyState
          icon="card"
          title="Sin pagos"
          description="No hay pagos para este filtro."
        />
      ) : (
        payments.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={`Ver pago ${p.pet_name ?? ''}`}
            onPress={() => navigation.navigate('AdminPaymentDetail', { id: p.id })}
          >
            <PaymentCard
              concept={p.pet_name ?? 'Pago'}
              amountLabel={formatMoney(p.amount, p.currency)}
              statusLabel={PAYMENT_STATUS_LABEL[p.status]}
              statusVariant={STATUS_VARIANT[p.status]}
              dueLabel={p.due_date ? `Vence: ${formatDate(p.due_date)}` : undefined}
              onRegister={
                p.status === 'pending' || p.status === 'overdue'
                  ? () => navigation.navigate('AdminPaymentRegister', { id: p.id })
                  : undefined
              }
            />
          </Pressable>
        ))
      )}
    </MobileShell>
  );
}
