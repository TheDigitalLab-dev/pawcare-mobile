import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, type ListRenderItemInfo } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Card } from '@/components/ui';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { getAdminConsultation } from '@/services/admin';
import type { Prescription } from '@/types/models';

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

  const renderItem = useCallback(
    ({ item: p }: ListRenderItemInfo<Prescription>) => (
      <Card style={styles.card}>
        {p.diagnosis ? (
          <Text style={[styles.diagnosis, { color: colors.foreground }]}>
            {p.diagnosis}
          </Text>
        ) : null}
        {p.items.map((it) => (
          <Text key={it.id} style={[styles.item, { color: colors.foreground }]}>
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
    ),
    [colors],
  );

  return (
    <MobileShell
      header={<AppHeader title="Recetas" onBack={back} />}
      contentStyle={styles.content}
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
        <FlatList
          data={prescriptions}
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
  card: { gap: 6 },
  diagnosis: { fontWeight: '600' },
  item: { fontSize: 14 },
});
