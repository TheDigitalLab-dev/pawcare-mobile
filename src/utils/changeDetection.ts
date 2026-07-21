/**
 * Detección de cambios (pura) para las notificaciones por sincronización:
 * compara el estado recién sincronizado contra el snapshot local anterior y
 * produce eventos "creado" / "cambió de estado". Es la base local-first de los
 * avisos O2/O7/A1/A2/A4/A5 del plan mientras no exista push remoto (F2).
 *
 * La PRIMERA sincronización de una entidad siembra el snapshot en silencio
 * (`seeded = false`): sin ella, todo lo histórico aparecería como "nuevo".
 */

export interface SnapshotState {
  id: string;
  state: string;
}

export interface ChangeEvent {
  kind: 'created' | 'changed';
  id: string;
  prevState: string | null;
  state: string;
}

export function detectChanges(
  previous: ReadonlyMap<string, string>,
  current: SnapshotState[],
  seeded: boolean,
): ChangeEvent[] {
  if (!seeded) return [];

  const events: ChangeEvent[] = [];
  for (const item of current) {
    const prev = previous.get(item.id);
    if (prev === undefined) {
      events.push({ kind: 'created', id: item.id, prevState: null, state: item.state });
    } else if (prev !== item.state) {
      events.push({ kind: 'changed', id: item.id, prevState: prev, state: item.state });
    }
  }
  return events;
}
