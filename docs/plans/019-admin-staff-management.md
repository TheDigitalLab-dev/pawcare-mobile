# Plan: Gestión de Personal (Staff) en Admin

## Resumen

Implementar el módulo de gestión de usuarios/staff en el dashboard de administración, permitiendo crear, editar, listar y eliminar usuarios con diferentes roles.

**Acceso restringido**: Solo usuarios con rol `admin` o `hr`.

---

## User Stories

### US-1: Ver lista de personal
**Como** administrador o recursos humanos
**Quiero** ver una lista de todo el personal del sistema
**Para** tener visibilidad de los usuarios registrados

**Criterios de aceptación:**
- [ ] La lista muestra: nombre completo, email, rol, estado (activo/inactivo)
- [ ] Puedo filtrar por rol (admin, vet, vet_assistant, assistant, finances, hr)
- [ ] Puedo buscar por nombre o email
- [ ] La lista tiene paginación
- [ ] Solo usuarios con rol `admin` o `hr` pueden acceder

---

### US-2: Ver detalle de un usuario
**Como** administrador o recursos humanos
**Quiero** ver los detalles completos de un usuario
**Para** conocer toda su información

**Criterios de aceptación:**
- [ ] Muestra información personal: nombre, email, username, documento de identidad
- [ ] Muestra información de contacto: teléfono, tipo de teléfono, dirección
- [ ] Muestra rol y permisos especiales (para veterinarios)
- [ ] Muestra estado: activo/inactivo
- [ ] Botones para editar y eliminar

---

### US-3: Crear nuevo usuario
**Como** administrador o recursos humanos
**Quiero** crear un nuevo usuario en el sistema
**Para** agregar personal a la plataforma

**Criterios de aceptación:**
- [ ] Formulario con campos obligatorios: nombre, apellido, email, username, documento, rol, contraseña
- [ ] Campos opcionales: teléfono, dirección, sexo
- [ ] Si el rol es `vet` o `vet_assistant`, mostrar campos adicionales:
  - Número de colegio, región del colegio
  - Número RUNSAI, número SACS
  - Código brucelosis, fecha brucelosis
  - Permisos: puede vacunar, puede emitir guías, puede emitir certificados
- [ ] Validaciones en frontend y backend
- [ ] Mensaje de éxito/error al guardar
- [ ] Redirige a lista después de crear

---

### US-4: Editar usuario existente
**Como** administrador o recursos humanos
**Quiero** editar la información de un usuario
**Para** mantener los datos actualizados

**Criterios de aceptación:**
- [ ] Formulario precargado con datos actuales
- [ ] No se puede cambiar email ni username (campos deshabilitados)
- [ ] Contraseña es opcional (solo si se quiere cambiar)
- [ ] Validaciones en frontend y backend
- [ ] Mensaje de éxito/error al guardar

---

### US-5: Desactivar/Eliminar usuario
**Como** administrador o recursos humanos
**Quiero** desactivar o eliminar un usuario
**Para** revocar su acceso al sistema

**Criterios de aceptación:**
- [ ] Confirmación antes de eliminar
- [ ] Soft delete (marca como eliminado, no borra de la base de datos)
- [ ] Usuario eliminado no puede iniciar sesión
- [ ] Mensaje de éxito/error

---

### US-6: Restricción de acceso
**Como** sistema
**Quiero** restringir el acceso al módulo de personal
**Para** que solo admin y hr puedan gestionar usuarios

**Criterios de aceptación:**
- [ ] Backend: retorna 403 si el usuario no es admin o hr
- [ ] Frontend: no muestra la opción en el sidebar si no tiene permisos
- [ ] Redirección si intenta acceder directamente por URL

---

## Arquitectura

### Roles de Usuario (enum en User model)

```ruby
enum :role, { admin: 0, vet: 1, vet_assistant: 2, assistant: 3, finances: 4, hr: 5 }
```

### Permisos

| Rol | Puede ver staff | Puede crear/editar/eliminar |
|-----|-----------------|----------------------------|
| admin | ✅ | ✅ |
| hr | ✅ | ✅ |
| vet | ❌ | ❌ |
| vet_assistant | ❌ | ❌ |
| assistant | ❌ | ❌ |
| finances | ❌ | ❌ |

### Recursos Existentes a Reutilizar

#### Backend - Paginatable Concern (`app/controllers/concerns/paginatable.rb`)

```ruby
# Ya existe y provee:
include Paginatable

# Métodos disponibles:
paginate(collection, default_per_page: 25)  # Retorna [paginated, pagination_meta]
pagination_meta(total, per)                  # Genera hash de paginación
page                                         # Número de página actual
per_page(default: 25)                        # Items por página
```

#### Frontend - PaginationMeta Type (`@/api/Pets.ts`)

```typescript
// Ya existe - importar desde @/api/Pets, NO crear nuevo
import type { PaginationMeta } from '@/api/Pets'

interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}
```

#### Frontend - Pagination UI (`@/components/ui/pagination.tsx`)

```typescript
// Componentes disponibles:
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination'
```

---

## Implementación

### Fase 1: Backend

#### 1.1 Rutas (`config/routes.rb`)

```ruby
# Página admin (Inertia)
scope :admin do
  # ... rutas existentes ...
  get "staff", to: "admin_pages#staff"  # Solo admin/hr
end

# API admin
namespace :admin do
  # ... rutas existentes ...
  get "staff-list", to: "staff#index"
  resources :staff, only: [:show, :create, :update, :destroy]
end
```

#### 1.2 Controlador de página (`app/controllers/admin_pages_controller.rb`)

```ruby
def staff
  authorize_admin_or_hr!
  render inertia: "admin/staff/StaffIndex", props: {
    user: user_response(current_user)
  }
end

private

def authorize_admin_or_hr!
  return if current_user&.admin? || current_user&.hr?
  render json: { error: "No autorizado" }, status: :forbidden
end
```

#### 1.3 Controlador API (`app/controllers/admin/staff_controller.rb`)

```ruby
module Admin
  class StaffController < ApplicationController
    include Authenticatable
    include Paginatable  # Reutilizar concern existente
    before_action :authenticate_staff!
    before_action :authorize_admin_or_hr!
    before_action :set_user, only: [:show, :update, :destroy]

    def index
      users = User.kept.order(:first_name)
      users = users.where(role: params[:role]) if params[:role].present?
      users = users.where(
        "first_name ILIKE :q OR last_name ILIKE :q OR email ILIKE :q",
        q: "%#{params[:search]}%"
      ) if params[:search].present?

      paginated_users, pagination = paginate(users)  # Usar método del concern

      render json: {
        users: paginated_users.map { |u| user_response(u) },
        pagination: pagination
      }
    end

    def show
      render json: { user: user_response(@user) }
    end

    def create
      result = Users::CreateUser.new(params: user_params).call

      if result.success?
        render json: { user: user_response(result.user) }, status: :created
      else
        render json: { errors: result.errors }, status: :unprocessable_content
      end
    end

    def update
      result = Users::UpdateUser.new(user: @user, params: user_params).call

      if result.success?
        render json: { user: user_response(result.user) }
      else
        render json: { errors: result.errors }, status: :unprocessable_content
      end
    end

    def destroy
      result = Users::DestroyUser.new(user: @user).call

      if result.success?
        render json: { success: true }
      else
        render json: { error: result.error }, status: :unprocessable_content
      end
    end

    private

    def authorize_admin_or_hr!
      return if current_user&.admin? || current_user&.hr?
      render json: { error: "No autorizado" }, status: :forbidden
    end

    def set_user
      @user = User.kept.find(params[:id])
    end

    def filter_params
      params.permit(:search, :role, :page, :per_page)
    end

    def user_params
      params.require(:user).permit(
        :first_name, :last_name, :email, :username, :password,
        :identity_document, :phone, :phone_type, :sex, :address, :role,
        :college_number, :college_region, :runsai_number, :sacs_number,
        :brucellosis_code, :brucellosis_date,
        :can_vaccinate, :can_issue_guides, :can_issue_certificates
      )
    end

    def user_response(user)
      user.as_json(except: [:password_digest, :deleted_at])
    end
  end
end
```

#### 1.4 Actions Existentes (verificar que existen)

Los actions CRUD ya existen en `app/actions/users/`:
- `Users::CreateUser` - Crear usuario
- `Users::UpdateUser` - Actualizar usuario
- `Users::DestroyUser` - Soft delete usuario

**Nota**: La lógica de filtrado y paginación está en el controlador usando el concern `Paginatable`, no requiere action separado.

---

### Fase 2: Frontend

#### 2.1 Types (`app/frontend/types/User.ts`)

Verificar que existan estos tipos:

```typescript
export type UserRole = 'admin' | 'vet' | 'vet_assistant' | 'assistant' | 'finances' | 'hr'

export interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  username: string
  identity_document: string
  phone?: string
  phone_type?: 'whatsapp' | 'telegram' | 'regular'
  sex?: 'male' | 'female' | 'other'
  address?: string
  role: UserRole
  active: boolean
  // Campos veterinarios
  college_number?: string
  college_region?: string
  runsai_number?: string
  sacs_number?: string
  brucellosis_code?: string
  brucellosis_date?: string
  can_vaccinate?: boolean
  can_issue_guides?: boolean
  can_issue_certificates?: boolean
  specialty?: string
  created_at: string
  updated_at: string
}

export interface CreateUserParams {
  first_name: string
  last_name: string
  email: string
  username: string
  password: string
  identity_document: string
  role: UserRole
  phone?: string
  phone_type?: 'whatsapp' | 'telegram' | 'regular'
  sex?: 'male' | 'female' | 'other'
  address?: string
  // Campos veterinarios opcionales
  college_number?: string
  college_region?: string
  can_vaccinate?: boolean
  can_issue_guides?: boolean
  can_issue_certificates?: boolean
}

export interface UpdateUserParams extends Partial<Omit<CreateUserParams, 'email' | 'username'>> {
  password?: string
}

export interface StaffFilters {
  search?: string
  role?: UserRole
  page?: number
  per_page?: number
}
```

#### 2.2 API Client (`app/frontend/api/AdminStaff.ts`)

```typescript
import { request } from '@/lib/request'
import type { User, CreateUserParams, UpdateUserParams, StaffFilters } from '@/types/User'
import type { PaginationMeta } from '@/api/Pets'  // Reutilizar tipo existente

export interface StaffListResponse {
  users: User[]
  pagination: PaginationMeta
}

export class AdminStaff {
  async list(filters?: StaffFilters): Promise<StaffListResponse> {
    return request({
      method: 'GET',
      url: '/admin/staff-list',
      params: filters
    })
  }

  async get(id: number): Promise<{ user: User }> {
    return request({
      method: 'GET',
      url: `/admin/staff/${id}`
    })
  }

  async create(params: CreateUserParams): Promise<{ user: User }> {
    return request({
      method: 'POST',
      url: '/admin/staff',
      data: { user: params }
    })
  }

  async update(id: number, params: UpdateUserParams): Promise<{ user: User }> {
    return request({
      method: 'PATCH',
      url: `/admin/staff/${id}`,
      data: { user: params }
    })
  }

  async delete(id: number): Promise<{ success: boolean }> {
    return request({
      method: 'DELETE',
      url: `/admin/staff/${id}`
    })
  }
}

export const adminStaffApi = new AdminStaff()
```

#### 2.3 Redux Slice (`app/frontend/store/slices/adminStaffSlice.ts`)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types/User'
import type { PaginationMeta } from '@/api/Pets'  // Reutilizar tipo existente

interface AdminStaffState {
  users: User[]
  selectedUser: User | null
  pagination: PaginationMeta | null
  isLoading: boolean
  error: string | null
}

const initialState: AdminStaffState = {
  users: [],
  selectedUser: null,
  pagination: null,
  isLoading: false,
  error: null
}

const adminStaffSlice = createSlice({
  name: 'adminStaff',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setUsers: (state, action: PayloadAction<{ users: User[]; pagination: PaginationMeta }>) => {
      state.users = action.payload.users
      state.pagination = action.payload.pagination
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.unshift(action.payload)
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
      if (state.selectedUser?.id === action.payload.id) {
        state.selectedUser = action.payload
      }
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(u => u.id !== action.payload)
      if (state.selectedUser?.id === action.payload) {
        state.selectedUser = null
      }
    }
  }
})

export const {
  setLoading,
  setError,
  setUsers,
  setSelectedUser,
  addUser,
  updateUser,
  removeUser
} = adminStaffSlice.actions

export default adminStaffSlice.reducer
```

#### 2.4 Hook (`app/frontend/hooks/useAdminStaff.ts`)

```typescript
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { adminStaffApi } from '@/api/AdminStaff'
import {
  setLoading,
  setError,
  setUsers,
  setSelectedUser,
  addUser,
  updateUser,
  removeUser
} from '@/store/slices/adminStaffSlice'
import type { StaffFilters, CreateUserParams, UpdateUserParams } from '@/types/User'

export function useAdminStaff() {
  const dispatch = useAppDispatch()
  const { users, selectedUser, pagination, isLoading, error } = useAppSelector(
    state => state.adminStaff
  )

  const fetchUsers = useCallback(async (filters?: StaffFilters) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const response = await adminStaffApi.list(filters)
      dispatch(setUsers({ users: response.users, pagination: response.pagination }))
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Error al cargar usuarios'))
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  const fetchUser = useCallback(async (id: number) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const response = await adminStaffApi.get(id)
      dispatch(setSelectedUser(response.user))
      return response.user
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Error al cargar usuario'))
      return null
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  const createUser = useCallback(async (params: CreateUserParams) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const response = await adminStaffApi.create(params)
      dispatch(addUser(response.user))
      return { success: true, user: response.user }
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.join(', ') || 'Error al crear usuario'
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  const editUser = useCallback(async (id: number, params: UpdateUserParams) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const response = await adminStaffApi.update(id, params)
      dispatch(updateUser(response.user))
      return { success: true, user: response.user }
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.join(', ') || 'Error al actualizar usuario'
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  const deleteUser = useCallback(async (id: number) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      await adminStaffApi.delete(id)
      dispatch(removeUser(id))
      return { success: true }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar usuario'
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  const selectUser = useCallback((user: User | null) => {
    dispatch(setSelectedUser(user))
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(setError(null))
  }, [dispatch])

  return {
    // State
    users,
    selectedUser,
    pagination,
    isLoading,
    error,
    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    editUser,
    deleteUser,
    selectUser,
    clearError
  }
}
```

#### 2.5 Página Principal (`app/frontend/pages/admin/staff/StaffIndex.tsx`)

```typescript
import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import { AdminLayout } from '../components/AdminLayout'
import { useAdminStaff } from '@/hooks/useAdminStaff'
import { StaffList } from './components/StaffList'
import { StaffDetail } from './components/StaffDetail'
import { StaffForm } from './components/StaffForm'
import type { AuthUser } from '@/api/Auth'
import type { UserRole, StaffFilters } from '@/types/User'

type View = 'list' | 'detail' | 'create' | 'edit'

interface StaffIndexProps {
  user: AuthUser
}

export default function StaffIndex({ user }: StaffIndexProps) {
  const [view, setView] = useState<View>('list')
  const [filters, setFilters] = useState<StaffFilters>({ page: 1, per_page: 10 })

  const {
    users,
    selectedUser,
    pagination,
    isLoading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    editUser,
    deleteUser,
    selectUser,
    clearError
  } = useAdminStaff()

  useEffect(() => {
    fetchUsers(filters)
  }, [filters, fetchUsers])

  const handleViewDetail = async (userId: number) => {
    await fetchUser(userId)
    setView('detail')
  }

  const handleCreate = () => {
    selectUser(null)
    setView('create')
  }

  const handleEdit = () => {
    setView('edit')
  }

  const handleBack = () => {
    selectUser(null)
    setView('list')
  }

  const handleSave = async (data: any) => {
    const result = view === 'create'
      ? await createUser(data)
      : await editUser(selectedUser!.id, data)

    if (result.success) {
      setView('list')
      fetchUsers(filters)
    }
    return result
  }

  const handleDelete = async (userId: number) => {
    const result = await deleteUser(userId)
    if (result.success) {
      setView('list')
    }
    return result
  }

  const handleFilterChange = (newFilters: Partial<StaffFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const renderView = () => {
    switch (view) {
      case 'list':
        return (
          <StaffList
            users={users}
            pagination={pagination}
            isLoading={isLoading}
            filters={filters}
            onViewDetail={handleViewDetail}
            onCreate={handleCreate}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
          />
        )
      case 'detail':
        return selectedUser && (
          <StaffDetail
            user={selectedUser}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      case 'create':
      case 'edit':
        return (
          <StaffForm
            user={view === 'edit' ? selectedUser : null}
            mode={view}
            isLoading={isLoading}
            error={error}
            onSave={handleSave}
            onCancel={handleBack}
            onClearError={clearError}
          />
        )
    }
  }

  return (
    <AdminLayout user={user}>
      <Head title="Personal - Admin - PawCare" />
      {renderView()}
    </AdminLayout>
  )
}
```

#### 2.6 Componentes

**Estructura de archivos:**
```
app/frontend/pages/admin/staff/
├── StaffIndex.tsx
└── components/
    ├── StaffList.tsx       # Lista con filtros y paginación
    ├── StaffDetail.tsx     # Vista detalle de usuario
    ├── StaffForm.tsx       # Formulario create/edit
    ├── StaffCard.tsx       # Card para mostrar en lista
    └── StaffFilters.tsx    # Filtros de búsqueda y rol
```

#### 2.7 Actualizar AdminSidebar

En `app/frontend/pages/admin/components/AdminSidebar.tsx`, habilitar la entrada de Personal:

```typescript
// En la sección GESTIÓN
{
  name: 'Personal',
  href: '/admin/staff',
  icon: Users,
  disabled: false,  // Cambiar de true a false
  // Agregar lógica de permisos
  hidden: !['admin', 'hr'].includes(user.role)
}
```

---

### Fase 3: Tests

#### 3.1 Request Specs (`spec/requests/admin/staff_spec.rb`)

```ruby
require 'rails_helper'

RSpec.describe "Admin::Staff", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:hr) { create(:user, :hr) }
  let(:vet) { create(:user, :vet) }

  describe "GET /admin/staff-list" do
    context "when user is admin" do
      before { sign_in(admin) }

      it "returns list of users" do
        create_list(:user, 3)
        get "/admin/staff-list"

        expect(response).to have_http_status(:ok)
        expect(json_response[:users].length).to eq(4) # 3 + admin
      end

      it "filters by role" do
        create(:user, :vet)
        create(:user, :assistant)

        get "/admin/staff-list", params: { role: 'vet' }

        expect(json_response[:users].length).to eq(1)
      end
    end

    context "when user is not admin or hr" do
      before { sign_in(vet) }

      it "returns forbidden" do
        get "/admin/staff-list"
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "POST /admin/staff" do
    let(:valid_params) do
      {
        user: {
          first_name: "Juan",
          last_name: "Pérez",
          email: "juan@example.com",
          username: "juanperez",
          password: "password123",
          identity_document: "12345678",
          role: "assistant"
        }
      }
    end

    context "when user is admin" do
      before { sign_in(admin) }

      it "creates a new user" do
        expect {
          post "/admin/staff", params: valid_params
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
      end
    end

    context "when user is hr" do
      before { sign_in(hr) }

      it "creates a new user" do
        expect {
          post "/admin/staff", params: valid_params
        }.to change(User, :count).by(1)
      end
    end
  end

  describe "DELETE /admin/staff/:id" do
    let!(:target_user) { create(:user, :assistant) }

    context "when user is admin" do
      before { sign_in(admin) }

      it "soft deletes the user" do
        delete "/admin/staff/#{target_user.id}"

        expect(response).to have_http_status(:ok)
        expect(target_user.reload.discarded?).to be true
      end
    end
  end
end
```

#### 3.2 Factory (`spec/factories/users.rb`)

Verificar que existan los traits necesarios:

```ruby
FactoryBot.define do
  factory :user do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.unique.email }
    username { Faker::Internet.unique.username }
    password { "password123" }
    identity_document { Faker::IDNumber.unique.valid }
    role { :assistant }

    trait :admin do
      role { :admin }
    end

    trait :hr do
      role { :hr }
    end

    trait :vet do
      role { :vet }
    end

    trait :assistant do
      role { :assistant }
    end
  end
end
```

---

## Orden de Implementación

### Sprint 1: Backend
1. [ ] Verificar que existan actions `Users::CreateUser`, `Users::UpdateUser`, `Users::DestroyUser`
2. [ ] Crear controlador `Admin::StaffController` (usando `Paginatable` concern)
3. [ ] Agregar rutas en `config/routes.rb`
4. [ ] Agregar método `staff` en `AdminPagesController`
5. [ ] Escribir request specs
6. [ ] Ejecutar tests y verificar

### Sprint 2: Frontend - Estructura
1. [ ] Crear/verificar types en `types/User.ts`
2. [ ] Crear API client `api/AdminStaff.ts`
3. [ ] Crear Redux slice `store/slices/adminStaffSlice.ts`
4. [ ] Registrar slice en `store/index.ts`
5. [ ] Crear hook `hooks/useAdminStaff.ts`

### Sprint 3: Frontend - UI
1. [ ] Crear página `pages/admin/staff/StaffIndex.tsx`
2. [ ] Crear componente `StaffList.tsx`
3. [ ] Crear componente `StaffDetail.tsx`
4. [ ] Crear componente `StaffForm.tsx`
5. [ ] Crear componentes auxiliares (Card, Filters)

### Sprint 4: Integración
1. [ ] Actualizar `AdminSidebar.tsx` con entrada de Personal
2. [ ] Agregar lógica de permisos en sidebar
3. [ ] Probar flujo completo
4. [ ] Ajustes de UI/UX

---

## Consideraciones de Seguridad

1. **Autorización en backend**: Siempre verificar rol antes de cualquier acción
2. **No exponer password_digest**: Excluir en responses
3. **Soft delete**: No eliminar registros permanentemente
4. **Validación de rol**: No permitir crear usuarios con rol superior al propio
5. **Contraseñas**: Mínimo 8 caracteres, validación en frontend y backend

---

## Notas Adicionales

- El módulo existente de `UsersController` (sin namespace admin) podría reutilizarse, pero se recomienda crear uno nuevo en `Admin::` para mantener separación de concerns
- Los campos de veterinario (college_number, etc.) solo aplican para roles `vet` y `vet_assistant`
- La UI debe mostrar/ocultar campos dinámicamente según el rol seleccionado
