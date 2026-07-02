import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Avatar, Button, Card, DetailHero } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { getAdoptionPet } from '@/services/public';
import { SPECIES_EMOJI, SPECIES_LABEL, type AdoptionPet } from '@/types/models';
import type { PublicStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<PublicStackParamList>;

function Body({ pet }: { pet: AdoptionPet }) {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <>
      <DetailHero
        title={pet.name}
        subtitle={[SPECIES_LABEL[pet.species], pet.breed, pet.age_display]
          .filter(Boolean)
          .join(' · ')}
        avatar={
          <Avatar
            uri={pet.photo_url ?? undefined}
            fallback={SPECIES_EMOJI[pet.species]}
            size="lg"
          />
        }
      />

      <Card style={styles.card}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Patrocinio responsable
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          {pet.name} tiene {pet.active_sponsors_count ?? 0} padrino(s). Al patrocinar
          ayudas a cubrir su alimentación y atención veterinaria.
        </Text>
        {pet.distinctive_features ? (
          <Text style={[styles.body, { color: colors.foreground }]}>
            {pet.distinctive_features}
          </Text>
        ) : null}
      </Card>

      <Button
        label="Quiero patrocinar"
        fullWidth
        onPress={() => navigation.navigate('Contact')}
      />
    </>
  );
}

export function SponsorshipDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<PublicStackParamList, 'SponsorshipDetail'>>();
  const id = route.params.id;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => getAdoptionPet(id));

  return (
    <MobileShell
      scroll
      header={<AppHeader title={data?.name ?? 'Patrocinio'} onBack={back} />}
      contentStyle={{ gap: 12 }}
    >
      <AsyncBoundary loading={loading && data === null} error={error} onRetry={reload}>
        {data ? <Body pet={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
});
