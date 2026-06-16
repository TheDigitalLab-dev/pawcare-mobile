/**
 * Modelos del dominio (presentacionales) basados en el schema real de `../pawcare`.
 * Los enums Rails son enteros; aquí se modelan como uniones de string + mapas de
 * etiqueta en español para la UI. Campos marcados opcionales = "según contrato API".
 */

// --- Enums + etiquetas -----------------------------------------------------

export type Sex = 'male' | 'female' | 'other';
export const SEX_LABEL: Record<Sex, string> = {
  female: 'Femenino',
  male: 'Masculino',
  other: 'Otro',
};

export type PhoneType = 'whatsapp' | 'telegram' | 'regular';
export const PHONE_TYPE_LABEL: Record<PhoneType, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  regular: 'Normal',
};

export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export const SPECIES_LABEL: Record<Species, string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  rabbit: 'Conejo',
  other: 'Otro',
};
export const SPECIES_EMOJI: Record<Species, string> = {
  dog: '🐶',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
};

export type AdoptionStatus = 'not_in_adoption' | 'available' | 'adopted';
export const ADOPTION_STATUS_LABEL: Record<AdoptionStatus, string> = {
  not_in_adoption: 'No disponible',
  available: 'En adopción',
  adopted: 'Adoptado',
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

export type StaffRole =
  | 'admin'
  | 'vet'
  | 'vet_assistant'
  | 'assistant'
  | 'finances'
  | 'hr';
export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  admin: 'Administrador',
  vet: 'Veterinario',
  vet_assistant: 'Asistente veterinario',
  assistant: 'Asistente',
  finances: 'Finanzas',
  hr: 'Recursos humanos',
};

// --- Entidades -------------------------------------------------------------

export interface Owner {
  id: number;
  type: 'Owner';
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  username: string;
  identity_document: string;
  address?: string;
  sex?: Sex;
  phone?: string;
  phone_type?: PhoneType;
  active?: boolean;
}

export interface StaffUser {
  id: number;
  type: 'User';
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  username: string;
  role: StaffRole;
  specialty?: string;
}

export type AuthUser = Owner | StaffUser;

export interface Pet {
  id: number;
  name: string;
  species: Species;
  breed?: string;
  sex?: Sex;
  birth_date?: string;
  distinctive_features?: string;
  adoption_status?: AdoptionStatus;
  photo_url?: string | null;
  proprietary_id?: number;
}

export interface PetMedicalProfile {
  chronic_diseases?: string[];
  allergies?: string[];
  blood_type?: string;
  notes?: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  duration_minutes?: number;
  requires_appointment?: boolean;
}

export interface Appointment {
  id: number;
  scheduled_at: string;
  duration_minutes?: number;
  status: AppointmentStatus;
  payment_status?: PaymentStatus;
  notes?: string;
  service_name?: string;
  vet_name?: string;
  pet_name?: string;
}

export interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  pet_name?: string;
  owner_name?: string;
  concept?: string;
}

export interface Consultation {
  id: number;
  consultation_date: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  weight?: number;
  temperature?: number;
  vet_name?: string;
  pet_name?: string;
  treatment_completed_at?: string | null;
}

export interface Vaccination {
  id: number;
  vaccine_name: string;
  manufacturer?: string;
  dose?: string;
  application_date: string;
  next_due_date?: string;
}

export interface Deworming {
  id: number;
  product_name: string;
  dose?: string;
  application_date: string;
  next_due_date?: string;
}

export interface LabExam {
  id: number;
  exam_name: string;
  status: string;
  results?: string;
}

export interface Prescription {
  id: number;
  diagnosis?: string;
  general_instructions?: string;
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: number;
  medication_name: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  completed_at?: string | null;
}

export interface MedicalReport {
  id: number;
  title: string;
  content?: string;
  generated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sale_price?: number;
  currency?: string;
  current_stock?: number;
  requires_prescription?: boolean;
  photo_url?: string | null;
}

export interface Sponsorship {
  id: number;
  amount: number;
  status: string;
  start_date?: string;
  end_date?: string;
  pet_name?: string;
}

export interface AdoptionPet extends Pet {
  age_label?: string;
  description?: string;
}
