/**
 * Repositorio local-first de tratamientos de medicación.
 *
 * Vive en la base SQLite del dispositivo (funciona sin conexión): el dueño pulsa
 * "Tratamiento iniciado" y aquí se ancla el horario de tomas; las alarmas locales
 * se programan a partir de estas filas (ver `services/alarms.ts`). Las filas
 * nacen `sync_status = 'pending'` para la sincronización diferida (F2–F4).
 *
 * Recibe el `SqlExecutor` inyectado: en la app es expo-sqlite (`db/database.ts`)
 * y en los tests es `node:sqlite` REAL — sin mocks.
 */
import type { SqlExecutor } from '@/db/sqlExecutor';
import { newLocalId } from '@/utils/localId';
import { generateDoseSchedule, reanchorFrom } from '@/utils/treatmentSchedule';

export type TreatmentStatus = 'active' | 'completed' | 'cancelled';
export type DoseStatus = 'pending' | 'taken' | 'skipped';

export interface TreatmentDose {
  id: string;
  treatmentId: string;
  doseIndex: number;
  scheduledAt: string;
  takenAt: string | null;
  status: DoseStatus;
  notificationId: string | null;
}

export interface Treatment {
  id: string;
  petId: number;
  petName: string | null;
  prescriptionItemId: number | null;
  medicationName: string;
  dose: string | null;
  frequencyHours: number;
  durationDays: number;
  startedAt: string;
  status: TreatmentStatus;
  syncStatus: 'pending' | 'synced' | 'error';
}

export interface ActiveTreatment extends Treatment {
  nextDose: TreatmentDose | null;
  takenCount: number;
  totalCount: number;
}

export interface StartTreatmentInput {
  petId: number;
  petName?: string | null;
  prescriptionItemId?: number | null;
  medicationName: string;
  dose?: string | null;
  frequencyHours: number;
  durationDays: number;
  /** ISO del momento "tratamiento iniciado". */
  startedAt: string;
}

export interface TreatmentsRepo {
  startTreatment(input: StartTreatmentInput): Treatment & { doses: TreatmentDose[] };
  getTreatment(id: string): Treatment | null;
  listActiveTreatments(): ActiveTreatment[];
  listDoses(treatmentId: string): TreatmentDose[];
  /** Marca la toma como administrada; si era la última, completa el tratamiento. */
  markDoseTaken(doseId: string, takenAtIso: string): void;
  /** Mueve esta toma y desplaza las pendientes posteriores el mismo delta. */
  rescheduleFromDose(doseId: string, newScheduledAtIso: string): void;
  finishTreatment(
    id: string,
    status: Extract<TreatmentStatus, 'completed' | 'cancelled'>,
  ): void;
  setDoseNotificationId(doseId: string, notificationId: string | null): void;
}

interface TreatmentRow {
  id: string;
  pet_id: number;
  pet_name: string | null;
  prescription_item_id: number | null;
  medication_name: string;
  dose: string | null;
  frequency_hours: number;
  duration_days: number;
  started_at: string;
  status: TreatmentStatus;
  sync_status: 'pending' | 'synced' | 'error';
}

interface DoseRow {
  id: string;
  treatment_id: string;
  dose_index: number;
  scheduled_at: string;
  taken_at: string | null;
  status: DoseStatus;
  notification_id: string | null;
}

function toTreatment(row: TreatmentRow): Treatment {
  return {
    id: row.id,
    petId: row.pet_id,
    petName: row.pet_name,
    prescriptionItemId: row.prescription_item_id,
    medicationName: row.medication_name,
    dose: row.dose,
    frequencyHours: row.frequency_hours,
    durationDays: row.duration_days,
    startedAt: row.started_at,
    status: row.status,
    syncStatus: row.sync_status,
  };
}

function toDose(row: DoseRow): TreatmentDose {
  return {
    id: row.id,
    treatmentId: row.treatment_id,
    doseIndex: row.dose_index,
    scheduledAt: row.scheduled_at,
    takenAt: row.taken_at,
    status: row.status,
    notificationId: row.notification_id,
  };
}

export function createTreatmentsRepo(exec: SqlExecutor): TreatmentsRepo {
  const now = () => new Date().toISOString();

  function listDoses(treatmentId: string): TreatmentDose[] {
    return exec
      .all<DoseRow>(
        'SELECT * FROM treatment_doses WHERE treatment_id = ? ORDER BY dose_index',
        [treatmentId],
      )
      .map(toDose);
  }

  function getTreatment(id: string): Treatment | null {
    const row = exec.get<TreatmentRow>('SELECT * FROM treatments WHERE id = ?', [id]);
    return row ? toTreatment(row) : null;
  }

  function completeIfDone(treatmentId: string): void {
    const pending = exec.get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM treatment_doses WHERE treatment_id = ? AND status = 'pending'",
      [treatmentId],
    );
    if (pending && pending.n === 0) {
      exec.run(
        "UPDATE treatments SET status = 'completed', sync_status = 'pending', updated_at = ? WHERE id = ?",
        [now(), treatmentId],
      );
    }
  }

  return {
    startTreatment(input) {
      const id = newLocalId();
      const schedule = generateDoseSchedule({
        startedAt: input.startedAt,
        frequencyHours: input.frequencyHours,
        durationDays: input.durationDays,
      });
      if (schedule.length === 0) {
        throw new Error('Frecuencia, duración o fecha de inicio inválidas.');
      }

      // Transacción real: el tratamiento y TODAS sus tomas se insertan juntos
      // o no se inserta nada (un fallo a mitad no deja tratamientos huérfanos).
      exec.exec('BEGIN');
      try {
        exec.run(
          `INSERT INTO treatments
             (id, pet_id, pet_name, prescription_item_id, medication_name, dose,
              frequency_hours, duration_days, started_at, status, sync_status, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'pending', ?)`,
          [
            id,
            input.petId,
            input.petName ?? null,
            input.prescriptionItemId ?? null,
            input.medicationName,
            input.dose ?? null,
            input.frequencyHours,
            input.durationDays,
            input.startedAt,
            now(),
          ],
        );

        schedule.forEach((scheduledAt, index) => {
          exec.run(
            `INSERT INTO treatment_doses
               (id, treatment_id, dose_index, scheduled_at, status, updated_at)
             VALUES (?, ?, ?, ?, 'pending', ?)`,
            [newLocalId(), id, index, scheduledAt, now()],
          );
        });
        exec.exec('COMMIT');
      } catch (e) {
        exec.exec('ROLLBACK');
        throw e;
      }

      const treatment = getTreatment(id);
      if (!treatment) throw new Error('No se pudo crear el tratamiento.');
      return { ...treatment, doses: listDoses(id) };
    },

    getTreatment,
    listDoses,

    listActiveTreatments() {
      const rows = exec.all<TreatmentRow>(
        "SELECT * FROM treatments WHERE status = 'active' AND deleted_at IS NULL ORDER BY started_at DESC",
      );
      if (rows.length === 0) return [];
      // Una sola consulta de tomas para todos los tratamientos (sin N+1).
      const placeholders = rows.map(() => '?').join(', ');
      const allDoses = exec
        .all<DoseRow>(
          `SELECT * FROM treatment_doses WHERE treatment_id IN (${placeholders})
           ORDER BY dose_index`,
          rows.map((r) => r.id),
        )
        .map(toDose);
      const byTreatment = new Map<string, TreatmentDose[]>();
      for (const dose of allDoses) {
        const group = byTreatment.get(dose.treatmentId);
        if (group) group.push(dose);
        else byTreatment.set(dose.treatmentId, [dose]);
      }
      return rows.map((row) => {
        const doses = byTreatment.get(row.id) ?? [];
        const nextDose = doses.find((d) => d.status === 'pending') ?? null;
        return {
          ...toTreatment(row),
          nextDose,
          takenCount: doses.filter((d) => d.status === 'taken').length,
          totalCount: doses.length,
        };
      });
    },

    markDoseTaken(doseId, takenAtIso) {
      const dose = exec.get<DoseRow>('SELECT * FROM treatment_doses WHERE id = ?', [
        doseId,
      ]);
      if (!dose) return;
      exec.run(
        "UPDATE treatment_doses SET status = 'taken', taken_at = ?, updated_at = ? WHERE id = ?",
        [takenAtIso, now(), doseId],
      );
      completeIfDone(dose.treatment_id);
    },

    rescheduleFromDose(doseId, newScheduledAtIso) {
      const dose = exec.get<DoseRow>('SELECT * FROM treatment_doses WHERE id = ?', [
        doseId,
      ]);
      if (!dose || dose.status !== 'pending') return;

      const doses = listDoses(dose.treatment_id);
      const schedule = doses.map((d) => d.scheduledAt);
      const moved = reanchorFrom(schedule, dose.dose_index, newScheduledAtIso);

      for (const d of doses) {
        // Solo las pendientes desde la toma movida cambian de horario.
        if (d.doseIndex < dose.dose_index || d.status !== 'pending') continue;
        exec.run(
          'UPDATE treatment_doses SET scheduled_at = ?, updated_at = ? WHERE id = ?',
          [moved[d.doseIndex], now(), d.id],
        );
      }
    },

    finishTreatment(id, status) {
      exec.run(
        "UPDATE treatments SET status = ?, sync_status = 'pending', updated_at = ? WHERE id = ?",
        [status, now(), id],
      );
    },

    setDoseNotificationId(doseId, notificationId) {
      exec.run(
        'UPDATE treatment_doses SET notification_id = ?, updated_at = ? WHERE id = ?',
        [notificationId, now(), doseId],
      );
    },
  };
}
