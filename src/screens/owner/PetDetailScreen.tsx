import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Avatar, Button, EmptyState, SectionTitle } from '@/components/ui';
import { ActionTileGrid, DetailHero } from '@/components/domain';
import type { ActionTile } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { mockPets } from '@/data/mock';
import { SEX_LABEL, SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function PetDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'PetDetail'>>();
  const pet = mockPets.find((p) => p.id === route.params.id);
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  if (!pet) {
    return (
      <MobileShell header={<AppHeader title="Mascota" onBack={back} />}>
        <EmptyState icon="paw" title="Mascota no encontrada" />
      </MobileShell>
    );
  }

  const petId = pet.id;
  const tiles: ActionTile[] = [
    {
      id: 'profile',
      label: 'Perfil médico',
      icon: 'medkit',
      onPress: () => navigation.navigate('MedicalProfile', { petId }),
    },
    {
      id: 'vaccinations',
      label: 'Vacunas',
      icon: 'bandage',
      onPress: () => navigation.navigate('Vaccinations', { petId }),
    },
    {
      id: 'dewormings',
      label: 'Desparasitaciones',
      icon: 'flask',
      onPress: () => navigation.navigate('Dewormings', { petId }),
    },
    {
      id: 'consultations',
      label: 'Consultas',
      icon: 'document-text',
      onPress: () => navigation.navigate('Consultations', { petId }),
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: 'reader',
      onPress: () => navigation.navigate('MedicalReports', { petId }),
    },
  ];

  const subtitleParts = [
    SPECIES_LABEL[pet.species],
    pet.breed,
    pet.sex ? SEX_LABEL[pet.sex] : undefined,
  ].filter(Boolean);

  return (
    <MobileShell
      scroll
      header={<AppHeader title={pet.name} onBack={back} />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <DetailHero
        title={pet.name}
        subtitle={subtitleParts.join(' · ')}
        avatar={
          <Avatar uri={pet.photo_url} fallback={SPECIES_EMOJI[pet.species]} size="lg" />
        }
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button
          label="Editar"
          variant="outline"
          onPress={() => navigation.navigate('PetForm', { id: petId })}
          style={{ flex: 1 }}
        />
        <Button
          label="Agendar cita"
          // TODO: cross-stack nav al wizard de citas (AppointmentsTab)
          onPress={() => undefined}
          style={{ flex: 1 }}
        />
      </View>

      <SectionTitle>Salud</SectionTitle>
      <ActionTileGrid tiles={tiles} />
    </MobileShell>
  );
}
