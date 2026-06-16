/**
 * Integración REAL del servicio de Citas contra `../pawcare`.
 * Lee citas/servicios/disponibilidad reales y ejerce un ciclo crear→cancelar.
 */
import * as authService from '@/services/auth';
import * as appointmentsService from '@/services/appointments';
import * as petsService from '@/services/pets';
import * as secureStore from '@/utils/secureStore';

beforeAll(async () => {
  await authService.login('owner1@example.com', 'password123');
});

afterAll(async () => {
  await secureStore.clearTokens();
});

describe('appointmentsService (lecturas reales)', () => {
  it('lista las citas del owner', async () => {
    const list = await appointmentsService.listAppointments();
    expect(Array.isArray(list)).toBe(true);
    if (list.length > 0) {
      const detail = await appointmentsService.getAppointment(list[0]!.id);
      expect(detail.id).toBe(list[0]!.id);
      expect(detail).toHaveProperty('status');
      expect(detail).toHaveProperty('pet');
    }
  });

  it('lista los servicios agendables', async () => {
    const services = await appointmentsService.listServices();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
    expect(services[0]).toEqual(
      expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }),
    );
  });
});

describe('appointmentsService crear→cancelar (real)', () => {
  it('agenda una cita en un hueco disponible y la cancela', async () => {
    const now = new Date();
    let month = now.getMonth() + 2; // mes SIGUIENTE (1-based)
    let year = now.getFullYear();
    if (month > 12) {
      month -= 12;
      year += 1;
    }

    const days = await appointmentsService.getAvailableDays(month, year);
    const services = await appointmentsService.listServices();
    const pets = await petsService.listPets();

    // Requiere datos sembrados; si no hay disponibilidad, no se puede agendar.
    expect(days.length).toBeGreaterThan(0);
    expect(services.length).toBeGreaterThan(0);
    expect(pets.length).toBeGreaterThan(0);

    const dateStr = days[0]!; // ya es "YYYY-MM-DD"
    const vets = await appointmentsService.getAvailableVets(dateStr);
    expect(vets.length).toBeGreaterThan(0);

    const vet = vets[0]!;
    const scheduledAt = `${dateStr}T${vet.start_time ?? '09:00'}:00`;

    const created = await appointmentsService.createAppointment({
      pet_id: pets[0]!.id,
      service_id: services[0]!.id,
      assigned_to_id: vet.id,
      scheduled_at: scheduledAt,
      notes: 'Cita de prueba (integración)',
    });

    expect(created.id).toEqual(expect.any(Number));
    expect(created.status).toBe('pending');

    const cancelled = await appointmentsService.cancelAppointment(
      created.id,
      'Prueba de integración',
    );
    expect(cancelled.status).toBe('cancelled');
  }, 30000);
});
