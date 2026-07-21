/**
 * Alarmas locales de medicación (expo-notifications).
 *
 * Capa fina sobre el módulo nativo: programa una notificación tipo alarma por
 * cada toma pendiente futura y guarda el id en la fila de la toma para poder
 * cancelarla/reprogramarla. Al ser notificaciones LOCALES suenan aunque no haya
 * conexión — coherente con local-first (plan-notificaciones.md, O14/O15).
 *
 * La lógica de negocio (horarios, reanclaje, estado de tomas) NO vive aquí:
 * está en `utils/treatmentSchedule` y `services/treatments`, probada con TDD.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { TreatmentDose, TreatmentsRepo } from './treatments';

export const MEDICATION_CHANNEL_ID = 'medication-alarms';

// Presentación en primer plano: la alarma debe verse y sonar aunque la app esté
// abierta (por defecto las notificaciones se silencian en foreground).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Cota de alarmas programadas por tratamiento (iOS limita ~64 pendientes en total). */
const MAX_SCHEDULED_PER_TREATMENT = 20;
/** Presupuesto global de programadas para no chocar con el límite del SO (~64). */
const MAX_SCHEDULED_TOTAL = 60;

let channelReady = false;

/** Canal Android de máxima prioridad (sonido + vibración). Idempotente. */
async function ensureChannel(): Promise<void> {
  if (channelReady || Platform.OS !== 'android') {
    channelReady = true;
    return;
  }
  await Notifications.setNotificationChannelAsync(MEDICATION_CHANNEL_ID, {
    name: 'Alarmas de medicación',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 300, 200, 300],
    enableVibrate: true,
  });
  channelReady = true;
}

/** Pide permiso de notificaciones. Devuelve si el usuario lo concedió. */
export async function ensureAlarmPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

interface AlarmContext {
  petName: string | null;
  medicationName: string;
  dose: string | null;
}

function alarmContent(ctx: AlarmContext, scheduledAt: string) {
  const time = new Date(scheduledAt).toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const pet = ctx.petName ? `${ctx.petName} — ` : '';
  return {
    title: `💊 ${pet}${ctx.medicationName}`,
    body: `${ctx.dose ? `${ctx.dose} · ` : ''}toma de las ${time}`,
    sound: 'default' as const,
  };
}

/**
 * Reprograma las alarmas de un tratamiento: cancela las existentes y agenda las
 * tomas pendientes FUTURAS (hasta la cota). Registra cada id en la toma.
 */
export async function syncTreatmentAlarms(
  repo: TreatmentsRepo,
  treatmentId: string,
  ctx: AlarmContext,
): Promise<void> {
  await ensureChannel();
  const doses = repo.listDoses(treatmentId);
  await cancelDoseAlarms(doses);

  // Presupuesto global: respeta el límite del SO contando lo ya programado por
  // OTROS tratamientos y recordatorios.
  let alreadyScheduled = 0;
  try {
    alreadyScheduled = (await Notifications.getAllScheduledNotificationsAsync()).length;
  } catch {
    // Sin acceso a las programadas: se usa solo la cota por tratamiento.
  }
  const budget = Math.min(
    MAX_SCHEDULED_PER_TREATMENT,
    Math.max(0, MAX_SCHEDULED_TOTAL - alreadyScheduled),
  );

  const nowMs = Date.now();
  const upcoming = doses
    .filter((d) => d.status === 'pending' && Date.parse(d.scheduledAt) > nowMs)
    .slice(0, budget);

  // allSettled: un fallo del SO en UNA alarma no debe abortar las demás ni
  // romper la acción del usuario (el registro de la toma ya ocurrió).
  await Promise.allSettled(
    upcoming.map(async (dose) => {
      const id = await Notifications.scheduleNotificationAsync({
        content: alarmContent(ctx, dose.scheduledAt),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(dose.scheduledAt),
          channelId: MEDICATION_CHANNEL_ID,
        },
      });
      repo.setDoseNotificationId(dose.id, id);
    }),
  );
}

/** Cancela TODAS las notificaciones locales programadas (cierre de sesión). */
export async function cancelAllLocalAlarms(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Sin acceso al programador: no hay nada más que hacer.
  }
}

/** Cancela las alarmas programadas de las tomas dadas. */
export async function cancelDoseAlarms(doses: TreatmentDose[]): Promise<void> {
  const ids = doses
    .map((d) => d.notificationId)
    .filter((id): id is string => id !== null);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}
