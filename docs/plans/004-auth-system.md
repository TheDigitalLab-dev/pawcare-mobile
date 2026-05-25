<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2024
Backend: app/controllers/auth_controller.rb
Actions: Login, Logout, RegisterOwner, ForgotPassword, ResetPassword, RefreshToken en app/actions/auth/
-->

# 004 - Sistema de Autenticación

## Resumen

Implementar autenticación basada en JWT para la API del backend, con protección CSRF para requests desde el frontend (Inertia.js). Dos tipos de usuarios: **Owners** (dueños de mascotas) y **Users** (personal de la clínica).

## Arquitectura de Autenticación

### JWT Stateless + Refresh Token en DB + httpOnly Cookies

- **Access Token**: JWT de corta duración (1 hora) almacenado en **cookie httpOnly**
  - Cookie encriptada, `httponly: true`, `secure: true` (prod), `same_site: :lax`
  - Enviada automáticamente por el navegador en cada request
  - Decodificable solo por el backend (SECRET_KEY en servidor)
  - **No accesible desde JavaScript** (protección XSS)
- **Refresh Token**: Token de larga duración (7 días) almacenado en DB + **cookie httpOnly**
  - Permite revocación real (logout, despidos)
  - Rotación automática en cada refresh (seguridad adicional)
  - Limpieza automática diaria vía job
  - Cookie encriptada `httponly: true`
- **CSRF Token**: Protección para requests que modifican datos (Rails built-in)
- **Current User**: Helper `current_user` que decodifica el JWT de cookies
- **Campo `active`**: Boolean en `users` y `owners` para deshabilitar cuentas
- **Inertia.js**: Envía cookies automáticamente, sin código JS adicional

### Flujo de Autenticación

```
1. Login → POST /api/auth/login
   - Valida credenciales
   - Crea refresh token en DB
   - Setea cookies httpOnly:
     * cookies.encrypted[:access_token] (1h, httponly, secure, same_site: :lax)
     * cookies.encrypted[:refresh_token] (7d, httponly, secure, same_site: :lax)
   - Retorna JSON: { user: {...}, success: true }
   - Navegador guarda cookies automáticamente

2. Requests autenticados → Cookies enviadas automáticamente
   - Navegador adjunta cookies en cada request
   - Middleware lee cookies.encrypted[:access_token]
   - Decodifica JWT y carga current_user
   - Verifica que usuario esté activo (active: true)

3. Token expirado → POST /api/auth/refresh
   - Lee cookies.encrypted[:refresh_token] automáticamente
   - Verifica token en DB (activo, no revocado, no expirado)
   - Revoca token viejo (rotation)
   - Crea nuevo refresh token en DB
   - Setea nuevas cookies httpOnly
   - Retorna JSON: { success: true }

4. Logout → DELETE /api/auth/logout
   - Revoca refresh_token en DB
   - Borra cookies: cookies.delete(:access_token), cookies.delete(:refresh_token)
   - Retorna JSON: { success: true }

5. Limpieza automática → Job diario
   - Elimina tokens expirados > 30 días
   - Elimina tokens revocados > 30 días
```

---

## Modelos de Usuario

### Owner (Dueño de mascota)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto-generado |
| first_name | string | Sí | Nombre |
| last_name | string | Sí | Apellido |
| identity_document | string | Sí | Cédula/DNI (único) |
| email | string | Sí | Único, para login |
| username | string | Sí | Único, alternativa para login |
| password_digest | string | Sí | Bcrypt hash |
| address | text | No | Dirección completa |
| sex | enum | No | male, female, other |
| phone | string | No | Teléfono principal |
| phone_type | enum | No | whatsapp, telegram, regular |
| active | boolean | Sí | Usuario activo (default: true) |
| created_at | datetime | Auto | |
| updated_at | datetime | Auto | |

### User (Personal de clínica)

Hereda campos base + campos específicos:

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto-generado |
| first_name | string | Sí | Nombre |
| last_name | string | Sí | Apellido |
| identity_document | string | Sí | Cédula/DNI (único) |
| email | string | Sí | Único, para login |
| username | string | Sí | Único, alternativa para login |
| password_digest | string | Sí | Bcrypt hash |
| address | text | No | Dirección completa |
| sex | enum | No | male, female, other |
| phone | string | No | Teléfono principal |
| phone_type | enum | No | whatsapp, telegram, regular |
| **role** | enum | Sí | Ver roles abajo |
| **college_number** | string | No | Número de colegiatura CMVV |
| **college_region** | string | No | Colegio regional (ej: Zulia, Carabobo) |
| **runsai_number** | string | No | Registro INSAI |
| **sacs_number** | string | No | Registro Ministerio de Salud |
| **brucellosis_code** | string | No | Código acreditación brucelosis |
| **brucellosis_date** | date | No | Fecha acreditación brucelosis |
| **can_vaccinate** | boolean | No | Permiso para vacunar |
| **can_issue_guides** | boolean | No | Permiso guías sanitarias INSAI |
| **can_issue_certificates** | boolean | No | Permiso certificados de salud |
| active | boolean | Sí | Usuario activo (default: true) |
| created_at | datetime | Auto | |
| updated_at | datetime | Auto | |

### Roles de User

```ruby
enum :role, {
  admin: 0,         # Acceso total al sistema
  vet: 1,           # Veterinario - historias médicas, diagnósticos
  vet_assistant: 2, # Auxiliar veterinario - casos específicos
  assistant: 3,     # Asistente/Secretario - agendas, citas
  finances: 4,      # Finanzas - pagos, inventario, reportes
  hr: 5             # RRHH - contratación, turnos, personal
}
```

### Permisos por Rol

| Permiso | admin | vet | vet_assistant | assistant | finances | hr |
|---------|-------|-----|---------------|-----------|----------|-----|
| Gestión usuarios | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Historias médicas | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ |
| Citas/Agenda | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Facturación | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Inventario | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Reportes | ✅ | 🔶 | ❌ | ❌ | ✅ | ✅ |
| Config sistema | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

🔶 = Acceso parcial/lectura

---

## Modelo RefreshToken

Tabla para almacenar tokens de refresh con capacidad de revocación:

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto-generado |
| token | string | Sí | Hash del refresh token (único) |
| tokenable_type | string | Sí | "Owner" o "User" (polymorphic) |
| tokenable_id | bigint | Sí | ID del owner/user |
| expires_at | datetime | Sí | Expiración (7 días desde creación) |
| revoked_at | datetime | No | Timestamp de revocación |
| created_at | datetime | Auto | |
| updated_at | datetime | Auto | |

### Métodos y Scopes

```ruby
# Scope para tokens activos
scope :active, -> { where(revoked_at: nil).where('expires_at > ?', Time.current) }

# Método de revocación
def revoke!
  update!(revoked_at: Time.current)
end

# Verificar si está activo
def active?
  revoked_at.nil? && expires_at > Time.current
end
```

### Asociaciones

```ruby
# RefreshToken
belongs_to :tokenable, polymorphic: true

# Owner
has_many :refresh_tokens, as: :tokenable, dependent: :destroy

# User
has_many :refresh_tokens, as: :tokenable, dependent: :destroy
```

---

## Endpoints API

### Autenticación (Público)

```
POST   /api/auth/register_owner     # Registro Owner (dueños de mascotas)
POST   /api/auth/login              # Login (Owner o User)
DELETE /api/auth/logout             # Logout
POST   /api/auth/refresh            # Refresh token
POST   /api/auth/forgot_password    # Solicitar reset
POST   /api/auth/reset_password     # Cambiar con token
GET    /api/auth/current_user       # Usuario actual autenticado
```

### Gestión de Users (Solo Admin/HR)

```
GET    /api/users                   # Listar usuarios staff
POST   /api/users                   # Crear usuario staff
GET    /api/users/:id               # Ver usuario
PATCH  /api/users/:id               # Actualizar usuario
DELETE /api/users/:id               # Eliminar usuario
```

### Perfil (Autenticado)

```
GET    /api/profile                 # Ver perfil propio
PATCH  /api/profile                 # Actualizar perfil propio
PATCH  /api/profile/password        # Cambiar contraseña
DELETE /api/profile                 # Eliminar cuenta propia
```

### Creación del Primer Admin

```bash
# Comando rake para crear admin inicial
bin/rails pawcare:create_admin
# Solicita: email, password, nombre, apellido, cédula
```

---

## Páginas Frontend

### Públicas (sin auth)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| /login | Login.tsx | Formulario login (email/username + password) |
| /register | Register.tsx | Registro Owner (dueños de mascotas) |
| /forgot-password | ForgotPassword.tsx | Solicitar reset de contraseña |
| /reset-password/:token | ResetPassword.tsx | Formulario nueva contraseña |

### Protegidas (requieren auth)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| /dashboard | Dashboard.tsx | Panel principal (varía según rol) |
| /profile | Profile.tsx | Ver/editar perfil |
| /profile/password | ChangePassword.tsx | Cambiar contraseña |

### UI por tipo de usuario

**Owner:**
- Dashboard simplificado: mis mascotas, próximas citas, historial
- Perfil con campos básicos

**User:**
- Dashboard según rol: accesos rápidos relevantes
- Perfil con campos veterinarios (si aplica)
- Navbar con menú de módulos según permisos

---

## Estructura de Archivos

### Backend (Rails)

```
app/
├── controllers/
│   └── api/
│       ├── auth_controller.rb
│       └── profile_controller.rb
├── models/
│   ├── owner.rb
│   ├── user.rb
│   └── refresh_token.rb
├── services/
│   └── jwt_service.rb
├── jobs/
│   └── cleanup_expired_tokens_job.rb
└── controllers/concerns/
    └── authenticatable.rb
```

### Frontend (React)

```
app/frontend/
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
│   └── dashboard/
│       ├── Dashboard.tsx
│       ├── Profile.tsx
│       └── ChangePassword.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useCurrentUser.ts
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── request.ts          # Cliente axios base
└── api/
    ├── Auth.ts             # Clase API autenticación
    └── Profile.ts          # Clase API perfil
```

---

## API Client Pattern

### Base Request (`lib/request.ts`)

```typescript
import axios from "axios";

const client = axios.create({
  baseURL: "/api",
});

export const request = async <T>(options: any): Promise<T> => {
  const onSuccess = (response: any) => response?.data;
  const onError = (error: any) => Promise.reject(error.response?.data);

  try {
    const response = await client(options);
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};
```

### Auth API Class (`api/Auth.ts`)

**NOTA**: Con cookies httpOnly, NO es necesario manejar tokens manualmente en el frontend. Las cookies se envían automáticamente.

```typescript
import { request } from "@/lib/request";

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterOwnerParams {
  first_name: string;
  last_name: string;
  identity_document: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
}

interface AuthResponse {
  user: Owner | User;
  success: boolean;
}

export class Auth {
  login(params: LoginParams) {
    return request<AuthResponse>({
      method: "POST",
      url: "/auth/login",
      data: params,
      // Cookies se setean automáticamente en el backend
    });
  }

  registerOwner(params: RegisterOwnerParams) {
    return request<AuthResponse>({
      method: "POST",
      url: "/auth/register_owner",
      data: params,
      // Cookies se setean automáticamente en el backend
    });
  }

  logout() {
    return request({
      method: "DELETE",
      url: "/auth/logout",
      // Cookies se eliminan automáticamente en el backend
    });
  }

  refresh() {
    return request<AuthResponse>({
      method: "POST",
      url: "/auth/refresh",
      // Cookie refresh_token se lee automáticamente en el backend
    });
  }

  forgotPassword(email: string) {
    return request({
      method: "POST",
      url: "/auth/forgot_password",
      data: { email },
    });
  }

  resetPassword(token: string, password: string, password_confirmation: string) {
    return request({
      method: "POST",
      url: "/auth/reset_password",
      data: { token, password, password_confirmation },
    });
  }

  currentUser() {
    return request<{ user: Owner | User }>({
      method: "GET",
      url: "/auth/current_user",
      // Cookie access_token se lee automáticamente en el backend
    });
  }
}
```

### Profile API Class (`api/Profile.ts`)

```typescript
import { request } from "@/lib/request";

export class Profile {
  csrf: string;

  constructor(csrf: string = "") {
    this.csrf = csrf;
  }

  get() {
    return request({
      method: "GET",
      url: "/profile",
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }

  update(data: Partial<Owner | User>) {
    return request({
      method: "PATCH",
      url: "/profile",
      data,
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }

  changePassword(current_password: string, password: string, password_confirmation: string) {
    return request({
      method: "PATCH",
      url: "/profile/password",
      data: { current_password, password, password_confirmation },
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }

  delete() {
    return request({
      method: "DELETE",
      url: "/profile",
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }
}
```

### Users API Class (`api/Users.ts`) - Solo Admin/HR

```typescript
import { request } from "@/lib/request";

interface CreateUserParams {
  first_name: string;
  last_name: string;
  identity_document: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  role: string;
  // Campos veterinarios opcionales
  college_number?: string;
  college_region?: string;
  runsai_number?: string;
  sacs_number?: string;
  brucellosis_code?: string;
  brucellosis_date?: string;
  can_vaccinate?: boolean;
  can_issue_guides?: boolean;
  can_issue_certificates?: boolean;
}

export class Users {
  csrf: string;

  constructor(csrf: string = "") {
    this.csrf = csrf;
  }

  list(params?: { page?: number; per_page?: number; role?: string }) {
    return request({
      method: "GET",
      url: "/users",
      params,
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }

  get(id: number) {
    return request({
      method: "GET",
      url: `/users/${id}`,
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }

  create(params: CreateUserParams) {
    return request({
      method: "POST",
      url: "/users",
      data: params,
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }

  update(id: number, params: Partial<CreateUserParams>) {
    return request({
      method: "PATCH",
      url: `/users/${id}`,
      data: params,
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }

  delete(id: number) {
    return request({
      method: "DELETE",
      url: `/users/${id}`,
      headers: { "X-CSRF-TOKEN": this.csrf },
    });
  }
}
```

### Uso en Componentes

```typescript
// En un componente o hook
const auth = new Auth(csrfToken);
const response = await auth.login({ email, password });

// Actualizar CSRF para siguientes requests
const profile = new Profile(response.csrf_token);
const userData = await profile.get();

// Gestión de users (solo admin/hr)
const users = new Users(response.csrf_token);
const staffList = await users.list({ role: 'vet' });
```

---

## Implementación por Fases (TDD)

### Fase 1: Modelos y Migraciones
1. Escribir tests de modelo Owner (`spec/models/owner_spec.rb`)
2. Crear migración Owner
3. Implementar modelo Owner con validaciones
4. Escribir tests de modelo User (`spec/models/user_spec.rb`)
5. Crear migración User
6. Implementar modelo User con validaciones
7. Crear rake task `pawcare:create_admin`

### Fase 2: JWT Service y Refresh Tokens
1. ✅ Instalar gem jwt
2. ✅ Escribir tests para JwtService (`spec/services/jwt_service_spec.rb`)
3. ✅ Crear JwtService (encode/decode, 1h access + 7d refresh)
4. Agregar campo `active` a `users` y `owners` (migration)
5. Escribir tests para RefreshToken (`spec/models/refresh_token_spec.rb`)
6. Crear migración y modelo RefreshToken
   - Campos: token, expires_at, revoked_at, tokenable (polymorphic)
   - Scope: active
   - Método: revoke!
7. Crear factory de RefreshToken
8. Actualizar JwtService para token rotation
9. Crear job `CleanupExpiredTokensJob` (diario)
10. Crear concern `Authenticatable` para controllers

### Fase 3: Auth Controller
1. Escribir request specs (`spec/requests/api/auth_spec.rb`)
2. POST /auth/register_owner
3. POST /auth/login
4. DELETE /auth/logout
5. POST /auth/refresh
6. POST /auth/forgot_password
7. POST /auth/reset_password
8. GET /auth/current_user

### Fase 4: Users Controller (Admin/HR)
1. Escribir request specs (`spec/requests/api/users_spec.rb`)
2. GET /users (list)
3. POST /users (create)
4. GET /users/:id (show)
5. PATCH /users/:id (update)
6. DELETE /users/:id (destroy)
7. Verificar autorización por rol

### Fase 5: Profile Controller
1. Escribir request specs (`spec/requests/api/profile_spec.rb`)
2. GET /profile
3. PATCH /profile
4. PATCH /profile/password
5. DELETE /profile

### Fase 6: Frontend - API Client
1. Instalar axios
2. Crear `lib/request.ts`
3. Crear `api/Auth.ts`
4. Crear `api/Profile.ts`
5. Crear `api/Users.ts`

### Fase 7: Frontend - Auth Pages
1. Login page
2. Register page (Owner)
3. Forgot/Reset password
4. Auth context y hooks

### Fase 8: Dashboard y Perfil
1. Dashboard base
2. Profile page
3. Change password
4. Navegación por rol

---

## Tests de Modelos

### Owner Validations (`spec/models/owner_spec.rb`)

```ruby
RSpec.describe Owner, type: :model do
  describe "validations" do
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_presence_of(:identity_document) }
    it { should validate_uniqueness_of(:identity_document) }
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:username) }
    it { should validate_uniqueness_of(:username).case_insensitive }
    it { should have_secure_password }
  end

  describe "enums" do
    it { should define_enum_for(:sex).with_values(male: 0, female: 1, other: 2) }
    it { should define_enum_for(:phone_type).with_values(whatsapp: 0, telegram: 1, regular: 2) }
  end
end
```

### User Validations (`spec/models/user_spec.rb`)

```ruby
RSpec.describe User, type: :model do
  describe "validations" do
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_presence_of(:identity_document) }
    it { should validate_uniqueness_of(:identity_document) }
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:username) }
    it { should validate_uniqueness_of(:username).case_insensitive }
    it { should validate_presence_of(:role) }
    it { should have_secure_password }
  end

  describe "enums" do
    it { should define_enum_for(:role).with_values(admin: 0, vet: 1, vet_assistant: 2, assistant: 3, finances: 4, hr: 5) }
    it { should define_enum_for(:sex).with_values(male: 0, female: 1, other: 2) }
    it { should define_enum_for(:phone_type).with_values(whatsapp: 0, telegram: 1, regular: 2) }
  end

  describe "veterinary fields" do
    context "when role is vet" do
      # Validaciones específicas para veterinarios si aplican
    end
  end
end
```

---

## Dependencias

### Gems
- `jwt` - Encode/decode JWT
- `bcrypt` - Password hashing (ya incluido en Rails)
- `shoulda-matchers` - Matchers para tests de modelos (dev/test)
- `factory_bot_rails` - Factories para tests (dev/test)

### NPM
- `axios` - Cliente HTTP para API requests

---

## Consideraciones de Seguridad

1. **httpOnly Cookies** - Tokens NO accesibles desde JavaScript (protección XSS)
2. **Cookies encriptadas** - Rails `cookies.encrypted` con AES-256-GCM
3. **SameSite: Lax** - Protección CSRF en cookies
4. **Secure flag** - Cookies solo sobre HTTPS en producción
5. **Access token corto** (1 hora) - Minimiza ventana de exposición
6. **Refresh token en DB** - Permite revocación real (logout, despidos)
7. **Token rotation** - Nuevo refresh token en cada ciclo (previene replay)
8. **Usuarios deshabilitables** - Campo `active` en users/owners
9. **CSRF protection** - Rails built-in con `protect_from_forgery`
10. **Rate limiting** - Proteger endpoints de auth (TODO: Fase posterior)
11. **Password requirements** - Mínimo 8 caracteres
12. **Limpieza automática** - Job diario elimina tokens viejos
13. **SECRET_KEY seguro** - Solo accesible en servidor (credentials.yml.enc)

---

## Fuentes

- [Requisitos INSAI SIGMAV](https://confesal.com/registro-insai-sigmav/)
- [Federación Colegios Médicos Veterinarios Venezuela](https://fcmvv.com/)
- [Ley de Ejercicio de Medicina Veterinaria](https://docs.venezuela.justia.com/federales/leyes/ley-de-ejercicio-de-la-medicina-veterinaria.pdf)
