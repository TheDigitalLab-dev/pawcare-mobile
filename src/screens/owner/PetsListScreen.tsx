import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Avatar, EmptyState, Fab, SearchBar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { formatDate, mockPets } from '@/data/mock';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function PetsListScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');

  const pets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockPets;
    return mockPets.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Mis mascotas" />}
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          icon="add"
          accessibilityLabel="Agregar mascota"
          onPress={() => navigation.navigate('PetForm', {})}
        />
      }
    >
      <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar mascota…" />

      {pets.length === 0 ? (
        <EmptyState
          icon="paw"
          title="Sin mascotas"
          description="No se encontraron mascotas."
        />
      ) : (
        <View style={{ gap: 8 }}>
          {pets.map((pet) => (
            <ListRow
              key={pet.id}
              title={pet.name}
              subtitle={`${SPECIES_LABEL[pet.species]}${pet.breed ? ` · ${pet.breed}` : ''}${pet.birth_date ? ` · Nac. ${formatDate(pet.birth_date)}` : ''}`}
              leading={
                <Avatar uri={pet.photo_url} fallback={SPECIES_EMOJI[pet.species]} />
              }
              onPress={() => navigation.navigate('PetDetail', { id: pet.id })}
            />
          ))}
        </View>
      )}
    </MobileShell>
  );
}
