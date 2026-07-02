import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Avatar, Fab, SearchBar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listPets } from '@/services/pets';
import { formatDate } from '@/utils/format';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function PetsListScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useAsync(listPets);

  // Refresca al volver a la pantalla (p. ej. tras crear/editar una mascota).
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
  }, [data, query]);

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

      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={filtered.length === 0}
        emptyIcon="paw"
        emptyTitle={query ? 'Sin resultados' : 'Aún no tienes mascotas'}
        emptyDescription={
          query ? 'Prueba con otro nombre.' : 'Agrega tu primera mascota con el botón +.'
        }
      >
        <View style={{ gap: 8 }}>
          {filtered.map((pet) => (
            <ListRow
              key={pet.id}
              title={pet.name}
              subtitle={`${SPECIES_LABEL[pet.species]}${pet.breed ? ` · ${pet.breed}` : ''}${
                pet.birth_date ? ` · Nac. ${formatDate(pet.birth_date)}` : ''
              }`}
              leading={
                <Avatar
                  uri={pet.photo_url ?? undefined}
                  fallback={SPECIES_EMOJI[pet.species]}
                />
              }
              onPress={() => navigation.navigate('PetDetail', { id: pet.id })}
            />
          ))}
        </View>
      </AsyncBoundary>
    </MobileShell>
  );
}
