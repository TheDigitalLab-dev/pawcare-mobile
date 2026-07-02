import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Button, InfoBanner, TextField } from '@/components/ui';
import type { OwnerProfileStackParamList } from '@/navigation/types';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/services/profile';
import { ApiError } from '@/types/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Nav = NativeStackNavigationProp<OwnerProfileStackParamList>;

export function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const back = navigation.canGoBack() ? navigation.goBack : undefined;
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    phone: (user && 'phone' in user ? user.phone : '') ?? '',
    address: (user && 'address' in user ? user.address : '') ?? '',
  });
  const set = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const emailValid = EMAIL_RE.test(form.email.trim());
  const canSubmit =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    emailValid &&
    !submitting;

  const onSubmit = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      await refreshUser();
      if (back) back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar el perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Editar perfil" onBack={back} />}
      contentStyle={{ gap: 12, paddingBottom: 32 }}
    >
      {error ? <InfoBanner tone="destructive" message={error} /> : null}

      <TextField
        label="Nombre"
        value={form.first_name}
        onChangeText={(v) => set('first_name', v)}
        autoCapitalize="words"
      />
      <TextField
        label="Apellido"
        value={form.last_name}
        onChangeText={(v) => set('last_name', v)}
        autoCapitalize="words"
      />
      <TextField
        label="Correo"
        value={form.email}
        onChangeText={(v) => set('email', v)}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        error={form.email.length > 0 && !emailValid ? 'Correo inválido.' : undefined}
      />
      <TextField
        label="Teléfono"
        value={form.phone}
        onChangeText={(v) => set('phone', v)}
        keyboardType="phone-pad"
      />
      <TextField
        label="Dirección"
        value={form.address}
        onChangeText={(v) => set('address', v)}
      />

      <Button
        label="Guardar"
        fullWidth
        loading={submitting}
        disabled={!canSubmit}
        onPress={onSubmit}
        style={{ marginTop: 8 }}
      />
    </MobileShell>
  );
}
