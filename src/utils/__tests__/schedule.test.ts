import { generateTimeSlots } from '@/utils/schedule';

describe('generateTimeSlots', () => {
  it('genera huecos en pasos del tamaño dado', () => {
    expect(generateTimeSlots('09:00', '11:00', 30)).toEqual([
      '09:00',
      '09:30',
      '10:00',
      '10:30',
    ]);
  });

  it('solo incluye huecos que caben completos antes del fin', () => {
    expect(generateTimeSlots('09:00', '10:00', 45)).toEqual(['09:00']);
  });

  it('devuelve vacío con entradas inválidas o paso no positivo', () => {
    expect(generateTimeSlots('bad', '10:00', 30)).toEqual([]);
    expect(generateTimeSlots('09:00', '10:00', 0)).toEqual([]);
    expect(generateTimeSlots('10:00', '09:00', 30)).toEqual([]);
  });
});
