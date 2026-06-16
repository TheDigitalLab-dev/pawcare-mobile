import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppHeader, MobileShell } from '@/components/layout';
import { Button, FilterChips, SectionTitle, TextField } from '@/components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export type OwnerSex = 'male' | 'female' | 'other';
export type PhoneType = 'whatsapp' | 'telegram' | 'regular';

export interface OwnerRegistration {
  first_name: string;
  last_name: string;
  identity_document: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  address: string;
  sex: OwnerSex;
  phone: string;
  phone_type: PhoneType;
}

export interface RegisterScreenProps {
  onBack?: () => void;
  onSubmit?: (data: OwnerRegistration) => void;
  submitting?: boolean;
  /** Errores 422 por campo provenientes del backend. */
  fieldErrors?: Partial<Record<keyof OwnerRegistration, string>>;
}

const SEX_OPTIONS = [
  { id: 'female', label: 'Femenino' },
  { id: 'male', label: 'Masculino' },
  { id: 'other', label: 'Otro' },
];
const PHONE_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'regular', label: 'Normal' },
];

/** Registro de dueño — formulario único enfocado (campos de `owner_params`). */
export function RegisterScreen({
  onBack,
  onSubmit,
  submitting,
  fieldErrors,
}: RegisterScreenProps) {
  const { colors } = useTheme();
  const [form, setForm] = useState<OwnerRegistration>({
    first_name: '',
    last_name: '',
    identity_document: '',
    email: '',
    username: '',
    password: '',
    password_confirmation: '',
    address: '',
    sex: 'female',
    phone: '',
    phone_type: 'whatsapp',
  });

  const set = <K extends keyof OwnerRegistration>(key: K, value: OwnerRegistration[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const emailValid = EMAIL_RE.test(form.email.trim());
  const passwordValid = form.password.length >= MIN_PASSWORD;
  const match = form.password === form.password_confirmation;
  const requiredFilled =
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.identity_document.trim() &&
    form.username.trim();
  const canSubmit =
    !!requiredFilled && emailValid && passwordValid && match && !submitting;

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Crear cuenta" onBack={onBack} />}
      contentStyle={styles.content}
    >
      <SectionTitle>Datos personales</SectionTitle>
      <TextField
        label="Nombre"
        value={form.first_name}
        onChangeText={(v) => set('first_name', v)}
        error={fieldErrors?.first_name}
      />
      <TextField
        label="Apellido"
        value={form.last_name}
        onChangeText={(v) => set('last_name', v)}
        error={fieldErrors?.last_name}
      />
      <TextField
        label="Documento de identidad"
        value={form.identity_document}
        onChangeText={(v) => set('identity_document', v)}
        keyboardType="numbers-and-punctuation"
        error={fieldErrors?.identity_document}
      />
      <View>
        <Text style={[styles.label, { color: colors.foreground }]}>Sexo</Text>
        <FilterChips
          options={SEX_OPTIONS}
          selectedId={form.sex}
          onSelect={(id) => set('sex', id as OwnerSex)}
        />
      </View>

      <SectionTitle>Contacto</SectionTitle>
      <TextField
        label="Correo"
        value={form.email}
        onChangeText={(v) => set('email', v)}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        error={
          fieldErrors?.email ??
          (form.email.length > 0 && !emailValid ? 'Correo inválido.' : undefined)
        }
      />
      <TextField
        label="Teléfono"
        value={form.phone}
        onChangeText={(v) => set('phone', v)}
        keyboardType="phone-pad"
        error={fieldErrors?.phone}
      />
      <View>
        <Text style={[styles.label, { color: colors.foreground }]}>Tipo de teléfono</Text>
        <FilterChips
          options={PHONE_OPTIONS}
          selectedId={form.phone_type}
          onSelect={(id) => set('phone_type', id as PhoneType)}
        />
      </View>
      <TextField
        label="Dirección"
        value={form.address}
        onChangeText={(v) => set('address', v)}
        error={fieldErrors?.address}
      />

      <SectionTitle>Acceso</SectionTitle>
      <TextField
        label="Usuario"
        value={form.username}
        onChangeText={(v) => set('username', v)}
        autoCapitalize="none"
        autoCorrect={false}
        error={fieldErrors?.username}
      />
      <TextField
        label="Contraseña"
        value={form.password}
        onChangeText={(v) => set('password', v)}
        secureTextEntry
        textContentType="newPassword"
        error={
          fieldErrors?.password ??
          (form.password.length > 0 && !passwordValid
            ? `Mínimo ${MIN_PASSWORD} caracteres.`
            : undefined)
        }
      />
      <TextField
        label="Confirmar contraseña"
        value={form.password_confirmation}
        onChangeText={(v) => set('password_confirmation', v)}
        secureTextEntry
        textContentType="newPassword"
        error={
          form.password_confirmation.length > 0 && !match
            ? 'Las contraseñas no coinciden.'
            : undefined
        }
      />

      <Button
        label="Crear cuenta"
        fullWidth
        loading={submitting}
        disabled={!canSubmit}
        onPress={() => onSubmit?.({ ...form, email: form.email.trim() })}
        style={styles.submit}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  submit: { marginTop: 8 },
});
