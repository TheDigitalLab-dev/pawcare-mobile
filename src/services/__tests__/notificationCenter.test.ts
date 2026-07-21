/**
 * Centro de notificaciones in-app (local-first) contra SQLite REAL
 * (`node:sqlite`). Nada mockeado: el mismo SQL corre en la app vía expo-sqlite.
 */
import { DatabaseSync } from 'node:sqlite';

import { applyMigrations } from '@/db/migrations';
import type { SqlExecutor } from '@/db/sqlExecutor';
import {
  createNotificationCenter,
  type NotificationCenter,
} from '@/services/notificationCenter';

function nodeExecutor(db: DatabaseSync): SqlExecutor {
  return {
    exec: (sql) => db.exec(sql),
    run: (sql, params = []) => {
      db.prepare(sql).run(...(params as never[]));
    },
    all: <T>(sql: string, params: unknown[] = []) =>
      db.prepare(sql).all(...(params as never[])) as T[],
    get: <T>(sql: string, params: unknown[] = []) =>
      (db.prepare(sql).get(...(params as never[])) as T | undefined) ?? undefined,
  };
}

describe('createNotificationCenter', () => {
  let db: DatabaseSync;
  let center: NotificationCenter;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    const exec = nodeExecutor(db);
    applyMigrations(exec);
    center = createNotificationCenter(exec);
  });

  afterEach(() => db.close());

  it('registra notificaciones y las lista de la más reciente a la más antigua', () => {
    center.add({ type: 'connectivity', title: 'Sin conexión', body: 'Modo local' });
    center.add({ type: 'treatment', title: 'Tratamiento iniciado' });

    const items = center.list();
    expect(items).toHaveLength(2);
    expect(items[0]!.title).toBe('Tratamiento iniciado');
    expect(items[1]!.body).toBe('Modo local');
    expect(items.every((n) => n.readAt === null)).toBe(true);
  });

  it('cuenta no leídas, marca una y marca todas como leídas', () => {
    center.add({ type: 'a', title: 'Uno' });
    center.add({ type: 'b', title: 'Dos' });
    expect(center.unreadCount()).toBe(2);

    const first = center.list()[0]!;
    center.markRead(first.id);
    expect(center.unreadCount()).toBe(1);

    center.markAllRead();
    expect(center.unreadCount()).toBe(0);
    expect(center.list().every((n) => n.readAt !== null)).toBe(true);
  });

  it('la clave de deduplicación evita registrar el mismo aviso dos veces', () => {
    center.add({ type: 'reminder', title: 'Vacuna próxima', dedupeKey: 'vacc-9' });
    center.add({ type: 'reminder', title: 'Vacuna próxima', dedupeKey: 'vacc-9' });

    expect(center.list()).toHaveLength(1);
  });

  it('retiene como máximo las 200 notificaciones más recientes', () => {
    for (let i = 0; i < 210; i++) center.add({ type: 't', title: `N${i}` });
    expect(center.list(500)).toHaveLength(200);
  });

  it('respeta el límite del listado', () => {
    for (let i = 0; i < 5; i++) center.add({ type: 't', title: `N${i}` });
    expect(center.list(3)).toHaveLength(3);
  });
});
