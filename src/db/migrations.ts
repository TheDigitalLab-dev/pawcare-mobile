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

const MIGRATIONS: Migration[] = [
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
  {
    id: 2,
    name: 'treatments_and_doses',
    sql: `
      CREATE TABLE IF NOT EXISTS treatments (
        id TEXT PRIMARY KEY NOT NULL,
        server_id INTEGER,
        pet_id INTEGER NOT NULL,
        pet_name TEXT,
        prescription_item_id INTEGER,
        medication_name TEXT NOT NULL,
        dose TEXT,
        frequency_hours INTEGER NOT NULL CHECK (frequency_hours > 0),
        duration_days INTEGER NOT NULL CHECK (duration_days > 0),
        started_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
          CHECK (status IN ('active', 'completed', 'cancelled')),
        sync_status TEXT NOT NULL DEFAULT 'pending'
          CHECK (sync_status IN ('pending', 'synced', 'error')),
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS treatment_doses (
        id TEXT PRIMARY KEY NOT NULL,
        treatment_id TEXT NOT NULL REFERENCES treatments (id),
        dose_index INTEGER NOT NULL,
        scheduled_at TEXT NOT NULL,
        taken_at TEXT,
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'taken', 'skipped')),
        notification_id TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_treatments_status ON treatments (status);
      CREATE INDEX IF NOT EXISTS idx_treatments_pet ON treatments (pet_id);
      CREATE INDEX IF NOT EXISTS idx_doses_treatment
        ON treatment_doses (treatment_id, dose_index);
      CREATE INDEX IF NOT EXISTS idx_doses_pending
        ON treatment_doses (status, scheduled_at);
    `,
  },
  {
    id: 3,
    name: 'notification_center',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        dedupe_key TEXT UNIQUE,
        created_at TEXT NOT NULL,
        read_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_created
        ON notifications (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_unread
        ON notifications (read_at);
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
