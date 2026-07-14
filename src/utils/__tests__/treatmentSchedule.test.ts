import {
  generateDoseSchedule,
  parseDurationDays,
  parseFrequencyHours,
  reanchorFrom,
} from '@/utils/treatmentSchedule';

describe('parseFrequencyHours', () => {
  it('entiende las formas comunes en que el vet escribe la frecuencia', () => {
    expect(parseFrequencyHours('cada 8 horas')).toBe(8);
    expect(parseFrequencyHours('Cada 12 h')).toBe(12);
    expect(parseFrequencyHours('c/6h')).toBe(6);
    expect(parseFrequencyHours('24h')).toBe(24);
  });

  it('convierte "N veces al día" a horas', () => {
    expect(parseFrequencyHours('3 veces al día')).toBe(8);
    expect(parseFrequencyHours('2 veces al dia')).toBe(12);
  });

  it('devuelve null cuando no puede interpretar (la UI pedirá el dato)', () => {
    expect(parseFrequencyHours('según indicación')).toBeNull();
    expect(parseFrequencyHours(null)).toBeNull();
    expect(parseFrequencyHours(undefined)).toBeNull();
    expect(parseFrequencyHours('0h')).toBeNull();
  });
});

describe('parseDurationDays', () => {
  it('entiende días y semanas', () => {
    expect(parseDurationDays('7 días')).toBe(7);
    expect(parseDurationDays('por 5 dias')).toBe(5);
    expect(parseDurationDays('2 semanas')).toBe(14);
    expect(parseDurationDays('1 semana')).toBe(7);
  });

  it('devuelve null cuando no puede interpretar', () => {
    expect(parseDurationDays('hasta terminar el frasco')).toBeNull();
    expect(parseDurationDays(null)).toBeNull();
    expect(parseDurationDays('0 días')).toBeNull();
  });
});

describe('generateDoseSchedule', () => {
  it('ancla la primera toma al inicio del tratamiento y espacia por frecuencia', () => {
    const doses = generateDoseSchedule({
      startedAt: '2026-07-14T08:00:00.000Z',
      frequencyHours: 8,
      durationDays: 1,
    });
    expect(doses).toEqual([
      '2026-07-14T08:00:00.000Z',
      '2026-07-14T16:00:00.000Z',
      '2026-07-15T00:00:00.000Z',
    ]);
  });

  it('cubre la duración completa: 7 días cada 8 h son 21 tomas', () => {
    const doses = generateDoseSchedule({
      startedAt: '2026-07-14T08:00:00.000Z',
      frequencyHours: 8,
      durationDays: 7,
    });
    expect(doses).toHaveLength(21);
    expect(doses[0]).toBe('2026-07-14T08:00:00.000Z');
    expect(doses[20]).toBe('2026-07-21T00:00:00.000Z');
  });

  it('devuelve vacío con parámetros no positivos', () => {
    expect(
      generateDoseSchedule({
        startedAt: '2026-07-14T08:00:00.000Z',
        frequencyHours: 0,
        durationDays: 7,
      }),
    ).toEqual([]);
    expect(
      generateDoseSchedule({
        startedAt: 'no-es-fecha',
        frequencyHours: 8,
        durationDays: 7,
      }),
    ).toEqual([]);
  });
});

describe('reanchorFrom', () => {
  const schedule = [
    '2026-07-14T08:00:00.000Z',
    '2026-07-14T16:00:00.000Z',
    '2026-07-15T00:00:00.000Z', // la de las 12 de la noche que nadie quiere
    '2026-07-15T08:00:00.000Z',
  ];

  it('mueve la toma indicada y desplaza las siguientes conservando los intervalos', () => {
    // La toma de medianoche se adelanta 2 h (22:00): las siguientes se corren igual.
    const result = reanchorFrom(schedule, 2, '2026-07-14T22:00:00.000Z');
    expect(result).toEqual([
      '2026-07-14T08:00:00.000Z',
      '2026-07-14T16:00:00.000Z',
      '2026-07-14T22:00:00.000Z',
      '2026-07-15T06:00:00.000Z',
    ]);
  });

  it('también permite atrasar (toma tardía: la siguiente se corre hacia adelante)', () => {
    const result = reanchorFrom(schedule, 1, '2026-07-14T18:30:00.000Z');
    expect(result[1]).toBe('2026-07-14T18:30:00.000Z');
    expect(result[2]).toBe('2026-07-15T02:30:00.000Z');
    expect(result[3]).toBe('2026-07-15T10:30:00.000Z');
    // Las anteriores no se tocan.
    expect(result[0]).toBe(schedule[0]);
  });

  it('con índice fuera de rango o fecha inválida devuelve el horario intacto', () => {
    expect(reanchorFrom(schedule, 9, '2026-07-14T22:00:00.000Z')).toEqual(schedule);
    expect(reanchorFrom(schedule, 1, 'no-es-fecha')).toEqual(schedule);
  });
});
