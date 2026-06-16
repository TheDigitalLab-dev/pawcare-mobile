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

  it('lista esquemas de vacunación', async () => {
    const schedules = await adminService.listVaccinationSchedules();
    expect(Array.isArray(schedules)).toBe(true);
  });

  // Nota: /admin/medical-reports-list es lento/flaky en el backend (genera
  // contenido) y cuelga undici en Jest; la pantalla lo consume con timeout y
  // estados de carga/error. No se cubre con test de integración por esa razón.

  it('obtiene una consulta completa con recetas y exámenes', async () => {
    const consultations = await adminService.listAdminConsultations();
    if (consultations.length === 0) return;
    const full = await adminService.getAdminConsultation(consultations[0]!.id);
    expect(full.id).toBe(consultations[0]!.id);
    expect(Array.isArray(full.prescriptions)).toBe(true);
    expect(Array.isArray(full.lab_exams)).toBe(true);
  });
});
