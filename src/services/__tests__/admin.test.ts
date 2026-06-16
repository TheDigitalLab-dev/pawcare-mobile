/**
 * Integración REAL del servicio Admin contra `../pawcare` (login de staff).
 */
import * as authService from '@/services/auth';
import * as adminService from '@/services/admin';
import * as secureStore from '@/utils/secureStore';

beforeAll(async () => {
  await authService.login('admin@pawcare.com', 'password123');
});

afterAll(async () => {
  await secureStore.clearTokens();
});

describe('adminService (listas reales del staff)', () => {
  it('lista mascotas, citas y pagos de toda la clínica', async () => {
    const [pets, appointments, payments] = await Promise.all([
      adminService.listAdminPets(),
      adminService.listAdminAppointments(),
      adminService.listAdminPayments(),
    ]);
    expect(Array.isArray(pets)).toBe(true);
    expect(Array.isArray(appointments)).toBe(true);
    expect(Array.isArray(payments)).toBe(true);
  });

  it('lista registros médicos (consultas, vacunas, desparasitaciones)', async () => {
    const [consultations, vaccinations, dewormings] = await Promise.all([
      adminService.listAdminConsultations(),
      adminService.listAdminVaccinations(),
      adminService.listAdminDewormings(),
    ]);
    expect(Array.isArray(consultations)).toBe(true);
    expect(Array.isArray(vaccinations)).toBe(true);
    expect(Array.isArray(dewormings)).toBe(true);
  });

  it('lista mascotas en adopción', async () => {
    const adoptions = await adminService.listAdminAdoptions();
    expect(Array.isArray(adoptions)).toBe(true);
  });
});
