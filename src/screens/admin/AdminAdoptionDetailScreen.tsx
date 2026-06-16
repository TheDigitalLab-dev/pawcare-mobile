import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, EmptyState, PetAvatar } from '@/components/ui';
import { DetailHero, ListRow } from '@/components/domain';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { mockAdoptionPets } from '@/data/mock';
import {
  ADOPTION_STATUS_LABEL,
  SEX_LABEL,
  SPECIES_EMOJI,
  SPECIES_LABEL,
  type AdoptionStatus,
} from '@/types/models';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;
type Rt = RouteProp<AdminPatientsStackParamList, 'AdminAdoptionDetail'>;

export function AdminAdoptionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const pet = mockAdoptionPets.find((p) => p.id === params.id);

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
          title="Adopción no encontrada"
          description="No existe una solicitud con ese identificador."
        />
      </MobileShell>
    );
  }

  const status: AdoptionStatus = pet.adoption_status ?? 'available_for_adoption';

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title={pet.name}
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <DetailHero
        title={pet.name}
        subtitle={`${SPECIES_LABEL[pet.species]} · ${pet.breed ?? 'Sin raza'}`}
        avatar={<PetAvatar fallback={SPECIES_EMOJI[pet.species]} size="lg" />}
      >
        <Badge label={ADOPTION_STATUS_LABEL[status]} variant="info" />
      </DetailHero>

      <ListRow title="Edad" subtitle={pet.age_label ?? 'Desconocida'} />
      <ListRow title="Sexo" subtitle={pet.sex ? SEX_LABEL[pet.sex] : 'Sin especificar'} />
      <ListRow title="Descripción" subtitle={pet.description ?? 'Sin descripción'} />

      <View style={{ gap: 8, marginTop: 8 }}>
        {/* No-op: sin backend. */}
        <Button label="Aprobar adopción" variant="primary" fullWidth onPress={() => {}} />
        <Button label="Rechazar" variant="destructive" fullWidth onPress={() => {}} />
      </View>
    </MobileShell>
  );
}
