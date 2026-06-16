import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Badge, Button, EmptyState, Fab, InfoBanner, TextField } from '@/components/ui';
import { ListRow } from '@/components/domain';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { mockPrescriptions } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;
type Rt = RouteProp<AdminMoreStackParamList, 'AdminPrescriptions'>;

export function AdminPrescriptionsScreen() {
  const navigation = useNavigation<Nav>();
  useRoute<Rt>();

  const prescription = mockPrescriptions[0];
  const items = prescription?.items ?? [];

  const [showForm, setShowForm] = useState(false);
  const [medication, setMedication] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Recetas"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 96 }}
      fab={
        <Fab
          accessibilityLabel="Agregar medicamento"
          icon="add"
          onPress={() => setShowForm((v) => !v)}
        />
      }
    >
      {prescription?.general_instructions ? (
        <InfoBanner message={prescription.general_instructions} tone="info" />
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon="document-text"
          title="Sin medicamentos"
          description="Esta receta aún no tiene medicamentos."
        />
      ) : (
        items.map((item) => (
          <ListRow
            key={item.id}
            title={item.medication_name}
            subtitle={`${item.dose ?? ''} · ${item.frequency ?? ''} · ${item.duration ?? ''}`}
            trailing={
              item.completed_at ? (
                <Badge label="Tomado" variant="success" />
              ) : (
                <Badge label="Activo" variant="warning" />
              )
            }
          />
        ))
      )}

      {showForm ? (
        <View style={{ gap: 12, marginTop: 8 }}>
          <TextField
            label="Medicamento"
            value={medication}
            onChangeText={setMedication}
          />
          <TextField label="Dosis" value={dose} onChangeText={setDose} />
          <TextField label="Frecuencia" value={frequency} onChangeText={setFrequency} />
          <Button
            label="Agregar a la receta"
            fullWidth
            disabled={!medication.trim()}
            // No-op: sin backend. Limpia el formulario.
            onPress={() => {
              setMedication('');
              setDose('');
              setFrequency('');
              setShowForm(false);
            }}
          />
        </View>
      ) : null}
    </MobileShell>
  );
}
