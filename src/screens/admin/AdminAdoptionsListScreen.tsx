import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, EmptyState, Fab, PetAvatar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { mockAdoptionPets } from '@/data/mock';
import {
  ADOPTION_STATUS_LABEL,
  SPECIES_EMOJI,
  SPECIES_LABEL,
  type AdoptionStatus,
} from '@/types/models';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;

const STATUS_VARIANT: Record<AdoptionStatus, 'success' | 'info' | 'warning'> = {
  available_for_adoption: 'success',
  adopted: 'info',
  not_for_adoption: 'warning',
};

export function AdminAdoptionsListScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Adopciones" />}
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Agregar adopción"
          onPress={() => navigation.navigate('AdminAdoptionForm')}
        />
      }
    >
      {mockAdoptionPets.length === 0 ? (
        <EmptyState
          icon="paw"
          title="Sin adopciones"
          description="Aún no hay mascotas en adopción."
        />
      ) : (
        mockAdoptionPets.map((pet) => {
          const status: AdoptionStatus = 'available_for_adoption';
          return (
            <ListRow
              key={pet.id}
              title={pet.name}
              subtitle={`${SPECIES_LABEL[pet.species]} · ${pet.age_display ?? 'Edad desconocida'}`}
              leading={<PetAvatar fallback={SPECIES_EMOJI[pet.species]} size="md" />}
              trailing={
                <Badge
                  label={ADOPTION_STATUS_LABEL[status]}
                  variant={STATUS_VARIANT[status]}
                />
              }
              onPress={() => navigation.navigate('AdminAdoptionDetail', { id: pet.id })}
            />
          );
        })
      )}
    </MobileShell>
  );
}
