import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemePreference } from '@/theme';
import { SessionProvider } from '@/session/SessionProvider';
import { RootNavigator } from '@/navigation/RootNavigator';

const THEME_KEY = 'pawcare.theme_preference';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export default function App() {
  // Preferencia de tema hidratada desde almacenamiento (persistente entre sesiones).
  // `null` mientras carga: evita un parpadeo claro→oscuro al arrancar.
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      setPreference(isThemePreference(stored) ? stored : 'system');
    });
  }, []);

  if (preference === null) return null;

  const handlePreferenceChange = (next: ThemePreference) => {
    void AsyncStorage.setItem(THEME_KEY, next);
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider
        initialPreference={preference}
        onPreferenceChange={handlePreferenceChange}
      >
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
