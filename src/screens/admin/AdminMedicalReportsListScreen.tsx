import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, SearchBar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminMedicalReports } from '@/services/admin';
import { formatDate } from '@/utils/format';
import type { MedicalReport } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminMedicalReportsListScreen() {
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useAsync(() => listAdminMedicalReports());

  const reports = useMemo(() => {
    const list = data ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((r) => r.title.toLowerCase().includes(q)) : list;
  }, [data, query]);

  const renderItem = useCallback(
    ({ item: r }: ListRenderItemInfo<MedicalReport>) => (
      <ListRow
        title={r.title}
        subtitle={formatDate(r.generated_at ?? r.created_at)}
        onPress={() => navigation.navigate('AdminMedicalReportDetail', { id: r.id })}
      />
    ),
    [navigation],
  );

  return (
    <MobileShell
      header={<AppHeader title="Reportes médicos" onBack={back} />}
      contentStyle={styles.content}
    >
      <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar reporte…" />

      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={reports.length === 0}
        emptyIcon="document-text"
        emptyTitle="Sin reportes"
        emptyDescription="No hay reportes médicos."
      >
        <FlatList
          data={reports}
          keyExtractor={(r) => String(r.id)}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
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
