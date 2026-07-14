/**
 * Identificadores locales para filas creadas offline (local-first). No son UUID:
 * solo necesitan ser únicos dentro del dispositivo; el servidor asigna el id
 * definitivo al sincronizar (columna `server_id`).
 */
export function newLocalId(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `loc_${time}_${rand}`;
}
