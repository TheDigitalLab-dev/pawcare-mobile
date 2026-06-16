/**
 * Servicio Admin (staff) contra el backend real `../pawcare`.
 * Endpoints JSON del namespace /admin/*-list (índices) + métricas.
 * Requiere sesión de staff (User) con Bearer.
 */
import type {
  Appointment,
  Consultation,
  Deworming,
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
