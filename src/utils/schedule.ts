/**
 * Genera horarios ("HH:MM") entre `start` y `end` en pasos de `stepMinutes`.
 * Solo incluye huecos que caben completos antes de `end`.
 */
export function generateTimeSlots(
  start: string,
  end: string,
  stepMinutes: number,
): string[] {
  const toMinutes = (t: string): number | null => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  };

  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  if (startMin === null || endMin === null || stepMinutes <= 0) return [];

  const format = (mins: number): string =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  const slots: string[] = [];
  for (let t = startMin; t + stepMinutes <= endMin; t += stepMinutes) {
    slots.push(format(t));
  }
  return slots;
}
