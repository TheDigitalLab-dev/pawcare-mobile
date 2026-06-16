import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { mockVaccinations } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;
type Rt = RouteProp<AdminMoreStackParamList, 'AdminVaccinationForm'>;

export function AdminVaccinationFormScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const editing = params.id !== undefined;
  const existing = editing ? mockVaccinations.find((v) => v.id === params.id) : undefined;

  const [name, setName] = useState(existing?.vaccine_name ?? '');
  const [manufacturer, setManufacturer] = useState(existing?.manufacturer ?? '');
  const [dose, setDose] = useState(existing?.dose ?? '');
  const [applicationDate, setApplicationDate] = useState(
    existing?.application_date ?? '',
  );
  const [nextDueDate, setNextDueDate] = useState(existing?.next_due_date ?? '');

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title={editing ? 'Editar vacuna' : 'Nueva vacuna'}
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <TextField label="Nombre de la vacuna" value={name} onChangeText={setName} />
      <TextField label="Fabricante" value={manufacturer} onChangeText={setManufacturer} />
      <TextField label="Dosis" value={dose} onChangeText={setDose} />
      <TextField
        label="Fecha de aplicación"
        value={applicationDate}
        onChangeText={setApplicationDate}
        placeholder="AAAA-MM-DD"
      />
      <TextField
        label="Próxima dosis"
        value={nextDueDate}
        onChangeText={setNextDueDate}
        placeholder="AAAA-MM-DD"
      />

      <Button
        label={editing ? 'Guardar cambios' : 'Registrar vacuna'}
        fullWidth
        disabled={!name.trim()}
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}
