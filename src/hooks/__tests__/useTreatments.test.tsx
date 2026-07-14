/**
 * Hook de tratamientos: une el repositorio local (SQLite REAL vía `node:sqlite`)
 * con las alarmas locales (expo-notifications, shim nativo). La lógica de
 * negocio se ejercita de verdad; solo el módulo nativo de alarmas es shim.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { DatabaseSync } from 'node:sqlite';
import * as Notifications from 'expo-notifications';

import { applyMigrations } from '@/db/migrations';
import type { SqlExecutor } from '@/db/sqlExecutor';
import { useTreatments } from '@/hooks/useTreatments';

function nodeExecutor(db: DatabaseSync): SqlExecutor {
  return {
    exec: (sql) => db.exec(sql),
    run: (sql, params = []) => {
      db.prepare(sql).run(...(params as never[]));
    },
    all: <T,>(sql: string, params: unknown[] = []) =>
      db.prepare(sql).all(...(params as never[])) as T[],
    get: <T,>(sql: string, params: unknown[] = []) =>
      (db.prepare(sql).get(...(params as never[])) as T | undefined) ?? undefined,
  };
}

const HOUR_MS = 60 * 60 * 1000;

describe('useTreatments', () => {
  let db: DatabaseSync;
  let exec: SqlExecutor;

  beforeEach(() => {
    jest.clearAllMocks();
    db = new DatabaseSync(':memory:');
    exec = nodeExecutor(db);
    applyMigrations(exec);
  });

  afterEach(() => db.close());

  async function startLuna(hook: { current: ReturnType<typeof useTreatments> }) {
    await act(async () => {
      await hook.current.start({
        petId: 42,
        petName: 'Luna',
        medicationName: 'Amoxicilina',
        dose: '250 mg',
        frequencyHours: 8,
        durationDays: 2,
      });
    });
  }

  it('arranca vacío y al iniciar un tratamiento lo lista con su próxima toma', async () => {
    const { result } = renderHook(() => useTreatments(exec));
    await waitFor(() => expect(result.current.treatments).toEqual([]));

    await startLuna(result);

    expect(result.current.treatments).toHaveLength(1);
    const t = result.current.treatments[0]!;
    expect(t.medicationName).toBe('Amoxicilina');
    expect(t.totalCount).toBe(6); // 2 días cada 8 h
    // La primera toma es AHORA (el ancla de "tratamiento iniciado").
    expect(t.nextDose).not.toBeNull();
  });

  it('programa alarmas locales para las tomas futuras al iniciar', async () => {
    const { result } = renderHook(() => useTreatments(exec));
    await startLuna(result);

    // 6 tomas: la primera es "ahora" (no futura), las 5 siguientes se agendan.
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(5);
  });

  it('marcar la próxima toma como administrada avanza el progreso', async () => {
    const { result } = renderHook(() => useTreatments(exec));
    await startLuna(result);

    await act(async () => {
      await result.current.markTaken(result.current.treatments[0]!);
    });

    const t = result.current.treatments[0]!;
    expect(t.takenCount).toBe(1);
    expect(Date.parse(t.nextDose!.scheduledAt)).toBeGreaterThan(Date.now());
  });

  it('mover la próxima toma desplaza también las siguientes y reprograma alarmas', async () => {
    const { result } = renderHook(() => useTreatments(exec));
    await startLuna(result);

    const before = result.current.treatments[0]!;
    const beforeNext = Date.parse(before.nextDose!.scheduledAt);

    await act(async () => {
      await result.current.moveNextDose(before, -120); // 2 h más temprano
    });

    const after = result.current.treatments[0]!;
    expect(Date.parse(after.nextDose!.scheduledAt)).toBe(beforeNext - 2 * HOUR_MS);
    // Se reprogramaron alarmas tras el cambio (más llamadas que las del inicio).
    expect(
      (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length,
    ).toBeGreaterThan(5);
  });

  it('iniciar un tratamiento deja constancia en el centro de notificaciones', async () => {
    const { result } = renderHook(() => useTreatments(exec));
    await startLuna(result);

    const rows = exec.all<{ title: string; body: string }>(
      "SELECT title, body FROM notifications WHERE type = 'treatment'",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.body).toContain('Amoxicilina');
    expect(rows[0]!.body).toContain('6 tomas');
  });

  it('finalizar el tratamiento lo saca de activos y cancela sus alarmas', async () => {
    const { result } = renderHook(() => useTreatments(exec));
    await startLuna(result);

    await act(async () => {
      await result.current.finish(result.current.treatments[0]!);
    });

    expect(result.current.treatments).toEqual([]);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
  });
});
