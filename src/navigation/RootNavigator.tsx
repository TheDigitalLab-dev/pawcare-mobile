import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type LinkingOptions,
  type Theme,
} from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/theme';
import { useSession } from '@/session/SessionProvider';
import { PublicStack } from './PublicStack';
import { OwnerTabs } from './OwnerTabs';
import { AdminTabs } from './AdminTabs';
import type { PublicStackParamList } from './types';

// Deep link de recuperación: pawcare://reset_password/:token. Aplica mientras la
// app está en estado público (PublicStack → Auth → ResetPassword).
const linking: LinkingOptions<PublicStackParamList> = {
  prefixes: ['pawcare://'],
  config: {
    screens: {
      Auth: {
        screens: {
          ResetPassword: 'reset_password/:token',
        },
      },
    },
  },
};

export function RootNavigator() {
  const { colors, scheme } = useTheme();
  const { role, status } = useSession();

  const navTheme: Theme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme).colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.foreground,
      border: colors.border,
      notification: colors.destructive,
    },
  };

  // Mientras se restaura la sesión (lectura de tokens + /me) mostramos un splash
  // para no parpadear de público → owner/admin.
  if (status === 'restoring') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      {role === 'owner' ? (
        <OwnerTabs />
      ) : role === 'admin' ? (
        <AdminTabs />
      ) : (
        <PublicStack />
      )}
    </NavigationContainer>
  );
}
