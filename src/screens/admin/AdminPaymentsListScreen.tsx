import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, type ListRenderItemInfo } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, FilterChips, type BadgeVariant } from '@/components/ui';
import { PaymentCard } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminPayments } from '@/services/admin';
import { formatDate, formatMoney } from '@/utils/format';
import { PAYMENT_STATUS_LABEL, type Payment, type PaymentStatus } from '@/types/models';

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
  { id: 'completed', label: 'Pagados' },
  { id: 'overdue', label: 'Vencidos' },
  { id: 'cancelled', label: 'Cancelados' },
];

export function AdminPaymentsListScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState('all');
  const { data, loading, error, reload } = useAsync(() => listAdminPayments());

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const payments = useMemo(() => {
    const list = data ?? [];
    return filter === 'all' ? list : list.filter((p) => p.status === filter);
  }, [data, filter]);

  const renderItem = useCallback(
    ({ item: p }: ListRenderItemInfo<Payment>) => (
      <Pressable
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
    ),
    [navigation],
  );

  return (
    <MobileShell
      header={
        <AppHeader
          title="Pagos"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={styles.content}
    >
      <FilterChips options={FILTERS} selectedId={filter} onSelect={setFilter} />

      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={payments.length === 0}
        emptyIcon="card"
        emptyTitle="Sin pagos"
        emptyDescription="No hay pagos para este filtro."
      >
        <FlatList
          data={payments}
          keyExtractor={(p) => String(p.id)}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  list: { flex: 1 },
  listContent: { gap: 12, paddingBottom: 32 },
});
