/**
 * Alertas por cambio de estado (local-first): al sincronizar una lista real del
 * backend se compara contra el snapshot local (`entity_snapshots`) y las
 * diferencias se registran en el centro de notificaciones. Sustituye a las
 * push remotas del plan (O2/O5/O7/A1/A2/A4/A5/V3) hasta que exista F2.
 *
 * La primera sincronización siembra en silencio (fila centinela por entidad).
 */
import type { SqlExecutor } from '@/db/sqlExecutor';
import { detectChanges, type ChangeEvent } from '@/utils/changeDetection';

import { createNotificationCenter } from './notificationCenter';

const SENTINEL = '__seeded__';

export interface ChangeAlertConfig<T> {
  /** Nombre del snapshot (p. ej. 'owner-appointments'). */
  entity: string;
  /** Categoría del aviso (tipo del centro; las preferencias filtran por esto). */
  category: string;
  idOf(item: T): string;
  stateOf(item: T): string;
  /** Texto del aviso; null = evento sin interés para el usuario. */
  describe(event: ChangeEvent, item: T): { title: string; body?: string } | null;
}

export function processChangeAlerts<T>(
  exec: SqlExecutor,
  items: T[],
  config: ChangeAlertConfig<T>,
): void {
  const rows = exec.all<{ entity_id: string; state: string }>(
    'SELECT entity_id, state FROM entity_snapshots WHERE entity = ?',
    [config.entity],
  );
  let seeded = false;
  const previous = new Map<string, string>();
  for (const row of rows) {
    if (row.entity_id === SENTINEL) seeded = true;
    else previous.set(row.entity_id, row.state);
  }

  const byId = new Map(items.map((it) => [config.idOf(it), it]));
  const current = items.map((it) => ({ id: config.idOf(it), state: config.stateOf(it) }));
  const events = detectChanges(previous, current, seeded);

  // Con la categoría apagada se actualiza el snapshot igual (al reactivarla no
  // debe llegar una avalancha retroactiva), pero no se registra ningún aviso.
  const pref = exec.get<{ enabled: number }>(
    'SELECT enabled FROM notification_prefs WHERE category = ?',
    [config.category],
  );
  const categoryOn = !pref || pref.enabled === 1;

  const center = createNotificationCenter(exec);
  for (const event of categoryOn ? events : []) {
    const item = byId.get(event.id);
    if (!item) continue;
    const text = config.describe(event, item);
    if (!text) continue;
    center.add({
      type: config.category,
      title: text.title,
      body: text.body ?? null,
      dedupeKey: `${config.entity}:${event.id}:${event.state}`,
    });
  }

  // Actualiza el snapshot (upsert) y marca la entidad como sembrada.
  const now = new Date().toISOString();
  for (const snap of current) {
    exec.run(
      `INSERT INTO entity_snapshots (entity, entity_id, state, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (entity, entity_id) DO UPDATE SET state = excluded.state,
         updated_at = excluded.updated_at`,
      [config.entity, snap.id, snap.state, now],
    );
  }
  if (!seeded) {
    exec.run(
      `INSERT OR IGNORE INTO entity_snapshots (entity, entity_id, state, updated_at)
       VALUES (?, ?, '1', ?)`,
      [config.entity, SENTINEL, now],
    );
  }
}
