<!--
STATUS: ✅ COMPLETADO
Implementado en: commits b5be479 + 4c90336
Incluye: ClinicSchedule, ScheduleException models, Actions, Controller, ShiftsIndex page
Backend: Models, Actions, Controller
Frontend: Types, API, Hook, ShiftsIndex, WeeklyCalendar, ClinicScheduleCard, StaffScheduleCard
-->

# Plan: Módulo de Turnos (Shifts Module)

## Resumen

Implementar un módulo de gestión de turnos que permita:
- **Configurar horarios de la clínica**: Días y horas de operación
- **Gestionar turnos del personal**: Horarios individuales por empleado
- **Días festivos y excepciones**: Días libres, vacaciones
- **Vista de calendario**: Visualización semanal/mensual de turnos

**Acceso**: Roles `admin`, `hr`

---

## Arquitectura

### Modelos

#### ClinicSchedule (Nuevo)
Horario general de operación de la clínica.

```
ClinicSchedule
├── day_of_week (integer, 0-6)
├── open_time (time)
├── close_time (time)
├── is_open (boolean)
└── notes (text)
```

#### StaffSchedule (Existente - Ya en schema.rb)
Horarios individuales del personal.

```
StaffSchedule (existente)
├── user_id (FK)
├── service_id (FK opcional)
├── day_of_week (integer)
├── start_time (time)
├── end_time (time)
├── is_available (boolean)
```

#### ScheduleException (Nuevo)
Excepciones a horarios (vacaciones, días festivos, permisos).

```
ScheduleException
├── exceptionable_type (string - User, Clinic)
├── exceptionable_id (bigint - nullable for clinic-wide)
├── exception_type (integer - holiday, vacation, sick, permit)
├── date (date)
├── all_day (boolean)
├── start_time (time - si no all_day)
├── end_time (time - si no all_day)
├── reason (string)
├── approved_by_id (FK users - opcional)
├── notes (text)
```

---

## User Stories

### Epic 1: Base de Datos y Modelos

#### US-1.1: Crear migración para ClinicSchedule
**Como** desarrollador
**Quiero** una tabla para horarios de la clínica
**Para** configurar días y horas de operación

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_clinic_schedules.rb`
- [ ] Campos: day_of_week, open_time, close_time, is_open, notes
- [ ] Índice en day_of_week (único)
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_clinic_schedules.rb` (nuevo)

---

#### US-1.2: Crear migración para ScheduleException
**Como** desarrollador
**Quiero** una tabla para excepciones de horario
**Para** gestionar vacaciones y días festivos

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_schedule_exceptions.rb`
- [ ] Campos: exceptionable_type, exceptionable_id, exception_type, date, all_day, start_time, end_time, reason, approved_by_id, notes
- [ ] Índices en date, exceptionable
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_schedule_exceptions.rb` (nuevo)

---

#### US-1.3: Crear modelo ClinicSchedule
**Como** desarrollador
**Quiero** el modelo ClinicSchedule
**Para** manejar horarios de la clínica

**Criterios de aceptación:**
- [ ] Crear `app/models/clinic_schedule.rb`
- [ ] Validaciones: day_of_week unique, times válidos
- [ ] Método: `self.open_today?`, `self.hours_for(day)`
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/clinic_schedule.rb` (nuevo)
- `spec/factories/clinic_schedules.rb` (nuevo)
- `spec/models/clinic_schedule_spec.rb` (nuevo)

---

#### US-1.4: Crear modelo ScheduleException
**Como** desarrollador
**Quiero** el modelo ScheduleException
**Para** manejar excepciones de horario

**Criterios de aceptación:**
- [ ] Crear `app/models/schedule_exception.rb`
- [ ] Asociaciones:
  - `belongs_to :exceptionable, polymorphic: true, optional: true`
  - `belongs_to :approved_by, class_name: 'User', optional: true`
- [ ] Enum exception_type: `{ holiday: 0, vacation: 1, sick: 2, permit: 3, training: 4 }`
- [ ] Validaciones: date required, times si no all_day
- [ ] Scopes: `for_date(date)`, `for_user(user)`, `clinic_wide`
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/schedule_exception.rb` (nuevo)
- `spec/factories/schedule_exceptions.rb` (nuevo)
- `spec/models/schedule_exception_spec.rb` (nuevo)

---

#### US-1.5: Crear seeds para Shifts
**Como** desarrollador
**Quiero** datos de prueba para turnos
**Para** probar el sistema

**Criterios de aceptación:**
- [ ] Crear `db/seeds/14_clinic_schedules.rb`
  - Lunes a Viernes: 8:00 - 18:00
  - Sábado: 8:00 - 14:00
  - Domingo: cerrado
- [ ] Crear `db/seeds/15_schedule_exceptions.rb`
  - Algunos días festivos de ejemplo
  - Vacaciones de un empleado de ejemplo
- [ ] Usar find_or_create_by!

**Archivos:**
- `db/seeds/14_clinic_schedules.rb` (nuevo)
- `db/seeds/15_schedule_exceptions.rb` (nuevo)

---

### Epic 2: Actions de Gestión de Turnos

#### US-2.1: Crear Action Shifts::GetClinicSchedule
**Como** admin
**Quiero** obtener el horario de la clínica
**Para** ver la configuración actual

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/shifts/get_clinic_schedule.rb`
- [ ] Retornar los 7 días con sus horarios
- [ ] Incluir excepciones próximas (30 días)
- [ ] Retornar `Result.success(schedules:, exceptions:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/shifts/get_clinic_schedule.rb` (nuevo)
- `spec/actions/admin/shifts/get_clinic_schedule_spec.rb` (nuevo)

---

#### US-2.2: Crear Action Shifts::UpdateClinicSchedule
**Como** admin
**Quiero** actualizar el horario de la clínica
**Para** modificar días y horas

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/shifts/update_clinic_schedule.rb`
- [ ] Input: array de días con horarios
- [ ] Validar que open_time < close_time
- [ ] Actualizar en transacción
- [ ] Retornar `Result.success(schedules:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/shifts/update_clinic_schedule.rb` (nuevo)
- `spec/actions/admin/shifts/update_clinic_schedule_spec.rb` (nuevo)

---

#### US-2.3: Crear Action Shifts::GetStaffSchedules
**Como** admin/hr
**Quiero** obtener los turnos del personal
**Para** ver la asignación actual

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/shifts/get_staff_schedules.rb`
- [ ] Input: `user_id` (opcional), `from_date`, `to_date`
- [ ] Retornar:
  - Si user_id: horarios de ese usuario
  - Si no: horarios de todos los usuarios activos
- [ ] Incluir excepciones del período
- [ ] Retornar `Result.success(schedules:, exceptions:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/shifts/get_staff_schedules.rb` (nuevo)
- `spec/actions/admin/shifts/get_staff_schedules_spec.rb` (nuevo)

---

#### US-2.4: Crear Action Shifts::UpdateStaffSchedule
**Como** admin/hr
**Quiero** actualizar el turno de un empleado
**Para** asignar o modificar horarios

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/shifts/update_staff_schedule.rb`
- [ ] Input: `user_id`, array de horarios por día
- [ ] Validar:
  - Usuario existe y está activo
  - Horarios no se superponen con horario de clínica
  - start_time < end_time
- [ ] Upsert de StaffSchedule records
- [ ] Retornar `Result.success(schedules:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/shifts/update_staff_schedule.rb` (nuevo)
- `spec/actions/admin/shifts/update_staff_schedule_spec.rb` (nuevo)

---

#### US-2.5: Crear Action Shifts::CreateException
**Como** admin/hr
**Quiero** crear una excepción de horario
**Para** registrar vacaciones o días festivos

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/shifts/create_exception.rb`
- [ ] Input: params de ScheduleException
- [ ] Validar:
  - No conflicto con citas existentes (warning)
  - Fechas válidas
- [ ] Retornar `Result.success(exception:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/shifts/create_exception.rb` (nuevo)
- `spec/actions/admin/shifts/create_exception_spec.rb` (nuevo)

---

#### US-2.6: Crear Action Shifts::DeleteException
**Como** admin/hr
**Quiero** eliminar una excepción
**Para** cancelar un día libre registrado

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/shifts/delete_exception.rb`
- [ ] Input: `exception_id`
- [ ] Validar: excepción existe
- [ ] Retornar `Result.success()` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/shifts/delete_exception.rb` (nuevo)
- `spec/actions/admin/shifts/delete_exception_spec.rb` (nuevo)

---

#### US-2.7: Crear Action Shifts::GetWeeklyOverview
**Como** admin/hr
**Quiero** ver un resumen semanal de turnos
**Para** planificar la semana

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/shifts/get_weekly_overview.rb`
- [ ] Input: `week_start_date`
- [ ] Retornar:
  - Horario de clínica por día
  - Personal disponible por día y hora
  - Excepciones de la semana
  - Citas programadas (count por slot)
- [ ] Retornar `Result.success(overview:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/shifts/get_weekly_overview.rb` (nuevo)
- `spec/actions/admin/shifts/get_weekly_overview_spec.rb` (nuevo)

---

### Epic 3: Backend - Controller y Rutas

#### US-3.1: Tests TDD para Shifts Controller
**Como** desarrollador
**Quiero** escribir tests antes de implementar
**Para** seguir TDD

**Criterios de aceptación:**
- [ ] Crear `spec/requests/admin/shifts_spec.rb`
- [ ] Tests para:
  - GET clinic_schedule
  - PATCH clinic_schedule
  - GET staff_schedules
  - PATCH staff_schedules/:user_id
  - GET weekly_overview
  - POST exceptions
  - DELETE exceptions/:id
- [ ] Verificar autorización (admin, hr)
- [ ] Tests deben fallar inicialmente

**Archivos:**
- `spec/requests/admin/shifts_spec.rb` (nuevo)

---

#### US-3.2: Implementar Admin::ShiftsController
**Como** admin/hr
**Quiero** endpoints de turnos
**Para** gestionar horarios

**Criterios de aceptación:**
- [ ] Crear `app/controllers/admin/shifts_controller.rb`
- [ ] Include Authenticatable
- [ ] before_action :authenticate_staff!
- [ ] before_action :authorize_shifts_manager! (admin, hr)
- [ ] Actions:
  - `clinic_schedule` (GET)
  - `update_clinic_schedule` (PATCH)
  - `staff_schedules` (GET)
  - `update_staff_schedule` (PATCH)
  - `weekly_overview` (GET)
  - `create_exception` (POST)
  - `delete_exception` (DELETE)
- [ ] Tests deben pasar

**Archivos:**
- `app/controllers/admin/shifts_controller.rb` (nuevo)

---

#### US-3.3: Agregar rutas de Shifts
**Como** desarrollador
**Quiero** rutas para turnos
**Para** que el frontend pueda consumir

**Criterios de aceptación:**
- [ ] Modificar `config/routes.rb`
- [ ] En namespace admin:
  ```ruby
  namespace :shifts do
    get :clinic_schedule
    patch :clinic_schedule, action: :update_clinic_schedule
    get :staff_schedules
    patch 'staff_schedules/:user_id', action: :update_staff_schedule
    get :weekly_overview
    resources :exceptions, only: [:create, :destroy]
  end
  ```

**Archivos:**
- `config/routes.rb` (modificar)

---

### Epic 4: Frontend - Tipos, API y Estado

#### US-4.1: Crear tipos TypeScript para Shifts
**Como** desarrollador frontend
**Quiero** tipos para turnos
**Para** tener type safety

**Criterios de aceptación:**
- [ ] Crear `app/frontend/types/Shifts.ts`
- [ ] Tipos:
  - `ClinicSchedule`
  - `StaffSchedule`
  - `ScheduleException`
  - `ExceptionType`
  - `WeeklyOverview`
  - `DaySchedule`

**Archivos:**
- `app/frontend/types/Shifts.ts` (nuevo)

---

#### US-4.2: Crear API client para Shifts
**Como** desarrollador frontend
**Quiero** cliente API para turnos
**Para** consumir los endpoints

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/Shifts.ts`
- [ ] Métodos:
  - getClinicSchedule()
  - updateClinicSchedule(schedules)
  - getStaffSchedules(params)
  - updateStaffSchedule(userId, schedules)
  - getWeeklyOverview(weekStart)
  - createException(params)
  - deleteException(id)
- [ ] Export instancia `shiftsApi`

**Archivos:**
- `app/frontend/api/Shifts.ts` (nuevo)

---

#### US-4.3: Crear hook useShifts
**Como** desarrollador frontend
**Quiero** hook para gestionar turnos
**Para** separar lógica

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/useShifts.ts`
- [ ] Métodos para cada operación
- [ ] Estado de semana seleccionada
- [ ] Manejo de loading/error
- [ ] Toast notifications

**Archivos:**
- `app/frontend/hooks/useShifts.ts` (nuevo)

---

### Epic 5: Frontend - Páginas y Componentes

#### US-5.1: Crear página ShiftsIndex
**Como** admin/hr
**Quiero** una página de gestión de turnos
**Para** configurar horarios

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/shifts/ShiftsIndex.tsx`
- [ ] Tabs: Horario Clínica, Turnos Personal, Calendario
- [ ] Vista interna con useState
- [ ] Envuelto en AdminLayout

**Archivos:**
- `app/frontend/pages/admin/shifts/ShiftsIndex.tsx` (nuevo)

---

#### US-5.2: Crear componente ClinicScheduleEditor
**Como** admin
**Quiero** editar el horario de la clínica
**Para** configurar días y horas

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/shifts/components/ClinicScheduleEditor.tsx`
- [ ] Grid de 7 días
- [ ] Toggle para abrir/cerrar día
- [ ] Time pickers para apertura/cierre
- [ ] Botón guardar

**Archivos:**
- `app/frontend/pages/admin/shifts/components/ClinicScheduleEditor.tsx` (nuevo)

---

#### US-5.3: Crear componente StaffScheduleEditor
**Como** admin/hr
**Quiero** editar turnos del personal
**Para** asignar horarios

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/shifts/components/StaffScheduleEditor.tsx`
- [ ] Selector de empleado
- [ ] Grid de días con horarios
- [ ] Toggle disponibilidad
- [ ] Time pickers
- [ ] Botón guardar

**Archivos:**
- `app/frontend/pages/admin/shifts/components/StaffScheduleEditor.tsx` (nuevo)

---

#### US-5.4: Crear componente WeeklyCalendar
**Como** admin/hr
**Quiero** ver calendario semanal
**Para** visualizar turnos

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/shifts/components/WeeklyCalendar.tsx`
- [ ] Vista de semana con días como columnas
- [ ] Filas: empleados
- [ ] Celdas: horarios con colores
- [ ] Mostrar excepciones
- [ ] Navegación entre semanas

**Archivos:**
- `app/frontend/pages/admin/shifts/components/WeeklyCalendar.tsx` (nuevo)

---

#### US-5.5: Crear componente ExceptionDialog
**Como** admin/hr
**Quiero** diálogo para crear excepciones
**Para** registrar vacaciones/festivos

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/shifts/components/ExceptionDialog.tsx`
- [ ] Selector: empleado o clínica general
- [ ] Date picker
- [ ] Tipo de excepción
- [ ] All day o horario específico
- [ ] Razón/notas
- [ ] Botones: Cancelar, Guardar

**Archivos:**
- `app/frontend/pages/admin/shifts/components/ExceptionDialog.tsx` (nuevo)

---

#### US-5.6: Habilitar página Shifts en sidebar y rutas
**Como** usuario admin/hr
**Quiero** acceder a Turnos desde el sidebar
**Para** gestionar horarios

**Criterios de aceptación:**
- [ ] Modificar `app/actions/admin/build_sidebar.rb`:
  - Habilitar item "shifts" (remover disabled: true)
  - Asegurar acceso para admin y hr
- [ ] Agregar en routes.rb: `get 'shifts', to: 'admin_pages#shifts'`
- [ ] Agregar action en AdminPagesController

**Archivos:**
- `app/actions/admin/build_sidebar.rb` (modificar)
- `config/routes.rb` (modificar)
- `app/controllers/admin_pages_controller.rb` (modificar)

---

## Modelo de Datos

### ClinicSchedule

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| day_of_week | integer | ✓ | 0-6 (domingo-sábado), unique |
| open_time | time | ✓ | Hora apertura |
| close_time | time | ✓ | Hora cierre |
| is_open | boolean | ✓ | Default: true |
| notes | text | - | Observaciones |

### ScheduleException

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| exceptionable_type | string | - | User o null (clínica) |
| exceptionable_id | bigint | - | FK o null |
| exception_type | integer | ✓ | Enum: holiday, vacation, sick, permit, training |
| date | date | ✓ | Fecha de la excepción |
| all_day | boolean | ✓ | Default: true |
| start_time | time | - | Si no all_day |
| end_time | time | - | Si no all_day |
| reason | string | - | Motivo |
| approved_by_id | bigint | - | FK users |
| notes | text | - | Observaciones |

---

## Endpoints API

| Método | Ruta | Acción | Roles |
|--------|------|--------|-------|
| GET | /admin/shifts/clinic_schedule | clinic_schedule | admin, hr |
| PATCH | /admin/shifts/clinic_schedule | update_clinic_schedule | admin |
| GET | /admin/shifts/staff_schedules | staff_schedules | admin, hr |
| PATCH | /admin/shifts/staff_schedules/:user_id | update_staff_schedule | admin, hr |
| GET | /admin/shifts/weekly_overview | weekly_overview | admin, hr |
| POST | /admin/shifts/exceptions | create_exception | admin, hr |
| DELETE | /admin/shifts/exceptions/:id | delete_exception | admin, hr |

---

## Orden de Implementación

### Fase 1: Base de Datos y Modelos (US 1.1 - 1.5)
1. Migraciones
2. Modelos con validaciones
3. Factories y model specs
4. Seeds

### Fase 2: Actions (US 2.1 - 2.7)
5. GetClinicSchedule
6. UpdateClinicSchedule
7. GetStaffSchedules
8. UpdateStaffSchedule
9. CreateException
10. DeleteException
11. GetWeeklyOverview

### Fase 3: Backend Controller (US 3.1 - 3.3)
12. Tests TDD
13. Controller
14. Rutas

### Fase 4: Frontend Base (US 4.1 - 4.3)
15. Tipos TypeScript
16. API client
17. Hook useShifts

### Fase 5: Páginas y Componentes (US 5.1 - 5.6)
18. ShiftsIndex
19. ClinicScheduleEditor
20. StaffScheduleEditor
21. WeeklyCalendar
22. ExceptionDialog
23. Habilitar en sidebar

---

## Verificación

### Tests Backend
```bash
bundle exec rspec spec/models/clinic_schedule_spec.rb
bundle exec rspec spec/models/schedule_exception_spec.rb
bundle exec rspec spec/actions/admin/shifts/
bundle exec rspec spec/requests/admin/shifts_spec.rb
```

### E2E Manual
1. Navegar a /admin/shifts
2. Editar horario de clínica
3. Editar turno de un empleado
4. Crear excepción (vacación)
5. Ver calendario semanal
6. Eliminar excepción

### CI
```bash
npm run push
```
