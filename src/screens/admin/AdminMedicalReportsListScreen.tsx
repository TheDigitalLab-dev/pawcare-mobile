import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, Fab, SearchBar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDateTime, mockReports } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;

export function AdminMedicalReportsListScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const reports = term
    ? mockReports.filter((r) => r.title.toLowerCase().includes(term))
    : mockReports;

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Reportes médicos"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Generar reporte"
          // No-op: sin backend.
          onPress={() => {}}
        />
      }
    >
      <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar reporte…" />

      {reports.length === 0 ? (
        <EmptyState
          icon="document-text"
          title="Sin reportes"
          description="No se encontraron reportes médicos."
        />
      ) : (
        reports.map((r) => (
          <ListRow
            key={r.id}
            title={r.title}
            subtitle={formatDateTime(r.generated_at)}
            onPress={() => navigation.navigate('AdminMedicalReportDetail', { id: r.id })}
          />
        ))
      )}
    </MobileShell>
  );
}
