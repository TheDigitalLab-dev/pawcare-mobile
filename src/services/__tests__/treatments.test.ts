/**
 * Repositorio local-first de tratamientos contra SQLite REAL (`node:sqlite`).
 * Nada mockeado: el mismo SQL corre en la app vía expo-sqlite.
 */
import { DatabaseSync } from 'node:sqlite';

import { applyMigrations } from '@/db/migrations';
import type { SqlExecutor } from '@/db/sqlExecutor';
import { createTreatmentsRepo, type TreatmentsRepo } from '@/services/treatments';

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

describe('createTreatmentsRepo', () => {
  let db: DatabaseSync;
  let repo: TreatmentsRepo;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    const exec = nodeExecutor(db);
    applyMigrations(exec);
    repo = createTreatmentsRepo(exec);
  });

  afterEach(() => db.close());

  const START = '2026-07-14T08:00:00.000Z';

  function startAmoxicilina() {
    return repo.startTreatment({
      petId: 42,
      petName: 'Luna',
      prescriptionItemId: 7,
      medicationName: 'Amoxicilina',
      dose: '250 mg',
      frequencyHours: 8,
      durationDays: 1,
      startedAt: START,
    });
  }

  it('inicia un tratamiento anclado al momento y genera sus tomas', () => {
    const t = startAmoxicilina();

    expect(t.medicationName).toBe('Amoxicilina');
    expect(t.status).toBe('active');
    expect(t.doses).toHaveLength(3);
    expect(t.doses[0]!.scheduledAt).toBe(START);
    expect(t.doses[2]!.scheduledAt).toBe('2026-07-15T00:00:00.000Z');
    expect(t.doses.every((d) => d.status === 'pending')).toBe(true);
  });

  it('lista solo tratamientos activos con su próxima toma pendiente', () => {
    const t = startAmoxicilina();
    repo.markDoseTaken(t.doses[0]!.id, '2026-07-14T08:05:00.000Z');

    const active = repo.listActiveTreatments();
    expect(active).toHaveLength(1);
    expect(active[0]!.nextDose?.scheduledAt).toBe('2026-07-14T16:00:00.000Z');
    expect(active[0]!.takenCount).toBe(1);
    expect(active[0]!.totalCount).toBe(3);

    repo.finishTreatment(t.id, 'completed');
    expect(repo.listActiveTreatments()).toHaveLength(0);
  });

  it('registrar una toma la marca con su hora real', () => {
    const t = startAmoxicilina();
    repo.markDoseTaken(t.doses[0]!.id, '2026-07-14T09:30:00.000Z');

    const doses = repo.listDoses(t.id);
    expect(doses[0]!.status).toBe('taken');
    expect(doses[0]!.takenAt).toBe('2026-07-14T09:30:00.000Z');
    expect(doses[1]!.status).toBe('pending');
  });

  it('reprogramar una toma desplaza las siguientes conservando intervalos (adiós toma de las 12)', () => {
    const t = startAmoxicilina();
    // La toma de medianoche (00:00) se adelanta a las 22:00.
    repo.rescheduleFromDose(t.doses[2]!.id, '2026-07-14T22:00:00.000Z');

    const doses = repo.listDoses(t.id);
    expect(doses[0]!.scheduledAt).toBe(START); // anteriores intactas
    expect(doses[2]!.scheduledAt).toBe('2026-07-14T22:00:00.000Z');
  });

  it('reprogramar solo afecta tomas pendientes (las tomadas no se mueven)', () => {
    const t = startAmoxicilina();
    repo.markDoseTaken(t.doses[0]!.id, '2026-07-14T08:00:00.000Z');
    // Atrasa la toma 1 media hora: la 2 se corre igual.
    repo.rescheduleFromDose(t.doses[1]!.id, '2026-07-14T16:30:00.000Z');

    const doses = repo.listDoses(t.id);
    expect(doses[0]!.takenAt).toBe('2026-07-14T08:00:00.000Z');
    expect(doses[1]!.scheduledAt).toBe('2026-07-14T16:30:00.000Z');
    expect(doses[2]!.scheduledAt).toBe('2026-07-15T00:30:00.000Z');
  });

  it('cuando todas las tomas están registradas, el tratamiento se completa solo', () => {
    const t = startAmoxicilina();
    for (const d of t.doses) repo.markDoseTaken(d.id, d.scheduledAt);

    expect(repo.getTreatment(t.id)?.status).toBe('completed');
  });

  it('guarda el id de notificación por toma para poder cancelar alarmas', () => {
    const t = startAmoxicilina();
    repo.setDoseNotificationId(t.doses[1]!.id, 'notif-abc');

    const doses = repo.listDoses(t.id);
    expect(doses[1]!.notificationId).toBe('notif-abc');
    expect(doses[0]!.notificationId).toBeNull();
  });

  it('los tratamientos quedan pendientes de sincronizar (local-first)', () => {
    const t = startAmoxicilina();
    expect(t.syncStatus).toBe('pending');
  });
});
