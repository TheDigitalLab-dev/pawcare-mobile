import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, FilterChips, SectionTitle, TextField } from '@/components/ui';
import type { OwnerPetsStackParamList } from '@/navigation/types';
import { mockPets } from '@/data/mock';
import { SEX_LABEL, SPECIES_LABEL, type Sex, type Species } from '@/types/models';

type Nav = NativeStackNavigationProp<OwnerPetsStackParamList>;

const SPECIES_OPTIONS = (Object.keys(SPECIES_LABEL) as Species[]).map((id) => ({
  id,
  label: SPECIES_LABEL[id],
}));
const SEX_OPTIONS = (Object.keys(SEX_LABEL) as Sex[]).map((id) => ({
  id,
  label: SEX_LABEL[id],
}));

export function PetFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<OwnerPetsStackParamList, 'PetForm'>>();
  const editingId = route.params.id;
  const existing =
    editingId !== undefined ? mockPets.find((p) => p.id === editingId) : undefined;
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [species, setSpecies] = useState<Species>(existing?.species ?? 'dog');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [sex, setSex] = useState<Sex>(existing?.sex ?? 'male');
  const [birthDate, setBirthDate] = useState(existing?.birth_date ?? '');
  const [features, setFeatures] = useState(existing?.distinctive_features ?? '');

  const canSubmit = name.trim().length > 0;

  return (
    <MobileShell
      scroll
      header={
        <AppHeader title={existing ? 'Editar mascota' : 'Nueva mascota'} onBack={back} />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <TextField label="Nombre" value={name} onChangeText={setName} />

      <View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 6,
            color: colors.foreground,
          }}
        >
          Especie
        </Text>
        <FilterChips
          options={SPECIES_OPTIONS}
          selectedId={species}
          onSelect={(id) => setSpecies(id as Species)}
        />
      </View>

      <TextField label="Raza" value={breed} onChangeText={setBreed} />

      <View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 6,
            color: colors.foreground,
          }}
        >
          Sexo
        </Text>
        <FilterChips
          options={SEX_OPTIONS}
          selectedId={sex}
          onSelect={(id) => setSex(id as Sex)}
        />
      </View>

      <TextField
        label="Fecha de nacimiento"
        placeholder="AAAA-MM-DD"
        value={birthDate}
        onChangeText={setBirthDate}
      />

      <SectionTitle>Características</SectionTitle>
      <TextField
        label="Características distintivas"
        placeholder="Color, marcas, temperamento…"
        value={features}
        onChangeText={setFeatures}
        multiline
      />

      <Button
        label="Guardar"
        fullWidth
        disabled={!canSubmit}
        // TODO: persistir mascota en el backend
        onPress={back}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}
