import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, Card, EmptyState } from '@/components';
import { formatDate, formatMoney, mockSponsorships } from '@/data/mock';
import type { PublicStackParamList } from '@/navigation/types';

/** Detalle de un patrocinio con su progreso. */
export function SponsorshipDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const route = useRoute<RouteProp<PublicStackParamList, 'SponsorshipDetail'>>();
  const { colors } = useTheme();

  const sponsorship = mockSponsorships.find((s) => s.id === route.params.id);

  if (!sponsorship) {
    return (
      <MobileShell
        header={
          <AppHeader
            title="Patrocinio"
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        }
      >
        <EmptyState
          icon="gift"
          title="Patrocinio no encontrado"
          description="Este patrocinio ya no está disponible."
        />
      </MobileShell>
    );
  }

  // Progreso presentacional (sin meta real en el modelo): valor fijo de ejemplo.
  const progress = 0.6;

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Patrocinio"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {formatMoney(sponsorship.amount)}
          </Text>
          {sponsorship.status === 'active' ? (
            <Badge label="Activo" variant="success" />
          ) : (
            <Badge label={sponsorship.status} variant="primary" />
          )}
        </View>

        {sponsorship.pet_name ? (
          <Text style={[styles.meta, { color: colors.foreground }]}>
            Mascota: {sponsorship.pet_name}
          </Text>
        ) : null}
        {sponsorship.start_date ? (
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            Inicio: {formatDate(sponsorship.start_date)}
          </Text>
        ) : null}

        <View style={styles.progressBlock}>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            Progreso de la meta
          </Text>
          <View style={[styles.track, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.round(progress * 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      </Card>

      <Button
        label="Patrocinar"
        fullWidth
        onPress={() => navigation.navigate('Contact')}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: { fontSize: 22, fontWeight: '700' },
  meta: { fontSize: 14 },
  progressBlock: { gap: 6, marginTop: 4 },
  track: { height: 8, borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 9999 },
});
