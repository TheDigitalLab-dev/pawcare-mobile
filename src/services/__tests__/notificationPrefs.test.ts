/**
 * Preferencias de notificaciones (opt-out por categoría) contra SQLite REAL.
 */
import { DatabaseSync } from 'node:sqlite';

import { applyMigrations } from '@/db/migrations';
import type { SqlExecutor } from '@/db/sqlExecutor';
import { createNotificationCenter } from '@/services/notificationCenter';
import {
  createNotificationPrefs,
  NOTIFICATION_CATEGORIES,
} from '@/services/notificationPrefs';

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

describe('createNotificationPrefs', () => {
  let db: DatabaseSync;
  let exec: SqlExecutor;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    exec = nodeExecutor(db);
    applyMigrations(exec);
  });

  afterEach(() => db.close());

  it('todas las categorías están habilitadas por defecto', () => {
    const prefs = createNotificationPrefs(exec);
    expect(prefs.all().every((p) => p.enabled)).toBe(true);
    expect(prefs.all()).toHaveLength(NOTIFICATION_CATEGORIES.length);
  });

  it('apagar y volver a encender una categoría persiste', () => {
    const prefs = createNotificationPrefs(exec);
    prefs.setEnabled('pagos', false);
    expect(prefs.isEnabled('pagos')).toBe(false);
    prefs.setEnabled('pagos', true);
    expect(prefs.isEnabled('pagos')).toBe(true);
  });

  it('una categoría apagada bloquea los avisos del centro (opt-out real)', () => {
    const prefs = createNotificationPrefs(exec);
    const center = createNotificationCenter(exec);

    prefs.setEnabled('conectividad', false);
    center.add({ type: 'conectividad', title: 'Sin conexión' });
    center.add({ type: 'citas', title: 'Cita confirmada' });

    const titles = center.list().map((n) => n.title);
    expect(titles).toEqual(['Cita confirmada']);
  });
});
