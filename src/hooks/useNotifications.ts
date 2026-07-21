/**
 * Hook del centro de notificaciones in-app (local-first): lista los avisos
 * persistidos en la base local y expone el conteo para el badge de la campana.
 * Acepta un `SqlExecutor` inyectado (tests con `node:sqlite` real).
 */
import { useCallback, useMemo, useState } from 'react';

import { initDatabase } from '@/db/database';
import type { SqlExecutor } from '@/db/sqlExecutor';
import {
  createNotificationCenter,
  type AppNotification,
} from '@/services/notificationCenter';

export interface UseNotifications {
  items: AppNotification[];
  unreadCount: number;
  markAllRead(): void;
  refresh(): void;
}

export function useNotifications(executor?: SqlExecutor): UseNotifications {
  const center = useMemo(
    () => createNotificationCenter(executor ?? initDatabase()),
    [executor],
  );

  // Lectura inicial perezosa (la base es local y síncrona); las mutaciones y la
  // navegación refrescan vía `refresh`.
  const [items, setItems] = useState<AppNotification[]>(() => center.list());
  const [unreadCount, setUnreadCount] = useState<number>(() => center.unreadCount());

  const refresh = useCallback(() => {
    setItems(center.list());
    setUnreadCount(center.unreadCount());
  }, [center]);

  const markAllRead = useCallback(() => {
    center.markAllRead();
    refresh();
  }, [center, refresh]);

  return { items, unreadCount, markAllRead, refresh };
}
