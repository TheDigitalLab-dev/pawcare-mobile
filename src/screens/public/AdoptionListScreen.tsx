import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Avatar, FilterChips, ListRow } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { listAdoptionPets } from '@/services/public';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';
import type { PublicStackParamList } from '@/navigation/types';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'dog', label: 'Perros' },
  { id: 'cat', label: 'Gatos' },
];

export function AdoptionListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PublicStackParamList>>();
  const [filter, setFilter] = useState('all');
  const { data, loading, error, reload } = useAsync(() => listAdoptionPets());

  const pets = (data ?? []).filter((p) => filter === 'all' || p.species === filter);

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

      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={pets.length === 0}
        emptyIcon="paw"
        emptyTitle="Sin mascotas"
        emptyDescription="No hay mascotas en adopción disponibles ahora."
      >
        {pets.map((pet) => (
          <ListRow
            key={pet.id}
            title={pet.name}
            subtitle={[SPECIES_LABEL[pet.species], pet.breed, pet.age_display]
              .filter(Boolean)
              .join(' · ')}
            leading={
              <Avatar
                uri={pet.photo_url ?? undefined}
                fallback={SPECIES_EMOJI[pet.species]}
                size="md"
              />
            }
            onPress={() => navigation.navigate('AdoptionDetail', { id: pet.id })}
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
