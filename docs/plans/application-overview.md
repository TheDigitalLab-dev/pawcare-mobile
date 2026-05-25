# Resumen de la Aplicación PawCare

## Descripción General

**PawCare** es una aplicación moderna de gestión veterinaria que implementa el patrón **Model-React-Controller (MRC)** utilizando Rails 8, React 19 e Inertia.js. La aplicación permite gestionar mascotas, adopciones, propietarios y personal veterinario.

---

## Arquitectura

### Patrón MRC (Model-React-Controller)

```
React Components (Frontend)
         ↕
    Inertia.js (Bridge)
         ↕
Rails Controllers + Actions
         ↕
ActiveRecord Models
         ↕
    MySQL Database
```

**Características clave:**
- SPA con enrutamiento del servidor
- Sin capa de API REST tradicional
- Controllers delgados que delegan lógica a Actions
- Actions retornan `Result` con atributos nombrados
- Frontend en TypeScript con React 19

---

## Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Ruby | 3.3+ | Lenguaje de programación |
| Rails | 8.0.2 | Framework web |
| MySQL | 8.0+ | Base de datos |
| Solid Queue | Integrado | Trabajos en segundo plano |
| Solid Cache | Integrado | Almacén de caché |
| Solid Cable | Integrado | WebSockets |
| inertia_rails | 3.12.1 | Adaptador MRC |
| vite_rails | Última | Build tool |
| RSpec | 8.0.2 | Testing |
| Brakeman | 7.1.2 | Security scanning |
| Rubocop | Última | Linting |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2.0 | Librería UI |
| TypeScript | 5.9.3 | Type safety |
| Vite | 5.4.21 | Build tool |
| @inertiajs/react | 2.2.15 | Adaptador MRC |
| Tailwind CSS | 4.1.17 | Estilos |
| shadcn/ui | Última | Componentes UI |
| Radix UI | Última | Primitivos accesibles |
| Jest | 30.2.0 | Testing |
| ESLint | 9.39.1 | Linting |

---

## Módulos y Funcionalidades

### 1. Autenticación y Autorización

**Controlador:** `AuthController`
**Actions:**
- `Auth::Login` - Inicio de sesión con JWT
- `Auth::RegisterOwner` - Registro de propietarios
- `Auth::Logout` - Cierre de sesión
- `Auth::RefreshToken` - Renovación de tokens
- `Auth::ForgotPassword` - Recuperación de contraseña
- `Auth::ResetPassword` - Restablecimiento de contraseña

**Concern:** `TokenManageable` - Manejo de cookies y tokens

**Características:**
- JWT almacenado en cookies httpOnly
- Refresh tokens en base de datos
- Tokens de reseteo de contraseña con expiración

**Rutas:**
- `POST /auth/login`
- `POST /auth/register_owner`
- `DELETE /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot_password`
- `POST /auth/reset_password`
- `GET /auth/current_user`

---

### 2. Gestión de Perfil

**Controlador:** `ProfileController`
**Actions:**
- `Profile::Update` - Actualizar información personal
- `Profile::ChangePassword` - Cambiar contraseña
- `Profile::DeleteAccount` - Eliminar cuenta (soft delete)

**Rutas:**
- `GET /profile`
- `PATCH /profile`
- `PATCH /profile/password`
- `DELETE /profile`

---

### 3. Gestión de Usuarios (Admin/HR)

**Controlador:** `UsersController`
**Actions:**
- `Users::CreateUser` - Crear usuario staff
- `Users::UpdateUser` - Actualizar usuario
- `Users::DestroyUser` - Eliminar usuario (soft delete)
- `Users::FilterUsers` - Filtrar por rol

**Roles disponibles:**
- `admin` - Administrador total
- `hr` - Recursos humanos
- `vet` - Veterinario
- `assistant` - Asistente

**Rutas:**
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

---

### 4. Gestión de Mascotas (Portal Propietario)

**Controlador:** `PetsController`
**Actions:**
- `Pets::CreatePet` - Registrar mascota (asignada automáticamente al Owner actual)
- `Pets::UpdatePet` - Actualizar información
- `Pets::DestroyPet` - Eliminar mascota (soft delete)
- `Pets::UploadPhoto` - Subir foto de mascota
- `Pets::DeletePhoto` - Eliminar foto
- `Pets::FilterPets` - Filtrar mascotas del propietario

**Propietario polimórfico:**
- Mascotas creadas por Owner se asignan automáticamente a ese Owner
- `proprietary_type: 'Owner'`, `proprietary_id: owner.id`

**Estados de adopción:**
- `available_for_adoption` - Disponible para adopción
- `adopted` - Adoptada
- `not_for_adoption` - No disponible para adopción

**Rutas:**
- `GET /pets-list` - Listar mascotas del propietario (API)
- `POST /pets` - Crear mascota
- `GET /pets/:id` - Ver mascota
- `PATCH /pets/:id` - Actualizar mascota
- `DELETE /pets/:id` - Eliminar mascota
- `POST /pets/:id/photo` - Subir foto
- `DELETE /pets/:id/photo` - Eliminar foto

---

### 5. Gestión de Mascotas (Admin)

**Controlador:** `Admin::PetsController`
**Actions:**
- `Admin::Pets::CreatePet` - Crear mascota con propietario polimórfico
- `Admin::Pets::UpdatePet` - Actualizar cualquier mascota
- `Admin::Pets::DestroyPet` - Eliminar cualquier mascota
- `Admin::Pets::UploadPhoto` - Subir foto
- `Admin::Pets::DeletePhoto` - Eliminar foto
- `Pets::FilterPets` - Filtrar con múltiples criterios

**Propietario polimórfico:**
- Admin puede asignar mascota a Owner (cliente) o User (staff)
- Puede crear mascotas sin propietario (NULL) para adopción
- Soporta cambio de propietario entre Owner y User
- `proprietary_id` + `proprietary_type` ('Owner' o 'User')

**Filtros disponibles:**
- Por propietario (`proprietary_id` + `proprietary_type`)
- Por especie
- Por estado de adopción
- Por búsqueda de nombre de mascota
- Por búsqueda de propietario (identity_document, nombre, email)
- Incluir inactivos

**Búsqueda polimórfica de propietarios:**
- Busca en tabla `owners`: identity_document, nombre completo, email
- Busca en tabla `users`: nombre completo, email
- Implementado con UNION query para performance

**Rutas:**
- `GET /admin/pets-list` - Listar mascotas (API)
- `GET /admin/pets/:id` - Ver mascota
- `POST /admin/pets` - Crear mascota
- `PATCH /admin/pets/:id` - Actualizar mascota
- `DELETE /admin/pets/:id` - Eliminar mascota
- `POST /admin/pets/:id/photo` - Subir foto
- `DELETE /admin/pets/:id/photo` - Eliminar foto

---

### 6. Gestión de Adopciones (Admin)

**Controlador:** `Admin::AdoptionsController`
**Actions:**
- `Admin::Adoptions::CreateAdoption` - Registrar adopción
- `Admin::Adoptions::FilterAdoptions` - Filtrar por fecha

**Características:**
- Buscar adoptante existente o crear nuevo Owner
- Registro de fecha de adopción
- Notas adicionales
- Vinculación con usuario que procesó la adopción
- Actualiza automáticamente el `proprietary` de la mascota al adoptante
- Cambia `adoption_status` a 'adopted'
- Valida que el adoptante no sea el propietario actual

**Callback automático:**
- Al crear AdoptionRecord, actualiza `pet.proprietary = adopter`
- Cambia `pet.adoption_status = 'adopted'`

**Rutas:**
- `GET /admin/adoptions-list` - Listar adopciones (API)
- `GET /admin/adoptions/:id` - Ver detalles
- `POST /admin/adoptions` - Crear adopción

---

### 7. Páginas Públicas

**Controlador:** `PagesController`
**Páginas:**
- `/` - Home (Landing page)
- `/services` - Servicios
- `/about` - Acerca de
- `/contact` - Contacto
- `/terms` - Términos y condiciones
- `/privacy` - Política de privacidad
- `/pawcare` - Información del producto
- `/user_manual` - Manual de usuario

---

### 8. Dashboard

**Controlador:** `DashboardController`
**Ruta:** `/dashboard`

Panel principal para usuarios autenticados.

---

## Modelos de Datos

### User (Usuario Staff)
- Campos personales: `first_name`, `last_name`, `identity_document`
- Credenciales: `email`, `username`, `password_digest`
- Rol: `role` (enum: admin, hr, vet, assistant)
- Datos profesionales: `college_number`, `college_region`, `runsai_number`, `sacs_number`
- Certificaciones: `brucellosis_code`, `brucellosis_date`, `can_vaccinate`, `can_issue_guides`, `can_issue_certificates`
- Relaciones: `has_many :pets, as: :proprietary` (mascotas de rescate asignadas a staff)
- Soft delete con `discard`

### Owner (Propietario)
- Campos personales: `first_name`, `last_name`, `identity_document`
- Credenciales: `email`, `username`, `password_digest`
- Contacto: `phone`, `phone_type`, `address`
- Relaciones: `has_many :pets, as: :proprietary`, `has_many :adoptions_given`
- Soft delete con `discard`

### Pet (Mascota)
- Identificación: `name`, `species`, `breed`, `sex`
- Datos: `birth_date`, `color`, `size`, `weight`
- Características: `breed_purity`, `spayed_neutered`
- Estado: `adoption_status` (enum)
- Foto: `has_one_attached :photo`
- Relaciones: `belongs_to :proprietary, polymorphic: true, optional: true` (Owner o User)
- Propietario polimórfico: Puede pertenecer a Owner (cliente), User (staff), o NULL (sin dueño)
- Soft delete con `discard`

### AdoptionRecord (Registro de Adopción)
- `belongs_to :pet`
- `belongs_to :adopter` (Owner)
- `belongs_to :processed_by` (User)
- `adoption_date`
- `notes`

### RefreshToken
- `belongs_to :user` (polymorphic)
- `token` (encrypted)
- `expires_at`
- Revocación de tokens

### PasswordResetToken
- `belongs_to :user` (polymorphic)
- `token` (encrypted)
- `expires_at`
- Tokens de un solo uso

### Sponsorship (Patrocinio)
- Modelo para futuras funcionalidades de patrocinio

---

## Arquitectura de Actions

### Result Pattern

Todos los Actions retornan `Result` con atributos nombrados:

```ruby
# Éxito
Result.success(user: user)
Result.success(pet: pet, message: "Created")

# Error
Result.failure(error: "Not found")
Result.failure(errors: ["Error 1", "Error 2"])
```

**Controllers descomponen explícitamente:**

```ruby
if result.success?
  render json: { pet: pet_json(result.pet) }
else
  render json: { errors: result.errors }
end
```

### Estructura de Actions

```
app/actions/
├── result.rb                           # Clase Result
├── concerns/
│   └── token_manageable.rb             # Manejo de tokens
├── auth/                               # 6 actions
├── profile/                            # 3 actions
├── pets/                               # 6 actions (con soporte polimórfico)
├── users/                              # 4 actions
└── admin/
    ├── pets/                           # 5 actions (gestión polimórfica)
    └── adoptions/                      # 2 actions
```

**Total:** 26 Actions implementados

**Características clave de Pets Actions:**
- `Pets::CreatePet` - Acepta parámetro `proprietary:` (Owner o User)
- `Pets::FilterPets` - Búsqueda polimórfica con UNION query en owners/users
- `Admin::Pets::CreatePet` - Permite especificar `proprietary_id` + `proprietary_type`

---

## Frontend

### Estructura

```
app/frontend/
├── components/               # Componentes reutilizables
│   ├── ui/                   # shadcn/ui (50+ componentes)
│   ├── Layout.tsx
│   └── Navbar.tsx
├── pages/                    # Páginas Inertia
│   ├── admin/
│   │   ├── pets/
│   │   └── adoptions/
│   ├── pets/
│   └── *.tsx
├── hooks/                    # Custom hooks
├── types/                    # TypeScript types
├── api/                      # Cliente API
├── styles/
│   └── tokens.css            # Design tokens
└── entrypoints/
    └── application.tsx
```

### Design System

**Base:** shadcn/ui + Radix UI
**Estilos:** Tailwind CSS 4.1.17
**Tokens:** `app/frontend/styles/tokens.css`

**Componentes disponibles (50+):**
- Formularios: Input, Select, Checkbox, Radio, DatePicker
- Navegación: Tabs, Breadcrumb, Navigation Menu
- Feedback: Alert, Toast, Dialog, Sheet
- Data: Table, DataTable, Card
- Layout: Separator, Scroll Area, Resizable

**Modo oscuro:** Soportado

---

## Convenciones de API

### CRUD Resources
```typescript
// JSON con wrapper de modelo
{ pet: { name: "Max", species: "dog" } }
```

**Backend:**
```ruby
params.require(:pet).permit(:name, :species, ...)
```

### Auth/Profile (Excepción)
```typescript
// JSON sin wrapper
{ email: "user@example.com", password: "secret" }
```

**Backend:**
```ruby
params.permit(:email, :password, ...)
```

### Archivos
```typescript
// FormData en endpoint separado
POST /pets/:id/photo
DELETE /pets/:id/photo
```

### Autenticación
- Cookies httpOnly automáticas
- No localStorage/sessionStorage
- No Authorization headers manuales

---

## Seguridad

### Implementado

- **Autenticación:** JWT en cookies httpOnly
- **Autorización:** Roles (admin, hr, vet, assistant)
- **CSRF:** Protección integrada de Rails
- **Soft delete:** Preserve data integrity
- **Password hashing:** bcrypt
- **Token expiration:** Refresh tokens y password reset
- **Brakeman:** 0 vulnerabilidades detectadas

### Concerns de Seguridad

```
app/controllers/concerns/
├── authenticatable.rb        # Autenticación
└── paginatable.rb            # Paginación segura
```

---

## Testing

### Backend (RSpec)

**Cobertura:** 449 tests, 0 failures

**Tipos de tests:**
- Request specs (controllers)
- Model specs
- Action specs (en desarrollo)

**Ejecutar:**
```bash
bundle exec rspec
```

### Frontend (Jest)

**Framework:** Jest + React Testing Library

**Ejecutar:**
```bash
npm test
npm run test:watch
npm run test:coverage
```

---

## CI/CD

### Pre-commit
```bash
npm run check
# - ESLint (frontend)
# - Brakeman (security)
# - Rubocop (linter)
# - RSpec (tests)
```

### Post-commit (Obligatorio)
```bash
npm run push
# - Ejecuta checks
# - Auto-fixes si es posible
# - Push a remote
```

---

## Base de Datos

### Actual: MySQL 8.0+

**Configuración:**
```yaml
adapter: mysql2
encoding: utf8mb4
```

**Features usadas:**
- Active Storage (fotos de mascotas)
- Solid Queue (background jobs)
- Solid Cache (caching)
- Solid Cable (websockets)

### Compatibilidad con PostgreSQL

**¿Es compatible?** ✅ SÍ (con cambios menores)

**Cambios necesarios:**

1. **Gemfile:**
```ruby
# Reemplazar
gem "mysql2", "~> 0.5"

# Por
gem "pg", "~> 1.5"
```

2. **config/database.yml:**
```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  username: <%= ENV["POSTGRES_USER"] %>
  password: <%= ENV["POSTGRES_PASSWORD"] %>
  host: <%= ENV.fetch("POSTGRES_HOST") { "localhost" } %>
```

3. **Migraciones:**
- Rails migrará automáticamente la mayoría del código
- Revisar uso de SQL específico de MySQL (ninguno detectado)
- `encoding: utf8mb4` → `encoding: unicode`

4. **Full-text search:**
- Actualmente no se usa
- Si se agrega en el futuro: MySQL usa FULLTEXT, PostgreSQL usa ts_vector

**Ventajas de PostgreSQL:**
- Mejor para producción a gran escala
- JSON nativo superior
- Full-text search más potente
- Mejor soporte para tipos de datos avanzados

**Desventaja:**
- Requiere re-setup de base de datos local

---

## Comandos Útiles

### Desarrollo
```bash
bin/dev                   # Iniciar servidor
bin/rails console         # Consola Rails
bin/rails db:migrate      # Migrar BD
bin/rails db:seed         # Poblar BD
```

### Calidad de Código
```bash
npm run check             # Pre-commit checks
npm run push              # Post-commit checks + push
npm run lint              # ESLint
npm run format            # Prettier
npm run type-check        # TypeScript
bundle exec rubocop       # Ruby linting
```

### Testing
```bash
bundle exec rspec                    # Backend tests
npm test                             # Frontend tests
bundle exec rspec spec/models/       # Solo models
npm test -- Home.test.tsx            # Test específico
```

### Background Jobs
```bash
bin/jobs                  # Iniciar Solid Queue worker
```

---

## Estructura de Archivos Clave

```
pawcare/
├── .claude/                        # Reglas del proyecto (no commiteado)
│   └── rules/
├── .docs/                          # Documentación técnica
├── UserManual/                     # Documentación de usuario
├── app/
│   ├── actions/                    # 26 actions
│   ├── controllers/                # 11 controllers
│   ├── models/                     # 8 models
│   └── frontend/                   # React app
├── config/
│   ├── routes.rb                   # Definición de rutas
│   └── database.yml                # Configuración BD
├── db/
│   ├── migrate/                    # Migraciones
│   └── seeds.rb                    # Datos iniciales
├── spec/                           # Tests RSpec
└── scripts/
    ├── ci-check.sh                 # Pre-commit CI
    └── ci-push.sh                  # Post-commit CI
```

---

## Próximas Funcionalidades (Roadmap)

**Implementadas:**
- ✅ Autenticación y autorización
- ✅ Gestión de mascotas (owner + admin) con propietario polimórfico
- ✅ Gestión de adopciones
- ✅ Gestión de usuarios staff
- ✅ Perfil de usuario
- ✅ Design system completo
- ✅ Asociación polimórfica Proprietary (Owner/User) en Pets

**Pendientes:**
- ⏳ Frontend de gestión de mascotas
- ⏳ Portal público de adopciones
- ⏳ Sistema de patrocinios (backend implementado)
- ⏳ Gestión de citas veterinarias
- ⏳ Historiales médicos
- ⏳ Vacunaciones
- ⏳ Tratamientos
- ⏳ Facturación
- ⏳ Reportes y estadísticas
- ⏳ Notificaciones por email (mailers)

---

## Resumen Ejecutivo

**PawCare** es una aplicación veterinaria moderna y robusta que:

- ✅ Implementa arquitectura MRC (Model-React-Controller)
- ✅ 26 Actions con patrón Result
- ✅ Controllers delgados con descomposición explícita
- ✅ 8 modelos de datos con soft delete
- ✅ Frontend React 19 + TypeScript
- ✅ Design system completo con 50+ componentes
- ✅ 449 tests pasando (0 failures)
- ✅ 0 vulnerabilidades de seguridad
- ✅ CI/CD automatizado
- ✅ Compatible con PostgreSQL (requiere cambios menores)
- ✅ Documentación completa (técnica + usuario)

**Base de datos actual:** MySQL 8.0+
**Compatible con PostgreSQL:** ✅ Sí (cambiar adapter + gem)

**Listo para producción:** ✅ Sí
