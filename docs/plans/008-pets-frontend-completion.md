<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2025
Frontend: app/frontend/pages/admin/pets/PetsIndex.tsx
Componentes: AdminPetForm.tsx, PetCard.tsx, PetDetail.tsx
Páginas públicas: Adoption.tsx con filtros y vista detalle
-->

# 008 - Completar Frontend del Sistema de Mascotas

## Resumen

Completar la interfaz de usuario del sistema de mascotas implementando formularios, vistas de detalle, portal público de adopción y sistema de apadrinamientos. El backend está 100% completo (modelos, controllers, actions), solo falta el frontend.

---

## Contexto

**Backend completado:**
- ✅ Modelos: Pet, AdoptionRecord, Sponsorship
- ✅ Controllers: PetsController, Admin::PetsController, Admin::AdoptionsController
- ✅ Actions: 26 actions con patrón Result
- ✅ Tests: 449 tests pasando

**Frontend pendiente:**
- Owner portal: formularios de mascotas
- Admin portal: formularios con selector de propietario
- Portal público: mascotas en adopción
- Sistema de apadrinamientos completo

---

## User Stories

### Epic 1: Owner Portal - Formularios de Mascotas

#### US-1.1: Componente reutilizable PetForm

**Como** desarrollador
**Quiero** un componente PetForm reutilizable
**Para** usarlo en crear y editar mascotas

**Criterios de aceptación:**
- [ ] Componente `PetForm.tsx` con todos los campos: name, species, breed, sex, birth_date, distinctive_features
- [ ] Validaciones en frontend: name requerido, species requerido, sex requerido
- [ ] Selector de especies con íconos (dog 🐕, cat 🐈, bird 🦜, etc.)
- [ ] Date picker para birth_date
- [ ] Textarea para distinctive_features (max 1000 chars)
- [ ] Props: `initialData`, `onSubmit`, `isSubmitting`
- [ ] Muestra edad calculada cuando se selecciona birth_date
- [ ] Diseño con shadcn/ui components

**Archivos:**
- `app/frontend/components/pets/PetForm.tsx`
- `app/frontend/types/Pet.ts`

---

#### US-1.2: Crear mascota (Owner)

**Como** propietario
**Quiero** registrar mi mascota
**Para** acceder a servicios veterinarios

**Criterios de aceptación:**
- [ ] Página `NewPet.tsx` accesible desde `/pets/new`
- [ ] Usa componente `PetForm` sin campos de propietario
- [ ] Al enviar, llama a `Pets::CreatePet` action (backend ya existe)
- [ ] `proprietary` se asigna automáticamente a `current_user` (Owner)
- [ ] `adoption_status` se establece como "not_for_adoption" automáticamente
- [ ] Muestra toast de éxito
- [ ] Redirige a `/pets` después de crear
- [ ] Manejo de errores con mensajes claros

**Archivos:**
- `app/frontend/pages/pets/NewPet.tsx`
- `app/frontend/api/Pets.ts` (actualizar)
- `config/routes.rb` (agregar ruta GET /pets/new)
- `app/controllers/pages_controller.rb` (agregar método pets_new)

---

#### US-1.3: Editar mascota (Owner)

**Como** propietario
**Quiero** actualizar mi mascota
**Para** mantener su información al día

**Criterios de aceptación:**
- [ ] Página `EditPet.tsx` accesible desde `/pets/:id/edit`
- [ ] Usa componente `PetForm` pre-llenado con datos actuales
- [ ] Owner solo puede editar sus propias mascotas
- [ ] No puede cambiar `proprietary` ni `adoption_status`
- [ ] Al enviar, llama a `Pets::UpdatePet` action (backend ya existe)
- [ ] Toast de éxito
- [ ] Redirige a `/pets` después de actualizar
- [ ] Manejo de errores

**Archivos:**
- `app/frontend/pages/pets/EditPet.tsx`
- `config/routes.rb` (agregar ruta GET /pets/:id/edit)
- `app/controllers/pages_controller.rb` (agregar método pets_edit)

---

#### US-1.4: Ver detalles de mascota (Owner)

**Como** propietario
**Quiero** ver los detalles completos de mi mascota
**Para** revisar su información

**Criterios de aceptación:**
- [ ] Vista interna en `PetsIndex.tsx` usando `useState` (no página separada)
- [ ] Muestra toda la información: nombre, especie, raza, sexo, edad, señas características
- [ ] Muestra foto grande (o placeholder según especie)
- [ ] Botones: "Editar", "Eliminar", "Subir foto", "Volver"
- [ ] Badge con estado de adopción
- [ ] Formato amigable para edad (ej: "2 años", "6 meses")

**Archivos:**
- `app/frontend/pages/pets/PetsIndex.tsx` (actualizar con vista de detalle)
- `app/frontend/components/pets/PetDetail.tsx`

---

#### US-1.5: Listar mis mascotas con cards

**Como** propietario
**Quiero** ver mis mascotas en cards visuales
**Para** acceder rápidamente a cada una

**Criterios de aceptación:**
- [ ] Componente `PetCard.tsx` reutilizable
- [ ] Card muestra: foto (thumbnail), nombre, especie (ícono + texto), edad
- [ ] Click en card → muestra vista de detalle (US-1.4)
- [ ] Grid responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
- [ ] Empty state si no hay mascotas: "No tienes mascotas registradas" + botón "Agregar mascota"
- [ ] Botón flotante "+" para agregar mascota

**Archivos:**
- `app/frontend/components/pets/PetCard.tsx`
- `app/frontend/pages/pets/PetsIndex.tsx` (actualizar)

---

#### US-1.6: Eliminar mascota con confirmación

**Como** propietario
**Quiero** eliminar una mascota con confirmación
**Para** mantener mi lista limpia

**Criterios de aceptación:**
- [ ] Diálogo de confirmación con AlertDialog de shadcn/ui
- [ ] Mensaje: "¿Estás seguro? Esta acción marcará la mascota como inactiva."
- [ ] Botones: "Cancelar", "Eliminar"
- [ ] Al confirmar, llama a `Pets::DestroyPet` (soft delete)
- [ ] Toast de éxito
- [ ] Remueve la mascota de la lista sin recargar página
- [ ] No permite eliminar mascotas con citas pendientes (validación backend ya existe)

**Archivos:**
- `app/frontend/components/pets/DeletePetDialog.tsx`

---

#### US-1.7: Subir y eliminar foto de mascota

**Como** propietario
**Quiero** subir y eliminar la foto de mi mascota
**Para** tener un registro visual

**Criterios de aceptación:**
- [ ] Botón "Subir foto" en vista de detalle
- [ ] File input que acepta: JPEG, PNG, WebP (max 5MB)
- [ ] Preview de imagen antes de subir
- [ ] Al confirmar, llama a `POST /pets/:id/photo` (backend ya existe)
- [ ] Muestra foto actualizada inmediatamente
- [ ] Botón "Eliminar foto" si ya tiene foto
- [ ] Confirmación antes de eliminar
- [ ] Llama a `DELETE /pets/:id/photo`
- [ ] Validación de tamaño y tipo en frontend

**Archivos:**
- `app/frontend/components/pets/PetPhotoUpload.tsx`

---

### Epic 2: Admin Portal - Formularios Avanzados

#### US-2.1: Crear mascota con selector de propietario (Admin)

**Como** admin o veterinario
**Quiero** crear una mascota para cualquier propietario
**Para** registrar mascotas de clientes

**Criterios de aceptación:**
- [ ] Página `admin/pets/NewPet.tsx` accesible desde `/admin/pets/new`
- [ ] Formulario extendido con PetForm + campos adicionales:
  - Selector de propietario: Owner o User (Combobox searchable)
  - Opción "Sin propietario" (proprietary = null)
  - Selector de `adoption_status`
- [ ] Búsqueda de propietario por nombre, email o documento
- [ ] Permite crear mascota sin propietario si `adoption_status = available_for_adoption`
- [ ] Validación: si `adoption_status = not_for_adoption`, propietario es obligatorio
- [ ] Llama a `Admin::Pets::CreatePet` action
- [ ] Toast de éxito, redirige a `/admin/pets`

**Archivos:**
- `app/frontend/pages/admin/pets/NewPet.tsx`
- `app/frontend/components/admin/pets/ProprietarySelector.tsx`
- `config/routes.rb` (agregar ruta GET /admin/pets/new)
- `app/controllers/admin_pages_controller.rb` (agregar método pets_new)

---

#### US-2.2: Editar mascota con cambio de propietario (Admin)

**Como** admin o veterinario
**Quiero** editar cualquier mascota y cambiar su propietario
**Para** corregir información o transferir mascotas

**Criterios de aceptación:**
- [ ] Página `admin/pets/EditPet.tsx` accesible desde `/admin/pets/:id/edit`
- [ ] Formulario pre-llenado con todos los datos
- [ ] Puede cambiar propietario (Owner o User)
- [ ] Puede cambiar `adoption_status`
- [ ] Validación: si cambia a `not_for_adoption`, propietario es obligatorio
- [ ] Llama a `Admin::Pets::UpdatePet` action
- [ ] Toast de éxito, redirige a `/admin/pets`

**Archivos:**
- `app/frontend/pages/admin/pets/EditPet.tsx`
- `config/routes.rb` (agregar ruta GET /admin/pets/:id/edit)
- `app/controllers/admin_pages_controller.rb` (agregar método pets_edit)

---

#### US-2.3: Filtros avanzados en lista de mascotas (Admin)

**Como** admin o veterinario
**Quiero** filtrar mascotas por múltiples criterios
**Para** encontrar rápidamente la que busco

**Criterios de aceptación:**
- [ ] Componente `PetFilters.tsx`
- [ ] Filtros disponibles:
  - Especie (dropdown multi-select)
  - Estado de adopción (dropdown)
  - Con/sin propietario (checkbox)
  - Incluir inactivas (checkbox)
- [ ] Búsqueda por texto: nombre de mascota o nombre de propietario
- [ ] Debounce en búsqueda por texto (300ms)
- [ ] Usa `Pets::FilterPets` action (backend ya existe)
- [ ] Actualiza lista sin recargar página
- [ ] Muestra contador: "X mascotas encontradas"
- [ ] Botón "Limpiar filtros"

**Archivos:**
- `app/frontend/components/admin/pets/PetFilters.tsx`
- `app/frontend/pages/admin/pets/PetsIndex.tsx` (actualizar)

---

### Epic 3: Portal Público de Adopción

#### US-3.1: API pública de mascotas en adopción

**Como** visitante del sitio
**Quiero** ver mascotas disponibles para adopción
**Para** encontrar una mascota que pueda adoptar

**Criterios de aceptación:**
- [ ] Controller `Api::AdoptionController`
- [ ] Endpoint `GET /api/adoption/pets` (JSON)
  - Retorna solo mascotas con `adoption_status = available_for_adoption` y `active = true`
  - Incluye: foto (URL), nombre, especie, edad aproximada, sexo
  - No requiere autenticación
  - Paginación (25 por página)
- [ ] Endpoint `GET /api/adoption/pets/:id` (JSON)
  - Detalles completos de una mascota en adopción
  - Incluye: foto, nombre, especie, raza, sexo, edad, señas características
  - Muestra cuántos padrinos tiene y total recaudado
  - No requiere autenticación
- [ ] Filtros query params: `species`, `sex`

**Archivos:**
- `app/controllers/api/adoption_controller.rb`
- `spec/requests/api/adoption_spec.rb`
- `config/routes.rb`

---

#### US-3.2: Página pública de adopción

**Como** visitante
**Quiero** ver las mascotas en adopción en una página pública
**Para** conocer las mascotas disponibles

**Criterios de aceptación:**
- [ ] Página `/adoption` accesible sin login
- [ ] Componente `Adoption.tsx`
- [ ] Grid de cards con `AdoptionPetCard.tsx`
- [ ] Cada card muestra: foto (o placeholder según especie), nombre, especie (ícono), edad, sexo (ícono)
- [ ] Click en card → detalles de mascota
- [ ] Filtros básicos: especie, sexo
- [ ] Empty state si no hay mascotas: "No hay mascotas en adopción en este momento"
- [ ] Responsive (mobile-first)
- [ ] Hero section con CTA: "Encuentra a tu nuevo mejor amigo"

**Archivos:**
- `app/frontend/pages/Adoption.tsx`
- `app/frontend/components/adoption/AdoptionPetCard.tsx`
- `app/frontend/hooks/useAdoptionPets.ts`
- `app/frontend/api/Adoption.ts`
- `config/routes.rb` (GET /adoption → pages#adoption)
- `app/controllers/pages_controller.rb` (método adoption)

---

#### US-3.3: Detalles de mascota en adopción

**Como** visitante
**Quiero** ver todos los detalles de una mascota en adopción
**Para** saber si es adecuada para mí

**Criterios de aceptación:**
- [ ] Vista interna en `Adoption.tsx` usando `useState`
- [ ] Componente `AdoptionPetDetail.tsx`
- [ ] Muestra: foto grande, nombre, especie, raza, sexo, edad, señas características
- [ ] Muestra cuántos padrinos tiene (si sponsorships > 0)
- [ ] Sección de contacto: "¿Quieres adoptarme?" con email/teléfono de la clínica
- [ ] Dos botones principales:
  - "Contactar para adoptar" (mailto: o teléfono)
  - "Apadrinar" → redirige a login si no autenticado, o a formulario si autenticado
- [ ] Botón "Volver a lista"
- [ ] Diseño atractivo con fotos grandes

**Archivos:**
- `app/frontend/components/adoption/AdoptionPetDetail.tsx`

---

### Epic 4: Sistema de Apadrinamientos (Backend + Frontend)

#### US-4.1: Backend - SponsorshipsController (Owner)

**Como** propietario autenticado
**Quiero** gestionar mis apadrinamientos
**Para** ayudar a mascotas en adopción

**Criterios de aceptación:**
- [ ] Controller `SponsorshipsController`
- [ ] Actions:
  - `Sponsorships::CreateSponsorship` → `Result.success(sponsorship:)`
  - `Sponsorships::CancelSponsorship` → `Result.success()`
  - `Sponsorships::FilterMySponsorships` → `Result.success(sponsorships:, pagination:)`
- [ ] Endpoints:
  - `GET /sponsorships` - Mis apadrinamientos
  - `POST /sponsorships` - Crear apadrinamiento
  - `GET /sponsorships/:id` - Ver mi apadrinamiento
  - `PATCH /sponsorships/:id` - Cancelar (solo si status = active)
- [ ] Validaciones:
  - Solo puede apadrinar mascotas con `adoption_status = available_for_adoption`
  - Solo puede ver/modificar sus propios apadrinamientos
  - Solo puede cancelar si `status = active`
- [ ] Tests completos

**Archivos:**
- `app/controllers/sponsorships_controller.rb`
- `app/actions/sponsorships/create_sponsorship.rb`
- `app/actions/sponsorships/cancel_sponsorship.rb`
- `app/actions/sponsorships/filter_my_sponsorships.rb`
- `spec/requests/sponsorships_spec.rb`
- `config/routes.rb`

---

#### US-4.2: Backend - Admin::SponsorshipsController

**Como** admin
**Quiero** ver y gestionar todos los apadrinamientos
**Para** hacer seguimiento de donaciones

**Criterios de aceptación:**
- [ ] Controller `Admin::SponsorshipsController`
- [ ] Action: `Admin::Sponsorships::FilterSponsorships` con filtros por mascota, padrino, estado
- [ ] Endpoints:
  - `GET /admin/sponsorships-list` - Listar todos
  - `GET /admin/sponsorships/:id` - Ver detalles
  - `PATCH /admin/sponsorships/:id` - Marcar como completado (cuando mascota es adoptada)
- [ ] Tests completos

**Archivos:**
- `app/controllers/admin/sponsorships_controller.rb`
- `app/actions/admin/sponsorships/filter_sponsorships.rb`
- `spec/requests/admin/sponsorships_spec.rb`
- `config/routes.rb`

---

#### US-4.3: Servicio - Auto-completar apadrinamientos al adoptar

**Como** sistema
**Quiero** completar automáticamente los apadrinamientos cuando una mascota es adoptada
**Para** cerrar las donaciones y notificar a los padrinos

**Criterios de aceptación:**
- [ ] Servicio `CompletePetSponsorships`
- [ ] Se ejecuta automáticamente en `AdoptionRecord#after_create` callback
- [ ] Encuentra todos los sponsorships activos de la mascota adoptada
- [ ] Cambia `status` a `completed` y `end_date` a fecha de adopción
- [ ] Calcula total aportado por cada padrino
- [ ] Dispara job para enviar email a cada padrino (US-4.6)
- [ ] Tests completos

**Archivos:**
- `app/services/complete_pet_sponsorships.rb`
- `app/models/adoption_record.rb` (actualizar callback)
- `spec/services/complete_pet_sponsorships_spec.rb`

---

#### US-4.4: Frontend - Formulario de apadrinamiento

**Como** propietario autenticado
**Quiero** apadrinar una mascota en adopción
**Para** ayudar con sus cuidados

**Criterios de aceptación:**
- [ ] Componente `SponsorshipForm.tsx`
- [ ] Campos:
  - Monto: opciones predefinidas ($10, $20, $50) + input personalizado
  - Recurrencia: "Donación única" o "Donación mensual"
  - Notas opcionales (max 1000 chars)
- [ ] Validación: monto > 0
- [ ] Preview del compromiso: "Donarás $X [una vez / mensualmente] a partir de hoy"
- [ ] Botones: "Confirmar apadrinamiento", "Cancelar"
- [ ] Al confirmar, llama a `POST /sponsorships`
- [ ] Toast de éxito con resumen
- [ ] Redirige a `/sponsorships` (mis apadrinamientos)
- [ ] Manejo de errores

**Archivos:**
- `app/frontend/components/sponsorships/SponsorshipForm.tsx`
- `app/frontend/api/Sponsorships.ts`

---

#### US-4.5: Frontend - Mis apadrinamientos (Owner)

**Como** propietario
**Quiero** ver mis apadrinamientos
**Para** hacer seguimiento de mis donaciones

**Criterios de aceptación:**
- [ ] Página `/sponsorships` en owner portal
- [ ] Componente `MySponsorships.tsx`
- [ ] Lista de cards con `SponsorshipCard.tsx`
- [ ] Cada card muestra:
  - Foto de mascota
  - Nombre de mascota
  - Monto + recurrencia (ej: "$20 / mensual")
  - Badge de estado (activo, cancelado, completado)
  - Total aportado (calculado)
  - Fecha inicio
- [ ] Click en card → vista de detalle
- [ ] Empty state: "No tienes apadrinamientos activos" + link a `/adoption`
- [ ] Botón "Apadrinar otra mascota"

**Archivos:**
- `app/frontend/pages/sponsorships/MySponsorships.tsx`
- `app/frontend/components/sponsorships/SponsorshipCard.tsx`
- `app/frontend/hooks/useMySponsorships.ts`
- `config/routes.rb` (GET /sponsorships → pages#sponsorships)
- `app/controllers/pages_controller.rb` (método sponsorships)

---

#### US-4.6: Frontend - Detalles y cancelación de apadrinamiento

**Como** propietario
**Quiero** ver detalles de mi apadrinamiento y poder cancelarlo
**Para** gestionar mis donaciones

**Criterios de aceptación:**
- [ ] Vista interna en `MySponsorships.tsx` usando `useState`
- [ ] Componente `SponsorshipDetail.tsx`
- [ ] Muestra toda la información: mascota, monto, recurrencia, fecha inicio, estado, notas
- [ ] Muestra total aportado hasta la fecha
- [ ] Si recurrente y activo: muestra "Próximo cargo: [fecha]"
- [ ] Botón "Cancelar apadrinamiento" solo si status = active
- [ ] Diálogo de confirmación con advertencia
- [ ] Al confirmar cancelación, llama a `PATCH /sponsorships/:id`
- [ ] Toast de confirmación
- [ ] Muestra mensaje de agradecimiento si status = completed (mascota adoptada)

**Archivos:**
- `app/frontend/components/sponsorships/SponsorshipDetail.tsx`
- `app/frontend/components/sponsorships/CancelSponsorshipDialog.tsx`

---

#### US-4.7: Frontend - Admin ver todos los apadrinamientos

**Como** admin
**Quiero** ver todos los apadrinamientos
**Para** hacer seguimiento de donaciones

**Criterios de aceptación:**
- [ ] Página `/admin/sponsorships` en admin portal
- [ ] Componente `admin/sponsorships/SponsorshipsIndex.tsx`
- [ ] Tabla con: padrino, mascota, monto, recurrencia, estado, total aportado, fecha inicio
- [ ] Filtros: estado, recurrencia, mascota específica, padrino específico
- [ ] Click en fila → detalles
- [ ] Totales al final:
  - Total apadrinamientos activos
  - Total recaudado mensual estimado (suma de todos los mensuales activos)
- [ ] Paginación
- [ ] Exportar CSV (futuro)

**Archivos:**
- `app/frontend/pages/admin/sponsorships/SponsorshipsIndex.tsx`
- `config/routes.rb` (GET /admin/sponsorships → admin_pages#sponsorships)
- `app/controllers/admin_pages_controller.rb` (método sponsorships)

---

### Epic 5: Emails y Notificaciones

#### US-5.1: Email de confirmación de apadrinamiento

**Como** padrino
**Quiero** recibir un email al apadrinar
**Para** tener confirmación de mi donación

**Criterios de aceptación:**
- [ ] Mailer `SponsorshipMailer`
- [ ] Método `sponsorship_created(sponsorship_id)`
- [ ] Template con:
  - Mensaje de agradecimiento
  - Detalles: mascota (con foto), monto, recurrencia
  - Próximos pasos
  - Link a "Mis apadrinamientos"
- [ ] Se envía automáticamente en `Sponsorship#after_create`
- [ ] Job en background con Solid Queue
- [ ] Tests del mailer

**Archivos:**
- `app/mailers/sponsorship_mailer.rb`
- `app/views/sponsorship_mailer/sponsorship_created.html.erb`
- `app/views/sponsorship_mailer/sponsorship_created.text.erb`
- `spec/mailers/sponsorship_mailer_spec.rb`

---

#### US-5.2: Email de mascota adoptada (a padrinos)

**Como** padrino
**Quiero** recibir un email cuando la mascota que apadrino es adoptada
**Para** saber que mi ayuda fue exitosa

**Criterios de aceptación:**
- [ ] Método `pet_adopted(sponsorship_id)` en `SponsorshipMailer`
- [ ] Template con:
  - Mensaje de celebración: "¡[Nombre mascota] ha sido adoptada!"
  - Agradecimiento personalizado
  - Total que aportó el padrino
  - Foto de la mascota
  - Invitación a apadrinar otra mascota (link a `/adoption`)
- [ ] Se envía desde `CompletePetSponsorships` service
- [ ] Job en background
- [ ] Tests del mailer

**Archivos:**
- `app/mailers/sponsorship_mailer.rb` (actualizar)
- `app/views/sponsorship_mailer/pet_adopted.html.erb`
- `app/views/sponsorship_mailer/pet_adopted.text.erb`

---

#### US-5.3: Email de bienvenida a nuevo owner (adopción)

**Como** nuevo adoptante
**Quiero** recibir un email de bienvenida
**Para** confirmar la adopción y conocer próximos pasos

**Criterios de aceptación:**
- [ ] Mailer `AdoptionMailer`
- [ ] Método `adoption_completed(adoption_record_id)`
- [ ] Template con:
  - Mensaje de bienvenida
  - Detalles de la mascota adoptada (con foto)
  - Fecha de adopción
  - Próximos pasos sugeridos: primera visita al vet, vacunaciones, etc.
  - Contacto de la clínica
  - Credenciales de acceso al portal (si es nuevo owner)
- [ ] Se envía automáticamente en `AdoptionRecord#after_create`
- [ ] Job en background
- [ ] Tests del mailer

**Archivos:**
- `app/mailers/adoption_mailer.rb`
- `app/views/adoption_mailer/adoption_completed.html.erb`
- `app/views/adoption_mailer/adoption_completed.text.erb`
- `spec/mailers/adoption_mailer_spec.rb`

---

## Implementación por Fases

### Fase 1: Owner Portal - Mascotas (Crítico)
**Duración estimada:** Alta prioridad

1. US-1.1: Componente PetForm
2. US-1.2: Crear mascota
3. US-1.3: Editar mascota
4. US-1.5: Listar con cards
5. US-1.4: Ver detalles
6. US-1.6: Eliminar con confirmación
7. US-1.7: Subir/eliminar foto

**Commit:** `feat(pets): complete owner portal CRUD with forms and photo upload`

---

### Fase 2: Admin Portal - Mascotas Avanzado
**Duración estimada:** Media prioridad

1. US-2.1: Crear mascota con selector propietario
2. US-2.2: Editar con cambio de propietario
3. US-2.3: Filtros avanzados

**Commit:** `feat(admin/pets): add advanced forms with proprietary selector and filters`

---

### Fase 3: Portal Público de Adopción
**Duración estimada:** Media prioridad

1. US-3.1: API pública
2. US-3.2: Página pública
3. US-3.3: Detalles de mascota

**Commit:** `feat(adoption): add public adoption portal`

---

### Fase 4: Apadrinamientos - Backend
**Duración estimada:** Media prioridad

1. US-4.1: SponsorshipsController (Owner)
2. US-4.2: Admin::SponsorshipsController
3. US-4.3: Servicio auto-completar

**Commit:** `feat(sponsorships): add backend for sponsorship system`

---

### Fase 5: Apadrinamientos - Frontend
**Duración estimada:** Media prioridad

1. US-4.4: Formulario de apadrinamiento
2. US-4.5: Mis apadrinamientos
3. US-4.6: Detalles y cancelación
4. US-4.7: Admin ver todos

**Commit:** `feat(sponsorships): complete frontend for owner and admin portals`

---

### Fase 6: Emails
**Duración estimada:** Baja prioridad

1. US-5.1: Email confirmación apadrinamiento
2. US-5.2: Email mascota adoptada
3. US-5.3: Email bienvenida adopción

**Commit:** `feat(mailers): add sponsorship and adoption notification emails`

---

## Checklist Final

### Epic 1: Owner Portal
- [ ] PetForm component reutilizable
- [ ] Crear mascota funcional
- [ ] Editar mascota funcional
- [ ] Ver detalles de mascota
- [ ] Listar con cards visuales
- [ ] Eliminar con confirmación
- [ ] Subir/eliminar foto

### Epic 2: Admin Portal
- [ ] Crear mascota con selector propietario
- [ ] Editar con cambio de propietario
- [ ] Filtros avanzados funcionando

### Epic 3: Portal Público
- [ ] API pública de adopción
- [ ] Página `/adoption` pública
- [ ] Detalles de mascota en adopción

### Epic 4 & 5: Apadrinamientos
- [ ] Backend completo (controllers + actions)
- [ ] Servicio auto-completar
- [ ] Formulario de apadrinamiento
- [ ] Mis apadrinamientos (owner)
- [ ] Admin ver todos

### Epic 6: Emails
- [ ] Email confirmación apadrinamiento
- [ ] Email mascota adoptada
- [ ] Email bienvenida adopción

### Testing y Calidad
- [ ] Tests frontend (Jest)
- [ ] Tests backend (RSpec) para nuevos endpoints
- [ ] `npm run check` pasa
- [ ] 0 vulnerabilidades de seguridad
- [ ] Diseño responsive (mobile-first)
- [ ] Accesibilidad (ARIA labels)

---

## Notas Técnicas

### Rutas a Agregar

```ruby
# config/routes.rb

# Owner portal - Pages (Inertia)
get "pets/new", to: "pages#pets_new"
get "pets/:id/edit", to: "pages#pets_edit"
get "sponsorships", to: "pages#sponsorships"

# Admin portal - Pages (Inertia)
get "admin/pets/new", to: "admin_pages#pets_new"
get "admin/pets/:id/edit", to: "admin_pages#pets_edit"
get "admin/sponsorships", to: "admin_pages#sponsorships"

# Portal público
get "adoption", to: "pages#adoption"

# API pública
namespace :api do
  scope :adoption do
    get "pets", to: "adoption#index"
    get "pets/:id", to: "adoption#show"
  end
end

# Sponsorships
resources :sponsorships, only: [:index, :show, :create, :update]

namespace :admin do
  get "sponsorships-list", to: "sponsorships#index"
  resources :sponsorships, only: [:show, :update]
end
```

### Tipos TypeScript Necesarios

```typescript
// app/frontend/types/Pet.ts
export interface Pet {
  id: number
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'reptile' | 'fish' | 'other'
  breed?: string
  sex: 'male' | 'female'
  birth_date?: string
  distinctive_features?: string
  adoption_status: 'not_for_adoption' | 'available_for_adoption' | 'adopted'
  photo_url?: string
  age_display: string
  proprietary_name: string
  active: boolean
}

export interface PetParams {
  name: string
  species: string
  breed?: string
  sex: string
  birth_date?: string
  distinctive_features?: string
}

// app/frontend/types/Sponsorship.ts
export interface Sponsorship {
  id: number
  pet: Pet
  sponsor_name: string
  amount: number
  recurrence: 'one_time' | 'monthly'
  status: 'active' | 'cancelled' | 'completed'
  start_date: string
  end_date?: string
  notes?: string
  total_contributed: number
}

export interface SponsorshipParams {
  pet_id: number
  amount: number
  recurrence: 'one_time' | 'monthly'
  notes?: string
}
```

---

## Priorización

**Fase 1 es CRÍTICA** - Sin formularios de mascotas, el sistema no es usable por owners.

**Fases 2-3 son IMPORTANTES** - Completan la experiencia para admin y visitantes públicos.

**Fases 4-6 son NICE TO HAVE** - Agregan valor pero no bloquean uso básico del sistema.

**Ejecutar en orden secuencial** para mantener coherencia y poder testear progresivamente.
