<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2024
Notas: Convención establecida en .claude/rules/api-json-convention.md
Aplicada en todos los controladores existentes
-->

# 006 - Estandarización de API JSON

## Resumen

Toda la comunicación API usa JSON con wrappers de modelo (convención Rails). Sin FormData para datos. Endpoints separados para archivos. Autenticación via cookies httpOnly.

---

## Arquitectura

| Aspecto | Convención |
|---------|------------|
| Datos | JSON con wrapper de modelo (`{ pet: {...} }`) |
| Archivos | Endpoint separado `POST /:id/photo` |
| Query params | URLSearchParams |
| Autenticación | Cookies httpOnly (automático) |
| FormData | Solo para uploads en endpoint dedicado |

---

## User Stories

### US-001: JSON con wrappers de modelo

**Como** desarrollador
**Quiero** enviar JSON con wrappers de modelo
**Para** seguir convenciones Rails y validación implícita con `require`

**Criterios de aceptación:**
- [ ] Frontend envía `{ pet: { name: "Max", species: "dog" } }`
- [ ] Backend usa `params.require(:pet).permit(...)`
- [ ] No se usa FormData para datos regulares

**Archivos:**
- `app/frontend/api/Pets.ts`
- `app/frontend/api/Adoptions.ts`
- `app/controllers/pets_controller.rb`
- `app/controllers/admin/pets_controller.rb`
- `app/controllers/admin/adoptions_controller.rb`

---

### US-002: Endpoints separados para archivos

**Como** desarrollador
**Quiero** subir archivos en endpoints dedicados
**Para** mantener JSON puro en CRUD principal

**Criterios de aceptación:**
- [ ] `POST /pets/:id/photo` para subir foto
- [ ] `DELETE /pets/:id/photo` para eliminar foto
- [ ] CRUD principal (`POST /pets`, `PATCH /pets/:id`) solo recibe JSON
- [ ] FormData solo se usa en endpoints de archivos

**Archivos:**
- `app/frontend/api/Pets.ts` - métodos `uploadPhoto()` y `deletePhoto()`
- `app/controllers/pets_controller.rb` - acciones `photo` y `delete_photo`
- `app/controllers/admin/pets_controller.rb` - acciones `photo` y `delete_photo`

---

### US-003: Autenticación via cookies httpOnly

**Como** desarrollador
**Quiero** autenticación automática via cookies
**Para** prevenir XSS y simplificar código

**Criterios de aceptación:**
- [ ] `withCredentials: true` en cliente Axios
- [ ] No se almacena token en localStorage/sessionStorage
- [ ] No se envía token en headers Authorization

**Archivos:**
- `app/frontend/lib/request.ts`
- `app/controllers/concerns/authenticatable.rb`

---

## Cambios Requeridos

### Frontend

| Archivo | Estado Actual | Cambio Requerido |
|---------|---------------|------------------|
| `Auth.ts` | JSON plano | Agregar wrapper si aplica |
| `Profile.ts` | JSON plano | Mantener (no es recurso CRUD) |
| `Users.ts` | JSON plano | Agregar wrapper `{ user: {...} }` |
| `Pets.ts` (Owner) | Wrapper + FormData | Quitar FormData, mantener wrapper |
| `Pets.ts` (Admin) | FormData siempre | Cambiar a JSON + wrapper + `uploadPhoto()` |
| `Adoptions.ts` | Wrapper | Mantener wrapper |

### Backend

Los controladores ya usan `params.require(:model)` correctamente. Solo verificar que no acepten FormData en acciones CRUD.

---

## Checklist

- [ ] `Pets.ts` usa JSON con wrapper `{ pet: {...} }`, sin FormData
- [ ] `AdminPets` usa JSON con wrapper `{ pet: {...} }` + método `uploadPhoto()`
- [ ] `Adoptions.ts` usa JSON con wrapper `{ adoption: {...} }`
- [ ] `Users.ts` usa JSON con wrapper `{ user: {...} }`
- [ ] Todos los clientes API tienen métodos `uploadPhoto()`/`deletePhoto()` cuando aplica
- [ ] `npm run push` pasa
