import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import {
  AsyncBoundary,
  Button,
  FilterChips,
  InfoBanner,
  TextField,
} from '@/components/ui';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import {
  createAdminPet,
  getAdminPet,
  listAdminOwners,
  updateAdminPet,
  type AdminOwner,
} from '@/services/admin';
import { ApiError } from '@/types/api';
import {
  PET_SEX_LABEL,
  SPECIES_LABEL,
  type Pet,
  type PetSex,
  type Species,
} from '@/types/models';

type Rt = RouteProp<AdminPatientsStackParamList, 'AdminPetForm'>;

const SPECIES_OPTIONS = (Object.keys(SPECIES_LABEL) as Species[]).map((id) => ({
  id,
  label: SPECIES_LABEL[id],
}));
const SEX_OPTIONS = (Object.keys(PET_SEX_LABEL) as PetSex[]).map((id) => ({
  id,
  label: PET_SEX_LABEL[id],
}));

function PetForm({ owners, existing }: { owners: AdminOwner[]; existing?: Pet }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;
  const editing = existing !== undefined;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    species: (existing?.species ?? 'dog') as Species,
    breed: existing?.breed ?? '',
    sex: (existing?.sex ?? 'male') as PetSex,
    birth_date: existing?.birth_date ?? '',
    distinctive_features: existing?.distinctive_features ?? '',
    proprietary_id: existing?.proprietary_id ?? owners[0]?.id,
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const canSubmit =
    form.name.trim().length > 0 && form.proprietary_id !== undefined && !submitting;
  const labelStyle = {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.foreground,
  };

  const onSubmit = async () => {
    if (form.proprietary_id === undefined) return;
    setSubmitting(true);
    setError(undefined);
    const input = {
      name: form.name.trim(),
      species: form.species,
      sex: form.sex,
      breed: form.breed.trim() || undefined,
      birth_date: form.birth_date.trim() || undefined,
      distinctive_features: form.distinctive_features.trim() || undefined,
      proprietary_id: form.proprietary_id,
    };
    try {
      if (existing) {
        await updateAdminPet(existing.id, input);
      } else {
        await createAdminPet(input);
      }
      if (back) back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar el paciente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error ? <InfoBanner tone="destructive" message={error} /> : null}

      <View>
        <Text style={labelStyle}>Dueño</Text>
        <FilterChips
          options={owners.map((o) => ({
            id: String(o.id),
            label: o.full_name ?? `${o.first_name} ${o.last_name}`,
          }))}
          selectedId={
            form.proprietary_id !== undefined ? String(form.proprietary_id) : ''
          }
          onSelect={(id) => set('proprietary_id', Number(id))}
        />
      </View>

      <TextField
        label="Nombre"
        value={form.name}
        onChangeText={(v) => set('name', v)}
        autoCapitalize="words"
      />

      <View>
        <Text style={labelStyle}>Especie</Text>
        <FilterChips
          options={SPECIES_OPTIONS}
          selectedId={form.species}
          onSelect={(id) => set('species', id as Species)}
        />
      </View>

      <TextField
        label="Raza"
        value={form.breed}
        onChangeText={(v) => set('breed', v)}
        autoCapitalize="words"
      />

      <View>
        <Text style={labelStyle}>Sexo</Text>
        <FilterChips
          options={SEX_OPTIONS}
          selectedId={form.sex}
          onSelect={(id) => set('sex', id as PetSex)}
        />
      </View>

      <TextField
        label="Fecha de nacimiento"
        value={form.birth_date}
        onChangeText={(v) => set('birth_date', v)}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
      />
      <TextField
        label="Características distintivas"
        value={form.distinctive_features}
        onChangeText={(v) => set('distinctive_features', v)}
        multiline
      />

      <Button
        label={editing ? 'Guardar cambios' : 'Crear paciente'}
        fullWidth
        loading={submitting}
        disabled={!canSubmit}
        onPress={onSubmit}
        style={{ marginTop: 8 }}
      />
    </>
  );
}

export function AdminPetFormScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<Rt>();
  const editingId = params.id;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const owners = useAsync(() => listAdminOwners());
  const pet = useAsync(() =>
    editingId !== undefined ? getAdminPet(editingId) : Promise.resolve(null),
  );

  const loading =
    (owners.loading && owners.data === null) || (pet.loading && pet.data === null);
  const error = owners.error ?? pet.error;

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title={editingId !== undefined ? 'Editar paciente' : 'Nuevo paciente'}
          onBack={back}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={() => {
          void owners.reload();
          void pet.reload();
        }}
        empty={editingId !== undefined && !loading && pet.data === null}
        emptyIcon="paw"
        emptyTitle="Paciente no encontrado"
        emptyDescription="No se pudo cargar el paciente a editar."
      >
        {owners.data && (editingId === undefined || pet.data) ? (
          <PetForm owners={owners.data} existing={pet.data ?? undefined} />
        ) : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
