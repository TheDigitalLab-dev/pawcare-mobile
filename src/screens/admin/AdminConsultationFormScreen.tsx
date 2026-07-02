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
  SectionTitle,
  TextField,
} from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { createAdminConsultation, listAdminPets } from '@/services/admin';
import { ApiError } from '@/types/api';
import type { Pet } from '@/types/models';

function todayDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function ConsultationForm({ pets }: { pets: Pet[] }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [form, setForm] = useState({
    petId: pets[0]?.id,
    date: todayDate(),
    diagnosis: '',
    treatment: '',
    notes: '',
    weight: '',
    temperature: '',
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const canSubmit =
    form.petId !== undefined && form.date.trim().length > 0 && !submitting;
  const labelStyle = {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.foreground,
  };

  const onSubmit = async () => {
    if (form.petId === undefined) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await createAdminConsultation({
        pet_id: form.petId,
        consultation_date: form.date.trim(),
        diagnosis: form.diagnosis.trim() || undefined,
        treatment: form.treatment.trim() || undefined,
        notes: form.notes.trim() || undefined,
        weight: form.weight.trim() ? Number(form.weight) : undefined,
        temperature: form.temperature.trim() ? Number(form.temperature) : undefined,
      });
      if (back) back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo registrar la consulta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error ? <InfoBanner tone="destructive" message={error} /> : null}

      <View>
        <Text style={labelStyle}>Mascota</Text>
        <FilterChips
          options={pets.map((p) => ({ id: String(p.id), label: p.name }))}
          selectedId={form.petId !== undefined ? String(form.petId) : ''}
          onSelect={(id) => set('petId', Number(id))}
        />
      </View>

      <TextField
        label="Fecha"
        value={form.date}
        onChangeText={(v) => set('date', v)}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      <SectionTitle>Datos clínicos</SectionTitle>
      <TextField
        label="Diagnóstico"
        value={form.diagnosis}
        onChangeText={(v) => set('diagnosis', v)}
        multiline
      />
      <TextField
        label="Tratamiento"
        value={form.treatment}
        onChangeText={(v) => set('treatment', v)}
        multiline
      />
      <TextField
        label="Notas"
        value={form.notes}
        onChangeText={(v) => set('notes', v)}
        multiline
      />
      <TextField
        label="Peso (kg)"
        value={form.weight}
        onChangeText={(v) => set('weight', v)}
        keyboardType="decimal-pad"
      />
      <TextField
        label="Temperatura (°C)"
        value={form.temperature}
        onChangeText={(v) => set('temperature', v)}
        keyboardType="decimal-pad"
      />

      <Button
        label="Registrar consulta"
        fullWidth
        loading={submitting}
        disabled={!canSubmit}
        onPress={onSubmit}
        style={{ marginTop: 8 }}
      />
    </>
  );
}

export function AdminConsultationFormScreen() {
  const navigation = useNavigation();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;
  const { data, loading, error, reload } = useAsync(() => listAdminPets());

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Nueva consulta" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={(data ?? []).length === 0}
        emptyIcon="paw"
        emptyTitle="Sin pacientes"
        emptyDescription="Registra un paciente antes de crear consultas."
      >
        {data ? <ConsultationForm pets={data} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
