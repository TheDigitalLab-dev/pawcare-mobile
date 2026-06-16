import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Button, TextField } from '@/components/ui';
import type { OwnerProfileStackParamList } from '@/navigation/types';

const MIN_PASSWORD = 8;

type Nav = NativeStackNavigationProp<OwnerProfileStackParamList>;

export function ChangePasswordScreen() {
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const nextValid = next.length >= MIN_PASSWORD;
  const match = next === confirm;
  const canSubmit = current.length > 0 && nextValid && match;

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Cambiar contraseña" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      <TextField
        label="Contraseña actual"
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
        textContentType="password"
      />
      <TextField
        label="Nueva contraseña"
        value={next}
        onChangeText={setNext}
        secureTextEntry
        textContentType="newPassword"
        error={
          next.length > 0 && !nextValid ? `Mínimo ${MIN_PASSWORD} caracteres.` : undefined
        }
      />
      <TextField
        label="Confirmar nueva contraseña"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        textContentType="newPassword"
        error={confirm.length > 0 && !match ? 'Las contraseñas no coinciden.' : undefined}
      />

      <Button
        label="Guardar"
        fullWidth
        disabled={!canSubmit}
        // TODO: actualizar contraseña en el backend
        onPress={back}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}
