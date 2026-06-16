import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, FilterChips, TextField } from '@/components/ui';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { mockPets } from '@/data/mock';
import { SEX_LABEL, SPECIES_LABEL, type Sex, type Species } from '@/types/models';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;
type Rt = RouteProp<AdminPatientsStackParamList, 'AdminPetForm'>;

const SPECIES_OPTIONS = (Object.keys(SPECIES_LABEL) as Species[]).map((id) => ({
  id,
  label: SPECIES_LABEL[id],
}));
const SEX_OPTIONS = (Object.keys(SEX_LABEL) as Sex[]).map((id) => ({
  id,
  label: SEX_LABEL[id],
}));

export function AdminPetFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const editing = params.id !== undefined;
  const existing = editing ? mockPets.find((p) => p.id === params.id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [species, setSpecies] = useState<Species>(existing?.species ?? 'dog');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [sex, setSex] = useState<Sex>(existing?.sex ?? 'male');
  const [birthDate, setBirthDate] = useState(existing?.birth_date ?? '');
  const [features, setFeatures] = useState(existing?.distinctive_features ?? '');

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title={editing ? 'Editar paciente' : 'Nuevo paciente'}
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <TextField label="Nombre" value={name} onChangeText={setName} />

      <View>
        <Text style={[styles.label, { color: colors.foreground }]}>Especie</Text>
        <FilterChips
          options={SPECIES_OPTIONS}
          selectedId={species}
          onSelect={(id) => setSpecies(id as Species)}
        />
      </View>

      <TextField label="Raza" value={breed} onChangeText={setBreed} />

      <View>
        <Text style={[styles.label, { color: colors.foreground }]}>Sexo</Text>
        <FilterChips
          options={SEX_OPTIONS}
          selectedId={sex}
          onSelect={(id) => setSex(id as Sex)}
        />
      </View>

      <TextField
        label="Fecha de nacimiento"
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="AAAA-MM-DD"
      />
      <TextField
        label="Características distintivas"
        value={features}
        onChangeText={setFeatures}
        multiline
      />

      <Button
        label={editing ? 'Guardar cambios' : 'Crear paciente'}
        fullWidth
        disabled={!name.trim()}
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
});
