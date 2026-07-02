import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Card } from '@/components/ui';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { getAdminConsultation } from '@/services/admin';

type Rt = RouteProp<AdminMoreStackParamList, 'AdminPrescriptions'>;

export function AdminPrescriptionsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<Rt>();
  const { colors } = useTheme();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() =>
    getAdminConsultation(params.consultationId),
  );
  const prescriptions = data?.prescriptions ?? [];

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Recetas" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={data !== null && prescriptions.length === 0}
        emptyIcon="document-text"
        emptyTitle="Sin recetas"
        emptyDescription="Esta consulta no tiene recetas."
      >
        {prescriptions.map((p) => (
          <Card key={p.id} style={{ gap: 6 }}>
            {p.diagnosis ? (
              <Text style={{ fontWeight: '600', color: colors.foreground }}>
                {p.diagnosis}
              </Text>
            ) : null}
            {p.items.map((it) => (
              <Text key={it.id} style={{ fontSize: 14, color: colors.foreground }}>
                • {it.medication_name}
                {it.dose ? ` — ${it.dose}` : ''}
                {it.frequency ? `, ${it.frequency}` : ''}
                {it.duration ? `, ${it.duration}` : ''}
              </Text>
            ))}
            {p.items.length === 0 ? (
              <Text style={{ color: colors.mutedForeground }}>Sin medicamentos.</Text>
            ) : null}
          </Card>
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
