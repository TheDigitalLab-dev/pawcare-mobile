import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Fab, PetAvatar, SearchBar } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listAdminPets } from '@/services/admin';
import { formatDate } from '@/utils/format';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;

export function AdminPetsListScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useAsync(() => listAdminPets());

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const pets = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = data ?? [];
    return term
      ? list.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            (p.breed ?? '').toLowerCase().includes(term),
        )
      : list;
  }, [data, query]);

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

      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={pets.length === 0}
        emptyIcon="paw"
        emptyTitle="Sin pacientes"
        emptyDescription="No se encontraron mascotas con ese criterio."
      >
        {pets.map((pet) => (
          <ListRow
            key={pet.id}
            title={pet.name}
            subtitle={`${SPECIES_LABEL[pet.species]} · ${pet.breed ?? 'Sin raza'} · ${formatDate(pet.birth_date)}`}
            leading={<PetAvatar fallback={SPECIES_EMOJI[pet.species]} size="md" />}
            onPress={() => navigation.navigate('AdminPetDetail', { id: pet.id })}
          />
        ))}
      </AsyncBoundary>
    </MobileShell>
  );
}
