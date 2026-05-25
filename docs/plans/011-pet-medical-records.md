# Pet Medical Records System - Implementation Plan

## Overview

Sistema completo de historiales medicos veterinarios para PawCare, incluyendo consultas, recetas, examenes de laboratorio, vacunaciones, desparasitaciones, y sistema de recordatorios por email.

**Basado en mockups:**
- `/historial` - Vista de historial medico por mascota
- `/consulta` - Formulario de nueva consulta con tabs
- `/reportes` - Generacion y exportacion de reportes

---

## Epics y User Stories

### Epic 1: Modelos Base de Datos (P0)

#### US-1.1: Crear modelo PetMedicalProfile
**Como** veterinario
**Quiero** mantener un perfil medico para cada mascota
**Para** registrar enfermedades cronicas, alergias e informacion medica importante

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_pet_medical_profiles.rb`
- `app/models/pet_medical_profile.rb`
- `spec/models/pet_medical_profile_spec.rb`
- `spec/factories/pet_medical_profiles.rb`
- `db/seeds/pet_medical_profiles.rb`

**Schema:**
```ruby
create_table :pet_medical_profiles do |t|
  t.references :pet, null: false, foreign_key: true, index: { unique: true }
  t.json :chronic_diseases, default: []
  t.json :allergies, default: []
  t.string :blood_type
  t.text :notes
  t.timestamps
end
```

---

#### US-1.2: Crear modelo Consultation
**Como** veterinario
**Quiero** registrar consultas medicas
**Para** tener un historial completo de cada visita

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_consultations.rb`
- `app/models/consultation.rb`
- `spec/models/consultation_spec.rb`
- `spec/factories/consultations.rb`
- `db/seeds/consultations.rb`

**Schema:**
```ruby
create_table :consultations do |t|
  t.references :pet, null: false, foreign_key: true
  t.references :veterinarian, null: false, foreign_key: { to_table: :users }
  t.datetime :consultation_date, null: false
  t.text :anamnesis
  t.text :diagnosis
  t.text :treatment
  t.text :notes
  # Signos vitales
  t.decimal :weight, precision: 5, scale: 2
  t.decimal :temperature, precision: 4, scale: 2
  t.integer :heart_rate
  t.integer :respiratory_rate
  t.string :blood_pressure
  t.datetime :deleted_at
  t.timestamps
end
```

---

#### US-1.3: Actualizar modelo Pet
**Como** desarrollador
**Quiero** agregar asociaciones medicas al modelo Pet
**Para** acceder a todos los datos medicos desde una mascota

**Modificar:** `app/models/pet.rb`
```ruby
has_one :medical_profile, class_name: 'PetMedicalProfile', dependent: :destroy
has_many :consultations, dependent: :destroy
has_many :vaccinations, dependent: :destroy
has_many :dewormings, dependent: :destroy
has_many :vaccination_schedules, dependent: :destroy
```

---

### Epic 2: Sistema de Recetas (P0)

#### US-2.1: Crear modelos Prescription y PrescriptionItem
**Como** veterinario
**Quiero** crear recetas con multiples medicamentos
**Para** dar instrucciones claras de tratamiento

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_prescriptions.rb`
- `db/migrate/YYYYMMDDHHMMSS_create_prescription_items.rb`
- `app/models/prescription.rb`
- `app/models/prescription_item.rb`
- `spec/models/prescription_spec.rb`
- `spec/models/prescription_item_spec.rb`
- `spec/factories/prescriptions.rb`
- `spec/factories/prescription_items.rb`

**Schema Prescription:**
```ruby
create_table :prescriptions do |t|
  t.references :consultation, null: false, foreign_key: true
  t.references :veterinarian, null: false, foreign_key: { to_table: :users }
  t.text :diagnosis
  t.text :general_instructions
  t.timestamps
end
```

**Schema PrescriptionItem:**
```ruby
create_table :prescription_items do |t|
  t.references :prescription, null: false, foreign_key: true
  t.string :medication_name, null: false
  t.string :dose, null: false
  t.string :frequency, null: false
  t.string :duration
  t.text :special_instructions
  t.timestamps
end
```

---

### Epic 3: Sistema de Examenes de Laboratorio (P1)

#### US-3.1: Crear modelo LabExam
**Como** veterinario
**Quiero** registrar solicitudes y resultados de examenes de laboratorio
**Para** llevar control de diagnosticos

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_lab_exams.rb`
- `app/models/lab_exam.rb`
- `spec/models/lab_exam_spec.rb`
- `spec/factories/lab_exams.rb`

**Schema:**
```ruby
create_table :lab_exams do |t|
  t.references :consultation, null: false, foreign_key: true
  t.references :veterinarian, null: false, foreign_key: { to_table: :users }
  t.integer :exam_type, null: false  # enum
  t.string :exam_name, null: false
  t.text :clinical_history
  t.text :clinical_signs
  t.json :results, default: {}
  t.integer :status, default: 0  # pending, in_progress, completed, cancelled
  t.boolean :fasting_required, default: false
  t.boolean :sedation_required, default: false
  t.text :special_instructions
  t.timestamps
end
```

**Enum exam_type:** hemograma, bioquimica, orina, coprologia, citologia, biopsia, radiografia, ecografia, electrocardiograma, other

---

### Epic 4: Sistema de Vacunacion (P1)

#### US-4.1: Crear modelo Vaccination
**Como** veterinario
**Quiero** registrar vacunaciones
**Para** llevar el historial de inmunizacion

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_vaccinations.rb`
- `app/models/vaccination.rb`
- `spec/models/vaccination_spec.rb`
- `spec/factories/vaccinations.rb`
- `db/seeds/vaccinations.rb`

**Schema:**
```ruby
create_table :vaccinations do |t|
  t.references :pet, null: false, foreign_key: true
  t.references :veterinarian, null: false, foreign_key: { to_table: :users }
  t.references :consultation, foreign_key: true  # opcional
  t.string :vaccine_name, null: false
  t.integer :vaccine_type, null: false  # enum
  t.string :manufacturer
  t.string :batch_number
  t.string :dose
  t.integer :administration_route, default: 0
  t.date :application_date, null: false
  t.date :expiration_date
  t.date :next_due_date
  t.text :observations
  t.timestamps
end
```

**Enum vaccine_type:** dhpp, fvrcp, rabies, bordetella, leptospirosis, lyme, felv, fiv, canine_influenza, other

**Validacion:** Veterinario debe tener `can_vaccinate: true`

---

### Epic 5: Sistema de Desparasitacion (P1)

#### US-5.1: Crear modelo Deworming
**Como** veterinario
**Quiero** registrar desparasitaciones
**Para** llevar control de tratamientos antiparasitarios

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_dewormings.rb`
- `app/models/deworming.rb`
- `spec/models/deworming_spec.rb`
- `spec/factories/dewormings.rb`
- `db/seeds/dewormings.rb`

**Schema:**
```ruby
create_table :dewormings do |t|
  t.references :pet, null: false, foreign_key: true
  t.references :veterinarian, null: false, foreign_key: { to_table: :users }
  t.references :consultation, foreign_key: true
  t.string :product_name, null: false
  t.string :dose
  t.integer :administration_route, default: 0
  t.date :application_date, null: false
  t.decimal :weight_at_application, precision: 5, scale: 2
  t.date :next_due_date
  t.text :observations
  t.timestamps
end
```

---

### Epic 6: Programas de Vacunacion (P1)

#### US-6.1: Crear modelos VaccinationSchedule y VaccinationScheduleItem
**Como** veterinario
**Quiero** crear programas de vacunacion para cachorros/gatitos
**Para** llevar seguimiento y enviar recordatorios

**Protocolos:**
- **Perros:** 3 DHPP cada 21 dias desde 6-8 semanas + rabia a 16 semanas
- **Gatos:** 3 FVRCP cada 21 dias desde 6-8 semanas + rabia a 12-16 semanas
- **Personalizado:** El veterinario define el esquema

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_vaccination_schedules.rb`
- `db/migrate/YYYYMMDDHHMMSS_create_vaccination_schedule_items.rb`
- `app/models/vaccination_schedule.rb`
- `app/models/vaccination_schedule_item.rb`
- `spec/models/vaccination_schedule_spec.rb`
- `spec/models/vaccination_schedule_item_spec.rb`
- `spec/factories/vaccination_schedules.rb`
- `spec/factories/vaccination_schedule_items.rb`

**Schema VaccinationSchedule:**
```ruby
create_table :vaccination_schedules do |t|
  t.references :pet, null: false, foreign_key: true
  t.integer :schedule_type, null: false  # puppy_dog, puppy_cat, annual, custom
  t.date :start_date, null: false
  t.integer :status, default: 0  # active, completed, cancelled
  t.text :notes
  t.timestamps
end
```

**Schema VaccinationScheduleItem:**
```ruby
create_table :vaccination_schedule_items do |t|
  t.references :vaccination_schedule, null: false, foreign_key: true
  t.integer :vaccine_type, null: false
  t.date :scheduled_date, null: false
  t.date :completed_date
  t.references :vaccination, foreign_key: true
  t.datetime :reminder_sent_at
  t.integer :status, default: 0  # pending, completed, overdue, skipped
  t.timestamps
end
```

---

### Epic 7: Sistema de Archivos Adjuntos (P1)

#### US-7.1: Crear modelo MedicalAttachment
**Como** veterinario
**Quiero** adjuntar archivos a consultas y examenes
**Para** guardar radiografias, resultados, certificados

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_medical_attachments.rb`
- `app/models/medical_attachment.rb`
- `spec/models/medical_attachment_spec.rb`
- `spec/factories/medical_attachments.rb`

**Schema:**
```ruby
create_table :medical_attachments do |t|
  t.references :attachable, polymorphic: true, null: false
  t.integer :category, null: false  # radiografia, laboratorio, certificado, otro
  t.string :description
  t.timestamps
end
```

**ActiveStorage:** `has_one_attached :file`

---

### Epic 8: Recordatorios por Email (P2)

#### US-8.1: Crear VaccinationMailer
**Como** sistema
**Quiero** enviar recordatorios de vacunacion
**Para** que los duenos no olviden vacunas importantes

**Archivos:**
- `app/mailers/vaccination_mailer.rb`
- `app/views/vaccination_mailer/one_month_reminder.html.erb`
- `app/views/vaccination_mailer/one_month_reminder.text.erb`
- `app/views/vaccination_mailer/one_week_reminder.html.erb`
- `app/views/vaccination_mailer/one_week_reminder.text.erb`
- `app/views/vaccination_mailer/overdue_reminder.html.erb`
- `app/views/vaccination_mailer/overdue_reminder.text.erb`
- `spec/mailers/vaccination_mailer_spec.rb`

**Metodos:**
- `one_month_reminder(vaccination_schedule_item)` - 1 mes antes
- `one_week_reminder(vaccination_schedule_item)` - 1 semana antes
- `overdue_reminder(vaccination_schedule_item)` - 1 semana despues si no hay vacuna

---

#### US-8.2: Crear VaccinationReminderJob
**Como** sistema
**Quiero** ejecutar un job diario de recordatorios
**Para** enviar emails automaticamente

**Archivos:**
- `app/jobs/vaccination_reminder_job.rb`
- `spec/jobs/vaccination_reminder_job_spec.rb`

**Logica:**
1. Buscar items con `scheduled_date = 30.days.from_now` -> enviar `one_month_reminder`
2. Buscar items con `scheduled_date = 7.days.from_now` -> enviar `one_week_reminder`
3. Buscar items pending con `scheduled_date = 7.days.ago` -> enviar `overdue_reminder`

---

#### US-8.3: Crear VaccinationScheduleCreatorJob
**Como** sistema
**Quiero** crear programas de vacunacion automaticamente
**Para** cuando un veterinario inicia el protocolo de un cachorro

**Archivos:**
- `app/jobs/vaccination_schedule_creator_job.rb`
- `spec/jobs/vaccination_schedule_creator_job_spec.rb`

---

### Epic 9: Reportes Medicos (P2)

#### US-9.1: Crear modelo MedicalReport
**Como** veterinario
**Quiero** generar reportes medicos completos
**Para** compartir con colegas o propietarios

**Archivos:**
- `db/migrate/YYYYMMDDHHMMSS_create_medical_reports.rb`
- `app/models/medical_report.rb`
- `spec/models/medical_report_spec.rb`
- `spec/factories/medical_reports.rb`

**Schema:**
```ruby
create_table :medical_reports do |t|
  t.references :pet, null: false, foreign_key: true
  t.references :created_by, null: false, foreign_key: { to_table: :users }
  t.string :title, null: false
  t.text :content
  t.integer :include_records_count, default: 10
  t.datetime :generated_at
  t.timestamps
end
```

---

#### US-9.2: Exportar reportes
**Como** veterinario
**Quiero** exportar reportes en JSON, CSV y PDF
**Para** compartir en diferentes formatos

**Funcionalidades:**
- Export JSON: Serializar datos completos
- Export CSV: Tabla con consultas, vacunas, etc.
- Print PDF: Usar browser print o libreria PDF
- Email: Enviar a propietario o colega

---

### Epic 10: Actions del Backend (P0-P1)

#### US-10.1: Crear Actions para Consultas
**Archivos:**
- `app/actions/medical/create_consultation.rb`
- `app/actions/medical/update_consultation.rb`
- `spec/actions/medical/create_consultation_spec.rb`
- `spec/actions/medical/update_consultation_spec.rb`

#### US-10.2: Crear Actions para Recetas
**Archivos:**
- `app/actions/medical/create_prescription.rb`
- `spec/actions/medical/create_prescription_spec.rb`

#### US-10.3: Crear Actions para Examenes
**Archivos:**
- `app/actions/medical/create_lab_exam.rb`
- `app/actions/medical/update_lab_exam_results.rb`
- `app/actions/medical/upload_lab_exam_files.rb`
- `spec/actions/medical/create_lab_exam_spec.rb`

#### US-10.4: Crear Actions para Vacunacion
**Archivos:**
- `app/actions/medical/create_vaccination.rb`
- `app/actions/medical/create_vaccination_schedule.rb`
- `app/actions/medical/complete_schedule_item.rb`
- `spec/actions/medical/create_vaccination_spec.rb`
- `spec/actions/medical/create_vaccination_schedule_spec.rb`

#### US-10.5: Crear Actions para Reportes
**Archivos:**
- `app/actions/medical/generate_report.rb`
- `app/actions/medical/export_report.rb`
- `app/actions/medical/email_report.rb`
- `spec/actions/medical/generate_report_spec.rb`

---

### Epic 11: Controllers del Backend (P1)

#### US-11.1: Crear Controllers Admin
**Archivos:**
- `app/controllers/admin/consultations_controller.rb`
- `app/controllers/admin/prescriptions_controller.rb`
- `app/controllers/admin/lab_exams_controller.rb`
- `app/controllers/admin/vaccinations_controller.rb`
- `app/controllers/admin/dewormings_controller.rb`
- `app/controllers/admin/vaccination_schedules_controller.rb`
- `app/controllers/admin/medical_profiles_controller.rb`
- `app/controllers/admin/medical_reports_controller.rb`

#### US-11.2: Crear Request Specs
**Archivos:**
- `spec/requests/admin/consultations_spec.rb`
- `spec/requests/admin/prescriptions_spec.rb`
- `spec/requests/admin/lab_exams_spec.rb`
- `spec/requests/admin/vaccinations_spec.rb`
- `spec/requests/admin/dewormings_spec.rb`
- `spec/requests/admin/vaccination_schedules_spec.rb`
- `spec/requests/admin/medical_profiles_spec.rb`
- `spec/requests/admin/medical_reports_spec.rb`

---

### Epic 12: Rutas API (P1)

#### US-12.1: Definir rutas en routes.rb

```ruby
# config/routes.rb

# Admin Pages
scope :admin do
  get "medical-records", to: "admin_pages#medical_records"
  get "consultations/new", to: "admin_pages#new_consultation"
  get "reports", to: "admin_pages#reports"
end

# Admin API
namespace :admin do
  resources :consultations do
    resources :prescriptions, only: [:create, :update, :destroy]
    resources :lab_exams do
      member do
        post :files
        delete 'files/:file_id', action: :delete_file
      end
    end
  end

  resources :vaccinations
  resources :dewormings

  resources :vaccination_schedules do
    member do
      post :complete_item
    end
  end

  resources :medical_reports, only: [:index, :show, :create] do
    member do
      get :export_json
      get :export_csv
      post :email
    end
  end

  # Pet-scoped
  scope 'pets/:pet_id' do
    get 'medical-profile', to: 'medical_profiles#show'
    patch 'medical-profile', to: 'medical_profiles#update'
    get 'medical-history', to: 'medical_records#history'
  end
end

# Owner Pages
get "my-pets/:pet_id/medical-history", to: "owner_pages#medical_history"
```

---

### Epic 13: Frontend Admin (P1)

#### US-13.1: Crear pagina Medical Records
**Como** veterinario
**Quiero** ver el historial medico completo de una mascota
**Para** tener contexto antes de una consulta

**Archivos:**
- `app/frontend/pages/admin/medical-records/MedicalRecordsIndex.tsx`
- `app/frontend/pages/admin/medical-records/components/MedicalProfileCard.tsx`
- `app/frontend/pages/admin/medical-records/components/MedicalTimeline.tsx`
- `app/frontend/pages/admin/medical-records/components/VitalSignsCard.tsx`
- `app/frontend/pages/admin/medical-records/components/VaccinationStatusCard.tsx`

**Vistas internas (useState):**
- `list` - Seleccion de mascota
- `history` - Timeline de historial
- `detail` - Detalle de registro

---

#### US-13.2: Crear pagina Nueva Consulta
**Como** veterinario
**Quiero** registrar una nueva consulta con formulario completo
**Para** documentar la visita del paciente

**Archivos:**
- `app/frontend/pages/admin/consultations/ConsultationsIndex.tsx`
- `app/frontend/pages/admin/consultations/components/ConsultationForm.tsx`
- `app/frontend/pages/admin/consultations/components/PrescriptionTab.tsx`
- `app/frontend/pages/admin/consultations/components/LabExamTab.tsx`
- `app/frontend/pages/admin/consultations/components/VaccinationTab.tsx`
- `app/frontend/pages/admin/consultations/components/FilesTab.tsx`

**Tabs del formulario:**
1. Consulta - Anamnesis, diagnostico, tratamiento, signos vitales
2. Receta - Medicamentos con dosis y frecuencia
3. Laboratorio - Examenes solicitados
4. Vacunas - Vacunacion y desparasitacion
5. Archivos - Adjuntos (radiografias, resultados)

---

#### US-13.3: Crear pagina Reportes
**Como** veterinario
**Quiero** generar reportes medicos
**Para** compartir informacion con colegas o propietarios

**Archivos:**
- `app/frontend/pages/admin/reports/ReportsIndex.tsx`
- `app/frontend/pages/admin/reports/components/ReportForm.tsx`
- `app/frontend/pages/admin/reports/components/ReportPreview.tsx`

**Funcionalidades:**
- Seleccionar mascota
- Titulo y contenido del reporte
- Seleccionar cantidad de registros a incluir
- Botones: JSON, CSV, Imprimir, Email

---

#### US-13.4: Crear tipos TypeScript
**Archivos:**
- `app/frontend/types/MedicalRecords.ts`

```typescript
export interface PetMedicalProfile {
  id: number
  pet_id: number
  chronic_diseases: string[]
  allergies: string[]
  blood_type?: string
  notes?: string
}

export interface Consultation {
  id: number
  pet_id: number
  veterinarian_id: number
  consultation_date: string
  anamnesis?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  weight?: number
  temperature?: number
  heart_rate?: number
  respiratory_rate?: number
  blood_pressure?: string
  veterinarian?: UserSummary
  prescriptions?: Prescription[]
  lab_exams?: LabExam[]
  attachments?: MedicalAttachment[]
}

export interface Prescription { ... }
export interface PrescriptionItem { ... }
export interface LabExam { ... }
export interface Vaccination { ... }
export interface Deworming { ... }
export interface VaccinationSchedule { ... }
export interface MedicalReport { ... }
```

---

#### US-13.5: Crear API clients
**Archivos:**
- `app/frontend/api/MedicalRecords.ts`

```typescript
export class AdminMedicalRecords {
  async getHistory(petId: number): Promise<{ history: MedicalHistory }>
  async getMedicalProfile(petId: number): Promise<{ profile: PetMedicalProfile }>
  async updateMedicalProfile(petId: number, data: MedicalProfileParams): Promise<...>
}

export class AdminConsultations {
  async list(filters?: ConsultationFilters): Promise<{ consultations: Consultation[] }>
  async get(id: number): Promise<{ consultation: Consultation }>
  async create(data: ConsultationParams): Promise<{ consultation: Consultation }>
  async update(id: number, data: Partial<ConsultationParams>): Promise<...>
}

export class AdminVaccinations { ... }
export class AdminLabExams { ... }
export class AdminMedicalReports { ... }
```

---

#### US-13.6: Crear Redux slice y hooks
**Archivos:**
- `app/frontend/store/slices/medicalRecordsSlice.ts`
- `app/frontend/hooks/useMedicalRecords.ts`
- `app/frontend/hooks/useConsultations.ts`
- `app/frontend/hooks/useVaccinations.ts`

---

### Epic 14: Frontend Owner (P2)

#### US-14.1: Crear pagina Historial Medico para Owners
**Como** propietario
**Quiero** ver el historial medico de mis mascotas
**Para** estar informado sobre su salud

**Archivos:**
- `app/frontend/pages/pets/MedicalHistoryIndex.tsx`
- `app/frontend/pages/pets/components/MedicalHistoryTimeline.tsx`
- `app/frontend/pages/pets/components/VaccinationCard.tsx`
- `app/frontend/pages/pets/components/ConsultationCard.tsx`

**Permisos:** Solo lectura de mascotas propias

---

## Permisos

| Recurso | Admin | Vet | Vet Assistant | Assistant | Owner |
|---------|-------|-----|---------------|-----------|-------|
| Consulta (crear/editar) | Si | Si | Si | No | No |
| Consulta (ver) | Si | Si | Si | Si | Solo propias |
| Receta (crear/editar) | Si | Si | Si | No | No |
| Vacunacion (crear) | Si | Si* | No | No | No |
| Examen Lab (crear) | Si | Si | Si | No | No |
| Perfil Medico (editar) | Si | Si | Si | No | No |
| Reportes (generar) | Si | Si | Si | No | No |

*Solo si `can_vaccinate: true`

---

## Orden de Implementacion

### Fase 1: Fundacion (P0)
1. US-1.1: PetMedicalProfile
2. US-1.2: Consultation
3. US-1.3: Actualizar Pet
4. US-2.1: Prescription y PrescriptionItem
5. Crear factories y seeds
6. Escribir specs (TDD)
7. Implementar Actions y Controllers basicos

### Fase 2: Features Core (P1)
1. US-3.1: LabExam
2. US-4.1: Vaccination
3. US-5.1: Deworming
4. US-6.1: VaccinationSchedule
5. US-7.1: MedicalAttachment
6. US-10.x: Actions restantes
7. US-11.x: Controllers restantes
8. US-13.1-13.6: Frontend Admin

### Fase 3: Features Avanzados (P2)
1. US-8.1-8.3: Sistema de recordatorios email
2. US-9.1-9.2: Reportes medicos
3. US-14.1: Frontend Owner
4. Integracion y testing E2E

---

## Verificacion

### Tests a ejecutar
```bash
# Backend
bundle exec rspec spec/models/pet_medical_profile_spec.rb
bundle exec rspec spec/models/consultation_spec.rb
bundle exec rspec spec/requests/admin/consultations_spec.rb
bundle exec rspec spec/actions/medical/

# Frontend
npm run lint
npm run typecheck

# CI completo
npm run push
```

### Verificacion manual
1. Crear consulta desde `/admin/consultations/new`
2. Ver historial en `/admin/medical-records` con mascota seleccionada
3. Crear programa de vacunacion para cachorro
4. Generar reporte y exportar a JSON/CSV
5. Verificar que owner puede ver historial de sus mascotas

---

## Archivos Criticos de Referencia

| Archivo | Proposito |
|---------|-----------|
| `db/schema.rb` | Fuente de verdad para estructura de datos |
| `app/models/pet.rb` | Modelo a extender con asociaciones medicas |
| `app/controllers/admin/pets_controller.rb` | Patron a seguir para controllers admin |
| `app/actions/admin/adoptions/create_adoption.rb` | Ejemplo de Action con Result pattern |
| `app/frontend/pages/admin/pets/PetsIndex.tsx` | Patron para paginas admin con vistas |
| `app/frontend/api/Pets.ts` | Patron para API clients |
| `app/frontend/hooks/usePets.ts` | Patron para hooks |
