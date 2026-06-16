import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Card, EmptyState } from '@/components/ui';
import type { OwnerHomeStackParamList } from '@/navigation/types';
import { formatDate, formatMoney, mockSponsorships } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerHomeStackParamList>;

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

export function OwnerSponsorshipDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerHomeStackParamList, 'OwnerSponsorshipDetail'>>();
  const sponsorship = mockSponsorships.find((s) => s.id === route.params.id);
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  if (!sponsorship) {
    return (
      <MobileShell header={<AppHeader title="Apadrinamiento" onBack={back} />}>
        <EmptyState icon="heart" title="Apadrinamiento no encontrado" />
      </MobileShell>
    );
  }

  return (
    <MobileShell
      scroll
      header={
        <AppHeader title={sponsorship.pet_name ?? 'Apadrinamiento'} onBack={back} />
      }
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <Card style={{ gap: 10 }}>
        <Row label="Mascota" value={sponsorship.pet_name ?? '—'} />
        <Row label="Monto" value={formatMoney(sponsorship.amount)} />
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
    </MobileShell>
  );
}
