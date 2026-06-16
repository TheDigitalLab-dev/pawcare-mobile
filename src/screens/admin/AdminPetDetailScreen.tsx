import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Alert, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, EmptyState, PetAvatar } from '@/components/ui';
import { DetailHero, ListRow } from '@/components/domain';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { formatDate, mockPets } from '@/data/mock';
import {
  ADOPTION_STATUS_LABEL,
  SEX_LABEL,
  SPECIES_EMOJI,
  SPECIES_LABEL,
} from '@/types/models';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;
type Rt = RouteProp<AdminPatientsStackParamList, 'AdminPetDetail'>;

export function AdminPetDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const pet = mockPets.find((p) => p.id === params.id);

  const onDelete = () => {
    Alert.alert(
      'Eliminar paciente',
      `¿Seguro que deseas eliminar a ${pet?.name ?? 'este paciente'}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          // No-op: sin backend. Volvemos a la lista.
          onPress: () => (navigation.canGoBack() ? navigation.goBack() : undefined),
        },
      ],
    );
  };

  if (!pet) {
    return (
      <MobileShell
        header={
          <AppHeader
            title="Paciente"
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        }
      >
        <EmptyState
          icon="paw"
          title="Paciente no encontrado"
          description="No existe un paciente con ese identificador."
        />
      </MobileShell>
    );
  }

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
        {pet.adoption_status ? (
          <Badge label={ADOPTION_STATUS_LABEL[pet.adoption_status]} variant="info" />
        ) : null}
      </DetailHero>

      <ListRow title="Especie" subtitle={SPECIES_LABEL[pet.species]} />
      <ListRow title="Raza" subtitle={pet.breed ?? 'Sin especificar'} />
      <ListRow title="Sexo" subtitle={pet.sex ? SEX_LABEL[pet.sex] : 'Sin especificar'} />
      <ListRow title="Nacimiento" subtitle={formatDate(pet.birth_date)} />
      <ListRow
        title="Características"
        subtitle={pet.distinctive_features ?? 'Ninguna registrada'}
      />

      <View style={{ gap: 8, marginTop: 8 }}>
        <Button
          label="Editar paciente"
          fullWidth
          onPress={() => navigation.navigate('AdminPetForm', { id: pet.id })}
        />
        <Button
          label="Perfil médico"
          variant="secondary"
          fullWidth
          onPress={() => navigation.navigate('AdminMedicalProfile', { petId: pet.id })}
        />
        <Button label="Eliminar" variant="destructive" fullWidth onPress={onDelete} />
      </View>
    </MobileShell>
  );
}
