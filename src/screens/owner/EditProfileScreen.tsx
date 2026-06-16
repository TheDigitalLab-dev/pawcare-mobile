import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import type { OwnerProfileStackParamList } from '@/navigation/types';
import { mockOwner } from '@/data/mock';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Nav = NativeStackNavigationProp<OwnerProfileStackParamList>;

export function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [firstName, setFirstName] = useState(mockOwner.first_name);
  const [lastName, setLastName] = useState(mockOwner.last_name);
  const [email, setEmail] = useState(mockOwner.email);
  const [phone, setPhone] = useState(mockOwner.phone ?? '');
  const [address, setAddress] = useState(mockOwner.address ?? '');

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit =
    firstName.trim().length > 0 && lastName.trim().length > 0 && emailValid;

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Editar perfil" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <TextField label="Nombre" value={firstName} onChangeText={setFirstName} />
      <TextField label="Apellido" value={lastName} onChangeText={setLastName} />
      <TextField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        error={email.length > 0 && !emailValid ? 'Correo inválido.' : undefined}
      />
      <TextField
        label="Teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextField label="Dirección" value={address} onChangeText={setAddress} />

      <Button
        label="Guardar"
        fullWidth
        disabled={!canSubmit}
        // TODO: actualizar perfil en el backend
        onPress={back}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}
