import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
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
import { useAsync } from '@/hooks/useAsync';
import { createAdminVaccination, listAdminPets } from '@/services/admin';
import { ApiError } from '@/types/api';
import type { Pet } from '@/types/models';

function todayDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function VaccinationForm({ pets }: { pets: Pet[] }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [form, setForm] = useState({
    petId: pets[0]?.id,
    vaccine_name: '',
    manufacturer: '',
    dose: '',
    application_date: todayDate(),
    next_due_date: '',
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const canSubmit =
    form.petId !== undefined &&
    form.vaccine_name.trim().length > 0 &&
    form.application_date.trim().length > 0 &&
    !submitting;

  const onSubmit = async () => {
    if (form.petId === undefined) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await createAdminVaccination({
        pet_id: form.petId,
        vaccine_name: form.vaccine_name.trim(),
        manufacturer: form.manufacturer.trim() || undefined,
        dose: form.dose.trim() || undefined,
        application_date: form.application_date.trim(),
        next_due_date: form.next_due_date.trim() || undefined,
      });
      if (back) back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo registrar la vacuna.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error ? <InfoBanner tone="destructive" message={error} /> : null}

      <View>
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground }}>
          Mascota
        </Text>
        <FilterChips
          options={pets.map((p) => ({ id: String(p.id), label: p.name }))}
          selectedId={form.petId !== undefined ? String(form.petId) : ''}
          onSelect={(id) => set('petId', Number(id))}
        />
      </View>

      <TextField
        label="Vacuna"
        value={form.vaccine_name}
        onChangeText={(v) => set('vaccine_name', v)}
      />
      <TextField
        label="Fabricante"
        value={form.manufacturer}
        onChangeText={(v) => set('manufacturer', v)}
      />
      <TextField label="Dosis" value={form.dose} onChangeText={(v) => set('dose', v)} />
      <TextField
        label="Fecha de aplicación"
        value={form.application_date}
        onChangeText={(v) => set('application_date', v)}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
      />
      <TextField
        label="Próxima dosis"
        value={form.next_due_date}
        onChangeText={(v) => set('next_due_date', v)}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      <Button
        label="Registrar vacuna"
        fullWidth
        loading={submitting}
        disabled={!canSubmit}
        onPress={onSubmit}
        style={{ marginTop: 8 }}
      />
    </>
  );
}

export function AdminVaccinationFormScreen() {
  const navigation = useNavigation();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;
  const { data, loading, error, reload } = useAsync(() => listAdminPets());

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Nueva vacuna" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={(data ?? []).length === 0}
        emptyIcon="paw"
        emptyTitle="Sin pacientes"
        emptyDescription="Registra un paciente antes de aplicar vacunas."
      >
        {data ? <VaccinationForm pets={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
