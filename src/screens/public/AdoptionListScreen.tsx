import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Avatar, FilterChips, ListRow } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { listAdoptionPets } from '@/services/public';
import { SPECIES_EMOJI, SPECIES_LABEL, type AdoptionPet } from '@/types/models';
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

  const pets = useMemo(
    () => (data ?? []).filter((p) => filter === 'all' || p.species === filter),
    [data, filter],
  );

  const renderItem = useCallback(
    ({ item: pet }: ListRenderItemInfo<AdoptionPet>) => (
      <ListRow
        title={pet.name}
        subtitle={[SPECIES_LABEL[pet.species], pet.breed, pet.age_display]
          .filter(Boolean)
          .join(' · ')}
        leading={() => (
          <Avatar
            uri={pet.photo_url ?? undefined}
            fallback={SPECIES_EMOJI[pet.species]}
            size="md"
          />
        )}
        onPress={() => navigation.navigate('AdoptionDetail', { id: pet.id })}
      />
    ),
    [navigation],
  );

  return (
    <MobileShell
      header={
        <AppHeader
          title="En adopción"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={styles.content}
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
        <FlatList
          data={pets}
          keyExtractor={(pet) => String(pet.id)}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </AsyncBoundary>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  list: { flex: 1 },
  listContent: { gap: 12 },
});
