<!--
STATUS: ✅ COMPLETADO
Implementado en: commit 7f6c24b (Feat/payments system #38)
Incluye: PaymentItems, due dates, recordatorios, estados avanzados, mailers automáticos
Backend: Models, Actions, Jobs, Mailers, Controller
Frontend: Types, API, Hook, Redux, Páginas, Componentes
-->

# Plan: Sistema de Pagos Avanzado (Payments Module)

## Resumen

Evolucionar el sistema de pagos existente a un sistema completo que incluye:
- **Payment Items**: Línea de facturación con servicios/tratamientos
- **Due dates y recordatorios**: Vencimiento programado con notificaciones automáticas
- **Estados avanzados**: draft, pending, completed, overdue, cancelled
- **Pagos relacionados**: Extensión de pagos cerrados via parent_payment_id
- **Automatización**: Creación de borrador al crear cita, mailers de recordatorio

**Acceso**: Roles `admin`, `vet`, `vet_assistant`, `assistant`

---

## Arquitectura

### Modelo Payment (Mejorado)

```
Payment
├── owner_id (referencia directa al dueño)
├── appointment_id (opcional - pagos pueden ser independientes)
├── parent_payment_id (auto-referencia para extensiones)
├── status: draft | pending | completed | overdue | cancelled
├── due_date (fecha de vencimiento)
├── due_days (días para calcular due_date)
├── transaction_id, provider, payment_method
├── pet_name, owner_name (cached para factura)
├── amount (calculado de payment_items)
└── has_many :payment_items
```

### Modelo PaymentItem (Nuevo)

```
PaymentItem
├── payment_id (FK)
├── service_id (opcional - puede ser item manual)
├── description (nombre del item)
├── quantity, unit_price, total_price
└── notes
```

### Flujos Principales

1. **Crear cita** → Se crea Payment draft automático con el servicio
2. **Editar draft** → Agregar/modificar items, establecer due_date
3. **Registrar pago** → Cambia status a completed, guarda transaction_id
4. **Extender pago** → Crear nuevo Payment con parent_payment_id (inmutable el original)

### Recordatorios Automáticos

| Job | Frecuencia | Acción |
|-----|------------|--------|
| PaymentDueReminderJob | Diario 9AM | Email si due_date = mañana |
| PaymentOverdueReminderJob | Lunes 9AM | Email si vencido |
| PaymentStatusUpdaterJob | Diario 1AM | Marca overdue automáticamente |

**Regla de vencimiento:** Un pago está vencido el día DESPUÉS de su due_date
- Ejemplo: due_date = 20/05, el 20/05 aún es válido, vencido desde el 21/05

---

## User Stories

### Epic 1: Base de Datos y Modelos

#### US-1.1: Migración para mejorar tabla payments
**Como** desarrollador
**Quiero** agregar nuevos campos a la tabla payments
**Para** soportar el sistema de pagos avanzado

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_enhance_payments_table.rb`
- [ ] Agregar campos: owner_id, parent_payment_id, status, due_date, due_days, transaction_id, provider, pet_name, owner_name
- [ ] Hacer appointment_id nullable (pagos pueden ser independientes)
- [ ] Hacer payment_method nullable (draft no tiene método)
- [ ] Hacer paid_at nullable (draft no está pagado)
- [ ] Agregar índices: owner_id, status, due_date, parent_payment_id
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_enhance_payments_table.rb` (nuevo)

---

#### US-1.2: Migración para crear tabla payment_items
**Como** desarrollador
**Quiero** crear la tabla payment_items
**Para** soportar múltiples servicios/tratamientos por pago

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_payment_items.rb`
- [ ] Campos: payment_id, service_id, description, quantity, unit_price, total_price, notes
- [ ] FK a payments (required), FK a services (optional)
- [ ] Índices en payment_id y service_id
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_payment_items.rb` (nuevo)

---

#### US-1.3: Migración de datos existentes
**Como** desarrollador
**Quiero** migrar los pagos existentes al nuevo esquema
**Para** mantener la integridad de datos

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_migrate_existing_payments.rb`
- [ ] Para cada Payment existente:
  - Obtener owner_id desde appointment.owner_id
  - Establecer status = :completed (ya están pagados)
  - Cachear pet_name y owner_name desde relaciones
  - Crear PaymentItem con el amount actual y service del appointment
- [ ] Hacer owner_id NOT NULL después de la migración
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_migrate_existing_payments.rb` (nuevo)

---

#### US-1.4: Actualizar modelo Payment
**Como** desarrollador
**Quiero** actualizar el modelo Payment con nuevas asociaciones y validaciones
**Para** soportar el flujo de pagos avanzado

**Criterios de aceptación:**
- [ ] Modificar `app/models/payment.rb`
- [ ] Asociaciones nuevas:
  - `belongs_to :owner`
  - `belongs_to :appointment, optional: true`
  - `belongs_to :parent_payment, class_name: 'Payment', optional: true`
  - `has_many :child_payments, class_name: 'Payment', foreign_key: :parent_payment_id`
  - `has_many :payment_items, dependent: :destroy`
  - `accepts_nested_attributes_for :payment_items, allow_destroy: true`
- [ ] Enum status: `{ draft: 0, pending: 1, completed: 2, overdue: 3, cancelled: 4 }`
- [ ] Validaciones condicionales según status
- [ ] Callbacks: calculate_total_amount, cache_names, calculate_due_date
- [ ] Scopes: drafts, pending_payment, completed, overdue, due_tomorrow, past_due
- [ ] Métodos: editable?, can_extend?

**Archivos:**
- `app/models/payment.rb` (modificar)

---

#### US-1.5: Crear modelo PaymentItem
**Como** desarrollador
**Quiero** crear el modelo PaymentItem
**Para** representar líneas de facturación

**Criterios de aceptación:**
- [ ] Crear `app/models/payment_item.rb`
- [ ] Asociaciones: belongs_to :payment, belongs_to :service (optional)
- [ ] Validaciones: description required, quantity > 0, unit_price >= 0
- [ ] Callback: before_save :calculate_total_price
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/payment_item.rb` (nuevo)
- `spec/factories/payment_items.rb` (nuevo)
- `spec/models/payment_item_spec.rb` (nuevo)

---

#### US-1.6: Actualizar factory y specs de Payment
**Como** desarrollador
**Quiero** actualizar los tests de Payment
**Para** cubrir las nuevas funcionalidades

**Criterios de aceptación:**
- [ ] Actualizar `spec/factories/payments.rb` con nuevos campos y traits
- [ ] Crear/actualizar `spec/models/payment_spec.rb`:
  - Test de status enum
  - Test de validaciones condicionales
  - Test de calculate_total_amount
  - Test de cache_names
  - Test de editable? y can_extend?
  - Test de scopes

**Archivos:**
- `spec/factories/payments.rb` (modificar)
- `spec/models/payment_spec.rb` (nuevo/modificar)

---

#### US-1.7: Crear seeds para payments
**Como** desarrollador
**Quiero** tener datos de prueba del nuevo sistema de pagos
**Para** probar el sistema sin crear datos manualmente

**Criterios de aceptación:**
- [ ] Crear `db/seeds/13_payments.rb`
- [ ] Crear pagos con diferentes estados:
  - 2 draft (borradores de citas futuras)
  - 2 pending con due_date (pendientes de pago)
  - 3 completed (pagados)
  - 1 overdue (vencido)
  - 1 con parent_payment_id (extensión)
- [ ] Crear payment_items para cada pago
- [ ] Usar find_or_create_by! para idempotencia

**Archivos:**
- `db/seeds/13_payments.rb` (nuevo)

---

### Epic 2: Actions del Sistema de Pagos

#### US-2.1: Crear Action Payments::CreateDraft
**Como** sistema
**Quiero** crear un pago en borrador automáticamente al crear una cita
**Para** tener el pago pre-configurado

**Criterios de aceptación:**
- [ ] Crear `app/actions/payments/create_draft.rb`
- [ ] Input: `appointment:`, `due_days: nil`, `due_date: nil`
- [ ] Lógica:
  - Crear Payment con status: :draft
  - owner_id desde appointment.owner_id
  - Crear PaymentItem con service del appointment
  - Calcular due_date si se proporciona due_days
- [ ] Retorna `Result.success(payment: payment)` o `Result.failure(errors:)`
- [ ] Crear spec `spec/actions/payments/create_draft_spec.rb`

**Archivos:**
- `app/actions/payments/create_draft.rb` (nuevo)
- `spec/actions/payments/create_draft_spec.rb` (nuevo)

---

#### US-2.2: Crear Action Payments::RegisterPayment
**Como** staff
**Quiero** registrar el pago de un borrador/pendiente
**Para** completar el proceso de facturación

**Criterios de aceptación:**
- [ ] Crear `app/actions/payments/register_payment.rb`
- [ ] Input: `payment:`, `params:` (payment_method, transaction_id, provider, notes)
- [ ] Validaciones:
  - Payment debe existir
  - Payment no debe estar completed
- [ ] Lógica:
  - Actualizar payment_method, transaction_id, provider, notes
  - Establecer paid_at = Time.current
  - Cambiar status a :completed
  - Actualizar appointment.payment_status si existe
- [ ] Retorna `Result.success(payment: payment)` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/payments/register_payment.rb` (nuevo)
- `spec/actions/payments/register_payment_spec.rb` (nuevo)

---

#### US-2.3: Crear Action Payments::ExtendPayment
**Como** staff
**Quiero** crear un pago relacionado a uno completado
**Para** agregar cargos adicionales sin modificar el original

**Criterios de aceptación:**
- [ ] Crear `app/actions/payments/extend_payment.rb`
- [ ] Input: `parent_payment:`, `params:` (items, due_date, notes)
- [ ] Validaciones:
  - parent_payment debe estar completed
- [ ] Lógica:
  - Crear nuevo Payment con parent_payment_id
  - Copiar owner_id, pet_name, owner_name
  - status: :pending (o :draft si no tiene due_date)
  - Crear payment_items según params
- [ ] Retorna `Result.success(payment: payment)` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/payments/extend_payment.rb` (nuevo)
- `spec/actions/payments/extend_payment_spec.rb` (nuevo)

---

#### US-2.4: Crear Action Payments::UpdateDraft
**Como** staff
**Quiero** actualizar un pago en borrador
**Para** modificar items antes de completar

**Criterios de aceptación:**
- [ ] Crear `app/actions/payments/update_draft.rb`
- [ ] Input: `payment:`, `params:` (due_date, due_days, notes, payment_items_attributes)
- [ ] Validaciones:
  - Payment debe ser editable? (no completed)
- [ ] Lógica:
  - Actualizar campos permitidos
  - Manejar nested attributes para payment_items
- [ ] Retorna `Result.success(payment: payment)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/payments/update_draft.rb` (nuevo)
- `spec/actions/payments/update_draft_spec.rb` (nuevo)

---

#### US-2.5: Integrar CreateDraft en creación de Appointment
**Como** sistema
**Quiero** que al crear una cita se cree automáticamente un pago en borrador
**Para** automatizar el flujo de facturación

**Criterios de aceptación:**
- [ ] Modificar `app/controllers/admin/appointments_controller.rb#create`
- [ ] Después de crear appointment exitosamente:
  - Llamar `Payments::CreateDraft.new(appointment: appointment).call`
  - Log si falla pero no bloquear creación de cita
- [ ] Actualizar relación en Appointment: `has_one :payment` a `has_many :payments`
- [ ] Crear scope en Payment: `scope :for_appointment, ->(apt) { where(appointment_id: apt.id) }`

**Archivos:**
- `app/controllers/admin/appointments_controller.rb` (modificar)
- `app/models/appointment.rb` (modificar)

---

### Epic 3: Jobs de Recordatorios

#### US-3.1: Crear PaymentDueReminderJob
**Como** sistema
**Quiero** enviar recordatorios de pago un día antes del vencimiento
**Para** notificar a los dueños

**Criterios de aceptación:**
- [ ] Crear `app/jobs/payment_due_reminder_job.rb`
- [ ] Hereda de ApplicationJob
- [ ] Queue: :mailers
- [ ] Lógica en `perform`:
  - Obtener Payment.due_tomorrow (status: pending, due_date: Date.tomorrow)
  - Para cada pago, enviar PaymentMailer.due_tomorrow.deliver_later
  - Log cantidad de emails enviados
- [ ] Manejo de errores con log
- [ ] Crear spec

**Archivos:**
- `app/jobs/payment_due_reminder_job.rb` (nuevo)
- `spec/jobs/payment_due_reminder_job_spec.rb` (nuevo)

---

#### US-3.2: Crear PaymentOverdueReminderJob
**Como** sistema
**Quiero** enviar recordatorios cada lunes para pagos vencidos
**Para** recordar a los dueños sus deudas pendientes

**Criterios de aceptación:**
- [ ] Crear `app/jobs/payment_overdue_reminder_job.rb`
- [ ] Hereda de ApplicationJob
- [ ] Queue: :mailers
- [ ] Lógica en `perform`:
  - Solo ejecutar si es lunes (Date.current.monday?)
  - Obtener Payment.overdue (status: overdue)
  - Para cada pago, enviar PaymentMailer.overdue_reminder.deliver_later
  - Log cantidad de emails enviados
- [ ] Crear spec

**Archivos:**
- `app/jobs/payment_overdue_reminder_job.rb` (nuevo)
- `spec/jobs/payment_overdue_reminder_job_spec.rb` (nuevo)

---

#### US-3.3: Crear PaymentStatusUpdaterJob
**Como** sistema
**Quiero** marcar automáticamente pagos vencidos como overdue
**Para** mantener estados consistentes

**Criterios de aceptación:**
- [ ] Crear `app/jobs/payment_status_updater_job.rb`
- [ ] Lógica:
  - Encontrar Payment.pending.where('due_date < ?', Date.current)
  - Actualizar status a :overdue
  - Log cantidad de pagos actualizados
- [ ] Ejecutar diariamente
- [ ] Crear spec

**Archivos:**
- `app/jobs/payment_status_updater_job.rb` (nuevo)
- `spec/jobs/payment_status_updater_job_spec.rb` (nuevo)

---

#### US-3.4: Configurar Solid Queue para jobs recurrentes
**Como** desarrollador
**Quiero** configurar la ejecución recurrente de los jobs
**Para** automatizar los recordatorios

**Criterios de aceptación:**
- [ ] Agregar configuración en `config/recurring.yml`:
  - PaymentDueReminderJob: diario a las 9:00 AM
  - PaymentOverdueReminderJob: lunes a las 9:00 AM
  - PaymentStatusUpdaterJob: diario a las 1:00 AM
- [ ] Documentar cómo ejecutar jobs manualmente

**Archivos:**
- `config/recurring.yml` (nuevo/modificar)

---

### Epic 4: Mailers

#### US-4.1: Crear PaymentMailer
**Como** sistema
**Quiero** enviar emails relacionados con pagos
**Para** notificar a los dueños

**Criterios de aceptación:**
- [ ] Crear `app/mailers/payment_mailer.rb`
- [ ] Métodos:
  - `due_tomorrow(payment)` - Recordatorio día antes de vencimiento
  - `overdue_reminder(payment)` - Recordatorio de pago vencido
  - `payment_received(payment)` - Confirmación de pago recibido
- [ ] Variables en cada email: @payment, @owner, @pet_name, @amount, @due_date
- [ ] Subjects claros en español
- [ ] Crear views HTML y texto

**Archivos:**
- `app/mailers/payment_mailer.rb` (nuevo)
- `app/views/payment_mailer/due_tomorrow.html.erb` (nuevo)
- `app/views/payment_mailer/due_tomorrow.text.erb` (nuevo)
- `app/views/payment_mailer/overdue_reminder.html.erb` (nuevo)
- `app/views/payment_mailer/overdue_reminder.text.erb` (nuevo)
- `app/views/payment_mailer/payment_received.html.erb` (nuevo)
- `app/views/payment_mailer/payment_received.text.erb` (nuevo)

---

#### US-4.2: Crear specs y previews para PaymentMailer
**Como** desarrollador
**Quiero** tests para el mailer de pagos
**Para** asegurar que los emails funcionan correctamente

**Criterios de aceptación:**
- [ ] Crear `spec/mailers/payment_mailer_spec.rb`
- [ ] Tests para cada método: subject, destinatario, contenido
- [ ] Previews en `spec/mailers/previews/payment_mailer_preview.rb`

**Archivos:**
- `spec/mailers/payment_mailer_spec.rb` (nuevo)
- `spec/mailers/previews/payment_mailer_preview.rb` (nuevo)

---

### Epic 5: Backend - Controller y Endpoints

#### US-5.1: Tests TDD para Payments endpoints
**Como** desarrollador
**Quiero** escribir tests antes de implementar el controlador
**Para** seguir TDD

**Criterios de aceptación:**
- [ ] Crear `spec/requests/admin/payments_spec.rb`
- [ ] Tests para:
  - GET /admin/payments-list (index con filtros)
  - GET /admin/payments/:id (show)
  - POST /admin/payments (create - pago directo)
  - PATCH /admin/payments/:id (update draft)
  - POST /admin/payments/:id/register (registrar pago)
  - POST /admin/payments/:id/extend (crear pago hijo)
- [ ] Verificar autorización (solo staff)
- [ ] Verificar que completed payments no se pueden editar
- [ ] Tests deben fallar inicialmente

**Archivos:**
- `spec/requests/admin/payments_spec.rb` (nuevo)

---

#### US-5.2: Implementar Admin::PaymentsController
**Como** staff
**Quiero** endpoints para gestionar pagos
**Para** administrar la facturación

**Criterios de aceptación:**
- [ ] Crear `app/controllers/admin/payments_controller.rb`
- [ ] Include Authenticatable
- [ ] before_action :authenticate_staff!
- [ ] Actions:
  - `index`: Lista con filtros (status, owner_id, appointment_id, from_date, to_date, overdue)
  - `show`: Detalle con payment_items, parent_payment, child_payments
  - `create`: Crear pago directo (sin appointment)
  - `update`: Actualizar draft (usa Payments::UpdateDraft)
  - `register`: Registrar pago (usa Payments::RegisterPayment)
  - `extend`: Crear pago hijo (usa Payments::ExtendPayment)
- [ ] Strong params con nested attributes para payment_items
- [ ] JSON responses siguiendo convención del proyecto
- [ ] Tests deben pasar

**Archivos:**
- `app/controllers/admin/payments_controller.rb` (nuevo)

---

#### US-5.3: Agregar rutas para Payments
**Como** desarrollador
**Quiero** agregar rutas de Payments
**Para** que el frontend pueda consumir el API

**Criterios de aceptación:**
- [ ] Modificar `config/routes.rb`
- [ ] En namespace `admin`:
  - `get 'payments-list', to: 'payments#index', as: :payments_list`
  - `resources :payments, only: [:show, :create, :update]`
  - `post 'payments/:id/register', to: 'payments#register', as: :register_payment`
  - `post 'payments/:id/extend', to: 'payments#extend', as: :extend_payment`
- [ ] Verificar rutas con `rails routes | grep payment`

**Archivos:**
- `config/routes.rb` (modificar)

---

### Epic 6: Frontend - Tipos y API Client

#### US-6.1: Actualizar tipos TypeScript para Payment
**Como** desarrollador frontend
**Quiero** tipos actualizados para el nuevo sistema de pagos
**Para** tener type safety

**Criterios de aceptación:**
- [ ] Modificar `app/frontend/types/Payment.ts`
- [ ] Tipos:
  - `PaymentStatus = 'draft' | 'pending' | 'completed' | 'overdue' | 'cancelled'`
  - `Payment` con nuevos campos
  - `PaymentParams` para crear/actualizar
  - `PaymentItem` y `PaymentItemParams`
  - `PaymentFilters`
  - `RegisterPaymentParams`
  - `ExtendPaymentParams`

**Archivos:**
- `app/frontend/types/Payment.ts` (modificar)

---

#### US-6.2: Crear API client para Payments
**Como** desarrollador frontend
**Quiero** un cliente API para Payments
**Para** consumir los endpoints

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/Payments.ts`
- [ ] Métodos: list, show, create, update, register, extend
- [ ] Usar convención JSON con wrapper `{ payment: {...} }`
- [ ] Export instancia `paymentsApi`

**Archivos:**
- `app/frontend/api/Payments.ts` (nuevo)

---

#### US-6.3: Crear Redux slice para Payments
**Como** desarrollador frontend
**Quiero** estado global para payments
**Para** manejar la lista y acciones

**Criterios de aceptación:**
- [ ] Crear `app/frontend/store/slices/paymentsSlice.ts`
- [ ] State: payments, currentPayment, pagination, isLoading, error
- [ ] Reducers correspondientes
- [ ] Registrar en store

**Archivos:**
- `app/frontend/store/slices/paymentsSlice.ts` (nuevo)
- `app/frontend/store/index.ts` (modificar)

---

#### US-6.4: Crear hook usePayments
**Como** desarrollador frontend
**Quiero** un hook para gestionar pagos
**Para** separar lógica de componentes

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/usePayments.ts`
- [ ] Métodos: fetchPayments, fetchPayment, createPayment, updatePayment, registerPayment, extendPayment
- [ ] Manejo de errores con toast
- [ ] Retorna estado y métodos

**Archivos:**
- `app/frontend/hooks/usePayments.ts` (nuevo)

---

### Epic 7: Frontend - Páginas y Componentes

#### US-7.1: Crear página PaymentsIndex
**Como** staff
**Quiero** ver la lista de pagos
**Para** gestionar facturación

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/payments/PaymentsIndex.tsx`
- [ ] Vista interna con useState: 'list' | 'detail' | 'create'
- [ ] Lista con columnas: Estado (badge), Mascota, Dueño, Monto, Due date, Paid at, Acciones
- [ ] Filtros: status, overdue, owner, fecha
- [ ] Botón "Nuevo pago"
- [ ] Indicadores visuales para overdue (rojo)
- [ ] Envuelto en AdminLayout

**Archivos:**
- `app/frontend/pages/admin/payments/PaymentsIndex.tsx` (nuevo)

---

#### US-7.2: Crear componente PaymentCard
**Como** staff
**Quiero** ver un resumen del pago en la lista
**Para** identificar rápidamente su estado

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/payments/components/PaymentCard.tsx`
- [ ] Mostrar: status badge con colores, pet/owner name, amount, due_date, paid_at
- [ ] Acciones según estado:
  - Draft/Pending: Editar, Registrar pago
  - Completed: Ver, Extender
  - Overdue: Editar, Registrar pago (highlight)

**Archivos:**
- `app/frontend/pages/admin/payments/components/PaymentCard.tsx` (nuevo)

---

#### US-7.3: Crear componente PaymentDetail
**Como** staff
**Quiero** ver el detalle completo de un pago
**Para** revisar toda la información

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/payments/components/PaymentDetail.tsx`
- [ ] Secciones:
  - Header: Status, Pet, Owner, Total
  - Items: Lista de PaymentItems con descripción, cantidad, precios
  - Info de pago (si completed): método, transaction_id, provider, paid_at
  - Notas
  - Parent payment (si es extensión)
  - Child payments (si tiene extensiones)
- [ ] Acciones contextuales según estado

**Archivos:**
- `app/frontend/pages/admin/payments/components/PaymentDetail.tsx` (nuevo)

---

#### US-7.4: Crear componente PaymentForm
**Como** staff
**Quiero** crear/editar pagos
**Para** gestionar la facturación

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/payments/components/PaymentForm.tsx`
- [ ] Campos:
  - Owner selector (si create)
  - Pet name (auto o manual)
  - Due date / Due days
  - Payment items (tabla editable)
  - Notas
- [ ] Total calculado automáticamente
- [ ] Validación: al menos 1 item
- [ ] Si edit y payment completed: mostrar read-only

**Archivos:**
- `app/frontend/pages/admin/payments/components/PaymentForm.tsx` (nuevo)

---

#### US-7.5: Crear componente RegisterPaymentDialog
**Como** staff
**Quiero** un diálogo para registrar el pago
**Para** completar el proceso rápidamente

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/payments/components/RegisterPaymentDialog.tsx`
- [ ] Dialog con campos: payment_method, transaction_id, provider, notes
- [ ] Mostrar resumen: monto total, owner, pet
- [ ] Botones: Cancelar, Registrar pago

**Archivos:**
- `app/frontend/pages/admin/payments/components/RegisterPaymentDialog.tsx` (nuevo)

---

#### US-7.6: Crear componente ExtendPaymentDialog
**Como** staff
**Quiero** crear un pago de extensión
**Para** agregar cargos a un pago completado

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/payments/components/ExtendPaymentDialog.tsx`
- [ ] Dialog con: info del pago padre (read-only), items nuevos, due_date, notas
- [ ] Al confirmar: llamar extendPayment, navegar al nuevo pago

**Archivos:**
- `app/frontend/pages/admin/payments/components/ExtendPaymentDialog.tsx` (nuevo)

---

#### US-7.7: Agregar página Payments al AdminSidebar y rutas
**Como** usuario admin
**Quiero** acceder a Pagos desde el sidebar
**Para** gestionar facturación

**Criterios de aceptación:**
- [ ] Modificar `app/actions/admin/build_sidebar.rb`:
  - Línea 38: remover `disabled: true` del item "payments"
- [ ] Agregar en routes.rb: `get 'payments', to: 'admin_pages#payments'`
- [ ] Agregar action en AdminPagesController

**Archivos:**
- `app/actions/admin/build_sidebar.rb` (modificar línea 38)
- `config/routes.rb` (modificar)
- `app/controllers/admin_pages_controller.rb` (modificar)

---

### Epic 8: Integración con Appointments

#### US-8.1: Mostrar info de pago en AppointmentDetail
**Como** staff
**Quiero** ver el estado de pago en el detalle de cita
**Para** saber si la cita está pagada

**Criterios de aceptación:**
- [ ] Modificar `AppointmentDetail.tsx`
- [ ] Mostrar: badge de payment_status, link al pago
- [ ] Botón "Ver pago" que navega a PaymentDetail
- [ ] Si payment es draft: botón "Registrar pago"

**Archivos:**
- `app/frontend/pages/admin/appointments/components/AppointmentDetail.tsx` (modificar)

---

## Modelo de Datos Detallado

### Payment (enhanced)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| owner_id | bigint | ✓ | FK owners |
| appointment_id | bigint | - | FK appointments (nullable) |
| parent_payment_id | bigint | - | Self-ref para extensiones |
| status | integer | ✓ | Enum: 0=draft, 1=pending, 2=completed, 3=overdue, 4=cancelled |
| due_date | date | - | Fecha de vencimiento |
| due_days | integer | - | Días para calcular due_date |
| transaction_id | string | - | ID del proveedor |
| provider | string | - | stripe, paypal, manual |
| payment_method | string | - | cash, card, transfer, online |
| payment_reference | string | - | Referencia adicional |
| amount | decimal(10,2) | ✓ | Suma de payment_items |
| currency | string | ✓ | Default: USD |
| pet_name | string | - | Cached para factura |
| owner_name | string | - | Cached para factura |
| paid_at | datetime | - | Cuando status=completed |
| notes | text | - | Observaciones |

### PaymentItem (nuevo)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| payment_id | bigint | ✓ | FK payments |
| service_id | bigint | - | FK services (opcional) |
| description | string | ✓ | Nombre del item |
| quantity | integer | ✓ | Default: 1 |
| unit_price | decimal(10,2) | ✓ | Precio unitario |
| total_price | decimal(10,2) | ✓ | quantity * unit_price |
| notes | text | - | Notas del item |

---

## Endpoints API

| Método | Ruta | Acción | Descripción |
|--------|------|--------|-------------|
| GET | /admin/payments-list | index | Lista con filtros |
| GET | /admin/payments/:id | show | Detalle con items |
| POST | /admin/payments | create | Crear pago directo |
| PATCH | /admin/payments/:id | update | Editar draft |
| POST | /admin/payments/:id/register | register | Registrar pago |
| POST | /admin/payments/:id/extend | extend | Crear extensión |

---

## Orden de Implementación

### Fase 1: Base de Datos y Modelos (US 1.1 - 1.7)
1. Migraciones (enhance, create_items, migrate_data)
2. Modelo Payment actualizado
3. Modelo PaymentItem nuevo
4. Factories y specs
5. Seeds

### Fase 2: Actions (US 2.1 - 2.5)
6. CreateDraft
7. RegisterPayment
8. ExtendPayment
9. UpdateDraft
10. Integración con Appointments

### Fase 3: Jobs y Mailers (US 3.1 - 4.2)
11. PaymentDueReminderJob
12. PaymentOverdueReminderJob
13. PaymentStatusUpdaterJob
14. Configuración Solid Queue
15. PaymentMailer con vistas
16. Specs de mailer

### Fase 4: Backend Controller (US 5.1 - 5.3)
17. Tests TDD
18. PaymentsController
19. Rutas

### Fase 5: Frontend (US 6.1 - 7.7)
20. Tipos TypeScript
21. API client
22. Redux slice
23. Hook usePayments
24. Página PaymentsIndex
25. Componentes UI
26. Habilitar en Sidebar

### Fase 6: Integración (US 8.1)
27. Info de pago en AppointmentDetail

---

## Verificación

### Tests Backend
```bash
bundle exec rspec spec/models/payment_spec.rb
bundle exec rspec spec/models/payment_item_spec.rb
bundle exec rspec spec/actions/payments/
bundle exec rspec spec/requests/admin/payments_spec.rb
bundle exec rspec spec/jobs/payment_*_spec.rb
bundle exec rspec spec/mailers/payment_mailer_spec.rb
```

### E2E Manual
1. Crear cita → Verificar payment draft creado
2. Editar draft → Agregar items
3. Establecer due_date
4. Registrar pago → Verificar status completed
5. Intentar editar completed → Debe fallar
6. Extender pago → Verificar parent_payment_id
7. Verificar emails de recordatorio (letter_opener en dev)

### CI
```bash
npm run push
```
