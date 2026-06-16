import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, EmptyState, ListRow, type BadgeVariant } from '@/components';
import { formatMoney, mockSponsorships } from '@/data/mock';
import type { PublicStackParamList } from '@/navigation/types';

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: 'success',
  pending: 'warning',
  completed: 'info',
  cancelled: 'destructive',
};

/** Listado de patrocinios disponibles. */
export function SponsorshipsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const { colors } = useTheme();

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Patrocinios"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      {mockSponsorships.length === 0 ? (
        <EmptyState
          icon="gift"
          title="Sin patrocinios"
          description="Aún no hay patrocinios activos."
        />
      ) : (
        mockSponsorships.map((sponsorship) => {
          const label = STATUS_LABEL[sponsorship.status] ?? sponsorship.status;
          const variant: BadgeVariant = STATUS_VARIANT[sponsorship.status] ?? 'primary';
          const subtitle = sponsorship.pet_name
            ? `Mascota: ${sponsorship.pet_name}`
            : undefined;
          return (
            <ListRow
              key={sponsorship.id}
              title={formatMoney(sponsorship.amount)}
              subtitle={subtitle}
              leading={<Ionicons name="gift" size={22} color={colors.primary} />}
              trailing={<Badge label={label} variant={variant} />}
              onPress={() =>
                navigation.navigate('SponsorshipDetail', {
                  id: sponsorship.id,
                })
              }
            />
          );
        })
      )}
    </MobileShell>
  );
}
