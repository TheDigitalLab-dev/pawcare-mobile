import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Avatar, Button, Card, DetailHero } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { getAdoptionPet } from '@/services/public';
import { SPECIES_EMOJI, SPECIES_LABEL, type AdoptionPet } from '@/types/models';
import type { PublicStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<PublicStackParamList>;

const REQUISITOS = [
  'Ser mayor de edad y presentar documento de identidad.',
  'Contar con un espacio adecuado para la mascota.',
  'Compromiso de control veterinario y vacunación al día.',
  'Firmar el acuerdo de adopción responsable.',
];

function Body({ pet }: { pet: AdoptionPet }) {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const subtitle = [SPECIES_LABEL[pet.species], pet.breed, pet.age_display]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <DetailHero
        title={pet.name}
        subtitle={subtitle}
        avatar={
          <Avatar
            uri={pet.photo_url ?? undefined}
            fallback={SPECIES_EMOJI[pet.species]}
            size="lg"
          />
        }
      >
        {pet.distinctive_features ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            {pet.distinctive_features}
          </Text>
        ) : null}
      </DetailHero>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Requisitos de adopción
        </Text>
        {REQUISITOS.map((item) => (
          <View key={item} style={styles.reqRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.reqText, { color: colors.foreground }]}>{item}</Text>
          </View>
        ))}
      </Card>

      <Button
        label="Contactar"
        fullWidth
        onPress={() => navigation.navigate('Contact')}
      />
    </>
  );
}

export function AdoptionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<PublicStackParamList, 'AdoptionDetail'>>();
  const id = route.params.id;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => getAdoptionPet(id));

  return (
    <MobileShell
      scroll
      header={<AppHeader title={data?.name ?? 'Adopción'} onBack={back} />}
      contentStyle={{ gap: 12 }}
    >
      <AsyncBoundary loading={loading && data === null} error={error} onRetry={reload}>
        {data ? <Body pet={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 14, textAlign: 'center' },
  card: { gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  reqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  reqText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
