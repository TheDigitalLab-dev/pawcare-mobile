/**
 * Lógica de horarios de tratamientos de medicación (local-first).
 *
 * El horario se ancla al momento en que el dueño pulsa "Tratamiento iniciado":
 * la primera toma es ese instante y las siguientes se espacian por la frecuencia
 * hasta cubrir la duración. `reanchorFrom` permite mover una toma (p. ej. la de
 * medianoche) desplazando las posteriores el mismo delta, conservando los
 * intervalos — así una toma tardía no obliga a levantarse a las 12.
 *
 * Los textos de frecuencia/duración vienen de la receta (`PrescriptionItem`)
 * escritos por el veterinario; los parsers cubren las formas comunes y devuelven
 * `null` cuando no pueden interpretar (la UI pide el dato explícitamente).
 */

/** "cada 8 horas" | "c/6h" | "12h" | "3 veces al día" → horas entre tomas. */
export function parseFrequencyHours(text: string | null | undefined): number | null {
  if (!text) return null;
  const t = text.toLowerCase();

  const timesPerDay = t.match(/(\d+)\s*veces?\s+al\s+d[ií]a/);
  if (timesPerDay) {
    const n = Number(timesPerDay[1]);
    return n > 0 && 24 % n === 0 ? 24 / n : n > 0 ? Math.round(24 / n) : null;
  }

  const hours = t.match(/(\d+)\s*h(?:oras?|rs?)?\b/);
  if (hours) {
    const n = Number(hours[1]);
    return n > 0 ? n : null;
  }
  return null;
}

/** "7 días" | "2 semanas" → días de duración del tratamiento. */
export function parseDurationDays(text: string | null | undefined): number | null {
  if (!text) return null;
  const t = text.toLowerCase();

  const weeks = t.match(/(\d+)\s*semanas?\b/);
  if (weeks) {
    const n = Number(weeks[1]);
    return n > 0 ? n * 7 : null;
  }

  const days = t.match(/(\d+)\s*d[ií]as?\b/);
  if (days) {
    const n = Number(days[1]);
    return n > 0 ? n : null;
  }
  return null;
}

export interface DoseScheduleInput {
  /** ISO del momento "tratamiento iniciado" (ancla de la primera toma). */
  startedAt: string;
  frequencyHours: number;
  durationDays: number;
}

const HOUR_MS = 60 * 60 * 1000;

/** Genera los ISO de todas las tomas: ancla + i·frecuencia, cubriendo la duración. */
export function generateDoseSchedule(input: DoseScheduleInput): string[] {
  const { startedAt, frequencyHours, durationDays } = input;
  const start = Date.parse(startedAt);
  if (Number.isNaN(start) || frequencyHours <= 0 || durationDays <= 0) return [];

  const count = Math.floor((durationDays * 24) / frequencyHours);
  const doses: string[] = [];
  for (let i = 0; i < count; i++) {
    doses.push(new Date(start + i * frequencyHours * HOUR_MS).toISOString());
  }
  return doses;
}

/**
 * Mueve la toma `fromIndex` a `newTimeIso` y desplaza todas las posteriores el
 * mismo delta (los intervalos entre tomas se conservan). Las anteriores no se
 * tocan. Con entradas inválidas devuelve el horario intacto.
 */
export function reanchorFrom(
  schedule: string[],
  fromIndex: number,
  newTimeIso: string,
): string[] {
  const anchor = schedule[fromIndex];
  if (anchor === undefined) return schedule;
  const oldTime = Date.parse(anchor);
  const newTime = Date.parse(newTimeIso);
  if (Number.isNaN(oldTime) || Number.isNaN(newTime)) return schedule;

  const delta = newTime - oldTime;
  return schedule.map((iso, i) =>
    i < fromIndex ? iso : new Date(Date.parse(iso) + delta).toISOString(),
  );
}
