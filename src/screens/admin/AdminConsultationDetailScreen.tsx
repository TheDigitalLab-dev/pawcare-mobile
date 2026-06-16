import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Alert, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, EmptyState } from '@/components/ui';
import { DetailHero, ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { formatDateTime, mockConsultations } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;
type Rt = RouteProp<AdminMoreStackParamList, 'AdminConsultationDetail'>;

export function AdminConsultationDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const consultation = mockConsultations.find((c) => c.id === params.id);

  const onDelete = () => {
    Alert.alert(
      'Eliminar consulta',
      '¿Seguro que deseas eliminar esta consulta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => (navigation.canGoBack() ? navigation.goBack() : undefined),
        },
      ],
    );
  };

  if (!consultation) {
    return (
      <MobileShell
        header={
          <AppHeader
            title="Consulta"
            onBack={navigation.canGoBack() ? navigation.goBack : undefined}
          />
        }
      >
        <EmptyState
          icon="medkit"
          title="Consulta no encontrada"
          description="No existe una consulta con ese identificador."
        />
      </MobileShell>
    );
  }

  const completed = !!consultation.treatment_completed_at;

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Consulta"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <DetailHero
        title={consultation.diagnosis ?? 'Consulta'}
        subtitle={formatDateTime(consultation.consultation_date)}
      >
        <Badge
          label={completed ? 'Tratamiento completado' : 'En curso'}
          variant={completed ? 'success' : 'warning'}
        />
      </DetailHero>

      <ListRow title="Veterinario" subtitle={consultation.veterinarian.full_name} />
      <ListRow
        title="Tratamiento"
        subtitle={consultation.treatment ?? 'Sin tratamiento'}
      />
      <ListRow title="Peso" subtitle={`${consultation.weight ?? '—'} kg`} />
      <ListRow title="Temperatura" subtitle={`${consultation.temperature ?? '—'} °C`} />
      <ListRow title="Notas" subtitle={consultation.notes ?? 'Sin notas'} />

      <ListRow
        title="Recetas"
        onPress={() =>
          navigation.navigate('AdminPrescriptions', {
            consultationId: consultation.id,
          })
        }
      />
      <ListRow
        title="Exámenes de laboratorio"
        onPress={() =>
          navigation.navigate('AdminLabExams', {
            consultationId: consultation.id,
          })
        }
      />

      <View style={{ gap: 8, marginTop: 8 }}>
        {/* No-op: sin backend. */}
        <Button
          label="Exportar receta"
          variant="secondary"
          fullWidth
          onPress={() => {}}
        />
        <Button
          label="Completar tratamiento"
          variant="primary"
          fullWidth
          disabled={completed}
          onPress={() => {}}
        />
        <Button
          label="Eliminar consulta"
          variant="destructive"
          fullWidth
          onPress={onDelete}
        />
      </View>
    </MobileShell>
  );
}
