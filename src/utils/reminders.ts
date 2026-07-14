/**
 * Recordatorios locales (plan-notificaciones.md, O1 y O3): funciones PURAS que
 * calculan qué avisos programar a partir de datos ya sincronizados. Al ser
 * push locales, suenan aunque no haya conexión (local-first).
 *
 * El `identifier` de cada aviso es estable (p. ej. `appt-10-24h`): reprogramar
 * con el mismo identificador reemplaza al anterior — sin duplicados.
 */

export interface ReminderSpec {
  identifier: string;
  title: string;
  body: string;
  /** ISO del momento en que debe sonar. */
  triggerAt: string;
}

interface AppointmentLike {
  id: number;
  scheduled_at: string;
  status: string;
  pet?: { name: string } | null;
  service?: { name: string } | null;
}

interface VaccinationLike {
  id: number;
  vaccine_name: string;
  next_due_date?: string | null;
}

const HOUR_MS = 60 * 60 * 1000;
const SKIP_STATUSES = new Set(['cancelled', 'completed']);

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

/** Avisos 24 h y 2 h antes de cada cita futura no cancelada/completada. */
export function appointmentReminders(
  appointments: AppointmentLike[],
  nowIso: string,
): ReminderSpec[] {
  const now = Date.parse(nowIso);
  const specs: ReminderSpec[] = [];

  for (const appt of appointments) {
    if (SKIP_STATUSES.has(appt.status)) continue;
    const at = Date.parse(appt.scheduled_at);
    if (Number.isNaN(at) || at <= now) continue;

    const who = [appt.pet?.name, appt.service?.name].filter(Boolean).join(' · ');
    const body = `${who ? `${who} — ` : ''}${formatWhen(appt.scheduled_at)}`;

    for (const [suffix, offsetH, lead] of [
      ['24h', 24, 'mañana'],
      ['2h', 2, 'en 2 horas'],
    ] as const) {
      const triggerMs = at - offsetH * HOUR_MS;
      if (triggerMs <= now) continue;
      specs.push({
        identifier: `appt-${appt.id}-${suffix}`,
        title: `📅 Cita ${lead}`,
        body,
        triggerAt: new Date(triggerMs).toISOString(),
      });
    }
  }
  return specs;
}

/** Aviso 3 días antes del vencimiento de la próxima dosis, a las 9:00 locales. */
export function vaccinationReminders(
  vaccinations: VaccinationLike[],
  nowIso: string,
): ReminderSpec[] {
  const now = Date.parse(nowIso);
  const specs: ReminderSpec[] = [];

  for (const vacc of vaccinations) {
    if (!vacc.next_due_date) continue;
    const due = new Date(`${vacc.next_due_date}T09:00:00`);
    if (Number.isNaN(due.getTime())) continue;

    const trigger = new Date(due.getTime());
    trigger.setDate(trigger.getDate() - 3);
    if (trigger.getTime() <= now) continue;

    specs.push({
      identifier: `vacc-${vacc.id}-due`,
      title: '💉 Vacuna próxima a vencer',
      body: `${vacc.vaccine_name} — vence el ${new Date(
        `${vacc.next_due_date}T09:00:00`,
      ).toLocaleDateString('es-VE', { day: 'numeric', month: 'long' })}`,
      triggerAt: trigger.toISOString(),
    });
  }
  return specs;
}
