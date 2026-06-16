import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, FilterChips, type BadgeVariant } from '@/components/ui';
import { PaymentCard } from '@/components/domain';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listPayments } from '@/services/payments';
import { formatDate, formatMoney } from '@/utils/format';
import { PAYMENT_STATUS_LABEL, type PaymentStatus } from '@/types/models';

const STATUS_VARIANT: Record<PaymentStatus, BadgeVariant> = {
  draft: 'outline',
  pending: 'warning',
  completed: 'success',
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

const PENDING: PaymentStatus[] = ['pending', 'overdue'];

export function OwnerPaymentsScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<Filter>('all');
  const { data, loading, error, reload } = useAsync(() => listPayments());

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const payments = useMemo(() => {
    const list = data ?? [];
    if (filter === 'pending') return list.filter((p) => PENDING.includes(p.status));
    if (filter === 'paid') return list.filter((p) => p.status === 'completed');
    return list;
  }, [data, filter]);

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

      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={payments.length === 0}
        emptyIcon="card"
        emptyTitle="Sin pagos"
        emptyDescription="No hay pagos en esta categoría."
      >
        <View style={{ gap: 12 }}>
          {payments.map((p) => (
            <PaymentCard
              key={p.id}
              concept={p.pet_name ?? 'Pago'}
              amountLabel={formatMoney(p.amount, p.currency)}
              statusLabel={PAYMENT_STATUS_LABEL[p.status]}
              statusVariant={STATUS_VARIANT[p.status]}
              dueLabel={
                p.status === 'completed'
                  ? `Pagado: ${formatDate(p.paid_at)}`
                  : `Vence: ${formatDate(p.due_date)}`
              }
              onRegister={
                PENDING.includes(p.status)
                  ? () => navigation.navigate('OwnerPaymentRegister', { id: p.id })
                  : undefined
              }
            />
          ))}
        </View>
      </AsyncBoundary>
    </MobileShell>
  );
}
