import { useSyncExternalStore } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type LinkingOptions,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/theme';
import { useSession } from '@/session/SessionProvider';
import { getApiBaseUrl, subscribeServerUrl } from '@/config/serverConfig';
import { ServerSettingsScreen } from '@/screens/auth';
import { PublicStack } from './PublicStack';
import { OwnerTabs } from './OwnerTabs';
import { AdminTabs } from './AdminTabs';
import type { PublicStackParamList } from './types';

// Gate de primer arranque: un build sin EXPO_PUBLIC_API_BASE_URL (self-hosted)
// no tiene servidor; la app abre directo en la configuración del servidor en
// lugar de quedar "muda". Al guardar una URL, el gate desaparece solo.
type ServerSetupParamList = { ServerSettings: undefined };
const SetupStack = createNativeStackNavigator<ServerSetupParamList>();

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
  const apiBaseUrl = useSyncExternalStore(subscribeServerUrl, getApiBaseUrl);

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

  if (apiBaseUrl.length === 0) {
    return (
      <NavigationContainer theme={navTheme}>
        <SetupStack.Navigator screenOptions={{ headerShown: false }}>
          <SetupStack.Screen name="ServerSettings" component={ServerSettingsScreen} />
        </SetupStack.Navigator>
      </NavigationContainer>
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
