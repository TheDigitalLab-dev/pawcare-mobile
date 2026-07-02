/**
 * Declaración mínima de `node:sqlite` (SQLite incorporado en Node, experimental)
 * usada solo por los tests de la capa local-first. Cubre lo que ejercitamos.
 */
declare module 'node:sqlite' {
  interface StatementSync {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown;
  }

  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
