# 022 - Plan de Resolución de Conflictos: Merge main → feat/staff-section

## Contexto

Se está haciendo merge de `origin/main` en la rama `feat/staff-section`. Hay 15 archivos con conflictos que necesitan resolución manual.

## Archivos con Conflictos

| # | Archivo | Tipo | Estrategia |
|---|---------|------|------------|
| 1 | `app/controllers/admin/staff_controller.rb` | AA | Combinar |
| 2 | `app/controllers/admin_pages_controller.rb` | UU | Combinar |
| 3 | `app/frontend/api/AdminStaff.ts` | AA | Usar HEAD + tipos |
| 4 | `app/frontend/hooks/useAdminStaff.ts` | AA | Combinar |
| 5 | `app/frontend/pages/admin/components/AdminLayout.tsx` | UU | Usar HEAD |
| 6 | `app/frontend/pages/admin/components/AdminSidebar.tsx` | UU | Usar HEAD |
| 7 | `app/frontend/pages/admin/staff/StaffIndex.tsx` | AA | Combinar |
| 8 | `app/frontend/pages/admin/staff/components/StaffDetail.tsx` | AA | Combinar |
| 9 | `app/frontend/pages/admin/staff/components/StaffForm.tsx` | AA | Combinar |
| 10 | `app/frontend/pages/admin/staff/components/StaffList.tsx` | AA | Combinar |
| 11 | `app/frontend/store/index.ts` | UU | Combinar |
| 12 | `app/frontend/store/slices/adminStaffSlice.ts` | AA | Combinar |
| 13 | `lib/tasks/chepino.rake` | UU | Usar HEAD |
| 14 | `package-lock.json` | UU | Regenerar |
| 15 | `spec/requests/admin/staff_spec.rb` | AA | Combinar |

---

## Análisis: Qué tiene cada rama

### HEAD (feat/staff-section) - Ventajas:
- Tipo `StaffMember` dedicado en `@/types/Staff`
- Sidebar configurado desde backend (`SidebarConfig`) - más flexible
- Action `Users::FilterUsers` para filtrado (sigue convención del proyecto)
- Mensajes de error en español
- `user_response` explícito con todos los campos

### origin/main - Ventajas:
- `useAdminStaff`: opciones `autoFetch`, `selectedUserId`, useEffects automáticos
- `StaffDetail`: UI con grid 2 columnas, `BooleanItem` visual, más íconos
- `StaffForm`: `useEffect` que reinicia form al cambiar `user.id`
- `StaffList`: `<Table>` con headers, paginación con números de página
- `staff_spec.rb`: test `does not expose password_digest`, usa path helpers
- `store/index.ts`: slices adicionales (services, staffSchedules, appointments)

---

## Plan de Resolución por Archivo

### 1. `app/controllers/admin/staff_controller.rb`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | `Users::FilterUsers` action, `filter_params`, `user_response` explícito |
| HEAD | Mensajes en español ("No autorizado", "Usuario no encontrado") |
| Main | `status: :ok` en respuestas (consistencia) |
| Main | `active` en `user_params` permitido |

---

### 2. `app/controllers/admin_pages_controller.rb`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | `authorize_staff_viewer!` para acceso expandido (assistant, finances) |
| HEAD | Método `staff` con `readOnly: current_user.assistant?` |
| Main | `appointments` en `page_action?` |

---

### 3. `app/frontend/api/AdminStaff.ts`
**Estrategia**: Usar HEAD + mantener tipos exportados

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Imports de `@/types/Staff` |
| HEAD | `StaffResponse` con `success?: boolean` |
| HEAD | Estructura de clase completa |

**Nota**: Los tipos `CreateStaffParams`, `UpdateStaffParams`, `StaffFilters` ya están en `@/types/Staff`, no se duplican.

---

### 4. `app/frontend/hooks/useAdminStaff.ts`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Tipos de `@/types/Staff` |
| HEAD | Interfaz `UseAdminStaffResult` explícita |
| HEAD | Manejo de errores con `finally { setLoading(false) }` |
| Main | Opciones `autoFetch`, `selectedUserId`, `initialFilters` |
| Main | `useEffect` para autoFetch en mount |
| Main | `useEffect` para fetch selectedUser cuando cambia id |

---

### 5. `app/frontend/pages/admin/components/AdminLayout.tsx`
**Estrategia**: Usar HEAD

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Props con `sidebarConfig: SidebarConfig` |
| HEAD | `<AdminSidebar currentPath={url} config={sidebarConfig} />` |

**Razón**: El sidebar backend-driven es más flexible y ya está implementado.

---

### 6. `app/frontend/pages/admin/components/AdminSidebar.tsx`
**Estrategia**: Usar HEAD

| Origen | Qué tomar |
|--------|-----------|
| HEAD | `SidebarConfig` type del backend |
| HEAD | `iconMap` para mapear strings a componentes Lucide |
| HEAD | `NavItem` y `NavSection` components |

**Razón**: Control de acceso en backend es más seguro y flexible.

---

### 7. `app/frontend/pages/admin/staff/StaffIndex.tsx`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Props con `sidebarConfig` |
| HEAD | `<AdminLayout user={user} sidebarConfig={sidebarConfig}>` |
| Main | `onClearError` pasado a componentes hijos |
| Main | Separación `handleSaveCreate` / `handleSaveEdit` (más claro) |
| Main | `fetchUsers(updated)` después de cambiar filtros |

---

### 8. `app/frontend/pages/admin/staff/components/StaffDetail.tsx`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Tipo `StaffMember` de `@/types/Staff` |
| HEAD | `ROLE_LABELS`, `isVetRole()` de types |
| Main | Layout grid 2 columnas (`md:grid-cols-2`) |
| Main | `BooleanItem` component para permisos |
| Main | `Separator` entre secciones |
| Main | Íconos adicionales (Stethoscope, Shield, CheckCircle, XCircle) |
| Main | Card separada para "Información de Cuenta" |

---

### 9. `app/frontend/pages/admin/staff/components/StaffForm.tsx`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Tipos de `@/types/Staff` |
| HEAD | `handleRoleChange` que limpia campos vet al cambiar rol |
| HEAD | `validateForm()` separada |
| Main | `useEffect` con `prevUserIdRef` para reiniciar form al cambiar usuario |
| Main | `onClearError` prop |
| Main | Layout grid 2 columnas para cards |
| Main | Checkbox "Usuario activo" en modo edit |

---

### 10. `app/frontend/pages/admin/staff/components/StaffList.tsx`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Tipo `StaffMember` de `@/types/Staff` |
| HEAD | `ROLE_LABELS` de types |
| Main | `<Table>` con TableHeader, TableBody, TableRow, TableCell |
| Main | Paginación con números de página (PaginationLink) |
| Main | `onClearError` prop |
| Main | Header con ícono Users y descripción |

---

### 11. `app/frontend/store/index.ts`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | `adminStaffReducer` |
| Main | `servicesReducer` |
| Main | `staffSchedulesReducer` |
| Main | `appointmentsReducer` |

---

### 12. `app/frontend/store/slices/adminStaffSlice.ts`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Tipo `StaffMember` de `@/types/Staff` |
| HEAD | `setUsers` que recibe `{ users, pagination }` junto |
| HEAD | `clearState` (reset completo) |
| Main | Mantener compatibilidad con el hook modificado |

---

### 13. `lib/tasks/chepino.rake`
**Estrategia**: Usar HEAD

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Formato con indentación correcta |

**Razón**: Solo diferencia de formato, sin cambio funcional.

---

### 14. `package-lock.json`
**Estrategia**: Regenerar

**Pasos**:
1. Aceptar versión de HEAD
2. Ejecutar `npm install` para regenerar lockfile

**Razón**: Lockfiles no deben resolverse manualmente.

---

### 15. `spec/requests/admin/staff_spec.rb`
**Estrategia**: Combinar

| Origen | Qué tomar |
|--------|-----------|
| HEAD | Setup con `let!` para usuarios |
| HEAD | Tests de búsqueda por email, username |
| HEAD | Tests de `password_confirmation` |
| HEAD | Test `revokes refresh tokens when deleting user` |
| HEAD | Mensajes en español en expectations |
| Main | Test `does not expose password_digest` |
| Main | Test `excludes deleted users` |
| Main | Path helpers (`admin_staff_list_path`, `admin_staff_path`) |

---

## Resumen de Estrategias

| Estrategia | Cantidad | Archivos |
|------------|----------|----------|
| **Combinar** | 11 | controller, pages_controller, hook, StaffIndex, StaffDetail, StaffForm, StaffList, store/index, slice, spec |
| **Usar HEAD** | 3 | AdminLayout, AdminSidebar, chepino.rake |
| **Usar HEAD + tipos** | 1 | AdminStaff.ts API |
| **Regenerar** | 1 | package-lock.json |

---

## Pasos de Ejecución

1. Resolver cada archivo según las tablas de arriba
2. Verificar que `@/types/Staff` tenga todos los tipos necesarios
3. Regenerar `package-lock.json` con `npm install`
4. Ejecutar `bundle exec rspec spec/requests/admin/staff_spec.rb`
5. Ejecutar `npm run lint`
6. Crear commit de merge

---

## Verificación Post-Merge

- [ ] Staff list muestra tabla con paginación numérica
- [ ] Staff detail muestra grid 2 columnas
- [ ] Staff form reinicia al cambiar usuario
- [ ] Sidebar viene del backend
- [ ] Tests pasan
- [ ] Lint pasa
