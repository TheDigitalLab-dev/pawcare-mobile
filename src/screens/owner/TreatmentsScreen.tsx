import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, Card, EmptyState, InfoBanner } from '@/components/ui';
import { useTreatments } from '@/hooks/useTreatments';
import type { ActiveTreatment } from '@/services/treatments';
import { formatDate } from '@/utils/format';

/** Ajustes rápidos de la próxima toma (minutos): evitan la toma de medianoche. */
const SHIFTS: { label: string; minutes: number }[] = [
  { label: '−2 h', minutes: -120 },
  { label: '−1 h', minutes: -60 },
  { label: '−30 m', minutes: -30 },
  { label: '+30 m', minutes: 30 },
  { label: '+1 h', minutes: 60 },
  { label: '+2 h', minutes: 120 },
];

function formatDoseTime(iso: string): string {
  const time = new Date(iso).toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formatDate(iso)} · ${time}`;
}

function TreatmentCard({
  treatment,
  onTaken,
  onShift,
  onFinish,
}: {
  treatment: ActiveTreatment;
  onTaken: (t: ActiveTreatment) => void;
  onShift: (t: ActiveTreatment, minutes: number) => void;
  onFinish: (t: ActiveTreatment) => void;
}) {
  const { colors } = useTheme();
  const subtitle = [
    treatment.petName,
    treatment.dose,
    `cada ${treatment.frequencyHours} h`,
    `${treatment.durationDays} días`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          💊 {treatment.medicationName}
        </Text>
        <Badge
          variant="outline"
          label={`${treatment.takenCount}/${treatment.totalCount} tomas`}
        />
      </View>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{subtitle}</Text>

      {treatment.nextDose ? (
        <>
          <Text style={{ fontSize: 14, color: colors.foreground }}>
            Próxima toma:{' '}
            <Text style={{ fontWeight: '700' }}>
              {formatDoseTime(treatment.nextDose.scheduledAt)}
            </Text>
          </Text>
          <View style={styles.shiftRow}>
            {SHIFTS.map((s) => (
              <Button
                key={s.label}
                label={s.label}
                variant="outline"
                size="sm"
                onPress={() => onShift(treatment, s.minutes)}
              />
            ))}
          </View>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            Al mover la próxima toma, las siguientes se desplazan igual (los intervalos se
            conservan).
          </Text>
        </>
      ) : null}

      <View style={styles.actionsRow}>
        <View style={styles.actionGrow}>
          <Button
            label="Administrado ✓"
            fullWidth
            disabled={!treatment.nextDose}
            onPress={() => onTaken(treatment)}
          />
        </View>
        <Button label="Finalizar" variant="outline" onPress={() => onFinish(treatment)} />
      </View>
    </Card>
  );
}

export function TreatmentsScreen() {
  const navigation = useNavigation();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;
  const { treatments, permissionDenied, markTaken, moveNextDose, finish } =
    useTreatments();

  const onTaken = useCallback((t: ActiveTreatment) => void markTaken(t), [markTaken]);
  const onShift = useCallback(
    (t: ActiveTreatment, minutes: number) => void moveNextDose(t, minutes),
    [moveNextDose],
  );
  const onFinish = useCallback((t: ActiveTreatment) => void finish(t), [finish]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ActiveTreatment>) => (
      <TreatmentCard
        treatment={item}
        onTaken={onTaken}
        onShift={onShift}
        onFinish={onFinish}
      />
    ),
    [onTaken, onShift, onFinish],
  );

  return (
    <MobileShell
      header={<AppHeader title="Tratamientos" onBack={back} />}
      contentStyle={styles.content}
    >
      {permissionDenied ? (
        <InfoBanner
          tone="warning"
          message="Sin permiso de notificaciones las alarmas no sonarán; las tomas igual quedan registradas. Puedes activarlo en los ajustes del teléfono."
        />
      ) : null}
      {treatments.length === 0 ? (
        <EmptyState
          icon="alarm"
          title="Sin tratamientos activos"
          description="Inicia un tratamiento desde la receta de una consulta y las alarmas de cada toma sonarán en este teléfono, incluso sin conexión."
        />
      ) : (
        <FlatList
          data={treatments}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 8 },
  list: { flex: 1 },
  listContent: { gap: 12, paddingBottom: 32 },
  card: { gap: 8 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  shiftRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  actionGrow: { flex: 1 },
});
