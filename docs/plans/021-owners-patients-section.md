# Plan: Sección Propietarios / Pacientes para Admin

## Resumen

Implementar la sección completa de "Propietarios/Pacientes" en el dashboard de administración, permitiendo a veterinarios y staff gestionar owners y sus mascotas (pacientes).

**Acceso**: Roles `admin`, `vet`, `vet_assistant`

---

## User Stories

### US-1: Ver lista de propietarios
**Como** veterinario o administrador
**Quiero** ver una lista de todos los propietarios registrados
**Para** encontrar rápidamente a un cliente y sus mascotas

**Criterios de aceptación:**
- [ ] Lista muestra: nombre completo, email, teléfono, cantidad de mascotas
- [ ] Puedo buscar por nombre, email o documento de identidad
- [ ] La lista tiene paginación (10 por página)
- [ ] Click en propietario muestra su detalle

**Archivos:**
- `app/controllers/admin/owners_controller.rb` (modificar index)
- `app/frontend/pages/admin/owners/components/OwnersList.tsx`

---

### US-2: Ver detalle de propietario con sus mascotas
**Como** veterinario o administrador
**Quiero** ver los datos completos de un propietario y sus mascotas
**Para** tener contexto completo del cliente

**Criterios de aceptación:**
- [ ] Muestra datos del propietario: nombre, email, teléfono, dirección, documento
- [ ] Lista de mascotas del propietario con foto, nombre, especie, edad
- [ ] Click en mascota muestra su detalle completo
- [ ] Botones: "Editar Propietario", "Agregar Mascota", "Volver"

**Archivos:**
- `app/controllers/admin/owners_controller.rb` (show)
- `app/actions/admin/owners/show.rb`
- `app/frontend/pages/admin/owners/components/OwnerDetail.tsx`

---

### US-3: Crear propietario (con mascota opcional)
**Como** veterinario o administrador
**Quiero** registrar un nuevo propietario, opcionalmente con su primera mascota
**Para** atender clientes que no pudieron registrarse ellos mismos

**Criterios de aceptación:**
- [ ] Formulario con campos: nombre, apellido, email, documento, teléfono, dirección
- [ ] Checkbox "Agregar mascota al crear" muestra form de mascota inline
- [ ] Si se marca, campos de mascota: nombre, especie, sexo, raza (opcional), fecha nacimiento (opcional)
- [ ] Validaciones en frontend y backend
- [ ] Después de crear, navega al detalle del propietario

**Archivos:**
- `app/controllers/admin/owners_controller.rb` (create)
- `app/actions/admin/owners/create.rb`
- `app/frontend/pages/admin/owners/components/OwnerForm.tsx`

---

### US-4: Editar propietario
**Como** veterinario o administrador
**Quiero** actualizar los datos de un propietario
**Para** mantener información actualizada

**Criterios de aceptación:**
- [ ] Formulario precargado con datos actuales
- [ ] Email y documento son editables (a diferencia de staff)
- [ ] Validaciones de unicidad
- [ ] Mensaje de éxito/error

**Archivos:**
- `app/controllers/admin/owners_controller.rb` (update)
- `app/actions/admin/owners/update.rb`
- `app/frontend/pages/admin/owners/components/OwnerForm.tsx` (reutilizar)

---

### US-5: Ver detalle de mascota
**Como** veterinario o administrador
**Quiero** ver todos los datos de una mascota
**Para** conocer su información médica y personal

**Criterios de aceptación:**
- [ ] Muestra: nombre, especie, raza, sexo, edad, características distintivas
- [ ] Muestra foto de la mascota (si tiene)
- [ ] Indicador visual si se puede editar (dentro de 72h o es admin)
- [ ] Botón "Editar" visible según permisos
- [ ] Link a historial médico (para implementación futura)

**Archivos:**
- `app/controllers/admin/owners_controller.rb` (show_pet)
- `app/frontend/pages/admin/owners/components/PetDetail.tsx`

---

### US-6: Crear mascota para propietario existente
**Como** veterinario o administrador
**Quiero** agregar una mascota a un propietario existente
**Para** registrar nuevas mascotas de clientes ya registrados

**Criterios de aceptación:**
- [ ] Formulario desde el detalle del propietario
- [ ] Campos: nombre, especie, sexo, raza, fecha nacimiento, características
- [ ] Upload de foto opcional
- [ ] Después de crear, vuelve al detalle del propietario

**Archivos:**
- `app/controllers/admin/owners_controller.rb` (create_pet)
- `app/actions/admin/owners/create_pet.rb`
- `app/frontend/pages/admin/owners/components/PetForm.tsx`

---

### US-7: Editar mascota (con restricción de 72 horas)
**Como** veterinario o administrador
**Quiero** editar los datos de una mascota
**Para** corregir errores o actualizar información

**Criterios de aceptación:**
- [ ] **Admin**: puede editar siempre
- [ ] **Vet/vet_assistant**: solo dentro de 72 horas desde creación
- [ ] Después de 72h, mensaje: "Solo el propietario o admin pueden editar esta mascota"
- [ ] Form precargado con datos actuales
- [ ] Permite cambiar foto

**Archivos:**
- `app/controllers/admin/owners_controller.rb` (update_pet)
- `app/actions/admin/owners/update_pet.rb`
- `app/frontend/pages/admin/owners/components/PetForm.tsx` (reutilizar)

---

### US-8: Subir/eliminar foto de mascota
**Como** veterinario o administrador
**Quiero** subir o cambiar la foto de una mascota
**Para** tener identificación visual

**Criterios de aceptación:**
- [ ] Endpoint separado para upload de foto (FormData)
- [ ] Validación de tipo de archivo (jpg, png, webp)
- [ ] Validación de tamaño máximo (5MB)
- [ ] Opción para eliminar foto existente
- [ ] Preview de imagen antes de subir

**Archivos:**
- `app/controllers/admin/owners_controller.rb` (upload_pet_photo, delete_pet_photo)
- `app/frontend/pages/admin/owners/components/PhotoUpload.tsx`

---

## Arquitectura

### Permisos

| Rol | Ver lista | Ver detalle | Crear | Editar (72h) | Editar (siempre) |
|-----|-----------|-------------|-------|--------------|------------------|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| vet | ✅ | ✅ | ✅ | ✅ | ❌ |
| vet_assistant | ✅ | ✅ | ✅ | ✅ | ❌ |
| assistant | ❌ | ❌ | ❌ | ❌ | ❌ |

### Regla de 72 Horas

```ruby
# app/actions/admin/owners/update_pet.rb
def can_edit?
  return true if @user.admin?
  return true if @pet.created_at >= 72.hours.ago
  false
end
```

**Nota**: El propietario siempre puede editar sus mascotas desde su portal, sin restricción de tiempo.

---

## Implementación

### Rutas (`config/routes.rb`)

```ruby
# Page route
scope :admin do
  get "owners", to: "admin_pages#owners"
end

# API routes
namespace :admin do
  get "owners-list", to: "owners#index"
  get "owners/:id", to: "owners#show"
  post "owners", to: "owners#create"
  patch "owners/:id", to: "owners#update"

  # Pets de un owner
  get "owners/:owner_id/pets/:id", to: "owners#show_pet"
  post "owners/:owner_id/pets", to: "owners#create_pet"
  patch "owners/:owner_id/pets/:id", to: "owners#update_pet"
  post "owners/:owner_id/pets/:id/photo", to: "owners#upload_pet_photo"
  delete "owners/:owner_id/pets/:id/photo", to: "owners#delete_pet_photo"
end
```

### Archivos a Crear/Modificar

#### Backend

| Archivo | Acción |
|---------|--------|
| `app/actions/admin/owners/filter.rb` | Crear (reemplaza Search) |
| `app/actions/admin/owners/show.rb` | Crear |
| `app/actions/admin/owners/create.rb` | Crear |
| `app/actions/admin/owners/update.rb` | Crear |
| `app/actions/admin/owners/create_pet.rb` | Crear |
| `app/actions/admin/owners/update_pet.rb` | Crear |
| `app/controllers/admin/owners_controller.rb` | Modificar (CRUD completo) |
| `app/controllers/admin_pages_controller.rb` | Modificar (agregar owners action) |
| `app/actions/admin/build_sidebar.rb` | Modificar (habilitar owners) |
| `config/routes.rb` | Modificar (agregar rutas) |
| `spec/requests/admin/owners_spec.rb` | Crear |

#### Frontend

| Archivo | Acción |
|---------|--------|
| `app/frontend/types/Owner.ts` | Crear |
| `app/frontend/api/AdminOwners.ts` | Crear |
| `app/frontend/store/slices/adminOwnersSlice.ts` | Crear |
| `app/frontend/hooks/useAdminOwners.ts` | Crear |
| `app/frontend/pages/admin/owners/OwnersIndex.tsx` | Crear |
| `app/frontend/pages/admin/owners/components/OwnersList.tsx` | Crear |
| `app/frontend/pages/admin/owners/components/OwnerDetail.tsx` | Crear |
| `app/frontend/pages/admin/owners/components/OwnerForm.tsx` | Crear |
| `app/frontend/pages/admin/owners/components/PetDetail.tsx` | Crear |
| `app/frontend/pages/admin/owners/components/PetForm.tsx` | Crear |
| `app/frontend/pages/admin/owners/components/PhotoUpload.tsx` | Crear |

---

### Types Frontend

```typescript
// app/frontend/types/Owner.ts
export interface Owner {
  id: number
  type: "Owner"
  first_name: string
  last_name: string
  full_name: string
  email: string
  identity_document: string
  phone: string | null
  phone_type: "whatsapp" | "telegram" | "regular" | null
  address: string | null
  sex: "male" | "female" | "other"
  active: boolean
  pets_count: number
  created_at: string
}

export interface OwnerWithPets extends Owner {
  pets: OwnerPet[]
}

export interface OwnerPet {
  id: number
  name: string
  species: string
  breed: string | null
  sex: "male" | "female"
  age_display: string
  photo_url: string | null
  can_edit: boolean  // true si dentro de 72h o user es admin
  created_at: string
}

export interface OwnerFilters {
  search?: string
  page?: number
  per_page?: number
}

export interface CreateOwnerParams {
  first_name: string
  last_name: string
  email: string
  identity_document: string
  phone?: string
  phone_type?: string
  address?: string
  sex?: string
}

export interface CreateOwnerWithPetParams extends CreateOwnerParams {
  pet?: CreatePetParams
}

export interface CreatePetParams {
  name: string
  species: string
  breed?: string
  sex: string
  birth_date?: string
  distinctive_features?: string
}
```

---

### Página SPA

```typescript
// app/frontend/pages/admin/owners/OwnersIndex.tsx
type View = 'list' | 'owner-detail' | 'pet-detail' | 'create-owner' | 'edit-owner' | 'create-pet' | 'edit-pet'

// Flujo de navegación:
// list -> owner-detail (click en owner)
// owner-detail -> pet-detail (click en mascota)
// owner-detail -> edit-owner
// owner-detail -> create-pet
// pet-detail -> edit-pet
// list -> create-owner
```

---

### Habilitar en Sidebar

```ruby
# app/actions/admin/build_sidebar.rb
# Cambiar línea 34:
{ key: "owners", href: "/admin/owners", label: "Propietarios / Pacientes", icon: "Users", disabled: false, roles: %w[admin vet vet_assistant] }
# (quitar disabled: true)
```

---

## Orden de Implementación (TDD)

### Fase 1: Backend - Tests y Actions
1. [ ] Escribir `spec/requests/admin/owners_spec.rb`
2. [ ] Crear actions en `app/actions/admin/owners/`
3. [ ] Actualizar `Admin::OwnersController` con CRUD completo

### Fase 2: Backend - Rutas y Página
4. [ ] Agregar rutas en `config/routes.rb`
5. [ ] Agregar action `owners` en `AdminPagesController`
6. [ ] Ejecutar tests y verificar

### Fase 3: Frontend - Estructura
7. [ ] Crear types en `types/Owner.ts`
8. [ ] Crear API client `api/AdminOwners.ts`
9. [ ] Crear Redux slice `store/slices/adminOwnersSlice.ts`
10. [ ] Registrar slice en `store/index.ts`
11. [ ] Crear hook `hooks/useAdminOwners.ts`

### Fase 4: Frontend - UI
12. [ ] Crear página `pages/admin/owners/OwnersIndex.tsx`
13. [ ] Crear componente `OwnersList.tsx`
14. [ ] Crear componente `OwnerDetail.tsx`
15. [ ] Crear componente `OwnerForm.tsx`
16. [ ] Crear componente `PetDetail.tsx`
17. [ ] Crear componente `PetForm.tsx`
18. [ ] Crear componente `PhotoUpload.tsx`

### Fase 5: Integración
19. [ ] Habilitar item en sidebar (build_sidebar.rb)
20. [ ] Probar flujo completo

---

## Verificación Final

1. [ ] Crear owner desde admin
2. [ ] Crear owner con mascota (flujo combinado)
3. [ ] Crear mascota para owner existente
4. [ ] Subir foto de mascota
5. [ ] Editar mascota dentro de 72h como vet (debe permitir)
6. [ ] Intentar editar mascota después de 72h como vet (debe fallar)
7. [ ] Editar mascota después de 72h como admin (debe permitir)
8. [ ] Ver lista filtrada de owners
9. [ ] Navegar: list -> owner -> pet -> volver
10. [ ] Tests pasan: `bundle exec rspec spec/requests/admin/owners_spec.rb`
