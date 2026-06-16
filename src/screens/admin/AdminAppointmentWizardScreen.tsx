import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, FilterChips, InfoBanner, SectionTitle } from '@/components/ui';
import { StepIndicator, ListRow } from '@/components/domain';
import type { AdminAgendaStackParamList } from '@/navigation/types';
import { mockServices, mockStaff } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminAgendaStackParamList>;

const STEP_LABELS = ['Día', 'Veterinario', 'Hora', 'Confirmar'];

const DAY_OPTIONS = [
  { id: '2026-06-15', label: 'Lun 15' },
  { id: '2026-06-16', label: 'Mar 16' },
  { id: '2026-06-17', label: 'Mié 17' },
];
const VET_OPTIONS = [
  { id: String(mockStaff.id), label: mockStaff.full_name ?? mockStaff.first_name },
  { id: 'vet-2', label: 'Dra. Ana López' },
];
const TIME_OPTIONS = [
  { id: '09:00', label: '09:00' },
  { id: '10:30', label: '10:30' },
  { id: '14:00', label: '14:00' },
];

export function AdminAppointmentWizardScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  const [step, setStep] = useState(0);
  const [day, setDay] = useState(DAY_OPTIONS[0]?.id ?? '');
  const [vet, setVet] = useState(VET_OPTIONS[0]?.id ?? '');
  const [time, setTime] = useState(TIME_OPTIONS[0]?.id ?? '');

  const vetLabel = VET_OPTIONS.find((v) => v.id === vet)?.label ?? '—';
  const dayLabel = DAY_OPTIONS.find((d) => d.id === day)?.label ?? '—';
  const isLast = step === STEP_LABELS.length - 1;

  const onNext = () => {
    if (isLast) {
      if (navigation.canGoBack()) navigation.goBack();
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Nueva cita"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <StepIndicator steps={STEP_LABELS.length} current={step} labels={STEP_LABELS} />

      {step === 0 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Selecciona el día</SectionTitle>
          <FilterChips options={DAY_OPTIONS} selectedId={day} onSelect={setDay} />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Selecciona el veterinario</SectionTitle>
          <FilterChips options={VET_OPTIONS} selectedId={vet} onSelect={setVet} />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Selecciona la hora</SectionTitle>
          <FilterChips options={TIME_OPTIONS} selectedId={time} onSelect={setTime} />
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Confirma los datos</SectionTitle>
          <InfoBanner message="Revisa antes de agendar la cita." tone="info" />
          <ListRow title="Día" subtitle={dayLabel} />
          <ListRow title="Veterinario" subtitle={vetLabel} />
          <ListRow title="Hora" subtitle={time} />
          <ListRow
            title="Servicio sugerido"
            subtitle={mockServices[0]?.name ?? 'Consulta general'}
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        {step > 0 ? (
          <Button
            label="Atrás"
            variant="outline"
            onPress={() => setStep((s) => Math.max(0, s - 1))}
            style={{ flex: 1 }}
          />
        ) : null}
        <Button
          label={isLast ? 'Agendar cita' : 'Siguiente'}
          onPress={onNext}
          style={{ flex: 1 }}
        />
      </View>

      <Text style={[styles.helper, { color: colors.mutedForeground }]}>
        Paso {step + 1} de {STEP_LABELS.length}
      </Text>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  helper: { fontSize: 12, textAlign: 'center' },
});
