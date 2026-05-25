<!--
STATUS: ✅ COMPLETADO
Creado: 2026-02-08
Completado: 2026-02-08
Objetivo: Estandarizar notificaciones toast en todos los hooks CRUD
Hooks modificados: usePets, useAdoptions, useSponsorships, useAdminStaff, useAdminOwners
Total toast.success agregados: 22
Total toast.error agregados: 22
-->

# Plan: Estandarizacion de Notificaciones Toast en Operaciones CRUD

## Resumen

Varios hooks de operaciones CRUD no implementan notificaciones toast para feedback al usuario. Este plan estandariza el patron de notificaciones en todos los hooks del sistema.

**Problema**: 5 hooks criticos no muestran feedback visual al usuario tras operaciones CRUD
**Solucion**: Agregar `toast.success()` y `toast.error()` siguiendo el patron existente
**Impacto**: Mejora significativa en UX para administracion de mascotas, adopciones y personal

---

## Estado Actual

### Hooks CON Toast (Patron Correcto)

| Hook | Operaciones | Estado |
|------|-------------|--------|
| `useAppointments.ts` | create, edit, delete, markAsPaid | ✅ Completo |
| `usePayments.ts` | create, edit, register, extend, cancel | ✅ Completo |
| `useServices.ts` | create, update, delete | ✅ Completo |
| `useProducts.ts` | create, edit, delete, stock operations | ✅ Completo |
| `useStaffSchedules.ts` | create, update, delete | ✅ Completo |
| `useShifts.ts` | updateClinic, updateStaff, exceptions | ✅ Completo |
| `useFinancial.ts` | expenses, refunds | ✅ Completo |
| `useContent.ts` | promotions, announcements, campaigns | ✅ Completo |
| `useServiceCategories.ts` | create, edit, delete | ✅ Completo |

### Hooks SIN Toast (Requieren Cambios)

| Hook | Operaciones Sin Toast | Prioridad |
|------|----------------------|-----------|
| `usePets.ts` | create, edit, delete, uploadPhoto, deletePhoto | 🔴 Alta |
| `useAdoptions.ts` | createAdoption | 🔴 Alta |
| `useSponsorships.ts` | create, cancel | 🔴 Alta |
| `useAdminStaff.ts` | create, edit, delete (usa return object) | 🟡 Media |
| `useAdminOwners.ts` | createOwner, editOwner, createPet, editPet, photos | 🟡 Media |

---

## Patron a Implementar

### Patron Estandar (de useAppointments.ts)

```typescript
import { toast } from 'sonner'

const createItem = async (data: ItemParams) => {
  try {
    const response = await api.create(data)
    dispatch(addItem(response.item))
    toast.success('Registro creado exitosamente')  // ✅ Agregar
    return response.item
  } catch (err) {
    const errorMessage = err instanceof Error
      ? err.message
      : 'Error al crear el registro'
    toast.error(errorMessage)  // ✅ Agregar
    dispatch(setError(errorMessage))
    throw err
  }
}
```

### Mensajes Estandar

| Operacion | Mensaje Exito | Mensaje Error |
|-----------|---------------|---------------|
| Create | "{Entidad} creado/a exitosamente" | "Error al crear {entidad}" |
| Update | "{Entidad} actualizado/a correctamente" | "Error al actualizar {entidad}" |
| Delete | "{Entidad} eliminado/a" | "Error al eliminar {entidad}" |
| Upload | "Imagen subida correctamente" | "Error al subir imagen" |
| Cancel | "{Entidad} cancelado/a" | "Error al cancelar {entidad}" |

---

## User Stories

### Epic 1: Hooks de Alta Prioridad

#### US-1.1: Agregar toast a usePets.ts
**Como** administrador de la clinica
**Quiero** ver notificaciones cuando gestiono mascotas
**Para** saber si mis acciones fueron exitosas o fallaron

**Criterios de aceptacion:**
- [ ] Importar `toast` de `sonner` en usePets.ts
- [ ] Agregar `toast.success('Mascota creada exitosamente')` en createPet
- [ ] Agregar `toast.success('Mascota actualizada correctamente')` en editPet
- [ ] Agregar `toast.success('Mascota eliminada')` en deletePet
- [ ] Agregar `toast.success('Foto subida correctamente')` en uploadPhoto
- [ ] Agregar `toast.success('Foto eliminada')` en deletePhoto
- [ ] Agregar `toast.error(message)` en todos los catch blocks
- [ ] Verificar funcionamiento en /admin/pets

**Archivos:**
- `app/frontend/hooks/usePets.ts`

---

#### US-1.2: Agregar toast a useAdoptions.ts
**Como** veterinario o recepcionista
**Quiero** ver notificaciones al registrar adopciones
**Para** confirmar que la adopcion se registro correctamente

**Criterios de aceptacion:**
- [ ] Importar `toast` de `sonner` en useAdoptions.ts
- [ ] Agregar `toast.success('Adopcion registrada exitosamente')` en createAdoption
- [ ] Agregar `toast.error(message)` en catch block
- [ ] Verificar funcionamiento en /admin/adoptions

**Archivos:**
- `app/frontend/hooks/useAdoptions.ts`

---

#### US-1.3: Agregar toast a useSponsorships.ts
**Como** administrador
**Quiero** ver notificaciones al gestionar apadrinamientos
**Para** confirmar las acciones realizadas

**Criterios de aceptacion:**
- [ ] Importar `toast` de `sonner` en useSponsorships.ts
- [ ] Agregar `toast.success('Apadrinamiento creado exitosamente')` en createSponsorship
- [ ] Agregar `toast.success('Apadrinamiento cancelado')` en cancelSponsorship
- [ ] Agregar `toast.error(message)` en todos los catch blocks
- [ ] Verificar funcionamiento en /admin/sponsorships

**Archivos:**
- `app/frontend/hooks/useSponsorships.ts`

---

### Epic 2: Hooks con Patron Diferente

#### US-2.1: Refactorizar useAdminStaff.ts
**Como** administrador o HR
**Quiero** ver notificaciones al gestionar personal
**Para** confirmar que las acciones sobre empleados se completaron

**Criterios de aceptacion:**
- [ ] Importar `toast` de `sonner` en useAdminStaff.ts
- [ ] Modificar createUser para agregar toast.success/error
- [ ] Modificar editUser para agregar toast.success/error
- [ ] Modificar deleteUser para agregar toast.success/error
- [ ] Mantener compatibilidad con return object si es necesario
- [ ] Verificar funcionamiento en /admin/users

**Archivos:**
- `app/frontend/hooks/useAdminStaff.ts`

---

#### US-2.2: Refactorizar useAdminOwners.ts
**Como** administrador
**Quiero** ver notificaciones al gestionar propietarios
**Para** confirmar que los cambios se guardaron

**Criterios de aceptacion:**
- [ ] Importar `toast` de `sonner` en useAdminOwners.ts
- [ ] Agregar toast a createOwner (exito/error)
- [ ] Agregar toast a editOwner (exito/error)
- [ ] Agregar toast a createPet (exito/error)
- [ ] Agregar toast a editPet (exito/error)
- [ ] Agregar toast a uploadPetPhoto (exito/error)
- [ ] Agregar toast a deletePetPhoto (exito/error)
- [ ] Verificar funcionamiento en /admin/owners

**Archivos:**
- `app/frontend/hooks/useAdminOwners.ts`

---

### Epic 3: Verificacion y Documentacion

#### US-3.1: Verificar implementacion completa
**Como** desarrollador
**Quiero** verificar que todos los hooks usan toast
**Para** asegurar consistencia en toda la aplicacion

**Criterios de aceptacion:**
- [ ] Ejecutar grep para verificar imports de toast en todos los hooks
- [ ] Probar cada operacion CRUD manualmente
- [ ] Verificar que los mensajes son coherentes y en espanol
- [ ] Documentar cualquier excepcion justificada

**Comandos de verificacion:**
```bash
# Verificar imports de toast
grep -r "from 'sonner'" app/frontend/hooks/

# Verificar uso de toast.success
grep -r "toast.success" app/frontend/hooks/

# Verificar uso de toast.error
grep -r "toast.error" app/frontend/hooks/
```

---

#### US-3.2: Actualizar documentacion
**Como** usuario de la documentacion
**Quiero** que el UserManual refleje las notificaciones
**Para** saber que feedback esperar

**Criterios de aceptacion:**
- [ ] Actualizar `UserManual/crud-operations.md` con estado real
- [ ] Marcar este plan como COMPLETADO
- [ ] Actualizar tabla en `SESION-DIDACTICA-2.md`

**Archivos:**
- `UserManual/crud-operations.md`
- `SESION-DIDACTICA-2.md`
- `.docs/031-toast-notifications-standardization.md`

---

## Orden de Implementacion

### Fase 1: Hooks de Alta Prioridad (Dia 1)
1. US-1.1: usePets.ts
2. US-1.2: useAdoptions.ts
3. US-1.3: useSponsorships.ts

### Fase 2: Hooks con Patron Diferente (Dia 2)
4. US-2.1: useAdminStaff.ts
5. US-2.2: useAdminOwners.ts

### Fase 3: Verificacion (Dia 3)
6. US-3.1: Verificacion completa
7. US-3.2: Actualizacion de documentacion

---

## Archivos a Modificar

```
app/frontend/hooks/
├── usePets.ts              [❌ → ✅] Agregar toast
├── useAdoptions.ts         [❌ → ✅] Agregar toast
├── useSponsorships.ts      [❌ → ✅] Agregar toast
├── useAdminStaff.ts        [⚠️ → ✅] Refactorizar + toast
└── useAdminOwners.ts       [⚠️ → ✅] Refactorizar + toast
```

---

## Verificacion Final

### Checklist Pre-Merge
- [ ] Todos los hooks tienen import de `toast` de `sonner`
- [ ] Todas las operaciones create tienen toast.success
- [ ] Todas las operaciones update tienen toast.success
- [ ] Todas las operaciones delete tienen toast.success
- [ ] Todos los catch blocks tienen toast.error
- [ ] Los mensajes son coherentes y en espanol
- [ ] Tests existentes siguen pasando
- [ ] Sin regresiones en funcionalidad

### Comandos de Verificacion
```bash
# Verificar lint
npm run lint

# Ejecutar tests
bundle exec rspec
npm run test

# CI completo
npm run push
```

---

## Notas Adicionales

### Dependencia
- `sonner` ya esta instalado en el proyecto
- El componente `<Toaster />` ya esta montado en el layout principal

### Consideraciones
- Mantener mensajes concisos (max ~50 caracteres)
- Usar espanol neutro (latinoamerica)
- Evitar mensajes tecnicos en errores de usuario
- Para errores del servidor, mostrar mensaje generico + log en consola
