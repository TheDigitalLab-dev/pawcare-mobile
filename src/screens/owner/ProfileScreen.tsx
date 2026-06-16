import { useNavigation } from '@react-navigation/native';
import { Alert, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader, MobileShell } from '@/components/layout';
import { Avatar, Button, EmptyState, SectionTitle } from '@/components/ui';
import { DetailHero, ListRow } from '@/components/domain';
import type { OwnerProfileStackParamList } from '@/navigation/types';
import { useAuth } from '@/hooks/useAuth';
import { deleteAccount } from '@/services/profile';
import { ApiError } from '@/types/api';
import { useTheme, type ThemePreference } from '@/theme';

type Nav = NativeStackNavigationProp<OwnerProfileStackParamList>;

const THEME_ORDER: ThemePreference[] = ['system', 'light', 'dark'];
const THEME_LABEL: Record<ThemePreference, string> = {
  system: 'Automático (sistema)',
  light: 'Claro',
  dark: 'Oscuro',
};
const THEME_ICON: Record<ThemePreference, string> = {
  system: '🌓',
  light: '☀️',
  dark: '🌙',
};

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const { preference, setPreference } = useTheme();

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(preference) + 1) % THEME_ORDER.length];
    if (next) setPreference(next);
  };

  const runDelete = async () => {
    try {
      await deleteAccount();
      // La cuenta queda eliminada: cierra sesión y vuelve al público.
      await signOut();
    } catch (e) {
      Alert.alert(
        'No se pudo eliminar la cuenta',
        e instanceof ApiError ? e.message : 'Inténtalo de nuevo más tarde.',
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert('Eliminar cuenta', 'Esta acción es permanente. ¿Deseas continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void runDelete() },
    ]);
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      // Revoca el refresh, limpia SecureStore y vuelve a público (RootNavigator).
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  if (user?.type !== 'Owner') {
    return (
      <MobileShell header={<AppHeader title="Perfil" />}>
        <EmptyState icon="person" title="Sin sesión de dueño" />
      </MobileShell>
    );
  }
  const owner = user;
  const initials =
    `${owner.first_name.charAt(0)}${owner.last_name.charAt(0)}`.toUpperCase();

  return (
    <MobileShell
      scroll
      header={<AppHeader title="Perfil" />}
      contentStyle={{ gap: 16, paddingBottom: 32 }}
    >
      <DetailHero
        title={owner.full_name ?? `${owner.first_name} ${owner.last_name}`}
        subtitle={owner.email}
        avatar={<Avatar fallback={initials} size="lg" />}
      />

      <SectionTitle>Datos</SectionTitle>
      <View style={{ gap: 8 }}>
        <ListRow title="Usuario" subtitle={owner.username} showChevron={false} />
        <ListRow
          title="Documento"
          subtitle={owner.identity_document}
          showChevron={false}
        />
        <ListRow title="Teléfono" subtitle={owner.phone ?? '—'} showChevron={false} />
        <ListRow title="Dirección" subtitle={owner.address ?? '—'} showChevron={false} />
      </View>

      <SectionTitle>Cuenta</SectionTitle>
      <View style={{ gap: 8 }}>
        <ListRow
          title="Editar perfil"
          leading={<Avatar fallback="✎" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ListRow
          title="Cambiar contraseña"
          leading={<Avatar fallback="🔒" />}
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </View>

      <SectionTitle>Apariencia</SectionTitle>
      <View style={{ gap: 8 }}>
        <ListRow
          title="Tema"
          subtitle={THEME_LABEL[preference]}
          leading={<Avatar fallback={THEME_ICON[preference]} />}
          onPress={cycleTheme}
        />
      </View>

      <Button
        label="Cerrar sesión"
        variant="outline"
        fullWidth
        onPress={confirmLogout}
        style={{ marginTop: 8 }}
      />
      <Button
        label="Eliminar cuenta"
        variant="destructive"
        fullWidth
        onPress={confirmDelete}
      />
    </MobileShell>
  );
}
