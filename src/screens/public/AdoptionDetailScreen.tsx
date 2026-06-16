import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Avatar, Button, Card, DetailHero, EmptyState } from '@/components';
import { mockAdoptionPets } from '@/data/mock';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';
import type { PublicStackParamList } from '@/navigation/types';

const REQUISITOS = [
  'Ser mayor de edad y presentar documento de identidad.',
  'Contar con un espacio adecuado para la mascota.',
  'Compromiso de control veterinario y vacunación al día.',
  'Firmar el acuerdo de adopción responsable.',
];

/** Detalle de una mascota en adopción + requisitos. */
export function AdoptionDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const route = useRoute<RouteProp<PublicStackParamList, 'AdoptionDetail'>>();
  const { colors } = useTheme();

  const pet = mockAdoptionPets.find((p) => p.id === route.params.id);

  if (!pet) {
    return (
      <MobileShell
        header={
          <AppHeader
            title="Adopción"
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        }
      >
        <EmptyState
          icon="paw"
          title="Mascota no encontrada"
          description="Esta mascota ya no está disponible."
        />
      </MobileShell>
    );
  }

  const subtitleParts = [SPECIES_LABEL[pet.species], pet.breed, pet.age_label].filter(
    Boolean,
  );

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title={pet.name}
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <DetailHero
        title={pet.name}
        subtitle={subtitleParts.join(' · ')}
        avatar={<Avatar fallback={SPECIES_EMOJI[pet.species]} size="lg" />}
      >
        {pet.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            {pet.description}
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
