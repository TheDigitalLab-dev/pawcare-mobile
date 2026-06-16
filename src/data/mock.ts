/**
 * Datos mock para las pantallas presentacionales (mientras no hay servicios
 * cableados). Se reemplazan por llamadas reales al API en cada módulo de dominio.
 */
import type {
  AdoptionPet,
  Appointment,
  Consultation,
  Deworming,
  LabExam,
  MedicalReport,
  Owner,
  Payment,
  Pet,
  PetMedicalProfile,
  Prescription,
  Product,
  Service,
  Sponsorship,
  StaffUser,
  Vaccination,
} from '@/types/models';

export const mockOwner: Owner = {
  id: 1,
  type: 'Owner',
  first_name: 'María',
  last_name: 'González',
  full_name: 'María González',
  email: 'maria@example.com',
  username: 'maria',
  identity_document: 'V-12345678',
  address: 'Av. Principal 123',
  sex: 'female',
  phone: '+58 412 1234567',
  phone_type: 'whatsapp',
  active: true,
};

export const mockStaff: StaffUser = {
  id: 9,
  type: 'User',
  first_name: 'Carlos',
  last_name: 'Pérez',
  full_name: 'Dr. Carlos Pérez',
  email: 'carlos@pawcare.com',
  username: 'cperez',
  role: 'vet',
  specialty: 'Medicina general',
};

export const mockPets: Pet[] = [
  {
    id: 1,
    name: 'Firulais',
    species: 'dog',
    breed: 'Labrador',
    sex: 'male',
    birth_date: '2022-03-10',
    adoption_status: 'not_for_adoption',
    photo_url: null,
    proprietary_id: 1,
  },
  {
    id: 2,
    name: 'Michi',
    species: 'cat',
    breed: 'Siamés',
    sex: 'female',
    birth_date: '2021-07-22',
    adoption_status: 'not_for_adoption',
    photo_url: null,
    proprietary_id: 1,
  },
];

export const mockMedicalProfile: PetMedicalProfile = {
  chronic_diseases: [],
  allergies: ['Polen'],
  blood_type: 'DEA 1.1+',
  notes: 'Sin observaciones relevantes.',
};

export const mockServices: Service[] = [
  {
    id: 1,
    name: 'Consulta general',
    description: 'Revisión clínica completa',
    price: 45000,
    currency: 'COP',
    duration_minutes: 30,
  },
  {
    id: 2,
    name: 'Vacunación',
    description: 'Aplicación de vacunas',
    price: 30000,
    currency: 'COP',
    duration_minutes: 20,
  },
  {
    id: 3,
    name: 'Desparasitación',
    description: 'Tratamiento antiparasitario',
    price: 25000,
    currency: 'COP',
    duration_minutes: 15,
  },
  {
    id: 4,
    name: 'Peluquería',
    description: 'Baño y corte',
    price: 40000,
    currency: 'COP',
    duration_minutes: 60,
  },
];

const mockAppointmentVet = {
  id: 10,
  first_name: 'Carlos',
  last_name: 'Pérez',
  role: 'vet' as const,
};

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    pet_id: 1,
    service_id: 1,
    owner_id: 1,
    assigned_to_id: 10,
    scheduled_at: '2026-06-16T10:30:00',
    duration_minutes: 30,
    status: 'confirmed',
    payment_status: 'unpaid',
    notes: null,
    cancellation_reason: null,
    pet: { id: 1, name: 'Firulais', species: 'dog', breed: 'Labrador' },
    service: { id: 1, name: 'Consulta general', price: 45000 },
    assigned_to: mockAppointmentVet,
  },
  {
    id: 2,
    pet_id: 2,
    service_id: 2,
    owner_id: 1,
    assigned_to_id: 10,
    scheduled_at: '2026-06-20T14:00:00',
    duration_minutes: 20,
    status: 'pending',
    payment_status: 'unpaid',
    notes: null,
    cancellation_reason: null,
    pet: { id: 2, name: 'Michi', species: 'cat', breed: 'Siamés' },
    service: { id: 2, name: 'Vacunación', price: 30000 },
    assigned_to: mockAppointmentVet,
  },
];

export const mockPayments: Payment[] = [
  {
    id: 1,
    owner_id: 1,
    amount: 45000,
    currency: 'COP',
    status: 'pending',
    due_date: '2026-06-25',
    pet_name: 'Firulais',
    owner_name: 'María González',
  },
  {
    id: 2,
    owner_id: 1,
    amount: 30000,
    currency: 'COP',
    status: 'completed',
    paid_at: '2026-05-31',
    pet_name: 'Michi',
    owner_name: 'María González',
  },
  {
    id: 3,
    owner_id: 1,
    amount: 25000,
    currency: 'COP',
    status: 'overdue',
    due_date: '2026-06-01',
    pet_name: 'Firulais',
    owner_name: 'María González',
  },
];

const mockMedicalVet = { id: 10, full_name: 'Dr. Carlos Pérez' };

export const mockConsultations: Consultation[] = [
  {
    id: 1,
    pet_id: 1,
    consultation_date: '2026-05-30T09:00:00',
    diagnosis: 'Dermatitis leve',
    treatment: 'Antihistamínico 7 días',
    weight: 28.5,
    temperature: 38.4,
    treatment_completed_at: null,
    veterinarian: mockMedicalVet,
    prescriptions: [],
    lab_exams: [],
  },
  {
    id: 2,
    pet_id: 1,
    consultation_date: '2026-03-12T11:00:00',
    diagnosis: 'Control sano',
    treatment: 'Ninguno',
    weight: 27.9,
    temperature: 38.2,
    treatment_completed_at: '2026-03-20T00:00:00',
    veterinarian: mockMedicalVet,
    prescriptions: [],
    lab_exams: [],
  },
];

export const mockVaccinations: Vaccination[] = [
  {
    id: 1,
    vaccine_name: 'Antirrábica',
    manufacturer: 'Zoetis',
    dose: '1 ml',
    application_date: '2026-04-10',
    next_due_date: '2027-04-10',
  },
  {
    id: 2,
    vaccine_name: 'Quíntuple',
    manufacturer: 'MSD',
    dose: '1 ml',
    application_date: '2026-01-15',
    next_due_date: '2026-07-15',
  },
];

export const mockDewormings: Deworming[] = [
  {
    id: 1,
    product_name: 'Drontal Plus',
    dose: '1 tableta',
    application_date: '2026-05-01',
    next_due_date: '2026-08-01',
  },
];

export const mockLabExams: LabExam[] = [
  {
    id: 1,
    exam_name: 'Hemograma completo',
    status: 'completed',
    results: 'Valores dentro de rango normal.',
  },
  { id: 2, exam_name: 'Perfil renal', status: 'pending' },
];

export const mockPrescriptions: Prescription[] = [
  {
    id: 1,
    diagnosis: 'Dermatitis leve',
    general_instructions: 'Mantener la piel seca.',
    items: [
      {
        id: 1,
        medication_name: 'Cetirizina',
        dose: '10 mg',
        frequency: 'cada 24h',
        duration: '7 días',
        special_instructions: null,
      },
    ],
  },
];

export const mockReports: MedicalReport[] = [
  {
    id: 1,
    pet_id: 1,
    title: 'Informe clínico — Firulais',
    content: 'Resumen de la consulta del 30/05.',
    generated_at: '2026-05-30T12:00:00',
    created_by: mockMedicalVet,
  },
];

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Alimento Premium 2kg',
    description: 'Croquetas para perro adulto',
    sale_price: '30000',
    in_stock: true,
    stock_quantity: 12,
    image_url: null,
  },
  {
    id: 2,
    name: 'Juguete mordedor',
    description: 'Caucho resistente',
    sale_price: '12000',
    in_stock: false,
    stock_quantity: 0,
    image_url: null,
  },
  {
    id: 3,
    name: 'Antipulgas',
    description: 'Pipeta mensual',
    sale_price: '18000',
    in_stock: true,
    stock_quantity: 30,
    image_url: null,
  },
];

export const mockAdoptionPets: AdoptionPet[] = [
  {
    id: 10,
    name: 'Luna',
    species: 'dog',
    breed: 'Mestiza',
    sex: 'female',
    age_display: '2 años',
    distinctive_features: 'Cariñosa y sociable.',
    photo_url: null,
  },
  {
    id: 11,
    name: 'Simba',
    species: 'cat',
    breed: 'Naranja',
    sex: 'male',
    age_display: '1 año',
    distinctive_features: 'Juguetón.',
    photo_url: null,
  },
];

/** Formatea un monto en moneda local (presentacional). */
// Los formateadores reales viven en utils/format; se re-exportan para no romper
// imports existentes mientras se migra cada dominio fuera de este mock.
export { formatDate, formatDateTime, formatMoney } from '@/utils/format';
