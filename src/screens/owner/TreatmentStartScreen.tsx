import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, Card, InfoBanner, TextField } from '@/components/ui';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useTreatments } from '@/hooks/useTreatments';
import { parseDurationDays, parseFrequencyHours } from '@/utils/treatmentSchedule';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

/**
 * Confirmación de "Tratamiento iniciado": la primera toma se ancla al momento en
 * que el dueño pulsa el botón y las alarmas locales quedan programadas (suenan
 * aunque no haya conexión). La frecuencia/duración vienen pre-llenadas desde el
 * texto de la receta cuando se pueden interpretar.
 */
export function TreatmentStartScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'TreatmentStart'>>();
  const params = route.params;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { start } = useTreatments();
  const [frequency, setFrequency] = useState(
    () => parseFrequencyHours(params.frequency)?.toString() ?? '',
  );
  const [duration, setDuration] = useState(
    () => parseDurationDays(params.duration)?.toString() ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frequencyHours = Number(frequency);
  const durationDays = Number(duration);
  const frequencyValid = Number.isInteger(frequencyHours) && frequencyHours > 0;
  const durationValid = Number.isInteger(durationDays) && durationDays > 0;

  const receta = [params.dose, params.frequency, params.duration]
    .filter(Boolean)
    .join(' · ');

  async function onStart() {
    setSaving(true);
    setError(null);
    try {
      await start({
        petId: params.petId,
        petName: params.petName ?? null,
        prescriptionItemId: params.prescriptionItemId ?? null,
        medicationName: params.medicationName,
        dose: params.dose ?? null,
        frequencyHours,
        durationDays,
      });
      navigation.replace('Treatments');
    } catch {
      setError('No se pudo iniciar el tratamiento. Revisa los datos.');
      setSaving(false);
    }
  }

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Iniciar tratamiento" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <Card style={{ gap: 6 }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.foreground }}>
          💊 {params.medicationName}
        </Text>
        {receta ? (
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            Receta: {receta}
          </Text>
        ) : null}
        {params.petName ? (
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            Para {params.petName}
          </Text>
        ) : null}
      </Card>

      <InfoBanner
        tone="info"
        message="La primera toma se ancla al momento en que pulses «Tratamiento iniciado». Las alarmas sonarán en este teléfono aunque no tengas conexión, y después podrás mover cualquier toma para ajustar el horario."
      />

      <TextField
        label="Frecuencia (horas entre tomas)"
        value={frequency}
        onChangeText={setFrequency}
        keyboardType="number-pad"
        placeholder="8"
        error={
          frequency.length > 0 && !frequencyValid
            ? 'Indica un número de horas mayor que cero.'
            : undefined
        }
        hint={!params.frequency ? undefined : `La receta dice: ${params.frequency}`}
      />
      <TextField
        label="Duración (días)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        placeholder="7"
        error={
          duration.length > 0 && !durationValid
            ? 'Indica un número de días mayor que cero.'
            : undefined
        }
        hint={!params.duration ? undefined : `La receta dice: ${params.duration}`}
      />

      {error ? <InfoBanner tone="destructive" message={error} /> : null}

      <View style={{ marginTop: 4 }}>
        <Button
          label={saving ? 'Iniciando…' : 'Tratamiento iniciado'}
          fullWidth
          disabled={!frequencyValid || !durationValid || saving}
          onPress={onStart}
        />
      </View>
    </MobileShell>
  );
}
