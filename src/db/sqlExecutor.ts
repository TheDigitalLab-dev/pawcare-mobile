/**
 * Interfaz mínima de ejecución SQL, agnóstica del motor.
 *
 * En la app la implementa `expo-sqlite` (ver `database.ts`). En los tests la
 * implementa `node:sqlite` (SQLite REAL en Node) — así las migraciones y queries
 * se prueban contra una base real, sin mocks (ver AGENTS.md).
 */
export interface SqlExecutor {
  /** Ejecuta DDL o varios statements separados por `;`. */
  exec(sql: string): void;
  /** INSERT/UPDATE/DELETE con parámetros posicionales (`?`). */
  run(sql: string, params?: unknown[]): void;
  /** SELECT que devuelve todas las filas. */
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[];
  /** SELECT que devuelve la primera fila (o `undefined`). */
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): T | undefined;
}
