import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, Card, EmptyState, SectionTitle } from '@/components/ui';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { formatDateTime, mockConsultations } from '@/data/mock';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

export function ConsultationDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'ConsultationDetail'>>();
  const consultation = mockConsultations.find((c) => c.id === route.params.id);
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [completed, setCompleted] = useState(
    consultation?.treatment_completed_at != null,
  );

  if (!consultation) {
    return (
      <MobileShell header={<AppHeader title="Consulta" onBack={back} />}>
        <EmptyState icon="document-text" title="Consulta no encontrada" />
      </MobileShell>
    );
  }

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Consulta" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <Card style={{ gap: 8 }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
          {formatDateTime(consultation.consultation_date)}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
          {consultation.diagnosis ?? 'Sin diagnóstico'}
        </Text>
        {consultation.vet_name ? (
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            {consultation.vet_name}
          </Text>
        ) : null}
        <Badge
          label={completed ? 'Tratamiento completado' : 'Tratamiento en curso'}
          variant={completed ? 'success' : 'warning'}
        />
      </Card>

      <SectionTitle>Tratamiento</SectionTitle>
      <Card>
        <Text style={{ fontSize: 15, color: colors.foreground }}>
          {consultation.treatment ?? 'Sin tratamiento indicado.'}
        </Text>
      </Card>

      <SectionTitle>Signos vitales</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Peso</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
            {consultation.weight != null ? `${consultation.weight} kg` : '—'}
          </Text>
        </Card>
        <Card style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Temperatura</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
            {consultation.temperature != null ? `${consultation.temperature} °C` : '—'}
          </Text>
        </Card>
      </View>

      <Button
        label="Exportar receta"
        variant="outline"
        fullWidth
        // TODO: exportar receta a PDF
        onPress={() => undefined}
        style={{ marginTop: 8 }}
      />
      {!completed ? (
        <Button
          label="Marcar tratamiento completado"
          fullWidth
          // TODO: marcar tratamiento completado en el backend
          onPress={() => setCompleted(true)}
        />
      ) : null}
    </MobileShell>
  );
}
