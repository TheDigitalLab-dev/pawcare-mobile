import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, FilterChips, SectionTitle, TextField } from '@/components/ui';
import type { AdminMoreStackParamList } from '@/navigation/types';
import { mockConsultations, mockPets, mockStaff } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminMoreStackParamList>;
type Rt = RouteProp<AdminMoreStackParamList, 'AdminConsultationForm'>;

const PET_OPTIONS = mockPets.map((p) => ({ id: String(p.id), label: p.name }));
const VET_OPTIONS = [
  { id: String(mockStaff.id), label: mockStaff.full_name ?? mockStaff.first_name },
  { id: 'vet-2', label: 'Dra. Ana López' },
];

export function AdminConsultationFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const editing = params.id !== undefined;
  const existing = editing
    ? mockConsultations.find((c) => c.id === params.id)
    : undefined;

  const firstPet = mockPets[0];
  const [petId, setPetId] = useState(firstPet ? String(firstPet.id) : '');
  const [vet, setVet] = useState(VET_OPTIONS[0]?.id ?? '');
  const [date, setDate] = useState(existing?.consultation_date ?? '');
  const [anamnesis, setAnamnesis] = useState(existing?.notes ?? '');
  const [diagnosis, setDiagnosis] = useState(existing?.diagnosis ?? '');
  const [treatment, setTreatment] = useState(existing?.treatment ?? '');
  const [weight, setWeight] = useState(
    existing?.weight !== undefined ? String(existing.weight) : '',
  );
  const [temperature, setTemperature] = useState(
    existing?.temperature !== undefined ? String(existing.temperature) : '',
  );

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title={editing ? 'Editar consulta' : 'Nueva consulta'}
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <View>
        <Text style={[styles.label, { color: colors.foreground }]}>Mascota</Text>
        <FilterChips options={PET_OPTIONS} selectedId={petId} onSelect={setPetId} />
      </View>
      <View>
        <Text style={[styles.label, { color: colors.foreground }]}>Veterinario</Text>
        <FilterChips options={VET_OPTIONS} selectedId={vet} onSelect={setVet} />
      </View>

      <TextField
        label="Fecha"
        value={date}
        onChangeText={setDate}
        placeholder="AAAA-MM-DDTHH:mm:ss"
      />

      <SectionTitle>Datos clínicos</SectionTitle>
      <TextField
        label="Anamnesis"
        value={anamnesis}
        onChangeText={setAnamnesis}
        multiline
      />
      <TextField
        label="Diagnóstico"
        value={diagnosis}
        onChangeText={setDiagnosis}
        multiline
      />
      <TextField
        label="Tratamiento"
        value={treatment}
        onChangeText={setTreatment}
        multiline
      />
      <TextField
        label="Peso (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
      />
      <TextField
        label="Temperatura (°C)"
        value={temperature}
        onChangeText={setTemperature}
        keyboardType="decimal-pad"
      />

      <Button
        label={editing ? 'Guardar cambios' : 'Registrar consulta'}
        fullWidth
        disabled={!petId}
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
});
