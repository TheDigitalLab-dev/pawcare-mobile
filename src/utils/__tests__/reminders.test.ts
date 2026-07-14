import { appointmentReminders, vaccinationReminders } from '@/utils/reminders';

const NOW = '2026-07-14T12:00:00.000Z';

describe('appointmentReminders', () => {
  const base = {
    pet: { id: 1, name: 'Luna', species: 'dog' },
    service: { id: 2, name: 'Consulta general' },
  };

  it('genera avisos 24 h y 2 h antes de una cita futura', () => {
    const specs = appointmentReminders(
      [
        {
          id: 10,
          scheduled_at: '2026-07-16T15:00:00.000Z',
          status: 'confirmed',
          ...base,
        },
      ],
      NOW,
    );

    expect(specs).toHaveLength(2);
    expect(specs[0]).toMatchObject({
      identifier: 'appt-10-24h',
      triggerAt: '2026-07-15T15:00:00.000Z',
    });
    expect(specs[1]).toMatchObject({
      identifier: 'appt-10-2h',
      triggerAt: '2026-07-16T13:00:00.000Z',
    });
    expect(specs[0]!.body).toContain('Luna');
    expect(specs[0]!.body).toContain('Consulta general');
  });

  it('omite los avisos cuyo momento ya pasó (cita en menos de 24 h)', () => {
    const specs = appointmentReminders(
      [{ id: 11, scheduled_at: '2026-07-15T08:00:00.000Z', status: 'pending', ...base }],
      NOW,
    );
    // Solo el de 2 h antes (el de 24 h antes ya quedó en el pasado).
    expect(specs.map((s) => s.identifier)).toEqual(['appt-11-2h']);
  });

  it('ignora citas canceladas, completadas o pasadas', () => {
    const specs = appointmentReminders(
      [
        {
          id: 12,
          scheduled_at: '2026-07-16T15:00:00.000Z',
          status: 'cancelled',
          ...base,
        },
        {
          id: 13,
          scheduled_at: '2026-07-16T15:00:00.000Z',
          status: 'completed',
          ...base,
        },
        {
          id: 14,
          scheduled_at: '2026-07-01T15:00:00.000Z',
          status: 'confirmed',
          ...base,
        },
      ],
      NOW,
    );
    expect(specs).toEqual([]);
  });
});

describe('vaccinationReminders', () => {
  it('avisa 3 días antes del vencimiento, a las 9:00 locales', () => {
    const specs = vaccinationReminders(
      [{ id: 9, vaccine_name: 'Antirrábica', next_due_date: '2026-07-30' }],
      NOW,
    );

    expect(specs).toHaveLength(1);
    expect(specs[0]!.identifier).toBe('vacc-9-due');
    expect(specs[0]!.title).toContain('Vacuna');
    expect(specs[0]!.body).toContain('Antirrábica');
    const trigger = new Date(specs[0]!.triggerAt);
    expect(trigger.getDate()).toBe(27); // 30 - 3 días
    expect(trigger.getHours()).toBe(9); // hora local
  });

  it('omite vacunas sin fecha próxima o con aviso ya vencido', () => {
    const specs = vaccinationReminders(
      [
        { id: 1, vaccine_name: 'Parvo', next_due_date: null },
        { id: 2, vaccine_name: 'Moquillo', next_due_date: '2026-07-10' },
      ],
      NOW,
    );
    expect(specs).toEqual([]);
  });
});
