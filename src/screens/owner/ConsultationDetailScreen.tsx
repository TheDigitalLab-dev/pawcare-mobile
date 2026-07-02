import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { AsyncBoundary, Button, Card, SectionTitle } from '@/components/ui';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { useAsync } from '@/hooks/useAsync';
import { listConsultations } from '@/services/medical';
import { formatDate } from '@/utils/format';
import type { Consultation } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

function Field({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontSize: 15, color: colors.foreground }}>{value}</Text>
    </View>
  );
}

function Body({ consultation, petId }: { consultation: Consultation; petId: number }) {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const vitals = [
    consultation.weight != null ? `Peso: ${consultation.weight} kg` : null,
    consultation.temperature != null ? `Temp: ${consultation.temperature}°` : null,
    consultation.heart_rate != null ? `FC: ${consultation.heart_rate}` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <>
      <Card style={{ gap: 10 }}>
        <Field label="Fecha" value={formatDate(consultation.consultation_date)} />
        <Field label="Veterinario" value={consultation.veterinarian.full_name} />
        {consultation.diagnosis ? (
          <Field label="Diagnóstico" value={consultation.diagnosis} />
        ) : null}
        {consultation.treatment ? (
          <Field label="Tratamiento" value={consultation.treatment} />
        ) : null}
        {vitals ? <Field label="Signos vitales" value={vitals} /> : null}
        {consultation.notes ? <Field label="Notas" value={consultation.notes} /> : null}
      </Card>

      {consultation.prescriptions.length > 0 ? (
        <>
          <SectionTitle>Recetas</SectionTitle>
          {consultation.prescriptions.map((p) => (
            <Card key={p.id} style={{ gap: 6 }}>
              {p.diagnosis ? (
                <Text style={{ fontWeight: '600', color: colors.foreground }}>
                  {p.diagnosis}
                </Text>
              ) : null}
              {p.items.map((it) => (
                <Text key={it.id} style={{ fontSize: 14, color: colors.foreground }}>
                  • {it.medication_name}
                  {it.dose ? ` — ${it.dose}` : ''}
                  {it.frequency ? `, ${it.frequency}` : ''}
                  {it.duration ? `, ${it.duration}` : ''}
                </Text>
              ))}
            </Card>
          ))}
        </>
      ) : null}

      {consultation.lab_exams.length > 0 ? (
        <Button
          label={`Ver exámenes de laboratorio (${consultation.lab_exams.length})`}
          variant="outline"
          fullWidth
          onPress={() =>
            navigation.navigate('LabExams', { petId, consultationId: consultation.id })
          }
        />
      ) : null}
    </>
  );
}

export function ConsultationDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'ConsultationDetail'>>();
  const { petId, id } = route.params;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const { data, loading, error, reload } = useAsync(() => listConsultations(petId));
  const consultation = (data ?? []).find((c) => c.id === id) ?? null;

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Consulta" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <AsyncBoundary
        loading={loading && data === null}
        error={error}
        onRetry={reload}
        empty={data !== null && consultation === null}
        emptyIcon="document-text"
        emptyTitle="Consulta no encontrada"
      >
        {consultation ? <Body consultation={consultation} petId={petId} /> : null}
      </AsyncBoundary>
    </MobileShell>
  );
}
