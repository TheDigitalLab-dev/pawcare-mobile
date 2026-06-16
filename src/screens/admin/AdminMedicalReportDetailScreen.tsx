import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, EmptyState, SectionTitle } from '@/components/ui';
import { DetailHero } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDateTime, mockReports } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;
type Rt = RouteProp<AdminMoreStackParamList, 'AdminMedicalReportDetail'>;

export function AdminMedicalReportDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const report = mockReports.find((r) => r.id === params.id);

  if (!report) {
    return (
      <MobileShell
        header={
          <AppHeader
            title="Reporte"
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        }
      >
        <EmptyState
          icon="document-text"
          title="Reporte no encontrado"
          description="No existe un reporte con ese identificador."
        />
      </MobileShell>
    );
  }

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Reporte médico"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <DetailHero
        title={report.title}
        subtitle={`Generado: ${formatDateTime(report.generated_at)}`}
      />

      <SectionTitle>Contenido</SectionTitle>
      <Text style={[styles.body, { color: colors.foreground }]}>
        {report.content ?? 'Sin contenido.'}
      </Text>

      <SectionTitle>Exportar</SectionTitle>
      <View style={styles.exportRow}>
        {/* No-op TODO: generar archivo sin backend. */}
        <Button
          label="CSV"
          variant="outline"
          onPress={() => {}}
          style={styles.exportBtn}
        />
        <Button
          label="JSON"
          variant="outline"
          onPress={() => {}}
          style={styles.exportBtn}
        />
        <Button
          label="PDF"
          variant="outline"
          onPress={() => {}}
          style={styles.exportBtn}
        />
      </View>

      <View style={{ gap: 8, marginTop: 8 }}>
        {/* No-op TODO: sin backend. */}
        <Button
          label="Enviar por correo"
          variant="secondary"
          fullWidth
          onPress={() => {}}
        />
        <Button label="Generar PDF" variant="primary" fullWidth onPress={() => {}} />
      </View>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 22 },
  exportRow: { flexDirection: 'row', gap: 8 },
  exportBtn: { flex: 1 },
});
