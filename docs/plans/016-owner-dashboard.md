<!--
STATUS: 📋 PENDIENTE
Creado: 2026-01-12
-->

# Plan: Owner Dashboard System

## Descripción General

Crear un sistema completo de dashboard para propietarios (owners) con layout consistente que incluya:
- **Ruta unificada**: `/owner/*` para todo el portal del propietario
- **Sidebar de navegación**: Menú lateral con secciones del propietario
- **Header superior**: Barra con información del usuario y acciones
- **Layout responsivo**: Sidebar colapsable en móvil/tablet
- **Gestión completa**: Perfil, mascotas, citas, pagos y tratamientos activos

Este sistema proporciona una experiencia de usuario coherente y separada del admin dashboard, con funcionalidades específicas para propietarios de mascotas.

---

## Arquitectura Actual vs. Propuesta

### Estado Actual
```
app/frontend/pages/
├── Dashboard.tsx                 # Dashboard genérico sin layout (DEPRECAR)
├── pets/
│   ├── PetsIndex.tsx            # Sin layout owner específico
│   └── components/
└── sponsorships/
    └── SponsorshipsIndex.tsx    # Sin layout owner específico

config/routes.rb:
  get "dashboard", to: "dashboard#index"
  get "my-pets", to: "owner_pages#pets"
  get "my-sponsorships", to: "owner_pages#sponsorships"
```

### Arquitectura Propuesta
```
app/frontend/pages/owner/
├── components/                   # Componentes compartidos del módulo owner
│   ├── OwnerLayout.tsx          # Layout principal con sidebar + header
│   ├── OwnerSidebar.tsx         # Navegación del propietario
│   └── OwnerHeader.tsx          # Header con usuario y acciones
├── dashboard/
│   └── DashboardIndex.tsx       # Vista principal (resumen)
├── profile/
│   └── ProfileIndex.tsx         # Perfil del propietario
├── pets/
│   └── PetsIndex.tsx            # Gestión de mascotas
├── appointments/
│   └── AppointmentsIndex.tsx    # Gestión de citas
├── payments/
│   ├── NewPaymentIndex.tsx      # Registrar nuevo pago
│   └── PaymentsHistoryIndex.tsx # Historial de pagos
└── treatments/
    └── TreatmentsIndex.tsx      # Tratamientos activos

config/routes.rb:
  scope :owner do
    get "dashboard", to: "owner_pages#dashboard"
    get "profile", to: "owner_pages#profile"
    get "pets", to: "owner_pages#pets"
    get "appointments", to: "owner_pages#appointments"
    get "payments/new", to: "owner_pages#new_payment"
    get "payments/history", to: "owner_pages#payments_history"
    get "treatments", to: "owner_pages#treatments"
  end

  # DEPRECAR: get "dashboard", to: "dashboard#index"
```

---

## User Stories por Epic

### Epic 1: Layout Components

#### US-1.1: OwnerLayout Component
**Como** propietario
**Quiero** ver un layout consistente en todas las páginas del portal
**Para** tener una experiencia de navegación coherente

**Criterios de aceptación:**
- [ ] Componente `OwnerLayout.tsx` en `pages/owner/components/`
- [ ] Recibe props: `user: AuthUser`, `children: React.ReactNode`
- [ ] Combina `OwnerSidebar` + `OwnerHeader` + contenido
- [ ] Layout responsivo (sidebar oculto en móvil con overlay)
- [ ] Usa variables CSS para dark mode
- [ ] Mobile-first design

**Archivos:**
- `app/frontend/pages/owner/components/OwnerLayout.tsx`

---

#### US-1.2: OwnerSidebar Component
**Como** propietario
**Quiero** navegar fácilmente entre las secciones del portal
**Para** acceder rápidamente a la información de mis mascotas

**Criterios de aceptación:**
- [ ] Componente `OwnerSidebar.tsx` en `pages/owner/components/`
- [ ] Recibe `currentPath: string` para detectar página activa
- [ ] Sección "PROPIETARIO" con 6 items:
  - Perfil (`/owner/profile`)
  - Mascotas (`/owner/pets`)
  - Citas (`/owner/appointments`)
  - Registrar Pagos (`/owner/payments/new`)
  - Historial de Pagos (`/owner/payments/history`)
  - Registros Activos (`/owner/treatments`)
- [ ] Aplica `bg-primary/10` y `border-l-4` al item activo
- [ ] Logo "PawCare" + subtítulo "Portal del Propietario"
- [ ] Usa Link de Inertia para navegación
- [ ] Responsivo: colapsable en móvil (<768px)

**Archivos:**
- `app/frontend/pages/owner/components/OwnerSidebar.tsx`

---

#### US-1.3: OwnerHeader Component
**Como** propietario
**Quiero** ver mi información de usuario y acciones rápidas
**Para** gestionar mi perfil y cerrar sesión fácilmente

**Criterios de aceptación:**
- [ ] Componente `OwnerHeader.tsx` en `pages/owner/components/`
- [ ] Recibe props: `user: AuthUser`, `onMenuToggle?: () => void`
- [ ] Muestra avatar con iniciales del usuario
- [ ] Dropdown con opciones:
  - Ver perfil (→ `/owner/profile`)
  - Tema (ThemeToggle)
  - Cerrar sesión (usa `useAuth().logout()`)
- [ ] Muestra nombre completo y "Propietario"
- [ ] Botón hamburguesa para móvil (toggle sidebar)
- [ ] Usa variables CSS para dark mode

**Archivos:**
- `app/frontend/pages/owner/components/OwnerHeader.tsx`

---

### Epic 2: Páginas del Owner

#### US-2.1: Owner Dashboard (Vista principal)
**Como** propietario
**Quiero** ver un resumen de mi información al entrar al portal
**Para** tener una vista general de mis mascotas, próximas citas y pagos

**Criterios de aceptación:**
- [ ] Página `DashboardIndex.tsx` en `pages/owner/dashboard/`
- [ ] Usa `OwnerLayout` con `user` prop
- [ ] Muestra cards con resumen:
  - Mis Mascotas (cantidad + acceso rápido)
  - Próximas Citas (lista de 3 próximas)
  - Tratamientos Activos (cantidad)
  - Pagos Pendientes (si aplica)
- [ ] Ruta backend: `GET /owner/dashboard`
- [ ] Controlador: `OwnerPagesController#dashboard`
- [ ] Props desde backend: `{ user: AuthUser }`

**Archivos:**
- `app/frontend/pages/owner/dashboard/DashboardIndex.tsx`
- `app/controllers/owner_pages_controller.rb` (actualizar)
- `config/routes.rb` (agregar ruta)

---

#### US-2.2: Owner Profile
**Como** propietario
**Quiero** ver y editar mi información personal
**Para** mantener mis datos actualizados

**Criterios de aceptación:**
- [ ] Página `ProfileIndex.tsx` en `pages/owner/profile/`
- [ ] Usa `OwnerLayout` con `user` prop
- [ ] Vista con dos modos: "view" y "edit" (useState)
- [ ] Campos editables:
  - Nombre, Apellido
  - Email, Username
  - Teléfono, Dirección
  - Sexo
- [ ] Botón "Cambiar Contraseña" (modal o vista separada)
- [ ] Usa hook `useProfile()` para actualización
- [ ] Ruta backend: `GET /owner/profile`
- [ ] API existente: `PATCH /profile`

**Archivos:**
- `app/frontend/pages/owner/profile/ProfileIndex.tsx`
- `app/frontend/hooks/useProfile.ts` (crear o reutilizar)
- `config/routes.rb` (agregar ruta)

---

#### US-2.3: Owner Pets
**Como** propietario
**Quiero** gestionar mis mascotas
**Para** agregar, editar y ver información de cada una

**Criterios de aceptación:**
- [ ] Página `PetsIndex.tsx` en `pages/owner/pets/`
- [ ] Usa `OwnerLayout` con `user` prop
- [ ] Vistas internas (useState): "list", "detail", "create", "edit"
- [ ] Lista de mascotas con PetCard
- [ ] Botón "Agregar Mascota"
- [ ] Click en mascota → vista detalle
- [ ] Desde detalle: editar o eliminar (soft delete)
- [ ] Reutiliza `useMyPets()` hook existente
- [ ] Ruta backend: `GET /owner/pets`
- [ ] API existente: `GET /pets`, `POST /pets`, `PATCH /pets/:id`, etc.

**Archivos:**
- `app/frontend/pages/owner/pets/PetsIndex.tsx`
- `app/controllers/owner_pages_controller.rb` (actualizar)
- `config/routes.rb` (agregar ruta)

---

#### US-2.4: Owner Appointments
**Como** propietario
**Quiero** ver y gestionar mis citas veterinarias
**Para** saber cuándo llevar a mis mascotas

**Criterios de aceptación:**
- [ ] Página `AppointmentsIndex.tsx` en `pages/owner/appointments/`
- [ ] Usa `OwnerLayout` con `user` prop
- [ ] Vistas internas: "list", "detail"
- [ ] Lista de citas (próximas y pasadas)
- [ ] Filtros: "Próximas", "Pasadas", "Todas"
- [ ] Click en cita → vista detalle (fecha, hora, mascota, veterinario, notas)
- [ ] Botón "Solicitar Cita" (futuro)
- [ ] Ruta backend: `GET /owner/appointments`
- [ ] API: `GET /appointments` (filtrado por owner)

**Archivos:**
- `app/frontend/pages/owner/appointments/AppointmentsIndex.tsx`
- `app/frontend/hooks/useAppointments.ts` (crear)
- `app/frontend/api/Appointments.ts` (crear)
- `app/controllers/owner_pages_controller.rb` (actualizar)
- `app/controllers/appointments_controller.rb` (crear)
- `config/routes.rb` (agregar rutas)

**Nota:** Este requiere backend nuevo (appointments system)

---

#### US-2.5: Owner Payments - New Payment
**Como** propietario
**Quiero** registrar un pago realizado
**Para** mantener mi historial de pagos actualizado

**Criterios de aceptación:**
- [ ] Página `NewPaymentIndex.tsx` en `pages/owner/payments/`
- [ ] Usa `OwnerLayout` con `user` prop
- [ ] Formulario con campos:
  - Monto
  - Método de pago (efectivo, tarjeta, transferencia)
  - Concepto (dropdown: cita, tratamiento, producto, otro)
  - Fecha (default: hoy)
  - Notas (opcional)
- [ ] Botón "Registrar Pago"
- [ ] Confirmación de éxito → redirige a historial
- [ ] Ruta backend: `GET /owner/payments/new`
- [ ] API: `POST /payments`

**Archivos:**
- `app/frontend/pages/owner/payments/NewPaymentIndex.tsx`
- `app/frontend/hooks/usePayments.ts` (crear)
- `app/frontend/api/Payments.ts` (crear)
- `app/controllers/owner_pages_controller.rb` (actualizar)
- `app/controllers/payments_controller.rb` (crear)
- `config/routes.rb` (agregar rutas)

**Nota:** Requiere backend nuevo (payments system)

---

#### US-2.6: Owner Payments - History
**Como** propietario
**Quiero** ver el historial de todos mis pagos
**Para** tener un registro financiero de mis gastos veterinarios

**Criterios de aceptación:**
- [ ] Página `PaymentsHistoryIndex.tsx` en `pages/owner/payments/`
- [ ] Usa `OwnerLayout` con `user` prop
- [ ] Tabla con columnas:
  - Fecha
  - Concepto
  - Monto
  - Método de pago
  - Estado (pagado, pendiente)
- [ ] Filtros: por fecha, por concepto
- [ ] Paginación
- [ ] Exportar a PDF (futuro)
- [ ] Ruta backend: `GET /owner/payments/history`
- [ ] API: `GET /payments` (filtrado por owner)

**Archivos:**
- `app/frontend/pages/owner/payments/PaymentsHistoryIndex.tsx`
- `app/frontend/hooks/usePayments.ts` (reutilizar)
- `app/controllers/owner_pages_controller.rb` (actualizar)
- `config/routes.rb` (agregar ruta)

---

#### US-2.7: Owner Treatments
**Como** propietario
**Quiero** ver los tratamientos activos de mis mascotas
**Para** dar seguimiento a su salud y medicaciones

**Criterios de aceptación:**
- [ ] Página `TreatmentsIndex.tsx` en `pages/owner/treatments/`
- [ ] Usa `OwnerLayout` con `user` prop
- [ ] Lista de tratamientos activos agrupados por mascota
- [ ] Cada tratamiento muestra:
  - Mascota
  - Tipo de tratamiento
  - Medicación
  - Frecuencia
  - Fecha inicio - Fecha fin
  - Veterinario responsable
  - Notas
- [ ] Filtro: por mascota
- [ ] Vista solo lectura (no puede editar, solo consultar)
- [ ] Ruta backend: `GET /owner/treatments`
- [ ] API: `GET /treatments` (filtrado por owner + activos)

**Archivos:**
- `app/frontend/pages/owner/treatments/TreatmentsIndex.tsx`
- `app/frontend/hooks/useTreatments.ts` (crear)
- `app/frontend/api/Treatments.ts` (crear)
- `app/controllers/owner_pages_controller.rb` (actualizar)
- `app/controllers/treatments_controller.rb` (crear)
- `config/routes.rb` (agregar rutas)

**Nota:** Requiere backend nuevo (treatments system)

---

### Epic 3: Integración y Migración

#### US-3.1: Redirección de Login para Owners
**Como** propietario
**Quiero** ser redirigido al dashboard de owners al iniciar sesión
**Para** acceder directamente a mi portal

**Criterios de aceptación:**
- [ ] Modificar `useLogin.ts`:
  - Si `user.type === 'Owner'` → `router.visit('/owner/dashboard')`
  - (Mantener redirección de Users a `/admin/pets`)
- [ ] Verificar que el login funciona correctamente
- [ ] Owners ven su dashboard al autenticarse

**Archivos:**
- `app/frontend/hooks/useLogin.ts` (actualizar)

---

#### US-3.2: Backend Routes Setup
**Como** desarrollador
**Quiero** tener todas las rutas configuradas correctamente
**Para** que las páginas del owner funcionen

**Criterios de aceptación:**
- [ ] Agregar scope `owner` en `routes.rb`
- [ ] Rutas GET para todas las páginas:
  - `/owner/dashboard`
  - `/owner/profile`
  - `/owner/pets`
  - `/owner/appointments`
  - `/owner/payments/new`
  - `/owner/payments/history`
  - `/owner/treatments`
- [ ] Actualizar `OwnerPagesController` con todas las actions
- [ ] Cada action renderiza la página Inertia correspondiente
- [ ] Todas las actions pasan `user: user_response(current_user)`

**Archivos:**
- `config/routes.rb`
- `app/controllers/owner_pages_controller.rb`

---

#### US-3.3: Deprecar Dashboard Genérico
**Como** desarrollador
**Quiero** eliminar el dashboard genérico
**Para** tener solo los dashboards específicos (admin y owner)

**Criterios de aceptación:**
- [ ] Verificar que ningún código usa `/dashboard`
- [ ] Comentar ruta `get "dashboard", to: "dashboard#index"` en routes.rb
- [ ] Mover `app/frontend/pages/Dashboard.tsx` a `app/frontend/pages/_unused/`
- [ ] Verificar que `DashboardController` no se usa
- [ ] Comentar o eliminar `app/controllers/dashboard_controller.rb`
- [ ] Agregar nota en commit: "Dashboard genérico deprecado, usar /owner/dashboard o /admin/pets"

**Archivos:**
- `config/routes.rb` (comentar ruta)
- `app/frontend/pages/Dashboard.tsx` → `app/frontend/pages/_unused/Dashboard.tsx`
- `app/controllers/dashboard_controller.rb` (deprecar)

---

## Orden de Implementación

### Fase 1: Layout Foundation (US-1.1, US-1.2, US-1.3)
**Objetivo:** Crear los componentes base del layout
**Duración estimada:** 2-3 horas
**Entregables:**
- OwnerLayout funcional
- OwnerSidebar con navegación
- OwnerHeader con usuario

### Fase 2: Core Pages (US-2.1, US-2.3, US-3.1, US-3.2)
**Objetivo:** Dashboard principal, gestión de mascotas y rutas backend
**Duración estimada:** 4-5 horas
**Entregables:**
- Owner Dashboard con resumen
- Owner Pets (reutiliza funcionalidad existente)
- Redirección correcta en login
- Todas las rutas configuradas

### Fase 3: Profile (US-2.2)
**Objetivo:** Gestión del perfil del propietario
**Duración estimada:** 2-3 horas
**Entregables:**
- Página de perfil con edición

### Fase 4: Extended Features (US-2.4, US-2.5, US-2.6, US-2.7)
**Objetivo:** Citas, pagos y tratamientos
**Duración estimada:** 8-10 horas (requiere backend nuevo)
**Entregables:**
- Owner Appointments (requiere appointments system)
- Owner Payments - New & History (requiere payments system)
- Owner Treatments (requiere treatments system)

**⚠️ Nota:** Estas features requieren desarrollo de backend completo (modelos, migraciones, controllers, actions)

### Fase 5: Migration & Cleanup (US-3.3)
**Objetivo:** Deprecar dashboard genérico
**Duración estimada:** 30 minutos
**Entregables:**
- Dashboard.tsx movido a _unused/
- Rutas limpias

---

## Dependencias

### Fase 1-3: Sin dependencias
- Pueden implementarse inmediatamente
- Reutilizan hooks y APIs existentes (`useMyPets`, `/pets`, `/profile`)

### Fase 4: Requiere nuevos sistemas
- **Appointments System**: Modelo, migración, controller, API
- **Payments System**: Modelo, migración, controller, API
- **Treatments System**: Modelo, migración, controller, API

**Recomendación:** Implementar Fases 1-3 primero, dejar Fase 4 para planes separados cuando se desarrollen estos sistemas.

---

## Convenciones Técnicas

### Rutas
- Prefijo: `/owner/*`
- Controlador: `OwnerPagesController`
- Páginas: `app/frontend/pages/owner/{domain}/`

### Componentes
- Layout compartido: `pages/owner/components/`
- Componentes de dominio: `pages/owner/{domain}/components/`

### Estilos
- Mobile-first
- Dark mode compatible (variables CSS)
- Reutilizar componentes UI de shadcn

### Estado
- Redux para estado global (user)
- useState para vistas internas de páginas
- Hooks custom para lógica de negocio

---

## Criterios de Éxito del Plan Completo

- [ ] Owner dashboard accesible en `/owner/dashboard`
- [ ] Sidebar con 6 secciones funcionales
- [ ] Layout responsivo (desktop + móvil)
- [ ] Owners son redirigidos correctamente al login
- [ ] Dashboard genérico deprecado
- [ ] Todas las páginas usan `OwnerLayout` consistentemente
- [ ] Dark mode funciona en todas las páginas
- [ ] Tests pasando para todas las rutas nuevas

---

## Notas de Implementación

1. **Prioridad:** Fases 1-3 son críticas, Fase 4 puede esperar
2. **Reutilización:** Maximizar uso de hooks/APIs existentes
3. **Testing:** Crear request specs para todas las rutas nuevas
4. **Mobile:** Probar en 375px, 768px, 1024px
5. **Accesibilidad:** Contraste WCAG AA en dark/light mode
