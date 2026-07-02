import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import {
  AsyncBoundary,
  Button,
  FilterChips,
  InfoBanner,
  SectionTitle,
  TextField,
} from '@/components/ui';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { createAdminAdoption, listAdminOwners, type AdminOwner } from '@/services/admin';
import { listAdoptionPets } from '@/services/public';
import { ApiError } from '@/types/api';
import type { AdoptionPet } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;

function todayDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function ownerLabel(o: AdminOwner): string {
  return o.full_name ?? `${o.first_name} ${o.last_name}`.trim();
}

function AdoptionForm({ pets, owners }: { pets: AdoptionPet[]; owners: AdminOwner[] }) {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [petId, setPetId] = useState<number | undefined>(pets[0]?.id);
  const [adopterId, setAdopterId] = useState<number | undefined>(owners[0]?.id);
  const [date, setDate] = useState(() => todayDate());
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const canSubmit =
    petId !== undefined &&
    adopterId !== undefined &&
    date.trim().length > 0 &&
    !submitting;

  const labelStyle = {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.foreground,
    marginBottom: 6,
  };

  const onSubmit = async () => {
    if (petId === undefined || adopterId === undefined) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await createAdminAdoption({
        pet_id: petId,
        adopter_id: adopterId,
        adoption_date: date.trim(),
        notes: notes.trim() || undefined,
      });
      back?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo registrar la adopción.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error ? <InfoBanner tone="destructive" message={error} /> : null}

      <View>
        <Text style={labelStyle}>Mascota en adopción</Text>
        <FilterChips
          options={pets.map((p) => ({ id: String(p.id), label: p.name }))}
          selectedId={petId !== undefined ? String(petId) : ''}
          onSelect={(id) => setPetId(Number(id))}
        />
      </View>

      <SectionTitle>Adoptante</SectionTitle>
      <FilterChips
        options={owners.map((o) => ({ id: String(o.id), label: ownerLabel(o) }))}
        selectedId={adopterId !== undefined ? String(adopterId) : ''}
        onSelect={(id) => setAdopterId(Number(id))}
      />

      <TextField
        label="Fecha de adopción"
        value={date}
        onChangeText={setDate}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
      />
      <TextField label="Notas" value={notes} onChangeText={setNotes} multiline />

      <Button
        label="Registrar adopción"
        fullWidth
        loading={submitting}
        disabled={!canSubmit}
        onPress={onSubmit}
        style={{ marginTop: 8 }}
      />
    </>
  );
}

export function AdminAdoptionFormScreen() {
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const pets = useAsync(() => listAdoptionPets());
  const owners = useAsync(() => listAdminOwners());

  const loading =
    (pets.loading && pets.data === null) || (owners.loading && owners.data === null);
  const ready = pets.data !== null && owners.data !== null;

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Nueva adopción" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading}
        error={pets.error ?? owners.error}
        onRetry={() => {
          pets.reload();
          owners.reload();
        }}
        empty={ready && (pets.data ?? []).length === 0}
        emptyIcon="paw"
        emptyTitle="Sin mascotas en adopción"
        emptyDescription="No hay mascotas disponibles para adopción."
      >
        {ready ? <AdoptionForm pets={pets.data!} owners={owners.data!} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
