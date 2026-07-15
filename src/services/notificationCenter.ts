/**
 * Centro de notificaciones in-app (local-first).
 *
 * Registro persistente de avisos al usuario en la base SQLite del dispositivo:
 * eventos de conectividad (O12/O13 del plan), tratamientos y recordatorios.
 * Funciona sin conexión; la campana de la app lee de aquí su badge.
 *
 * Recibe el `SqlExecutor` inyectado (tests: `node:sqlite` real, sin mocks).
 */
import type { SqlExecutor } from '@/db/sqlExecutor';
import { newLocalId } from '@/utils/localId';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface AddNotificationInput {
  type: string;
  title: string;
  body?: string | null;
  /** Si se repite la clave, el aviso no se duplica. */
  dedupeKey?: string;
}

export interface NotificationCenter {
  add(input: AddNotificationInput): void;
  list(limit?: number): AppNotification[];
  unreadCount(): number;
  markRead(id: string): void;
  markAllRead(): void;
}

interface Row {
  id: string;
  type: string;
  title: string;
  body: string | null;
  created_at: string;
  read_at: string | null;
}

function toNotification(row: Row): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

export function createNotificationCenter(exec: SqlExecutor): NotificationCenter {
  return {
    add(input) {
      // Opt-out por categoría: el `type` del aviso es su categoría de preferencia.
      const pref = exec.get<{ enabled: number }>(
        'SELECT enabled FROM notification_prefs WHERE category = ?',
        [input.type],
      );
      if (pref && pref.enabled === 0) return;
      exec.run(
        `INSERT OR IGNORE INTO notifications (id, type, title, body, dedupe_key, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          newLocalId(),
          input.type,
          input.title,
          input.body ?? null,
          input.dedupeKey ?? null,
          new Date().toISOString(),
        ],
      );
    },

    list(limit = 50) {
      return exec
        .all<Row>(
          'SELECT * FROM notifications ORDER BY created_at DESC, rowid DESC LIMIT ?',
          [limit],
        )
        .map(toNotification);
    },

    unreadCount() {
      const row = exec.get<{ n: number }>(
        'SELECT COUNT(*) AS n FROM notifications WHERE read_at IS NULL',
      );
      return row?.n ?? 0;
    },

    markRead(id) {
      exec.run('UPDATE notifications SET read_at = ? WHERE id = ? AND read_at IS NULL', [
        new Date().toISOString(),
        id,
      ]);
    },

    markAllRead() {
      exec.run('UPDATE notifications SET read_at = ? WHERE read_at IS NULL', [
        new Date().toISOString(),
      ]);
    },
  };
}
