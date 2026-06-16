import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Card, SectionTitle } from '@/components/ui';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { getMedicalReport } from '@/services/medical';
import { formatDate } from '@/utils/format';
import type { MedicalReport } from '@/types/models';

function Body({ report }: { report: MedicalReport }) {
  const { colors } = useTheme();
  return (
    <>
      <Card style={{ gap: 6 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
          {report.title}
        </Text>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
          {formatDate(report.generated_at ?? report.created_at)} ·{' '}
          {report.created_by.full_name}
        </Text>
      </Card>

      {report.current_observations ? (
        <>
          <SectionTitle>Observaciones</SectionTitle>
          <Card>
            <Text style={{ fontSize: 15, color: colors.foreground }}>
              {report.current_observations}
            </Text>
          </Card>
        </>
      ) : null}

      {report.referral_reason ? (
        <>
          <SectionTitle>Motivo de remisión</SectionTitle>
          <Card>
            <Text style={{ fontSize: 15, color: colors.foreground }}>
              {report.referral_reason}
            </Text>
          </Card>
        </>
      ) : null}

      {report.content ? (
        <>
          <SectionTitle>Contenido</SectionTitle>
          <Card>
            <Text style={{ fontSize: 15, color: colors.foreground }}>
              {report.content}
            </Text>
          </Card>
        </>
      ) : null}
    </>
  );
}

export function MedicalReportDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'MedicalReportDetail'>>();
  const { petId, id } = route.params;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => getMedicalReport(petId, id));

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Reporte médico" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary loading={loading && data === null} error={error} onRetry={reload}>
        {data ? <Body report={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
