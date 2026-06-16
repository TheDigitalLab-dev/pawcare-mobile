import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Avatar, Button, FilterChips, SectionTitle } from '@/components/ui';
import { ListRow, StepIndicator } from '@/components/domain';
import type { OwnerAppointmentsStackParamList } from '@/navigation/types';
import { mockPets, mockServices } from '@/data/mock';
import { SPECIES_EMOJI, SPECIES_LABEL } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerAppointmentsStackParamList>;

const STEP_LABELS = ['Mascota', 'Veterinario', 'Día', 'Hora'];

const VETS = [
  { id: 'v1', label: 'Dr. Carlos Pérez', specialty: 'Medicina general' },
  { id: 'v2', label: 'Dra. Ana López', specialty: 'Cirugía' },
];

const DAYS = [
  { id: '2026-06-16', label: 'Lun 16 jun' },
  { id: '2026-06-17', label: 'Mar 17 jun' },
  { id: '2026-06-18', label: 'Mié 18 jun' },
];

const HOURS = [
  { id: '09:00', label: '09:00' },
  { id: '10:30', label: '10:30' },
  { id: '14:00', label: '14:00' },
  { id: '16:30', label: '16:30' },
];

export function AppointmentWizardScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [step, setStep] = useState(0);
  const [petId, setPetId] = useState<number | undefined>(undefined);
  const [vetId, setVetId] = useState<string | undefined>(undefined);
  const [day, setDay] = useState<string | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>(undefined);

  const firstVet = VETS[0];
  const firstService = mockServices[0];

  const canAdvance =
    (step === 0 && petId !== undefined) ||
    (step === 1 && vetId !== undefined) ||
    (step === 2 && day !== undefined) ||
    (step === 3 && hour !== undefined);

  const isLast = step === STEP_LABELS.length - 1;

  const onNext = () => {
    if (isLast) {
      // TODO: crear cita en el backend
      back?.();
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Agendar cita" onBack={back} />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <StepIndicator steps={STEP_LABELS.length} current={step} labels={STEP_LABELS} />

      {step === 0 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige la mascota</SectionTitle>
          {mockPets.map((pet) => (
            <ListRow
              key={pet.id}
              title={pet.name}
              subtitle={SPECIES_LABEL[pet.species]}
              leading={
                <Avatar uri={pet.photo_url} fallback={SPECIES_EMOJI[pet.species]} />
              }
              showChevron={false}
              trailing={
                petId === pet.id ? (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>
                ) : undefined
              }
              onPress={() => setPetId(pet.id)}
            />
          ))}
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige el veterinario</SectionTitle>
          {VETS.map((v) => (
            <ListRow
              key={v.id}
              title={v.label}
              subtitle={v.specialty}
              showChevron={false}
              trailing={
                vetId === v.id ? (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>
                ) : undefined
              }
              onPress={() => setVetId(v.id)}
            />
          ))}
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige el día</SectionTitle>
          <FilterChips options={DAYS} selectedId={day ?? ''} onSelect={setDay} />
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Elige la hora</SectionTitle>
          <FilterChips options={HOURS} selectedId={hour ?? ''} onSelect={setHour} />
          {firstService ? (
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              Servicio: {firstService.name}
              {firstVet && vetId
                ? ` · ${VETS.find((v) => v.id === vetId)?.label ?? firstVet.label}`
                : ''}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        {step > 0 ? (
          <Button
            label="Atrás"
            variant="outline"
            onPress={() => setStep((s) => Math.max(0, s - 1))}
            style={{ flex: 1 }}
          />
        ) : null}
        <Button
          label={isLast ? 'Confirmar' : 'Siguiente'}
          disabled={!canAdvance}
          onPress={onNext}
          style={{ flex: 1 }}
        />
      </View>
    </MobileShell>
  );
}
