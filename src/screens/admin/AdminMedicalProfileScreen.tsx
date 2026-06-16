import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Button, InfoBanner, TextField } from '@/components/ui';
import type { AdminPatientsStackParamList } from '@/navigation/types';
import { mockMedicalProfile } from '@/data/mock';

type Nav = NativeStackNavigationProp<AdminPatientsStackParamList>;
type Rt = RouteProp<AdminPatientsStackParamList, 'AdminMedicalProfile'>;

export function AdminMedicalProfileScreen() {
  const navigation = useNavigation<Nav>();
  useRoute<Rt>();

  const [allergies, setAllergies] = useState(
    (mockMedicalProfile.allergies ?? []).join(', '),
  );
  const [chronic, setChronic] = useState(
    (mockMedicalProfile.chronic_diseases ?? []).join(', '),
  );
  const [bloodType, setBloodType] = useState(mockMedicalProfile.blood_type ?? '');
  const [notes, setNotes] = useState(mockMedicalProfile.notes ?? '');

  return (
    <MobileShell
      scroll
      header={
        <AppHeader
          title="Perfil médico"
          onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      }
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <InfoBanner message="Separa varias entradas con comas." tone="info" />
      <TextField
        label="Alergias"
        value={allergies}
        onChangeText={setAllergies}
        placeholder="Polen, penicilina…"
        multiline
      />
      <TextField
        label="Enfermedades crónicas"
        value={chronic}
        onChangeText={setChronic}
        multiline
      />
      <TextField label="Tipo de sangre" value={bloodType} onChangeText={setBloodType} />
      <TextField label="Notas" value={notes} onChangeText={setNotes} multiline />

      <Button
        label="Guardar perfil"
        fullWidth
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}
