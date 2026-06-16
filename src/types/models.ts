/**
 * Modelos del dominio (presentacionales) basados en el schema real de `../pawcare`.
 * Los enums Rails son enteros; aquí se modelan como uniones de string + mapas de
 * etiqueta en español para la UI. Campos marcados opcionales = "según contrato API".
 */

// --- Enums + etiquetas -----------------------------------------------------

// Owner.sex admite los tres; Pet.sex (backend) solo male/female.
export type Sex = 'male' | 'female' | 'other';
export const SEX_LABEL: Record<Sex, string> = {
  female: 'Femenino',
  male: 'Masculino',
  other: 'Otro',
};

export type PetSex = 'male' | 'female';
export const PET_SEX_LABEL: Record<PetSex, string> = {
  male: 'Macho',
  female: 'Hembra',
};

export type PhoneType = 'whatsapp' | 'telegram' | 'regular';
export const PHONE_TYPE_LABEL: Record<PhoneType, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  regular: 'Normal',
};

// Enum del backend (app/models/pet.rb): 8 especies.
export type Species =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rabbit'
  | 'hamster'
  | 'reptile'
  | 'fish'
  | 'other';
export const SPECIES_LABEL: Record<Species, string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  rabbit: 'Conejo',
  hamster: 'Hámster',
  reptile: 'Reptil',
  fish: 'Pez',
  other: 'Otro',
};
export const SPECIES_EMOJI: Record<Species, string> = {
  dog: '🐶',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  reptile: '🦎',
  fish: '🐟',
  other: '🐾',
};

// Enum del backend: not_for_adoption | available_for_adoption | adopted.
export type AdoptionStatus = 'not_for_adoption' | 'available_for_adoption' | 'adopted';
export const ADOPTION_STATUS_LABEL: Record<AdoptionStatus, string> = {
  not_for_adoption: 'No disponible',
  available_for_adoption: 'En adopción',
  adopted: 'Adoptado',
};

// Enum del backend (app/models/appointment.rb).
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';
export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  rescheduled: 'Reagendada',
};

// payment_status de la cita (distinto del estado del modelo Payment).
export type AppointmentPaymentStatus = 'unpaid' | 'paid' | 'refunded';
export const APPOINTMENT_PAYMENT_STATUS_LABEL: Record<AppointmentPaymentStatus, string> =
  {
    unpaid: 'Sin pagar',
    paid: 'Pagado',
    refunded: 'Reembolsado',
  };

// Enum del backend (app/models/payment.rb).
export type PaymentStatus = 'draft' | 'pending' | 'completed' | 'overdue' | 'cancelled';
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  completed: 'Pagado',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'online';
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  online: 'En línea',
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

// Espejo de `pet_json` (app/controllers/concerns/pet_jsonable.rb).
export interface Pet {
  id: number;
  name: string;
  species: Species;
  breed?: string | null;
  sex?: PetSex | null;
  birth_date?: string | null;
  age_display?: string | null;
  distinctive_features?: string | null;
  adoption_status?: AdoptionStatus;
  active?: boolean;
  photo_url?: string | null;
  proprietary_id?: number;
  proprietary_type?: 'Owner' | 'User';
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
  description?: string | null;
  price?: number | null;
  price_cents?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
}

/** Vet disponible para una fecha (de owner-available-vets). */
export interface AvailableVet {
  id: number;
  first_name: string;
  last_name: string;
  start_time: string | null; // "HH:MM"
  end_time: string | null;
}

/** Mini-objetos anidados que devuelve appointment_json. */
export interface AppointmentPet {
  id: number;
  name: string;
  species: Species;
  breed?: string | null;
}
export interface AppointmentVet {
  id: number;
  first_name: string;
  last_name: string;
  role?: StaffRole;
}
export interface AppointmentService {
  id: number;
  name: string;
  price?: number | null;
  price_cents?: number | null;
}

// Espejo de appointment_json (owner_appointments_controller).
export interface Appointment {
  id: number;
  pet_id: number;
  service_id: number;
  owner_id: number;
  assigned_to_id: number | null;
  scheduled_at: string;
  duration_minutes?: number | null;
  status: AppointmentStatus;
  payment_status: AppointmentPaymentStatus;
  notes?: string | null;
  cancellation_reason?: string | null;
  pet: AppointmentPet | null;
  service: AppointmentService | null;
  assigned_to: AppointmentVet | null;
}

export interface PaymentItem {
  id: number;
  service_id?: number | null;
  description?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  total_price?: number | null;
  notes?: string | null;
}

// Espejo de payment_json (owner_payments_controller).
export interface Payment {
  id: number;
  owner_id: number;
  appointment_id?: number | null;
  status: PaymentStatus;
  amount: number;
  amount_cents?: number | null;
  currency: string;
  due_date?: string | null;
  due_days?: number | null;
  payment_method?: PaymentMethod | null;
  paid_at?: string | null;
  transaction_id?: string | null;
  provider?: string | null;
  payment_reference?: string | null;
  pet_name?: string | null;
  owner_name?: string | null;
  notes?: string | null;
  items?: PaymentItem[];
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
