import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Badge, Card } from '@/components/ui';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { getSponsorship } from '@/services/sponsorships';
import { formatDate, formatMoney } from '@/utils/format';
import type { Sponsorship } from '@/types/models';

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

function Body({ sponsorship }: { sponsorship: Sponsorship }) {
  return (
    <Card style={{ gap: 10 }}>
      <Row label="Mascota" value={sponsorship.pet?.name ?? '—'} />
      <Row label="Monto" value={formatMoney(sponsorship.amount)} />
      {sponsorship.recurrence ? (
        <Row label="Recurrencia" value={sponsorship.recurrence} />
      ) : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14 }}>Estado</Text>
        <Badge
          label={sponsorship.status === 'active' ? 'Activo' : sponsorship.status}
          variant={sponsorship.status === 'active' ? 'success' : 'outline'}
        />
      </View>
      <Row label="Inicio" value={formatDate(sponsorship.start_date)} />
      <Row label="Fin" value={formatDate(sponsorship.end_date)} />
    </Card>
  );
}

export function OwnerSponsorshipDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OwnerHomeStackParamList, 'OwnerSponsorshipDetail'>>();
  const id = route.params.id;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => getSponsorship(id));

  return (
    <MobileShell
      scroll
      header={<AppHeader title={data?.pet?.name ?? 'Apadrinamiento'} onBack={back} />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <AsyncBoundary loading={loading && data === null} error={error} onRetry={reload}>
        {data ? <Body sponsorship={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
