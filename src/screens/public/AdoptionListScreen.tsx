import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Avatar, EmptyState, FilterChips, ListRow } from '@/components';
import { mockAdoptionPets } from '@/data/mock';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';
import type { PublicStackParamList } from '@/navigation/types';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'dog', label: 'Perros' },
  { id: 'cat', label: 'Gatos' },
];

/** Listado de mascotas en adopción, filtrable por especie. */
export function AdoptionListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const [filter, setFilter] = useState('all');

  const pets = useMemo(() => {
    if (filter === 'all') return mockAdoptionPets;
    return mockAdoptionPets.filter((pet) => pet.species === filter);
  }, [filter]);

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="En adopción"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12 }}
    >
      <FilterChips options={FILTERS} selectedId={filter} onSelect={setFilter} />

      {pets.length === 0 ? (
        <EmptyState
          icon="paw"
          title="Sin mascotas"
          description="No hay mascotas de esta especie disponibles ahora."
        />
      ) : (
        pets.map((pet) => {
          const subtitleParts = [
            SPECIES_LABEL[pet.species],
            pet.breed,
            pet.age_label,
          ].filter(Boolean);
          return (
            <ListRow
              key={pet.id}
              title={pet.name}
              subtitle={subtitleParts.join(' · ')}
              leading={<Avatar fallback={SPECIES_EMOJI[pet.species]} size="md" />}
              onPress={() => navigation.navigate('AdoptionDetail', { id: pet.id })}
            />
          );
        })
      )}
    </MobileShell>
  );
}
