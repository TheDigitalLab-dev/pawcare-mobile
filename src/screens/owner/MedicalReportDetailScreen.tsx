import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, Card, EmptyState } from '@/components/ui';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { formatDateTime, mockReports } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function MedicalReportDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'MedicalReportDetail'>>();
  const report = mockReports.find((r) => r.id === route.params.id);
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  if (!report) {
    return (
      <MobileShell header={<AppHeader title="Reporte" onBack={back} />}>
        <EmptyState icon="reader" title="Reporte no encontrado" />
      </MobileShell>
    );
  }

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Reporte" onBack={back} />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground }}>
          {report.title}
        </Text>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
          {formatDateTime(report.generated_at)}
        </Text>
      </View>

      <Card>
        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.foreground }}>
          {report.content ?? 'Sin contenido.'}
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button
          label="Descargar PDF"
          // TODO: descargar reporte en PDF
          onPress={() => undefined}
          style={{ flex: 1 }}
        />
        <Button
          label="Compartir"
          variant="outline"
          // TODO: compartir reporte
          onPress={() => undefined}
          style={{ flex: 1 }}
        />
      </View>
    </MobileShell>
  );
}
