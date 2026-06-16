import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { EmptyState, Fab, SearchBar , PetAvatar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { formatDate, mockPets } from '@/data/mock';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;

export function AdminPetsListScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const pets = term
    ? mockPets.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.breed ?? '').toLowerCase().includes(term),
      )
    : mockPets;

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Pacientes" />}
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Agregar paciente"
          onPress={() => navigation.navigate('AdminPetForm', {})}
        />
      }
    >
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por nombre o raza…"
      />

      {pets.length === 0 ? (
        <EmptyState
          icon="paw"
          title="Sin pacientes"
          description="No se encontraron mascotas con ese criterio."
        />
      ) : (
        pets.map((pet) => (
          <ListRow
            key={pet.id}
            title={pet.name}
            subtitle={`${SPECIES_LABEL[pet.species]} · ${pet.breed ?? 'Sin raza'} · ${formatDate(pet.birth_date)}`}
            leading={<PetAvatar fallback={SPECIES_EMOJI[pet.species]} size="md" />}
            onPress={() => navigation.navigate('AdminPetDetail', { id: pet.id })}
          />
        ))
      )}
    </MobileShell>
  );
}
