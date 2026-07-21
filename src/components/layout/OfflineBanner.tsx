import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { initDatabase } from '@/db/database';
import { useConnectivity } from '@/hooks/useConnectivity';
import { createNotificationCenter } from '@/services/notificationCenter';
import { useTheme } from '@/theme';
import { connectivityEvent } from '@/utils/connectivity';

/**
 * Banner offline global (O12): visible mientras no haya conexión, presentado
 * como modo normal de operación (local-first), no como error. Las transiciones
 * quedan registradas en el centro de notificaciones (O12/O13).
 */
export function OfflineBanner() {
  const { colors } = useTheme();
  const online = useConnectivity();
  const prev = useRef(online);

  useEffect(() => {
    const event = connectivityEvent(prev.current, online);
    prev.current = online;
    if (!event) return;
    try {
      createNotificationCenter(initDatabase()).add(event);
    } catch {
      // Base local no disponible (p. ej. arranque muy temprano): solo banner.
    }
  }, [online]);

  if (online) return null;

  return (
    <View style={[styles.base, { backgroundColor: colors.warning }]}>
      <Ionicons name="cloud-offline" size={14} color={colors.warningForeground} />
      <Text style={[styles.text, { color: colors.warningForeground }]}>
        Sin conexión — trabajando con los datos locales
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  text: { fontSize: 12, fontWeight: '600' },
});
