<!--
STATUS: ✅ COMPLETADO
Implementado en: commits b5be479 + 4c90336
Incluye: Expense, SpecialEvent, Refund models, Balance/CashFlow Actions, FinancialIndex page
Backend: Models, Actions, Controller
Frontend: Types, API, Hook, FinancialIndex, BalanceCard, ExpenseCard, RefundCard
-->

# Plan: Módulo Financiero (Financial Module)

## Resumen

Implementar un módulo financiero completo que incluya:
- **Ingresos**: Vista consolidada de pagos recibidos
- **Egresos/Gastos**: Registro de gastos de la clínica
- **Pagos por cobrar**: Pagos pendientes y vencidos
- **Cancelaciones/Devoluciones**: Gestión de reembolsos
- **Eventos especiales**: Jornadas de vacunación, esterilización, etc.
- **Reportes**: Balance, flujo de caja, proyecciones

**Acceso**: Roles `admin`, `finances`

---

## Arquitectura

### Modelos

#### Expense (Nuevo)
Registro de egresos/gastos de la clínica.

```
Expense
├── category (integer enum)
├── description (string)
├── amount (decimal)
├── currency (string)
├── expense_date (date)
├── payment_method (string)
├── receipt_number (string)
├── vendor (string)
├── created_by_id (FK users)
├── notes (text)
└── has_one_attached :receipt
```

#### SpecialEvent (Nuevo)
Eventos especiales como jornadas de vacunación.

```
SpecialEvent
├── name (string)
├── event_type (integer enum)
├── description (text)
├── start_date (date)
├── end_date (date)
├── start_time (time)
├── end_time (time)
├── is_recurring (boolean)
├── recurrence_pattern (string JSON)
├── discount_percentage (decimal)
├── services_ids (JSON array)
├── max_capacity (integer)
├── current_registrations (integer)
├── is_visible_on_landing (boolean)
├── status (integer enum)
├── created_by_id (FK users)
└── notes (text)
```

#### Refund (Nuevo)
Registro de devoluciones/reembolsos.

```
Refund
├── payment_id (FK)
├── amount (decimal)
├── reason (string)
├── refund_method (string)
├── transaction_id (string)
├── processed_by_id (FK users)
├── processed_at (datetime)
├── notes (text)
└── status (integer enum)
```

---

## User Stories

### Epic 1: Base de Datos y Modelos

#### US-1.1: Crear migración para Expense
**Como** desarrollador
**Quiero** una tabla para gastos
**Para** registrar egresos de la clínica

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_expenses.rb`
- [ ] Campos: category, description, amount, currency, expense_date, payment_method, receipt_number, vendor, created_by_id, notes
- [ ] Índices en expense_date, category, created_by_id
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_expenses.rb` (nuevo)

---

#### US-1.2: Crear migración para SpecialEvent
**Como** desarrollador
**Quiero** una tabla para eventos especiales
**Para** gestionar jornadas y promociones

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_special_events.rb`
- [ ] Campos: name, event_type, description, start_date, end_date, start_time, end_time, is_recurring, recurrence_pattern, discount_percentage, services_ids, max_capacity, current_registrations, is_visible_on_landing, status, created_by_id, notes
- [ ] Índices en start_date, event_type, status, is_visible_on_landing
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_special_events.rb` (nuevo)

---

#### US-1.3: Crear migración para Refund
**Como** desarrollador
**Quiero** una tabla para reembolsos
**Para** registrar devoluciones

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_refunds.rb`
- [ ] Campos: payment_id, amount, reason, refund_method, transaction_id, processed_by_id, processed_at, notes, status
- [ ] FK a payments
- [ ] Índices en payment_id, status, processed_at
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_refunds.rb` (nuevo)

---

#### US-1.4: Crear modelo Expense
**Como** desarrollador
**Quiero** el modelo Expense
**Para** manejar gastos

**Criterios de aceptación:**
- [ ] Crear `app/models/expense.rb`
- [ ] Asociaciones:
  - `belongs_to :created_by, class_name: 'User'`
  - `has_one_attached :receipt`
- [ ] Enum category: `{ supplies: 0, utilities: 1, rent: 2, salaries: 3, equipment: 4, maintenance: 5, marketing: 6, taxes: 7, insurance: 8, other: 9 }`
- [ ] Validaciones: description, amount > 0, expense_date
- [ ] Scopes: `by_category`, `by_date_range`, `this_month`, `this_year`
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/expense.rb` (nuevo)
- `spec/factories/expenses.rb` (nuevo)
- `spec/models/expense_spec.rb` (nuevo)

---

#### US-1.5: Crear modelo SpecialEvent
**Como** desarrollador
**Quiero** el modelo SpecialEvent
**Para** manejar eventos especiales

**Criterios de aceptación:**
- [ ] Crear `app/models/special_event.rb`
- [ ] Asociaciones:
  - `belongs_to :created_by, class_name: 'User'`
  - `has_many :appointments` (via services)
- [ ] Enum event_type: `{ vaccination_day: 0, sterilization_day: 1, consultation_day: 2, checkup_day: 3, adoption_fair: 4, special_discount: 5, other: 6 }`
- [ ] Enum status: `{ draft: 0, published: 1, ongoing: 2, completed: 3, cancelled: 4 }`
- [ ] Validaciones: name, start_date, event_type
- [ ] Métodos: `active?`, `upcoming?`, `services` (desde JSON)
- [ ] Scopes: `visible_on_landing`, `active`, `upcoming`
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/special_event.rb` (nuevo)
- `spec/factories/special_events.rb` (nuevo)
- `spec/models/special_event_spec.rb` (nuevo)

---

#### US-1.6: Crear modelo Refund
**Como** desarrollador
**Quiero** el modelo Refund
**Para** manejar devoluciones

**Criterios de aceptación:**
- [ ] Crear `app/models/refund.rb`
- [ ] Asociaciones:
  - `belongs_to :payment`
  - `belongs_to :processed_by, class_name: 'User', optional: true`
- [ ] Enum status: `{ pending: 0, approved: 1, completed: 2, rejected: 3 }`
- [ ] Validaciones: amount > 0, amount <= payment.amount, reason
- [ ] Callbacks: `after_update :update_payment_status` (cuando completed)
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/refund.rb` (nuevo)
- `spec/factories/refunds.rb` (nuevo)
- `spec/models/refund_spec.rb` (nuevo)

---

#### US-1.7: Crear seeds para Financial
**Como** desarrollador
**Quiero** datos de prueba
**Para** probar el módulo financiero

**Criterios de aceptación:**
- [ ] Crear `db/seeds/16_expenses.rb`
  - Ejemplos de diferentes categorías
- [ ] Crear `db/seeds/17_special_events.rb`
  - Jornada de vacunación próxima
  - Día de consultas con descuento
- [ ] Crear `db/seeds/18_refunds.rb`
  - Un reembolso de ejemplo
- [ ] Usar find_or_create_by!

**Archivos:**
- `db/seeds/16_expenses.rb` (nuevo)
- `db/seeds/17_special_events.rb` (nuevo)
- `db/seeds/18_refunds.rb` (nuevo)

---

### Epic 2: Actions de Gastos (Expenses)

#### US-2.1: Crear Action Financial::ListExpenses
**Como** admin/finances
**Quiero** listar gastos con filtros
**Para** ver los egresos

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/list_expenses.rb`
- [ ] Input: from_date, to_date, category, vendor
- [ ] Incluir paginación
- [ ] Retornar `Result.success(expenses:, pagination:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/list_expenses.rb` (nuevo)
- `spec/actions/admin/financial/list_expenses_spec.rb` (nuevo)

---

#### US-2.2: Crear Action Financial::CreateExpense
**Como** admin/finances
**Quiero** registrar un gasto
**Para** llevar control de egresos

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/create_expense.rb`
- [ ] Input: params, current_user (para created_by)
- [ ] Validar campos requeridos
- [ ] Retornar `Result.success(expense:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/create_expense.rb` (nuevo)
- `spec/actions/admin/financial/create_expense_spec.rb` (nuevo)

---

#### US-2.3: Crear Action Financial::UpdateExpense
**Como** admin/finances
**Quiero** editar un gasto
**Para** corregir información

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/update_expense.rb`
- [ ] Input: expense, params
- [ ] Retornar `Result.success(expense:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/update_expense.rb` (nuevo)
- `spec/actions/admin/financial/update_expense_spec.rb` (nuevo)

---

#### US-2.4: Crear Action Financial::DeleteExpense
**Como** admin
**Quiero** eliminar un gasto
**Para** remover registros incorrectos

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/delete_expense.rb`
- [ ] Input: expense
- [ ] Usar soft delete (discard) si aplica
- [ ] Retornar `Result.success()` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/delete_expense.rb` (nuevo)
- `spec/actions/admin/financial/delete_expense_spec.rb` (nuevo)

---

### Epic 3: Actions de Eventos Especiales

#### US-3.1: Crear Action Financial::ListSpecialEvents
**Como** admin/finances
**Quiero** listar eventos especiales
**Para** ver las jornadas programadas

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/list_special_events.rb`
- [ ] Input: from_date, to_date, status, event_type
- [ ] Incluir paginación
- [ ] Retornar `Result.success(events:, pagination:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/list_special_events.rb` (nuevo)
- `spec/actions/admin/financial/list_special_events_spec.rb` (nuevo)

---

#### US-3.2: Crear Action Financial::CreateSpecialEvent
**Como** admin
**Quiero** crear un evento especial
**Para** programar jornadas

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/create_special_event.rb`
- [ ] Input: params, current_user
- [ ] Validar fechas, servicios
- [ ] Manejar recurrencia (convertir a JSON)
- [ ] Retornar `Result.success(event:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/create_special_event.rb` (nuevo)
- `spec/actions/admin/financial/create_special_event_spec.rb` (nuevo)

---

#### US-3.3: Crear Action Financial::UpdateSpecialEvent
**Como** admin
**Quiero** editar un evento especial
**Para** modificar jornadas

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/update_special_event.rb`
- [ ] Input: event, params
- [ ] Retornar `Result.success(event:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/update_special_event.rb` (nuevo)
- `spec/actions/admin/financial/update_special_event_spec.rb` (nuevo)

---

#### US-3.4: Crear Action Financial::CancelSpecialEvent
**Como** admin
**Quiero** cancelar un evento
**Para** notificar cancelación

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/cancel_special_event.rb`
- [ ] Input: event, reason
- [ ] Cambiar status a cancelled
- [ ] Notificar a registrados (si aplica)
- [ ] Retornar `Result.success(event:)` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/cancel_special_event.rb` (nuevo)
- `spec/actions/admin/financial/cancel_special_event_spec.rb` (nuevo)

---

### Epic 4: Actions de Reembolsos

#### US-4.1: Crear Action Financial::ListRefunds
**Como** admin/finances
**Quiero** listar reembolsos
**Para** ver devoluciones

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/list_refunds.rb`
- [ ] Input: from_date, to_date, status
- [ ] Incluir paginación y relaciones (payment)
- [ ] Retornar `Result.success(refunds:, pagination:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/list_refunds.rb` (nuevo)
- `spec/actions/admin/financial/list_refunds_spec.rb` (nuevo)

---

#### US-4.2: Crear Action Financial::CreateRefund
**Como** admin/finances
**Quiero** crear un reembolso
**Para** iniciar devolución

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/create_refund.rb`
- [ ] Input: payment_id, amount, reason
- [ ] Validar: payment completed, amount <= payment.amount
- [ ] Status inicial: pending
- [ ] Retornar `Result.success(refund:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/create_refund.rb` (nuevo)
- `spec/actions/admin/financial/create_refund_spec.rb` (nuevo)

---

#### US-4.3: Crear Action Financial::ProcessRefund
**Como** admin/finances
**Quiero** procesar un reembolso
**Para** completar la devolución

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/process_refund.rb`
- [ ] Input: refund, params (refund_method, transaction_id), current_user
- [ ] Actualizar: status completed, processed_by, processed_at
- [ ] Actualizar payment si corresponde (parcial vs total)
- [ ] Retornar `Result.success(refund:)` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/process_refund.rb` (nuevo)
- `spec/actions/admin/financial/process_refund_spec.rb` (nuevo)

---

### Epic 5: Actions de Reportes Financieros

#### US-5.1: Crear Action Financial::GetBalance
**Como** admin/finances
**Quiero** ver el balance financiero
**Para** conocer la situación económica

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/get_balance.rb`
- [ ] Input: from_date, to_date
- [ ] Calcular:
  - Total ingresos (payments completed)
  - Total egresos (expenses)
  - Total reembolsos
  - Balance neto
  - Comparativa con período anterior
- [ ] Retornar `Result.success(balance:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/get_balance.rb` (nuevo)
- `spec/actions/admin/financial/get_balance_spec.rb` (nuevo)

---

#### US-5.2: Crear Action Financial::GetCashFlow
**Como** admin/finances
**Quiero** ver el flujo de caja
**Para** analizar movimientos

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/get_cash_flow.rb`
- [ ] Input: from_date, to_date, granularity
- [ ] Serie temporal con:
  - Ingresos por período
  - Egresos por período
  - Balance acumulado
- [ ] Retornar `Result.success(cash_flow:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/get_cash_flow.rb` (nuevo)
- `spec/actions/admin/financial/get_cash_flow_spec.rb` (nuevo)

---

#### US-5.3: Crear Action Financial::GetPendingPayments
**Como** admin/finances
**Quiero** ver pagos pendientes
**Para** gestionar cobros

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/financial/get_pending_payments.rb`
- [ ] Incluir:
  - Pagos draft
  - Pagos pending
  - Pagos overdue
- [ ] Agrupar por owner (opcional)
- [ ] Ordenar por due_date
- [ ] Retornar `Result.success(pending_payments:, totals:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/financial/get_pending_payments.rb` (nuevo)
- `spec/actions/admin/financial/get_pending_payments_spec.rb` (nuevo)

---

### Epic 6: Backend - Controller y Rutas

#### US-6.1: Tests TDD para Financial Controller
**Como** desarrollador
**Quiero** escribir tests antes de implementar
**Para** seguir TDD

**Criterios de aceptación:**
- [ ] Crear `spec/requests/admin/financial_spec.rb`
- [ ] Tests para todos los endpoints
- [ ] Verificar autorización (admin, finances)
- [ ] Tests deben fallar inicialmente

**Archivos:**
- `spec/requests/admin/financial_spec.rb` (nuevo)

---

#### US-6.2: Implementar Admin::FinancialController
**Como** admin/finances
**Quiero** endpoints financieros
**Para** gestionar finanzas

**Criterios de aceptación:**
- [ ] Crear `app/controllers/admin/financial_controller.rb`
- [ ] Include Authenticatable
- [ ] before_action :authenticate_staff!
- [ ] before_action :authorize_financial_access! (admin, finances)
- [ ] Actions para:
  - Expenses: index, create, update, destroy
  - Special Events: index, show, create, update, cancel
  - Refunds: index, create, process
  - Reports: balance, cash_flow, pending_payments
- [ ] Tests deben pasar

**Archivos:**
- `app/controllers/admin/financial_controller.rb` (nuevo)

---

#### US-6.3: Agregar rutas de Financial
**Como** desarrollador
**Quiero** rutas para finanzas
**Para** que el frontend pueda consumir

**Criterios de aceptación:**
- [ ] Modificar `config/routes.rb`
- [ ] En namespace admin:
  ```ruby
  namespace :financial do
    # Expenses
    resources :expenses, except: [:show]

    # Special Events
    resources :special_events do
      member do
        post :cancel
      end
    end

    # Refunds
    resources :refunds, only: [:index, :create] do
      member do
        post :process
      end
    end

    # Reports
    get :balance
    get :cash_flow
    get :pending_payments
  end
  ```

**Archivos:**
- `config/routes.rb` (modificar)

---

### Epic 7: Frontend - Tipos, API y Estado

#### US-7.1: Crear tipos TypeScript para Financial
**Como** desarrollador frontend
**Quiero** tipos para finanzas
**Para** tener type safety

**Criterios de aceptación:**
- [ ] Crear `app/frontend/types/Financial.ts`
- [ ] Tipos:
  - `Expense`, `ExpenseCategory`, `ExpenseParams`
  - `SpecialEvent`, `EventType`, `EventStatus`, `SpecialEventParams`
  - `Refund`, `RefundStatus`, `RefundParams`
  - `Balance`, `CashFlowEntry`
  - `FinancialFilters`

**Archivos:**
- `app/frontend/types/Financial.ts` (nuevo)

---

#### US-7.2: Crear API client para Financial
**Como** desarrollador frontend
**Quiero** cliente API para finanzas
**Para** consumir los endpoints

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/Financial.ts`
- [ ] Métodos para cada operación
- [ ] Export instancia `financialApi`

**Archivos:**
- `app/frontend/api/Financial.ts` (nuevo)

---

#### US-7.3: Crear hook useFinancial
**Como** desarrollador frontend
**Quiero** hook para gestionar finanzas
**Para** separar lógica

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/useFinancial.ts`
- [ ] Métodos para cada operación
- [ ] Estado de filtros y período
- [ ] Manejo de loading/error
- [ ] Toast notifications

**Archivos:**
- `app/frontend/hooks/useFinancial.ts` (nuevo)

---

### Epic 8: Frontend - Páginas y Componentes

#### US-8.1: Crear página FinancialIndex
**Como** admin/finances
**Quiero** una página financiera
**Para** gestionar finanzas

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/FinancialIndex.tsx`
- [ ] Tabs: Resumen, Ingresos, Egresos, Eventos, Reembolsos
- [ ] Vista interna con useState
- [ ] Envuelto en AdminLayout

**Archivos:**
- `app/frontend/pages/admin/financial/FinancialIndex.tsx` (nuevo)

---

#### US-8.2: Crear componente FinancialSummary
**Como** admin/finances
**Quiero** ver resumen financiero
**Para** tener visión general

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/components/FinancialSummary.tsx`
- [ ] Cards con: ingresos, egresos, balance, pendientes
- [ ] Gráfico de flujo de caja
- [ ] Período seleccionable
- [ ] Comparativa

**Archivos:**
- `app/frontend/pages/admin/financial/components/FinancialSummary.tsx` (nuevo)

---

#### US-8.3: Crear componente ExpensesList
**Como** admin/finances
**Quiero** listar gastos
**Para** ver egresos

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/components/ExpensesList.tsx`
- [ ] Tabla con: fecha, categoría, descripción, monto, acciones
- [ ] Filtros por categoría y fecha
- [ ] Botón nuevo gasto
- [ ] Paginación

**Archivos:**
- `app/frontend/pages/admin/financial/components/ExpensesList.tsx` (nuevo)

---

#### US-8.4: Crear componente ExpenseForm
**Como** admin/finances
**Quiero** formulario de gastos
**Para** registrar egresos

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/components/ExpenseForm.tsx`
- [ ] Campos: categoría, descripción, monto, fecha, proveedor, método de pago
- [ ] Upload de recibo (imagen)
- [ ] Modo create/edit

**Archivos:**
- `app/frontend/pages/admin/financial/components/ExpenseForm.tsx` (nuevo)

---

#### US-8.5: Crear componente SpecialEventsList
**Como** admin/finances
**Quiero** listar eventos especiales
**Para** ver jornadas programadas

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/components/SpecialEventsList.tsx`
- [ ] Cards con: nombre, tipo, fechas, estado, descuento
- [ ] Filtros por estado y tipo
- [ ] Botón nuevo evento
- [ ] Indicador de visibilidad en landing

**Archivos:**
- `app/frontend/pages/admin/financial/components/SpecialEventsList.tsx` (nuevo)

---

#### US-8.6: Crear componente SpecialEventForm
**Como** admin
**Quiero** formulario de eventos
**Para** crear/editar jornadas

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/components/SpecialEventForm.tsx`
- [ ] Campos: nombre, tipo, descripción, fechas, horarios
- [ ] Selector de servicios incluidos
- [ ] Descuento
- [ ] Recurrencia (checkbox + selector de patrón)
- [ ] Toggle visibilidad en landing
- [ ] Modo create/edit

**Archivos:**
- `app/frontend/pages/admin/financial/components/SpecialEventForm.tsx` (nuevo)

---

#### US-8.7: Crear componente RefundsList
**Como** admin/finances
**Quiero** listar reembolsos
**Para** gestionar devoluciones

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/components/RefundsList.tsx`
- [ ] Tabla con: pago original, monto, razón, estado, acciones
- [ ] Filtros por estado
- [ ] Acciones: procesar, ver detalle

**Archivos:**
- `app/frontend/pages/admin/financial/components/RefundsList.tsx` (nuevo)

---

#### US-8.8: Crear componente RefundDialog
**Como** admin/finances
**Quiero** diálogo de reembolso
**Para** crear/procesar devolución

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/components/RefundDialog.tsx`
- [ ] Crear: seleccionar pago, monto, razón
- [ ] Procesar: método, ID transacción
- [ ] Mostrar info del pago original

**Archivos:**
- `app/frontend/pages/admin/financial/components/RefundDialog.tsx` (nuevo)

---

#### US-8.9: Crear componente PendingPaymentsList
**Como** admin/finances
**Quiero** ver pagos pendientes
**Para** gestionar cobros

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/financial/components/PendingPaymentsList.tsx`
- [ ] Tabs: Draft, Pendientes, Vencidos
- [ ] Ordenar por due_date
- [ ] Highlight para vencidos
- [ ] Quick action: registrar pago
- [ ] Totales por categoría

**Archivos:**
- `app/frontend/pages/admin/financial/components/PendingPaymentsList.tsx` (nuevo)

---

#### US-8.10: Habilitar página Financial en sidebar y rutas
**Como** usuario admin/finances
**Quiero** acceder a Finanzas desde el sidebar
**Para** gestionar aspectos financieros

**Criterios de aceptación:**
- [ ] Modificar `app/actions/admin/build_sidebar.rb`:
  - Habilitar item "financial" (remover disabled: true)
  - Asegurar acceso para admin y finances
- [ ] Agregar en routes.rb: `get 'financial', to: 'admin_pages#financial'`
- [ ] Agregar action en AdminPagesController

**Archivos:**
- `app/actions/admin/build_sidebar.rb` (modificar)
- `config/routes.rb` (modificar)
- `app/controllers/admin_pages_controller.rb` (modificar)

---

## Modelo de Datos

### Expense

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| category | integer | ✓ | Enum |
| description | string | ✓ | Max 255 |
| amount | decimal(10,2) | ✓ | > 0 |
| currency | string | ✓ | Default: USD |
| expense_date | date | ✓ | - |
| payment_method | string | - | cash, card, transfer |
| receipt_number | string | - | Número de factura |
| vendor | string | - | Proveedor |
| created_by_id | bigint | ✓ | FK users |
| notes | text | - | - |

### SpecialEvent

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| name | string | ✓ | Max 255 |
| event_type | integer | ✓ | Enum |
| description | text | - | - |
| start_date | date | ✓ | - |
| end_date | date | - | Null = un solo día |
| start_time | time | - | - |
| end_time | time | - | - |
| is_recurring | boolean | ✓ | Default: false |
| recurrence_pattern | jsonb | - | Pattern JSON |
| discount_percentage | decimal(5,2) | - | 0-100 |
| services_ids | jsonb | - | Array de IDs |
| max_capacity | integer | - | Null = sin límite |
| current_registrations | integer | ✓ | Default: 0 |
| is_visible_on_landing | boolean | ✓ | Default: false |
| status | integer | ✓ | Enum |
| created_by_id | bigint | ✓ | FK users |
| notes | text | - | - |

### Refund

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| payment_id | bigint | ✓ | FK payments |
| amount | decimal(10,2) | ✓ | <= payment.amount |
| reason | string | ✓ | - |
| refund_method | string | - | cash, card, transfer |
| transaction_id | string | - | ID del proveedor |
| processed_by_id | bigint | - | FK users |
| processed_at | datetime | - | - |
| notes | text | - | - |
| status | integer | ✓ | Enum |

---

## Endpoints API

| Método | Ruta | Acción | Roles |
|--------|------|--------|-------|
| GET | /admin/financial/expenses | list_expenses | admin, finances |
| POST | /admin/financial/expenses | create_expense | admin, finances |
| PATCH | /admin/financial/expenses/:id | update_expense | admin, finances |
| DELETE | /admin/financial/expenses/:id | delete_expense | admin |
| GET | /admin/financial/special_events | list_events | admin, finances |
| GET | /admin/financial/special_events/:id | show_event | admin, finances |
| POST | /admin/financial/special_events | create_event | admin |
| PATCH | /admin/financial/special_events/:id | update_event | admin |
| POST | /admin/financial/special_events/:id/cancel | cancel_event | admin |
| GET | /admin/financial/refunds | list_refunds | admin, finances |
| POST | /admin/financial/refunds | create_refund | admin, finances |
| POST | /admin/financial/refunds/:id/process | process_refund | admin, finances |
| GET | /admin/financial/balance | get_balance | admin, finances |
| GET | /admin/financial/cash_flow | get_cash_flow | admin, finances |
| GET | /admin/financial/pending_payments | get_pending | admin, finances |

---

## Orden de Implementación

### Fase 1: Base de Datos y Modelos (US 1.1 - 1.7)
1. Migraciones
2. Modelos con validaciones
3. Factories y model specs
4. Seeds

### Fase 2: Actions de Expenses (US 2.1 - 2.4)
5. ListExpenses
6. CreateExpense
7. UpdateExpense
8. DeleteExpense

### Fase 3: Actions de Special Events (US 3.1 - 3.4)
9. ListSpecialEvents
10. CreateSpecialEvent
11. UpdateSpecialEvent
12. CancelSpecialEvent

### Fase 4: Actions de Refunds (US 4.1 - 4.3)
13. ListRefunds
14. CreateRefund
15. ProcessRefund

### Fase 5: Actions de Reports (US 5.1 - 5.3)
16. GetBalance
17. GetCashFlow
18. GetPendingPayments

### Fase 6: Backend Controller (US 6.1 - 6.3)
19. Tests TDD
20. Controller
21. Rutas

### Fase 7: Frontend Base (US 7.1 - 7.3)
22. Tipos TypeScript
23. API client
24. Hook useFinancial

### Fase 8: Páginas y Componentes (US 8.1 - 8.10)
25. FinancialIndex
26. FinancialSummary
27. ExpensesList + Form
28. SpecialEventsList + Form
29. RefundsList + Dialog
30. PendingPaymentsList
31. Habilitar en sidebar

---

## Verificación

### Tests Backend
```bash
bundle exec rspec spec/models/expense_spec.rb
bundle exec rspec spec/models/special_event_spec.rb
bundle exec rspec spec/models/refund_spec.rb
bundle exec rspec spec/actions/admin/financial/
bundle exec rspec spec/requests/admin/financial_spec.rb
```

### E2E Manual
1. Navegar a /admin/financial
2. Ver resumen con balance
3. Crear y editar gastos
4. Crear evento especial
5. Marcar evento como visible en landing
6. Crear y procesar reembolso
7. Ver pagos pendientes

### CI
```bash
npm run push
```
