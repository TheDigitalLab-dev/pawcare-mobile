<!--
STATUS: ❌ NO IMPLEMENTADO
Pendiente: Todo el sistema de citas está por implementar
Requiere: 4 modelos (Service, StaffSchedule, Appointment, Payment)
Backend: Controllers, Actions, Seeds
Frontend: Páginas, hooks, componentes
-->

# Plan: Sistema de Citas (Appointments) para Admin Dashboard

## Descripción General

Implementar un sistema completo de gestión de citas veterinarias que permita:
- **CRUD de servicios**: Crear/gestionar servicios ofrecidos (consulta, cirugía, peluquería, hostal, hospitalización)
- **Disponibilidad de staff**: Definir horarios y días disponibles por veterinario/staff para cada servicio
- **CRUD de appointments**: Crear, reagendar, cancelar citas con información de mascota, dueño y veterinario asignado
- **Gestión de pagos**: Marcar citas como pagadas con referencia de transacción y método de pago
- **Frontend completo**: Interfaz para gestionar todos los aspectos del sistema

Este sistema sigue TDD (Test-Driven Development) y crea seeds para todos los modelos nuevos.

---

## Modelos de Base de Datos

### 1. Service (Servicios)
```ruby
# Servicios ofrecidos por la clínica
- id: integer
- name: string (required, unique)
- description: text
- price: decimal(10,2) (required)
- currency: string (default: 'USD')
- duration_minutes: integer (required)
- active: boolean (default: true)
- created_by_id: integer (foreign_key -> users)
- created_at: datetime
- updated_at: datetime
```

### 2. StaffSchedule (Disponibilidad de Staff)
```ruby
# Horarios de disponibilidad de cada miembro del staff
- id: integer
- user_id: integer (foreign_key -> users, required)
- service_id: integer (foreign_key -> services, optional)
- day_of_week: integer (0-6, Sunday=0, required)
- start_time: time (required)
- end_time: time (required)
- is_available: boolean (default: true)
- created_at: datetime
- updated_at: datetime
```

### 3. Appointment (Citas)
```ruby
# Citas agendadas
- id: integer
- pet_id: integer (foreign_key -> pets, required)
- service_id: integer (foreign_key -> services, required)
- assigned_to_id: integer (foreign_key -> users, required) # Veterinario asignado
- scheduled_at: datetime (required)
- duration_minutes: integer (required, copiado de service)
- status: string (enum: pending, confirmed, in_progress, completed, cancelled, rescheduled)
- notes: text
- cancellation_reason: text
- payment_status: string (enum: unpaid, paid, refunded)
- created_at: datetime
- updated_at: datetime
```

### 4. Payment (Pagos)
```ruby
# Pagos de citas (separado para ligar con costos de insumos futuros)
- id: integer
- appointment_id: integer (foreign_key -> appointments, required)
- amount: decimal(10,2) (required)
- currency: string (default: 'USD')
- payment_method: string (enum: cash, card, transfer, online)
- payment_reference: string
- paid_at: datetime (required)
- notes: text
- created_at: datetime
- updated_at: datetime
```

---

## Stack Tecnológico

### Backend
- Ruby on Rails 8.0.2
- RSpec para testing (TDD)
- Actions pattern para lógica de negocio

### Frontend
- React 19.2.0 + TypeScript
- Inertia.js
- shadcn/ui components
- Tailwind CSS
- Hooks pattern (useServices, useStaffSchedules, useAppointments, usePayments)

### Nuevas dependencias UI (si no existen)
```bash
npx shadcn@latest add calendar
npx shadcn@latest add date-picker
npx shadcn@latest add time-picker
npx shadcn@latest add badge
npx shadcn@latest add tabs
```

---

## Epics y User Stories

### Epic 1: Setup y Fundación - Modelos Base

#### US-1.1: Crear modelo Service con migration y validaciones
**Como** desarrollador
**Quiero** crear el modelo Service con sus validaciones
**Para** almacenar los servicios ofrecidos por la clínica

**Criterios de aceptación:**
- [ ] Crear migration `db/migrate/xxx_create_services.rb`
- [ ] Crear modelo `app/models/service.rb` con validaciones:
  - `validates :name, presence: true, uniqueness: true`
  - `validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }`
  - `validates :duration_minutes, presence: true, numericality: { greater_than: 0 }`
  - `validates :currency, presence: true`
- [ ] Asociaciones:
  - `belongs_to :created_by, class_name: 'User'`
- [ ] Scope `active` para filtrar servicios activos
- [ ] Scope `order_by_name` para ordenar alfabéticamente
- [ ] Ejecutar `rails db:migrate`

**Archivos:**
- `db/migrate/xxx_create_services.rb` (nuevo)
- `app/models/service.rb` (nuevo)

---

#### US-1.2: Crear seed para Service
**Como** desarrollador
**Quiero** tener datos de prueba de servicios
**Para** probar el sistema sin crear servicios manualmente

**Criterios de aceptación:**
- [ ] Crear `db/seeds/services.rb`
- [ ] Usar `find_or_create_by!` para idempotencia
- [ ] Crear al menos 8 servicios:
  - Consulta general (30 min, $30)
  - Vacunación (15 min, $20)
  - Cirugía menor (60 min, $150)
  - Cirugía mayor (120 min, $500)
  - Peluquería (45 min, $40)
  - Hostal (1440 min/24h, $50)
  - Hospitalización (1440 min/24h, $200)
  - Emergencia (30 min, $100)
- [ ] Asignar `created_by` al admin user
- [ ] Ejecutar `rails db:seed` y verificar

**Archivos:**
- `db/seeds/services.rb` (nuevo)

---

#### US-1.3: Crear modelo StaffSchedule con migration y validaciones
**Como** desarrollador
**Quiero** crear el modelo StaffSchedule para gestionar disponibilidad de staff
**Para** saber qué veterinarios/staff están disponibles en qué horarios

**Criterios de aceptación:**
- [ ] Crear migration `db/migrate/xxx_create_staff_schedules.rb`
- [ ] Crear modelo `app/models/staff_schedule.rb` con validaciones:
  - `validates :user_id, presence: true`
  - `validates :day_of_week, presence: true, inclusion: { in: 0..6 }`
  - `validates :start_time, :end_time, presence: true`
  - Custom validation: `end_time` debe ser después de `start_time`
- [ ] Asociaciones:
  - `belongs_to :user`
  - `belongs_to :service, optional: true`
- [ ] Scope `available` para filtrar `is_available: true`
- [ ] Scope `for_day(day)` para filtrar por día de la semana
- [ ] Scope `for_user(user_id)` para filtrar por usuario
- [ ] Ejecutar `rails db:migrate`

**Archivos:**
- `db/migrate/xxx_create_staff_schedules.rb` (nuevo)
- `app/models/staff_schedule.rb` (nuevo)

**Validación custom:**
```ruby
validate :end_time_after_start_time

private

def end_time_after_start_time
  return if end_time.blank? || start_time.blank?
  if end_time <= start_time
    errors.add(:end_time, "must be after start time")
  end
end
```

---

#### US-1.4: Crear seed para StaffSchedule
**Como** desarrollador
**Quiero** tener horarios de disponibilidad de prueba
**Para** probar el sistema de citas

**Criterios de aceptación:**
- [ ] Crear `db/seeds/staff_schedules.rb`
- [ ] Crear horarios para al menos 2 veterinarios (admin user + otro staff)
- [ ] Horarios de lunes a viernes (day_of_week: 1-5)
- [ ] Horarios matutinos: 08:00 - 13:00
- [ ] Horarios vespertinos: 14:00 - 18:00
- [ ] Algunos staff solo disponibles para ciertos servicios (ej: peluquero solo para peluquería)
- [ ] Ejecutar `rails db:seed` y verificar

**Archivos:**
- `db/seeds/staff_schedules.rb` (nuevo)

---

#### US-1.5: Crear modelo Appointment con migration y validaciones
**Como** desarrollador
**Quiero** crear el modelo Appointment para gestionar citas
**Para** almacenar las citas agendadas

**Criterios de aceptación:**
- [ ] Crear migration `db/migrate/xxx_create_appointments.rb`
- [ ] Crear modelo `app/models/appointment.rb` con validaciones:
  - `validates :pet_id, :service_id, :assigned_to_id, :scheduled_at, :duration_minutes, presence: true`
  - `validates :status, inclusion: { in: %w[pending confirmed in_progress completed cancelled rescheduled] }`
  - `validates :payment_status, inclusion: { in: %w[unpaid paid refunded] }`
- [ ] Asociaciones:
  - `belongs_to :pet`
  - `belongs_to :service`
  - `belongs_to :assigned_to, class_name: 'User'`
  - `has_one :payment, dependent: :destroy`
- [ ] Enums:
  - `enum status: { pending: 'pending', confirmed: 'confirmed', in_progress: 'in_progress', completed: 'completed', cancelled: 'cancelled', rescheduled: 'rescheduled' }`
  - `enum payment_status: { unpaid: 'unpaid', paid: 'paid', refunded: 'refunded' }`
- [ ] Scopes:
  - `scope :upcoming, -> { where('scheduled_at > ?', Time.current).order(scheduled_at: :asc) }`
  - `scope :past, -> { where('scheduled_at <= ?', Time.current).order(scheduled_at: :desc) }`
  - `scope :active, -> { where.not(status: ['cancelled', 'rescheduled']) }`
- [ ] Callbacks:
  - `before_create :set_duration_from_service`
- [ ] Ejecutar `rails db:migrate`

**Archivos:**
- `db/migrate/xxx_create_appointments.rb` (nuevo)
- `app/models/appointment.rb` (nuevo)

**Callback:**
```ruby
private

def set_duration_from_service
  self.duration_minutes ||= service.duration_minutes
end
```

---

#### US-1.6: Crear modelo Payment con migration y validaciones
**Como** desarrollador
**Quiero** crear el modelo Payment para gestionar pagos de citas
**Para** llevar registro detallado de pagos y facilitar futuras integraciones con costos de insumos

**Criterios de aceptación:**
- [ ] Crear migration `db/migrate/xxx_create_payments.rb`
- [ ] Crear modelo `app/models/payment.rb` con validaciones:
  - `validates :appointment_id, presence: true, uniqueness: true`
  - `validates :amount, presence: true, numericality: { greater_than: 0 }`
  - `validates :payment_method, inclusion: { in: %w[cash card transfer online] }`
  - `validates :paid_at, presence: true`
- [ ] Asociaciones:
  - `belongs_to :appointment`
- [ ] Enum:
  - `enum payment_method: { cash: 'cash', card: 'card', transfer: 'transfer', online: 'online' }`
- [ ] Callback:
  - `after_create :mark_appointment_as_paid`
- [ ] Ejecutar `rails db:migrate`

**Archivos:**
- `db/migrate/xxx_create_payments.rb` (nuevo)
- `app/models/payment.rb` (nuevo)

**Callback:**
```ruby
private

def mark_appointment_as_paid
  appointment.update(payment_status: :paid)
end
```

---

#### US-1.7: Crear seeds para Appointment y Payment
**Como** desarrollador
**Quiero** tener citas y pagos de prueba
**Para** probar el sistema completo

**Criterios de aceptación:**
- [ ] Crear `db/seeds/appointments.rb`
- [ ] Crear al menos 10 appointments con diferentes estados:
  - 3 pending (futuras)
  - 2 confirmed (futuras)
  - 2 completed (pasadas, paid)
  - 1 cancelled (pasada)
  - 2 upcoming sin pagar
- [ ] Asignar a diferentes pets, services, y veterinarios
- [ ] Crear pagos automáticamente para appointments con `payment_status: paid`
- [ ] Ejecutar `rails db:seed` y verificar

**Archivos:**
- `db/seeds/appointments.rb` (nuevo)

---

#### US-1.8: Crear tipos TypeScript para frontend
**Como** desarrollador frontend
**Quiero** tener tipos TypeScript para los nuevos modelos
**Para** tener autocompletado y type safety

**Criterios de aceptación:**
- [ ] Actualizar `app/frontend/types/index.ts` con tipos:
  - `Service`
  - `ServiceParams`
  - `StaffSchedule`
  - `StaffScheduleParams`
  - `Appointment`
  - `AppointmentParams`
  - `Payment`
  - `PaymentParams`
- [ ] Incluir enums para `status`, `payment_status`, `payment_method`, `day_of_week`
- [ ] Incluir tipos de filtros y paginación

**Archivos:**
- `app/frontend/types/index.ts` (modificar)

**Tipos:**
```typescript
export type ServiceStatus = 'active' | 'inactive'
export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'online'
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Service {
  id: number
  name: string
  description: string | null
  price: string
  currency: string
  duration_minutes: number
  active: boolean
  created_by_id: number
  created_at: string
  updated_at: string
}

export interface ServiceParams {
  name: string
  description?: string
  price: number
  currency?: string
  duration_minutes: number
  active?: boolean
}

export interface StaffSchedule {
  id: number
  user_id: number
  service_id: number | null
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
  updated_at: string
  // Relaciones populated
  user?: User
  service?: Service
}

export interface StaffScheduleParams {
  user_id: number
  service_id?: number
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  is_available?: boolean
}

export interface Appointment {
  id: number
  pet_id: number
  service_id: number
  assigned_to_id: number
  scheduled_at: string
  duration_minutes: number
  status: AppointmentStatus
  notes: string | null
  cancellation_reason: string | null
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
  // Relaciones populated
  pet?: Pet
  service?: Service
  assigned_to?: User
  payment?: Payment
  // Computed
  proprietary?: Owner | User // El dueño de la mascota
}

export interface AppointmentParams {
  pet_id: number
  service_id: number
  assigned_to_id: number
  scheduled_at: string
  notes?: string
}

export interface Payment {
  id: number
  appointment_id: number
  amount: string
  currency: string
  payment_method: PaymentMethod
  payment_reference: string | null
  paid_at: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PaymentParams {
  appointment_id: number
  amount: number
  currency?: string
  payment_method: PaymentMethod
  payment_reference?: string
  paid_at: string
  notes?: string
}

export interface AppointmentFilters {
  page?: number
  per_page?: number
  status?: AppointmentStatus
  payment_status?: PaymentStatus
  assigned_to_id?: number
  pet_id?: number
  service_id?: number
  from_date?: string
  to_date?: string
}
```

---

### Epic 2: Backend - Services CRUD (TDD)

#### US-2.1: Tests para Services endpoints
**Como** desarrollador
**Quiero** escribir tests antes de implementar el controlador de Services
**Para** seguir TDD y asegurar calidad

**Criterios de aceptación:**
- [ ] Crear `spec/requests/admin/services_spec.rb`
- [ ] Tests para GET /admin/services-list (index)
  - Lista todos los servicios activos
  - Filtra por `active`
  - Paginación
- [ ] Tests para GET /admin/services/:id (show)
  - Retorna servicio específico
  - 404 si no existe
- [ ] Tests para POST /admin/services (create)
  - Crea servicio con params válidos
  - Error 422 con params inválidos
  - Solo staff puede crear
- [ ] Tests para PATCH /admin/services/:id (update)
  - Actualiza servicio
  - Error 422 con params inválidos
- [ ] Tests para DELETE /admin/services/:id (destroy)
  - Marca como `active: false` (soft delete)
  - No elimina físicamente
- [ ] Ejecutar tests: deben **fallar** (código no implementado aún)

**Archivos:**
- `spec/requests/admin/services_spec.rb` (nuevo)

**Ejemplo de test:**
```ruby
require 'rails_helper'

RSpec.describe 'Admin::Services', type: :request do
  let(:admin) { User.create!(email: 'admin@test.com', password: 'password123', role: :admin) }
  let(:headers) { auth_headers(admin) }

  describe 'GET /admin/services-list' do
    it 'returns all active services' do
      create(:service, name: 'Consulta', active: true)
      create(:service, name: 'Inactivo', active: false)

      get '/admin/services-list', headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['services'].size).to eq(1)
      expect(json['services'][0]['name']).to eq('Consulta')
    end
  end

  # ... más tests
end
```

---

#### US-2.2: Implementar Admin::ServicesController
**Como** staff de la clínica
**Quiero** poder gestionar servicios desde el admin
**Para** ofrecer diferentes tipos de citas

**Criterios de aceptación:**
- [ ] Crear `app/controllers/admin/services_controller.rb`
- [ ] Incluir `Authenticatable` concern
- [ ] `before_action :authenticate_staff!`
- [ ] Implementar actions: index, show, create, update, destroy
- [ ] Strong params: `service_params`
- [ ] Index retorna JSON: `{ services: [...], pagination: {...} }`
- [ ] Show retorna JSON: `{ service: {...} }`
- [ ] Create retorna 201 con `{ service: {...} }`
- [ ] Update retorna 200 con `{ service: {...} }`
- [ ] Destroy marca `active: false` y retorna 204
- [ ] Ejecutar tests: deben **pasar**

**Archivos:**
- `app/controllers/admin/services_controller.rb` (nuevo)

**Controlador:**
```ruby
class Admin::ServicesController < ApplicationController
  include Authenticatable

  before_action :authenticate_staff!
  before_action :set_service, only: [:show, :update, :destroy]

  def index
    services = Service.active.order_by_name
    services = services.page(params[:page]).per(params[:per_page] || 20)

    render json: {
      services: services.map { |s| service_json(s) },
      pagination: pagination_meta(services)
    }
  end

  def show
    render json: { service: service_json(@service) }
  end

  def create
    service = Service.new(service_params.merge(created_by: current_user))

    if service.save
      render json: { service: service_json(service) }, status: :created
    else
      render json: { errors: service.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @service.update(service_params)
      render json: { service: service_json(@service) }
    else
      render json: { errors: @service.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @service.update(active: false)
    head :no_content
  end

  private

  def set_service
    @service = Service.find(params[:id])
  end

  def service_params
    params.require(:service).permit(:name, :description, :price, :currency, :duration_minutes, :active)
  end

  def service_json(service)
    service.as_json(include: { created_by: { only: [:id, :first_name, :last_name] } })
  end
end
```

---

#### US-2.3: Agregar rutas para Services
**Como** desarrollador
**Quiero** agregar las rutas de Services al router
**Para** que el frontend pueda consumir el API

**Criterios de aceptación:**
- [ ] Abrir `config/routes.rb`
- [ ] Dentro del namespace `admin`, agregar:
  - `get 'services-list', to: 'services#index', as: :services_list`
  - `resources :services, only: [:show, :create, :update, :destroy]`
- [ ] Verificar rutas con `rails routes | grep services`

**Archivos:**
- `config/routes.rb` (modificar)

---

### Epic 3: Backend - Staff Schedules CRUD (TDD)

#### US-3.1: Tests para StaffSchedules endpoints
**Como** desarrollador
**Quiero** escribir tests para el controlador de StaffSchedules
**Para** seguir TDD

**Criterios de aceptación:**
- [ ] Crear `spec/requests/admin/staff_schedules_spec.rb`
- [ ] Tests para GET /admin/staff-schedules-list
  - Lista horarios por usuario
  - Filtra por día de la semana
  - Filtra por servicio
- [ ] Tests para POST /admin/staff-schedules (create)
- [ ] Tests para PATCH /admin/staff-schedules/:id (update)
- [ ] Tests para DELETE /admin/staff-schedules/:id (destroy)
- [ ] Tests deben fallar inicialmente

**Archivos:**
- `spec/requests/admin/staff_schedules_spec.rb` (nuevo)

---

#### US-3.2: Implementar Admin::StaffSchedulesController
**Como** administrador
**Quiero** gestionar los horarios de disponibilidad del staff
**Para** saber cuándo está disponible cada veterinario/empleado

**Criterios de aceptación:**
- [ ] Crear `app/controllers/admin/staff_schedules_controller.rb`
- [ ] Implementar actions: index, create, update, destroy
- [ ] Index acepta filtros: `user_id`, `day_of_week`, `service_id`
- [ ] Incluir relaciones `user` y `service` en JSON response
- [ ] Tests deben pasar

**Archivos:**
- `app/controllers/admin/staff_schedules_controller.rb` (nuevo)

---

#### US-3.3: Agregar rutas para StaffSchedules
**Como** desarrollador
**Quiero** agregar rutas para StaffSchedules
**Para** que el frontend pueda gestionar horarios

**Criterios de aceptación:**
- [ ] Agregar en namespace `admin`:
  - `get 'staff-schedules-list', to: 'staff_schedules#index', as: :staff_schedules_list`
  - `resources :staff_schedules, only: [:create, :update, :destroy]`

**Archivos:**
- `config/routes.rb` (modificar)

---

### Epic 4: Backend - Appointments CRUD (TDD)

#### US-4.1: Tests para Appointments endpoints
**Como** desarrollador
**Quiero** escribir tests para Appointments
**Para** seguir TDD

**Criterios de aceptación:**
- [ ] Crear `spec/requests/admin/appointments_spec.rb`
- [ ] Tests para GET /admin/appointments-list (index)
  - Lista con filtros: status, payment_status, assigned_to_id, date range
  - Incluye relaciones: pet, service, assigned_to, payment, proprietary
  - Paginación
- [ ] Tests para GET /admin/appointments/:id (show)
- [ ] Tests para POST /admin/appointments (create)
  - Valida disponibilidad de staff en ese horario
  - Valida que no haya overlapping appointments
- [ ] Tests para PATCH /admin/appointments/:id (update)
  - Reagendar (cambiar scheduled_at)
  - Cambiar status
  - Cancelar (status: cancelled, agregar cancellation_reason)
- [ ] Tests para POST /admin/appointments/:id/mark-paid
  - Crea Payment y marca appointment como paid
- [ ] Tests deben fallar inicialmente

**Archivos:**
- `spec/requests/admin/appointments_spec.rb` (nuevo)

---

#### US-4.2: Implementar Admin::AppointmentsController
**Como** staff de la clínica
**Quiero** gestionar citas de clientes
**Para** organizar el calendario de atención

**Criterios de aceptación:**
- [ ] Crear `app/controllers/admin/appointments_controller.rb`
- [ ] Implementar actions: index, show, create, update
- [ ] Custom action `mark_paid` (POST /admin/appointments/:id/mark-paid)
- [ ] Index incluye relaciones: pet (con owner), service, assigned_to, payment
- [ ] Filtros: status, payment_status, assigned_to_id, pet_id, service_id, from_date, to_date
- [ ] Create valida disponibilidad antes de crear
- [ ] Update permite reagendar y cambiar status
- [ ] Tests deben pasar

**Archivos:**
- `app/controllers/admin/appointments_controller.rb` (nuevo)

**Action mark_paid:**
```ruby
def mark_paid
  appointment = Appointment.find(params[:id])

  payment = Payment.new(payment_params.merge(appointment: appointment))

  if payment.save
    render json: {
      appointment: appointment_json(appointment.reload),
      payment: payment_json(payment)
    }, status: :created
  else
    render json: { errors: payment.errors.full_messages }, status: :unprocessable_content
  end
end

private

def payment_params
  params.require(:payment).permit(:amount, :currency, :payment_method, :payment_reference, :paid_at, :notes)
end
```

---

#### US-4.3: Crear Action para validar disponibilidad
**Como** sistema
**Quiero** validar que el staff esté disponible antes de crear una cita
**Para** evitar conflictos de horarios

**Criterios de aceptación:**
- [ ] Crear `app/actions/appointments/validate_availability.rb`
- [ ] Input: `user_id`, `scheduled_at`, `duration_minutes`
- [ ] Verifica:
  - StaffSchedule existe para ese día/horario
  - No hay appointments overlapping para ese usuario
- [ ] Retorna `Result.success` o `Result.failure(error: "mensaje")`
- [ ] Usar en `AppointmentsController#create` antes de guardar

**Archivos:**
- `app/actions/appointments/validate_availability.rb` (nuevo)

**Lógica:**
```ruby
module Appointments
  class ValidateAvailability
    def initialize(user_id:, scheduled_at:, duration_minutes:)
      @user_id = user_id
      @scheduled_at = scheduled_at
      @duration_minutes = duration_minutes
    end

    def call
      return Result.failure(error: "Staff not available at this time") unless staff_available?
      return Result.failure(error: "Staff already has an appointment at this time") if has_conflict?

      Result.success
    end

    private

    def staff_available?
      day = @scheduled_at.wday
      time = @scheduled_at.strftime('%H:%M:%S')

      StaffSchedule.where(user_id: @user_id, day_of_week: day, is_available: true)
                   .where('start_time <= ? AND end_time >= ?', time, time)
                   .exists?
    end

    def has_conflict?
      end_time = @scheduled_at + @duration_minutes.minutes

      Appointment.where(assigned_to_id: @user_id)
                 .active
                 .where('scheduled_at < ? AND (scheduled_at + (duration_minutes * 60)) > ?', end_time, @scheduled_at)
                 .exists?
    end
  end
end
```

---

#### US-4.4: Agregar rutas para Appointments
**Como** desarrollador
**Quiero** agregar rutas de Appointments
**Para** que el frontend pueda gestionar citas

**Criterios de aceptación:**
- [ ] Agregar en namespace `admin`:
  - `get 'appointments-list', to: 'appointments#index', as: :appointments_list`
  - `resources :appointments, only: [:show, :create, :update]`
  - `post 'appointments/:id/mark-paid', to: 'appointments#mark_paid', as: :mark_paid_appointment`

**Archivos:**
- `config/routes.rb` (modificar)

---

### Epic 5: Frontend - Services Management

#### US-5.1: Crear API client para Services
**Como** desarrollador frontend
**Quiero** un cliente API para Services
**Para** consumir los endpoints desde React

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/Services.ts`
- [ ] Exportar clase `Services` con métodos:
  - `list(filters?)`: GET /admin/services-list
  - `show(id)`: GET /admin/services/:id
  - `create(params)`: POST /admin/services
  - `update(id, params)`: PATCH /admin/services/:id
  - `destroy(id)`: DELETE /admin/services/:id
- [ ] Usar convención JSON con wrapper `{ service: {...} }`
- [ ] Tipos: `Service`, `ServiceParams`, `ServiceFilters`

**Archivos:**
- `app/frontend/api/Services.ts` (nuevo)

**Implementación:**
```typescript
import { request } from '@/lib/request'
import type { Service, ServiceParams } from '@/types'

interface ServiceFilters {
  page?: number
  per_page?: number
  active?: boolean
}

interface PaginationMeta {
  current_page: number
  total_pages: number
  total_count: number
}

export class Services {
  async list(filters?: ServiceFilters): Promise<{ services: Service[]; pagination: PaginationMeta }> {
    return request({
      method: 'GET',
      url: '/admin/services-list',
      data: filters,
    })
  }

  async show(id: number): Promise<{ service: Service }> {
    return request({
      method: 'GET',
      url: `/admin/services/${id}`,
    })
  }

  async create(params: ServiceParams): Promise<{ service: Service }> {
    return request({
      method: 'POST',
      url: '/admin/services',
      data: { service: params },
    })
  }

  async update(id: number, params: Partial<ServiceParams>): Promise<{ service: Service }> {
    return request({
      method: 'PATCH',
      url: `/admin/services/${id}`,
      data: { service: params },
    })
  }

  async destroy(id: number): Promise<void> {
    return request({
      method: 'DELETE',
      url: `/admin/services/${id}`,
    })
  }
}

export const services = new Services()
```

---

#### US-5.2: Crear hook useServices
**Como** desarrollador frontend
**Quiero** un hook custom para gestionar servicios
**Para** separar lógica de negocio de componentes

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/useServices.ts`
- [ ] Usar Redux para estado global
- [ ] Métodos: `fetchServices`, `createService`, `updateService`, `deleteService`
- [ ] Estado: `services`, `isLoading`, `error`
- [ ] Manejo de errores con toast/alert

**Archivos:**
- `app/frontend/hooks/useServices.ts` (nuevo)
- `app/frontend/store/slices/servicesSlice.ts` (nuevo)

---

#### US-5.3: Crear página ServicesIndex (admin)
**Como** administrador
**Quiero** ver una lista de todos los servicios
**Para** gestionarlos fácilmente

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/services/ServicesIndex.tsx`
- [ ] Vista interna: `list` | `create` | `edit` (useState)
- [ ] Lista muestra: nombre, descripción, precio, duración, estado (active/inactive)
- [ ] Botón "Nuevo servicio"
- [ ] Acciones por servicio: Editar, Activar/Desactivar
- [ ] Filtro: Mostrar solo activos / Mostrar todos
- [ ] Envuelto en `<AdminLayout>`

**Archivos:**
- `app/frontend/pages/admin/services/ServicesIndex.tsx` (nuevo)
- `app/frontend/pages/admin/services/components/ServiceForm.tsx` (nuevo)
- `app/frontend/pages/admin/services/components/ServiceCard.tsx` (nuevo)

---

#### US-5.4: Crear componente ServiceForm
**Como** staff
**Quiero** un formulario para crear/editar servicios
**Para** gestionar la información de cada servicio

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/services/components/ServiceForm.tsx`
- [ ] Campos: name, description (textarea), price, currency, duration_minutes, active (checkbox)
- [ ] Validación: campos requeridos
- [ ] Modo create: título "Nuevo Servicio", botón "Crear"
- [ ] Modo edit: título "Editar Servicio", botón "Guardar"
- [ ] Botón "Cancelar" vuelve a lista
- [ ] Toast de éxito/error

**Archivos:**
- `app/frontend/pages/admin/services/components/ServiceForm.tsx` (nuevo)

---

#### US-5.5: Agregar página Services al AdminSidebar
**Como** usuario admin
**Quiero** acceder a Servicios desde el sidebar
**Para** navegar fácilmente

**Criterios de aceptación:**
- [ ] Modificar `app/frontend/components/admin/AdminSidebar.tsx`
- [ ] Agregar item: "Servicios" con icono `Briefcase` o `Stethoscope`
- [ ] Href: `/admin/services`
- [ ] Colocar en sección "Administración" o crear nueva sección "Configuración"

**Archivos:**
- `app/frontend/components/admin/AdminSidebar.tsx` (modificar)

---

#### US-5.6: Crear ruta y controlador de página Services
**Como** desarrollador
**Quiero** crear la ruta Inertia para la página de Services
**Para** que se pueda acceder desde el navegador

**Criterios de aceptación:**
- [ ] Abrir `config/routes.rb`
- [ ] Agregar en scope `admin`: `get 'services', to: 'admin_pages#services', as: :admin_services_page`
- [ ] Agregar action en `app/controllers/admin_pages_controller.rb`:
  ```ruby
  def services
    render inertia: "admin/services/ServicesIndex", props: {
      user: user_response(current_user)
    }
  end
  ```

**Archivos:**
- `config/routes.rb` (modificar)
- `app/controllers/admin_pages_controller.rb` (modificar)

---

### Epic 6: Frontend - Staff Schedules Management

#### US-6.1: Crear API client para StaffSchedules
**Como** desarrollador frontend
**Quiero** un cliente API para StaffSchedules
**Para** consumir los endpoints

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/StaffSchedules.ts`
- [ ] Métodos: `list`, `create`, `update`, `destroy`
- [ ] Tipos: `StaffSchedule`, `StaffScheduleParams`

**Archivos:**
- `app/frontend/api/StaffSchedules.ts` (nuevo)

---

#### US-6.2: Crear hook useStaffSchedules
**Como** desarrollador frontend
**Quiero** un hook para gestionar horarios de staff
**Para** separar lógica de componentes

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/useStaffSchedules.ts`
- [ ] Redux slice: `staffSchedulesSlice.ts`
- [ ] Métodos: `fetchSchedules`, `createSchedule`, `updateSchedule`, `deleteSchedule`

**Archivos:**
- `app/frontend/hooks/useStaffSchedules.ts` (nuevo)
- `app/frontend/store/slices/staffSchedulesSlice.ts` (nuevo)

---

#### US-6.3: Crear página StaffSchedulesIndex
**Como** administrador
**Quiero** gestionar los horarios de disponibilidad del staff
**Para** definir cuándo cada persona está disponible

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/staff-schedules/StaffSchedulesIndex.tsx`
- [ ] Vista de calendario semanal (lunes a domingo)
- [ ] Selector de staff member (User)
- [ ] Mostrar horarios existentes por día
- [ ] Botón "Agregar horario"
- [ ] Editar/eliminar horarios existentes
- [ ] Filtro por servicio (opcional)

**Archivos:**
- `app/frontend/pages/admin/staff-schedules/StaffSchedulesIndex.tsx` (nuevo)
- `app/frontend/pages/admin/staff-schedules/components/ScheduleForm.tsx` (nuevo)
- `app/frontend/pages/admin/staff-schedules/components/WeeklyCalendar.tsx` (nuevo)

---

#### US-6.4: Agregar StaffSchedules al sidebar y rutas
**Como** usuario admin
**Quiero** acceder a Horarios del Staff desde el sidebar
**Para** gestionar disponibilidad

**Criterios de aceptación:**
- [ ] Agregar en AdminSidebar: "Horarios Staff" con icono `Calendar`
- [ ] Agregar ruta: `get 'staff-schedules', to: 'admin_pages#staff_schedules'`
- [ ] Agregar action en AdminPagesController

**Archivos:**
- `app/frontend/components/admin/AdminSidebar.tsx` (modificar)
- `config/routes.rb` (modificar)
- `app/controllers/admin_pages_controller.rb` (modificar)

---

### Epic 7: Frontend - Appointments Management

#### US-7.1: Crear API client para Appointments
**Como** desarrollador frontend
**Quiero** un cliente API para Appointments
**Para** consumir endpoints de citas

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/Appointments.ts`
- [ ] Métodos: `list`, `show`, `create`, `update`, `markPaid`
- [ ] Tipos: `Appointment`, `AppointmentParams`, `AppointmentFilters`

**Archivos:**
- `app/frontend/api/Appointments.ts` (nuevo)

**Método markPaid:**
```typescript
async markPaid(id: number, paymentParams: PaymentParams): Promise<{ appointment: Appointment; payment: Payment }> {
  return request({
    method: 'POST',
    url: `/admin/appointments/${id}/mark-paid`,
    data: { payment: paymentParams },
  })
}
```

---

#### US-7.2: Crear hook useAppointments
**Como** desarrollador frontend
**Quiero** un hook para gestionar citas
**Para** separar lógica de componentes

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/useAppointments.ts`
- [ ] Redux slice: `appointmentsSlice.ts`
- [ ] Métodos: `fetchAppointments`, `createAppointment`, `updateAppointment`, `cancelAppointment`, `markPaid`

**Archivos:**
- `app/frontend/hooks/useAppointments.ts` (nuevo)
- `app/frontend/store/slices/appointmentsSlice.ts` (nuevo)

---

#### US-7.3: Crear página AppointmentsIndex
**Como** staff de la clínica
**Quiero** ver y gestionar todas las citas
**Para** organizar el calendario de atención

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/appointments/AppointmentsIndex.tsx`
- [ ] Vistas internas: `list` | `calendar` | `detail` | `create` | `edit`
- [ ] Vista list: tabla con mascota, dueño, servicio, veterinario, fecha/hora, estado, pago
- [ ] Vista calendar: calendario mensual con citas por día
- [ ] Filtros: fecha, estado, veterinario, mascota, servicio
- [ ] Botón "Nueva cita"
- [ ] Acciones: Ver detalle, Editar, Cancelar, Marcar como pagada

**Archivos:**
- `app/frontend/pages/admin/appointments/AppointmentsIndex.tsx` (nuevo)
- `app/frontend/pages/admin/appointments/components/AppointmentForm.tsx` (nuevo)
- `app/frontend/pages/admin/appointments/components/AppointmentDetail.tsx` (nuevo)
- `app/frontend/pages/admin/appointments/components/AppointmentCalendar.tsx` (nuevo)
- `app/frontend/pages/admin/appointments/components/PaymentDialog.tsx` (nuevo)

---

#### US-7.4: Crear AppointmentForm con validación de disponibilidad
**Como** staff
**Quiero** crear/editar citas con validación automática de disponibilidad
**Para** evitar conflictos de horarios

**Criterios de aceptación:**
- [ ] Crear formulario con campos:
  - Pet (selector con búsqueda)
  - Service (selector)
  - Assigned to (veterinario, selector filtrado por disponibilidad)
  - Fecha y hora
  - Notas
- [ ] Al seleccionar servicio, autocompletar duración
- [ ] Al seleccionar fecha/hora, mostrar veterinarios disponibles
- [ ] Validación en tiempo real de disponibilidad
- [ ] Mostrar mensaje si no hay disponibilidad
- [ ] Modo create y edit

**Archivos:**
- `app/frontend/pages/admin/appointments/components/AppointmentForm.tsx` (nuevo)

---

#### US-7.5: Crear AppointmentDetail con acciones
**Como** staff
**Quiero** ver los detalles de una cita y ejecutar acciones
**Para** gestionar el flujo de atención

**Criterios de aceptación:**
- [ ] Mostrar información completa:
  - Mascota (con foto si existe) + dueño
  - Servicio, duración
  - Veterinario asignado
  - Fecha/hora
  - Estado actual
  - Estado de pago
  - Notas
  - Información de pago (si existe)
- [ ] Acciones según estado:
  - Pending → Confirmar, Cancelar, Reagendar
  - Confirmed → Marcar en progreso, Cancelar, Reagendar
  - In progress → Marcar completada
  - Completed → Marcar como pagada (si unpaid)
- [ ] Diálogo de cancelación con motivo (cancellation_reason)
- [ ] Diálogo de reagendar (selector de nueva fecha/hora)
- [ ] Diálogo de pago (PaymentDialog)

**Archivos:**
- `app/frontend/pages/admin/appointments/components/AppointmentDetail.tsx` (nuevo)
- `app/frontend/pages/admin/appointments/components/CancelDialog.tsx` (nuevo)
- `app/frontend/pages/admin/appointments/components/RescheduleDialog.tsx` (nuevo)

---

#### US-7.6: Crear PaymentDialog
**Como** staff
**Quiero** marcar una cita como pagada con información detallada
**Para** llevar registro de pagos

**Criterios de aceptación:**
- [ ] Dialog con formulario:
  - Monto (precargado del service.price, editable)
  - Moneda (default del servicio)
  - Método de pago (selector: cash, card, transfer, online)
  - Referencia de transacción (opcional)
  - Fecha de pago (default: ahora, editable)
  - Notas (opcional)
- [ ] Validación: monto > 0
- [ ] Al guardar, llamar `appointments.markPaid(id, paymentParams)`
- [ ] Actualizar estado de appointment en Redux
- [ ] Toast de éxito

**Archivos:**
- `app/frontend/pages/admin/appointments/components/PaymentDialog.tsx` (nuevo)

---

#### US-7.7: Crear AppointmentCalendar con vista mensual
**Como** staff
**Quiero** ver las citas en un calendario mensual
**Para** tener una vista general de la agenda

**Criterios de aceptación:**
- [ ] Calendario mensual (usar `react-big-calendar` o componente custom)
- [ ] Mostrar citas por día con color según estado:
  - Pending: amarillo
  - Confirmed: azul
  - In progress: verde
  - Completed: gris
  - Cancelled: rojo
- [ ] Click en cita abre AppointmentDetail
- [ ] Navegación mes anterior/siguiente
- [ ] Indicador de estado de pago (badge)

**Archivos:**
- `app/frontend/pages/admin/appointments/components/AppointmentCalendar.tsx` (nuevo)

**Dependencia:**
```bash
npm install react-big-calendar
npm install --save-dev @types/react-big-calendar
```

---

#### US-7.8: Habilitar link de Appointments en sidebar y agregar rutas
**Como** usuario admin
**Quiero** acceder a Citas desde el sidebar
**Para** gestionar appointments

**Criterios de aceptación:**
- [ ] En AdminSidebar.tsx línea 48: Remover `disabled: true` del item "Citas"
  - El href ya existe: `/admin/appointments`
  - El icono ya existe: `Calendar`
- [ ] Agregar ruta en routes.rb: `get 'appointments', to: 'admin_pages#appointments', as: :admin_appointments_page`
- [ ] Agregar action `appointments` en AdminPagesController:
  ```ruby
  def appointments
    render inertia: "admin/appointments/AppointmentsIndex", props: {
      user: user_response(current_user)
    }
  end
  ```
- [ ] Verificar que el link en sidebar navega correctamente a la página

**Archivos:**
- `app/frontend/pages/admin/components/AdminSidebar.tsx` (modificar - línea 48)
- `config/routes.rb` (modificar)
- `app/controllers/admin_pages_controller.rb` (modificar)

---

### Epic 8: Features Adicionales

#### US-8.1: Agregar búsqueda de mascotas en AppointmentForm
**Como** staff
**Quiero** buscar mascotas por nombre o dueño al crear una cita
**Para** encontrarlas rápidamente

**Criterios de aceptación:**
- [ ] Input de búsqueda de mascota (autocomplete)
- [ ] Búsqueda por nombre de mascota o nombre de dueño
- [ ] Mostrar resultados con: nombre mascota, especie, nombre dueño
- [ ] Usar endpoint existente `/admin/pets-list` con filtros
- [ ] Componente reutilizable `PetSearchSelector`

**Archivos:**
- `app/frontend/components/admin/PetSearchSelector.tsx` (nuevo)

---

#### US-8.2: Dashboard de estadísticas de appointments
**Como** administrador
**Quiero** ver estadísticas de citas
**Para** entender el estado del negocio

**Criterios de aceptación:**
- [ ] En `/admin/appointments`, sección superior con cards:
  - Total citas del mes
  - Citas pendientes
  - Citas completadas
  - Ingresos del mes (suma de payments)
- [ ] Gráfico de citas por servicio (bar chart)
- [ ] Gráfico de citas por veterinario (bar chart)
- [ ] Usar recharts para gráficos

**Archivos:**
- `app/frontend/pages/admin/appointments/components/AppointmentStats.tsx` (nuevo)

**Dependencia:**
```bash
npm install recharts
```

---

#### US-8.3: Notificaciones/Recordatorios (placeholder)
**Como** staff
**Quiero** poder configurar recordatorios de citas
**Para** que los clientes no olviden sus appointments

**Criterios de aceptación:**
- [ ] Agregar campo `reminder_sent: boolean` a appointments (migration)
- [ ] En AppointmentDetail, botón "Enviar recordatorio"
- [ ] Por ahora, solo marca como `reminder_sent: true`
- [ ] En el futuro, integrar con sistema de emails/SMS

**Archivos:**
- `db/migrate/xxx_add_reminder_sent_to_appointments.rb` (nuevo)
- `app/frontend/pages/admin/appointments/components/AppointmentDetail.tsx` (modificar)

---

#### US-8.4: Exportar citas a CSV
**Como** administrador
**Quiero** exportar la lista de citas a CSV
**Para** generar reportes

**Criterios de aceptación:**
- [ ] Botón "Exportar CSV" en AppointmentsIndex
- [ ] Endpoint `GET /admin/appointments/export` retorna CSV
- [ ] CSV incluye: fecha, mascota, dueño, servicio, veterinario, estado, pago
- [ ] Respeta filtros aplicados en la vista

**Archivos:**
- `app/controllers/admin/appointments_controller.rb` (modificar)
- `app/frontend/pages/admin/appointments/AppointmentsIndex.tsx` (modificar)

**Backend:**
```ruby
def export
  appointments = Appointment.includes(:pet, :service, :assigned_to, :payment)
  # Aplicar filtros...

  csv = CSV.generate(headers: true) do |csv|
    csv << ['Fecha', 'Mascota', 'Dueño', 'Servicio', 'Veterinario', 'Estado', 'Pago']
    appointments.each do |apt|
      csv << [apt.scheduled_at, apt.pet.name, apt.pet.proprietary_name, apt.service.name, apt.assigned_to.full_name, apt.status, apt.payment_status]
    end
  end

  send_data csv, filename: "appointments-#{Date.today}.csv"
end
```

---

### Epic 9: Regla de Seeds y Documentación

#### US-9.1: Crear regla de seeds en .claude/rules
**Como** desarrollador
**Quiero** una regla que obligue a crear seeds para cada modelo nuevo
**Para** mantener datos de prueba consistentes

**Criterios de aceptación:**
- [ ] Crear `.claude/rules/model-seeds-requirement.md`
- [ ] Regla: "Cada vez que se crea un modelo nuevo, DEBE crearse un archivo de seed correspondiente en `db/seeds/`"
- [ ] Debe ser idempotente con `find_or_create_by!`
- [ ] Debe crear al menos 5-10 registros de ejemplo
- [ ] Seed debe incluirse en `db/seeds.rb`

**Archivos:**
- `.claude/rules/model-seeds-requirement.md` (nuevo)

**Contenido:**
```markdown
# Model Seeds Requirement

## Regla Obligatoria

**Cada vez que se crea un modelo nuevo, DEBE crearse un archivo de seed correspondiente.**

### Ubicación
- `db/seeds/{modelo_plural}.rb`
- Ejemplo: `db/seeds/appointments.rb` para modelo `Appointment`

### Requisitos del Seed
1. **Idempotente**: Usar `find_or_create_by!` siempre
2. **Cantidad**: Al menos 5-10 registros de ejemplo
3. **Realista**: Datos que reflejen casos de uso reales
4. **Relaciones**: Crear relaciones con modelos existentes
5. **Variedad**: Incluir diferentes estados/casos edge

### Estructura
\`\`\`ruby
# db/seeds/appointments.rb
puts "📅 Seeding Appointments..."

pet1 = Pet.find_by(name: "Max")
service1 = Service.find_by(name: "Consulta general")
vet = User.find_by(role: :vet)

Appointment.find_or_create_by!(
  pet: pet1,
  service: service1,
  scheduled_at: 3.days.from_now.change(hour: 10)
) do |apt|
  apt.assigned_to = vet
  apt.duration_minutes = service1.duration_minutes
  apt.status = :confirmed
  apt.payment_status = :unpaid
end

puts "✅ Appointments seeded successfully\n"
\`\`\`

### Inclusión en db/seeds.rb
\`\`\`ruby
# db/seeds.rb
Dir[Rails.root.join("db/seeds/*.rb")].sort.each do |seed_file|
  load seed_file
end
\`\`\`

### Cuándo Ejecutar
- Después de `rails db:migrate`
- Ejecutar `rails db:seed` para cargar datos
- En desarrollo: `rails db:reset` para limpiar y recargar todo
```

---

## Orden de Implementación

### Fase 1: Modelos y Backend Base (Epic 1-2)
1. US-1.1 → US-1.2: Service model + seed
2. US-1.3 → US-1.4: StaffSchedule model + seed
3. US-1.5 → US-1.6 → US-1.7: Appointment, Payment models + seed
4. US-1.8: Tipos TypeScript
5. US-2.1 → US-2.2 → US-2.3: Services backend (TDD)

### Fase 2: Backend Schedules y Appointments (Epic 3-4)
6. US-3.1 → US-3.2 → US-3.3: StaffSchedules backend (TDD)
7. US-4.1 → US-4.2 → US-4.3 → US-4.4: Appointments backend (TDD)

### Fase 3: Frontend Services y Schedules (Epic 5-6)
8. US-5.1 → US-5.2: Services API + hook
9. US-5.3 → US-5.4 → US-5.5 → US-5.6: Services UI
10. US-6.1 → US-6.2: StaffSchedules API + hook
11. US-6.3 → US-6.4: StaffSchedules UI

### Fase 4: Frontend Appointments (Epic 7)
12. US-7.1 → US-7.2: Appointments API + hook
13. US-7.3 → US-7.4: Appointments UI base
14. US-7.5 → US-7.6: AppointmentDetail + PaymentDialog
15. US-7.7 → US-7.8: Calendar view + rutas

### Fase 5: Features Adicionales (Epic 8-9)
16. US-8.1: Pet search selector
17. US-8.2: Dashboard stats
18. US-8.3: Reminders placeholder
19. US-8.4: CSV export
20. US-9.1: Seeds requirement rule

---

## Archivos Totales

### Backend (34 archivos nuevos)
```
db/migrate/
├── xxx_create_services.rb
├── xxx_create_staff_schedules.rb
├── xxx_create_appointments.rb
├── xxx_create_payments.rb
└── xxx_add_reminder_sent_to_appointments.rb

app/models/
├── service.rb
├── staff_schedule.rb
├── appointment.rb
└── payment.rb

app/controllers/admin/
├── services_controller.rb
├── staff_schedules_controller.rb
└── appointments_controller.rb

app/actions/appointments/
└── validate_availability.rb

db/seeds/
├── services.rb
├── staff_schedules.rb
└── appointments.rb

spec/requests/admin/
├── services_spec.rb
├── staff_schedules_spec.rb
└── appointments_spec.rb

.claude/rules/
└── model-seeds-requirement.md
```

### Frontend (25 archivos nuevos + 4 modificados)
```
app/frontend/api/
├── Services.ts
├── StaffSchedules.ts
└── Appointments.ts

app/frontend/hooks/
├── useServices.ts
├── useStaffSchedules.ts
└── useAppointments.ts

app/frontend/store/slices/
├── servicesSlice.ts
├── staffSchedulesSlice.ts
└── appointmentsSlice.ts

app/frontend/types/
└── index.ts (modificar)

app/frontend/pages/admin/services/
├── ServicesIndex.tsx
└── components/
    ├── ServiceForm.tsx
    └── ServiceCard.tsx

app/frontend/pages/admin/staff-schedules/
├── StaffSchedulesIndex.tsx
└── components/
    ├── ScheduleForm.tsx
    └── WeeklyCalendar.tsx

app/frontend/pages/admin/appointments/
├── AppointmentsIndex.tsx
└── components/
    ├── AppointmentForm.tsx
    ├── AppointmentDetail.tsx
    ├── AppointmentCalendar.tsx
    ├── PaymentDialog.tsx
    ├── CancelDialog.tsx
    ├── RescheduleDialog.tsx
    └── AppointmentStats.tsx

app/frontend/components/admin/
├── AdminSidebar.tsx (modificar)
└── PetSearchSelector.tsx

config/
└── routes.rb (modificar)

app/controllers/
└── admin_pages_controller.rb (modificar)
```

---

## Testing

### Backend (RSpec)
- Request specs para cada controlador (services, staff_schedules, appointments)
- Model specs para validaciones
- Action specs para ValidateAvailability

### Frontend (Jest)
- Tests de hooks (useServices, useStaffSchedules, useAppointments)
- Tests de componentes críticos (AppointmentForm, PaymentDialog)
- Tests de Redux slices

---

## Dependencias NPM Nuevas

```bash
npm install react-big-calendar
npm install recharts
npm install --save-dev @types/react-big-calendar

# shadcn/ui components (si no existen)
npx shadcn@latest add calendar
npx shadcn@latest add date-picker
npx shadcn@latest add tabs
```

---

## Migraciones Ejemplo

### CreateServices
```ruby
class CreateServices < ActiveRecord::Migration[8.0]
  def change
    create_table :services do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string :currency, default: 'USD', null: false
      t.integer :duration_minutes, null: false
      t.boolean :active, default: true, null: false
      t.references :created_by, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :services, :name, unique: true
    add_index :services, :active
  end
end
```

### CreateAppointments
```ruby
class CreateAppointments < ActiveRecord::Migration[8.0]
  def change
    create_table :appointments do |t|
      t.references :pet, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true
      t.references :assigned_to, null: false, foreign_key: { to_table: :users }
      t.datetime :scheduled_at, null: false
      t.integer :duration_minutes, null: false
      t.string :status, default: 'pending', null: false
      t.text :notes
      t.text :cancellation_reason
      t.string :payment_status, default: 'unpaid', null: false

      t.timestamps
    end

    add_index :appointments, :scheduled_at
    add_index :appointments, :status
    add_index :appointments, :payment_status
    add_index :appointments, [:assigned_to_id, :scheduled_at]
  end
end
```

---

## Criterios de Éxito

- [ ] Todos los tests backend pasan (RSpec)
- [ ] Se pueden crear, editar, listar servicios desde el admin
- [ ] Se pueden configurar horarios de staff por día/servicio
- [ ] Se pueden crear citas con validación de disponibilidad
- [ ] Se puede reagendar y cancelar citas
- [ ] Se pueden marcar citas como pagadas con información detallada
- [ ] Vista de calendario funciona correctamente
- [ ] Filtros y búsqueda funcionan en appointments
- [ ] Todos los modelos tienen seeds con datos de prueba
- [ ] Documentación de seeds requirement creada

---

## Notas de Implementación

### Validación de Disponibilidad
- Verificar StaffSchedule antes de crear appointment
- Verificar overlapping appointments
- Mostrar feedback visual en el frontend

### Manejo de Zonas Horarias
- Almacenar `scheduled_at` en UTC
- Mostrar en timezone del usuario (configurar en frontend)

### Performance
- Usar eager loading en appointments index: `.includes(:pet, :service, :assigned_to, :payment)`
- Índices en columnas frecuentemente consultadas (scheduled_at, status, assigned_to_id)

### Seguridad
- Solo staff puede acceder a endpoints de admin
- Validar que pets existen y pertenecen al sistema
- Validar que assigned_to es un User válido

### UX
- Feedback claro en cada acción (toast notifications)
- Loading states en todas las operaciones async
- Confirmaciones antes de cancelar/eliminar
