import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, FilterChips, TextField } from '@/components/ui';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { mockAdoptionPets } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;

const PET_OPTIONS = mockAdoptionPets.map((p) => ({
  id: String(p.id),
  label: p.name,
}));

export function AdminAdoptionFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  const firstPet = mockAdoptionPets[0];
  const [petId, setPetId] = useState<string>(firstPet ? String(firstPet.id) : '');
  const [adopter, setAdopter] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Nueva adopción"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <View>
        <Text style={[styles.label, { color: colors.foreground }]}>Mascota</Text>
        <FilterChips options={PET_OPTIONS} selectedId={petId} onSelect={setPetId} />
      </View>
      <TextField
        label="Adoptante"
        value={adopter}
        onChangeText={setAdopter}
        placeholder="Nombre completo"
      />
      <TextField
        label="Fecha"
        value={date}
        onChangeText={setDate}
        placeholder="AAAA-MM-DD"
      />
      <TextField label="Notas" value={notes} onChangeText={setNotes} multiline />

      <Button
        label="Registrar adopción"
        fullWidth
        disabled={!petId || !adopter.trim()}
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
});
