import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/theme';

/**
 * Campana del centro de notificaciones con punto de "no leídas". Vive en los
 * encabezados de los paneles (dueño y administrador).
 */
export function NotificationsBell({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();

  return (
    <View>
      <IconButton
        icon="notifications-outline"
        accessibilityLabel={
          unreadCount > 0 ? `Notificaciones: ${unreadCount} sin leer` : 'Notificaciones'
        }
        onPress={onPress}
      />
      {unreadCount > 0 ? (
        <View
          style={[
            styles.dot,
            { backgroundColor: colors.destructive, borderColor: colors.card },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});
