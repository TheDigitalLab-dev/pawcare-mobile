import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { AppHeader, MobileShell } from '@/components/layout';
import {
  AsyncBoundary,
  Button,
  FilterChips,
  InfoBanner,
  SectionTitle,
  TextField,
} from '@/components/ui';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { getAdminPayment, registerAdminPayment } from '@/services/admin';
import { ApiError } from '@/types/api';
import { formatMoney } from '@/utils/format';
import { PAYMENT_METHOD_LABEL, type Payment, type PaymentMethod } from '@/types/models';

type Rt = RouteProp<AdminMoreStackParamList, 'AdminPaymentRegister'>;

const METHOD_OPTIONS = (Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map(
  (id) => ({ id, label: PAYMENT_METHOD_LABEL[id] }),
);

function RegisterForm({ payment }: { payment: Payment }) {
  const navigation = useNavigation();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const onSubmit = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      await registerAdminPayment(payment.id, {
        payment_method: method,
        payment_reference: reference.trim() || undefined,
      });
      if (back) back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo registrar el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error ? <InfoBanner tone="destructive" message={error} /> : null}
      <InfoBanner
        tone="info"
        message={`${payment.pet_name ?? 'Pago'} · ${formatMoney(payment.amount, payment.currency)}`}
      />

      <SectionTitle>Método de pago</SectionTitle>
      <FilterChips
        options={METHOD_OPTIONS}
        selectedId={method}
        onSelect={(id) => setMethod(id as PaymentMethod)}
      />

      <TextField
        label="Referencia"
        value={reference}
        onChangeText={setReference}
        placeholder="N.° de transacción"
        autoCapitalize="characters"
      />

      <Button
        label="Confirmar pago"
        fullWidth
        loading={submitting}
        onPress={onSubmit}
        style={{ marginTop: 8 }}
      />
    </>
  );
}

export function AdminPaymentRegisterScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<Rt>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => getAdminPayment(params.id));

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Registrar pago" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary loading={loading && data === null} error={error} onRetry={reload}>
        {data ? <RegisterForm payment={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
