<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2024
Notas: Controladores refactorizados para cumplir convención JSON wrapper
AuthController, PetsController, ProfileController actualizados
-->

# 007 - Cumplimiento de API en Controladores

## Resumen

Estandarizar todos los controladores para cumplir con las convenciones establecidas:
- **CRUD**: JSON con wrappers de modelo (`params.require(:model).permit(...)`)
- **Auth/Profile**: Params planos permitidos (excepción documentada)
- **Todos**: Lógica de negocio delegada a Actions
- **Archivos**: FormData solo en endpoints dedicados

---

## Estado Actual

| Controlador | Params | Actions | Estado |
|-------------|--------|---------|--------|
| `PetsController` | ✅ wrapper | ❌ Lógica directa | Parcial |
| `Admin::PetsController` | ✅ wrapper | ✅ `FilterPets` | Parcial |
| `Admin::AdoptionsController` | ✅ wrapper | ❌ Lógica directa | Parcial |
| `UsersController` | ✅ wrapper | ❌ Lógica directa | Parcial |
| `AuthController` | ✅ planos (excepción) | ❌ Lógica directa | Parcial |
| `ProfileController` | ✅ planos (excepción) | ❌ Lógica directa | Parcial |

**Frontend**: `Auth.ts`, `Profile.ts`, `Pets.ts`, `Users.ts`, `Adoptions.ts` - OK (sin cambios requeridos)

---

## User Stories

### Epic 1: Infraestructura de Actions

#### US-1.1: Crear Result Class

**Como** desarrollador
**Quiero** una clase Result con atributos nombrados
**Para** que los controllers descompongan explícitamente los datos

**Criterios de aceptación:**
- [ ] Crear `Result` con `success?`, `failure?`, `error`, `errors`
- [ ] Soportar atributos nombrados (`Result.success(user: user, token: token)`)
- [ ] Acceso via `result.user`, `result.token`, etc.
- [ ] Tests para Result class

**Archivos:**
- `app/actions/result.rb`
- `spec/actions/result_spec.rb`

---

### Epic 2: AuthController - Extraer Actions

#### US-2.1: Extraer lógica de Auth a Actions

**Como** desarrollador
**Quiero** extraer lógica de AuthController a Actions
**Para** mantener controladores delgados

**Criterios de aceptación:**
- [ ] Crear `Auth::Login` → `Result.success(user:)`
- [ ] Crear `Auth::RegisterOwner` → `Result.success(user:)`
- [ ] Crear `Auth::ForgotPassword` → `Result.success(message:)`
- [ ] Crear `Auth::ResetPassword` → `Result.success(message:)`
- [ ] Crear `Auth::RefreshToken` → `Result.success()`
- [ ] Crear `TokenManageable` concern para manejo de cookies
- [ ] Controller descompone Result explícitamente (`result.user`, `result.message`)
- [ ] Tests de actions

**Archivos:**
- `app/actions/auth/login.rb`
- `app/actions/auth/register_owner.rb`
- `app/actions/auth/forgot_password.rb`
- `app/actions/auth/reset_password.rb`
- `app/actions/auth/refresh_token.rb`
- `app/actions/concerns/token_manageable.rb`
- `app/controllers/auth_controller.rb`
- `spec/actions/auth/*_spec.rb`

---

### Epic 3: ProfileController - Extraer Actions

#### US-3.1: Extraer lógica de Profile a Actions

**Como** desarrollador
**Quiero** extraer lógica de ProfileController a Actions
**Para** mantener controladores delgados

**Criterios de aceptación:**
- [ ] Crear `Profile::Update` → `Result.success(user:)`
- [ ] Crear `Profile::ChangePassword` → `Result.success(message:)`
- [ ] Crear `Profile::DeleteAccount` → `Result.success()`
- [ ] Controller descompone Result explícitamente
- [ ] Tests de actions

**Archivos:**
- `app/actions/profile/update.rb`
- `app/actions/profile/change_password.rb`
- `app/actions/profile/delete_account.rb`
- `app/controllers/profile_controller.rb`
- `spec/actions/profile/*_spec.rb`

---

### Epic 4: PetsController - Extraer Actions

#### US-4.1: Extraer lógica CRUD a Actions

**Como** desarrollador
**Quiero** extraer lógica de PetsController a Actions
**Para** mantener controladores delgados

**Criterios de aceptación:**
- [ ] Crear `Pets::CreatePet` → `Result.success(pet:)`
- [ ] Crear `Pets::UpdatePet` → `Result.success(pet:)`
- [ ] Crear `Pets::DestroyPet` → `Result.success()`
- [ ] Crear `Pets::UploadPhoto` → `Result.success(pet:)`
- [ ] Crear `Pets::DeletePhoto` → `Result.success(pet:)`
- [ ] Controller descompone Result explícitamente (`result.pet`)
- [ ] Tests de actions

**Archivos:**
- `app/actions/pets/create_pet.rb`
- `app/actions/pets/update_pet.rb`
- `app/actions/pets/destroy_pet.rb`
- `app/actions/pets/upload_photo.rb`
- `app/actions/pets/delete_photo.rb`
- `app/controllers/pets_controller.rb`
- `spec/actions/pets/*_spec.rb`

---

### Epic 5: Admin::PetsController - Extraer Actions

#### US-5.1: Extraer lógica CRUD a Actions

**Como** desarrollador
**Quiero** extraer lógica de Admin::PetsController a Actions
**Para** mantener controladores delgados

**Criterios de aceptación:**
- [ ] `Pets::FilterPets` ya existe - mantener
- [ ] Crear `Admin::Pets::CreatePet` → `Result.success(pet:)`
- [ ] Crear `Admin::Pets::UpdatePet` → `Result.success(pet:)`
- [ ] Crear `Admin::Pets::DestroyPet` → `Result.success()`
- [ ] Crear `Admin::Pets::UploadPhoto` → `Result.success(pet:)`
- [ ] Crear `Admin::Pets::DeletePhoto` → `Result.success(pet:)`
- [ ] Controller descompone Result explícitamente
- [ ] Tests de actions

**Archivos:**
- `app/actions/admin/pets/create_pet.rb`
- `app/actions/admin/pets/update_pet.rb`
- `app/actions/admin/pets/destroy_pet.rb`
- `app/actions/admin/pets/upload_photo.rb`
- `app/actions/admin/pets/delete_photo.rb`
- `app/controllers/admin/pets_controller.rb`
- `spec/actions/admin/pets/*_spec.rb`

---

### Epic 6: Admin::AdoptionsController - Extraer Actions

#### US-6.1: Extraer lógica a Actions

**Como** desarrollador
**Quiero** extraer lógica de Admin::AdoptionsController a Actions
**Para** mantener controladores delgados

**Criterios de aceptación:**
- [ ] Crear `Admin::Adoptions::CreateAdoption` → `Result.success(adoption:)`
- [ ] Crear `Admin::Adoptions::FilterAdoptions` → `Result.success(adoptions:, pagination:)`
- [ ] Controller descompone Result explícitamente
- [ ] Tests de actions

**Archivos:**
- `app/actions/admin/adoptions/create_adoption.rb`
- `app/actions/admin/adoptions/filter_adoptions.rb`
- `app/controllers/admin/adoptions_controller.rb`
- `spec/actions/admin/adoptions/*_spec.rb`

---

### Epic 7: UsersController - Extraer Actions

#### US-7.1: Extraer lógica CRUD a Actions

**Como** desarrollador
**Quiero** extraer lógica de UsersController a Actions
**Para** mantener controladores delgados

**Criterios de aceptación:**
- [ ] Crear `Users::CreateUser` → `Result.success(user:)`
- [ ] Crear `Users::UpdateUser` → `Result.success(user:)`
- [ ] Crear `Users::DestroyUser` → `Result.success()`
- [ ] Crear `Users::FilterUsers` → `Result.success(users:, pagination:)`
- [ ] Controller descompone Result explícitamente
- [ ] Tests de actions

**Archivos:**
- `app/actions/users/create_user.rb`
- `app/actions/users/update_user.rb`
- `app/actions/users/destroy_user.rb`
- `app/actions/users/filter_users.rb`
- `app/controllers/users_controller.rb`
- `spec/actions/users/*_spec.rb`

---

## Implementación por Fases

### Fase 1: Infraestructura
1. US-1.1: Crear Result class

### Fase 2: Auth Actions
1. US-2.1: Extraer lógica a Actions + TokenManageable concern

### Fase 3: Profile Actions
1. US-3.1: Extraer lógica a Actions

### Fase 4: Pets Actions
1. US-4.1: Extraer lógica CRUD a Actions

### Fase 5: Admin Pets Actions
1. US-5.1: Extraer lógica CRUD a Actions

### Fase 6: Admin Adoptions Actions
1. US-6.1: Extraer lógica a Actions

### Fase 7: Users Actions
1. US-7.1: Extraer lógica CRUD a Actions

---

## Checklist Final

- [ ] `Result` class creada con atributos nombrados
- [ ] Todos los Actions retornan `Result.success(attr:)` o `Result.failure(error:)`
- [ ] Todos los controllers descomponen Result explícitamente (`result.user`, `result.pet`)
- [ ] Actions tienen tests unitarios
- [ ] `TokenManageable` concern creado para Auth
- [ ] `npm run push` pasa en todas las fases
