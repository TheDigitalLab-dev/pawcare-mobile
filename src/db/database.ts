/**
 * Base de datos local (SQLite) para el modo local-first.
 *
 * Usa `expo-sqlite` (API síncrona) y aplica las migraciones al abrir. Este módulo
 * SOLO se importa desde código de la app (no desde tests: los tests ejercitan el
 * mismo SQL con `node:sqlite`, ver `__tests__`).
 */
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { applyMigrations } from './migrations';
import type { SqlExecutor } from './sqlExecutor';

const DATABASE_NAME = 'pawcare.db';

/** Envuelve una `SQLiteDatabase` de expo-sqlite como `SqlExecutor`. */
export function createExpoExecutor(db: SQLiteDatabase): SqlExecutor {
  return {
    exec: (sql) => db.execSync(sql),
    run: (sql, params = []) => {
      db.runSync(sql, params as never[]);
    },
    all: <T>(sql: string, params: unknown[] = []) =>
      db.getAllSync(sql, params as never[]) as T[],
    get: <T>(sql: string, params: unknown[] = []) =>
      (db.getFirstSync(sql, params as never[]) as T | null) ?? undefined,
  };
}

let executor: SqlExecutor | null = null;

/** Abre la base local (si no lo está) y aplica migraciones pendientes. */
export function initDatabase(): SqlExecutor {
  if (executor) return executor;
  const db = openDatabaseSync(DATABASE_NAME);
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const exec = createExpoExecutor(db);
  applyMigrations(exec);
  executor = exec;
  return executor;
}

/** Ejecutor activo. Lanza si aún no se llamó a `initDatabase()`. */
export function getExecutor(): SqlExecutor {
  if (!executor) throw new Error('initDatabase() no ha sido llamado todavía.');
  return executor;
}
