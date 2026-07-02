/**
 * Migraciones del esquema local-first (SQLite).
 *
 * Cada migración es SQL puro e idempotente en su aplicación (se registra en
 * `schema_migrations`). El esquema incluye las columnas de control de
 * sincronización descritas en `LOCAL_FIRST_PLAN.md`.
 *
 * F1 arranca con la tabla piloto `weighings` (pesaje) + la bitácora `sync_outbox`.
 */
import type { SqlExecutor } from './sqlExecutor';

export interface Migration {
  id: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    id: 1,
    name: 'init_sync_and_weighings',
    sql: `
      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        op TEXT NOT NULL CHECK (op IN ('create', 'update', 'delete')),
        payload TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weighings (
        id TEXT PRIMARY KEY NOT NULL,
        server_id INTEGER,
        pet_id INTEGER NOT NULL,
        weight_kg REAL NOT NULL,
        measured_at TEXT NOT NULL,
        notes TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending'
          CHECK (sync_status IN ('pending', 'synced', 'error')),
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_weighings_pet ON weighings (pet_id);
      CREATE INDEX IF NOT EXISTS idx_weighings_sync ON weighings (sync_status);
      CREATE INDEX IF NOT EXISTS idx_outbox_created ON sync_outbox (created_at);
    `,
  },
];

/**
 * Aplica las migraciones pendientes en orden. Idempotente: las ya aplicadas
 * (registradas en `schema_migrations`) se omiten. Devuelve los ids aplicados.
 */
export function applyMigrations(exec: SqlExecutor): number[] {
  exec.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const done = new Set(
    exec.all<{ id: number }>('SELECT id FROM schema_migrations').map((row) => row.id),
  );

  const applied: number[] = [];
  for (const migration of [...MIGRATIONS].sort((a, b) => a.id - b.id)) {
    if (done.has(migration.id)) continue;
    exec.exec(migration.sql);
    exec.run('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)', [
      migration.id,
      migration.name,
      new Date().toISOString(),
    ]);
    applied.push(migration.id);
  }
  return applied;
}
