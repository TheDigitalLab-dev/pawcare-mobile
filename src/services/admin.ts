/**
 * Servicio Admin (staff) contra el backend real `../pawcare`.
 * Endpoints JSON del namespace /admin/*-list (índices) + métricas.
 * Requiere sesión de staff (User) con Bearer.
 */
import type {
  Appointment,
  Consultation,
  Deworming,
  MedicalReport,
  Payment,
  Pet,
  Vaccination,
} from '@/types/models';
import { api } from './api';

/** Registro de adopción del admin (adoptions-list). */
export interface AdoptionRecord {
  id: number;
  adoption_date?: string | null;
  notes?: string | null;
  pet: { id: number; name: string; species: string } | null;
  adopter?: { id: number; full_name?: string } | null;
}

/** Esquema de vacunación (admin vaccination-schedules-list). */
export interface VaccinationSchedule {
  id: number;
  pet_id: number;
  schedule_type: string;
  start_date?: string | null;
  status: string;
  pet: { id: number; name: string; species: string } | null;
}

/** Consulta completa (con recetas y exámenes) — /admin/consultations/:id. */
export async function getAdminConsultation(id: number): Promise<Consultation> {
  const { consultation } = await api.get<{ consultation: Consultation }>(
    `/admin/consultations/${id}`,
  );
  return consultation;
}

export async function listVaccinationSchedules(): Promise<VaccinationSchedule[]> {
  const { schedules } = await api.get<{ schedules: VaccinationSchedule[] }>(
    '/admin/vaccination-schedules-list',
  );
  return schedules;
}

export async function listAdminMedicalReports(): Promise<MedicalReport[]> {
  const { medical_reports } = await api.get<{ medical_reports: MedicalReport[] }>(
    '/admin/medical-reports-list',
  );
  return medical_reports;
}

export async function getAdminMedicalReport(id: number): Promise<MedicalReport> {
  const { medical_report } = await api.get<{ medical_report: MedicalReport }>(
    `/admin/medical_reports/${id}`,
  );
  return medical_report;
}

export async function listAdminPets(): Promise<Pet[]> {
  const res = await api.get<{ pets: Pet[] }>('/admin/pets-list');
  return res.pets;
}

export async function listAdminAppointments(): Promise<Appointment[]> {
  const res = await api.get<{ appointments: Appointment[] }>('/admin/appointments-list');
  return res.appointments;
}

export async function listAdminPayments(): Promise<Payment[]> {
  const res = await api.get<{ payments: Payment[] }>('/admin/payments-list');
  return res.payments;
}

export async function listAdminConsultations(): Promise<Consultation[]> {
  const res = await api.get<{ consultations: Consultation[] }>(
    '/admin/consultations-list',
  );
  return res.consultations;
}

export async function listAdminVaccinations(): Promise<Vaccination[]> {
  const res = await api.get<{ vaccinations: Vaccination[] }>('/admin/vaccinations-list');
  return res.vaccinations;
}

export async function listAdminDewormings(): Promise<Deworming[]> {
  const res = await api.get<{ dewormings: Deworming[] }>('/admin/dewormings-list');
  return res.dewormings;
}

export async function listAdminAdoptions(): Promise<AdoptionRecord[]> {
  const res = await api.get<{ adoptions: AdoptionRecord[] }>('/admin/adoptions-list');
  return res.adoptions;
}

export interface AdminMetrics {
  consultations?: number;
  revenue?: number;
  completed_appointments?: number;
  cancelled_appointments?: number;
  new_patients?: number;
  vaccinations?: number;
  adoptions?: number;
  active_sponsorships?: number;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const res = await api.get<{ data: AdminMetrics }>('/admin/metrics/dashboard');
  return res.data;
}
