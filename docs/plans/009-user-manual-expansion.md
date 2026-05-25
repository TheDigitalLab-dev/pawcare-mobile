<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2025
Archivos: 9 archivos .md en UserManual/
Incluye: Index, authentication, profile-management, my-pets, admin-pets, admin-adoptions, admin-users, color-palette-configuration, landing-configuration
-->

# Plan: Expansión del Manual de Usuario

## Epic 1: Autenticación y Gestión de Cuenta

### US-1.1: Documentar proceso de inicio de sesión
**Como** usuario nuevo
**Quiero** entender cómo iniciar sesión en PawCare
**Para** acceder a mi cuenta y gestionar mis mascotas

**Criterios de aceptación:**
- [ ] Documento explica cómo acceder a la página de login
- [ ] Incluye screenshots del formulario de login
- [ ] Explica qué hacer si olvido mi contraseña
- [ ] Describe los diferentes tipos de usuario (Owner vs Staff)
- [ ] Incluye troubleshooting de errores comunes (credenciales incorrectas, cuenta bloqueada)

**Archivos:**
- `UserManual/authentication.md` (nuevo)
- `UserManual/Index.md` (actualizar)

---

### US-1.2: Documentar proceso de registro
**Como** nuevo propietario de mascota
**Quiero** entender cómo registrarme en PawCare
**Para** crear mi cuenta y empezar a usar el sistema

**Criterios de aceptación:**
- [ ] Documento explica paso a paso el proceso de registro
- [ ] Lista todos los campos requeridos (nombre, email, username, cédula, teléfono)
- [ ] Explica requisitos de contraseña
- [ ] Incluye screenshots del formulario
- [ ] Describe qué hacer después de registrarse

**Archivos:**
- `UserManual/authentication.md` (actualizar)

---

### US-1.3: Documentar recuperación de contraseña
**Como** usuario que olvidó su contraseña
**Quiero** entender cómo recuperar el acceso a mi cuenta
**Para** poder volver a usar PawCare

**Criterios de aceptación:**
- [ ] Documento explica el proceso de "Olvidé mi contraseña"
- [ ] Describe cómo solicitar el email de recuperación
- [ ] Explica cómo usar el link de reseteo
- [ ] Incluye tiempo de expiración del token (24 horas)
- [ ] Troubleshooting si no recibo el email

**Archivos:**
- `UserManual/authentication.md` (actualizar)

---

## Epic 2: Gestión de Perfil

### US-2.1: Documentar actualización de perfil
**Como** usuario registrado
**Quiero** saber cómo actualizar mi información personal
**Para** mantener mis datos al día

**Criterios de aceptación:**
- [ ] Documento explica cómo acceder a la página de perfil
- [ ] Lista todos los campos editables (nombre, email, teléfono, dirección)
- [ ] Explica qué campos no se pueden cambiar (username, identity_document)
- [ ] Incluye screenshots del formulario de perfil
- [ ] Describe validaciones (email único, formato de teléfono)

**Archivos:**
- `UserManual/profile-management.md` (nuevo)
- `UserManual/Index.md` (actualizar)

---

### US-2.2: Documentar cambio de contraseña
**Como** usuario preocupado por la seguridad
**Quiero** saber cómo cambiar mi contraseña
**Para** proteger mi cuenta

**Criterios de aceptación:**
- [ ] Documento explica cómo acceder a la página de cambio de contraseña
- [ ] Lista requisitos de contraseña nueva
- [ ] Explica que se requiere contraseña actual
- [ ] Incluye screenshots del formulario
- [ ] Describe qué pasa después del cambio (logout automático)

**Archivos:**
- `UserManual/profile-management.md` (actualizar)

---

### US-2.3: Documentar eliminación de cuenta
**Como** usuario que quiere dejar de usar PawCare
**Quiero** entender cómo eliminar mi cuenta
**Para** tomar una decisión informada

**Criterios de aceptación:**
- [ ] Documento explica el proceso de eliminación de cuenta
- [ ] Advierte que es soft delete (datos se preservan)
- [ ] Explica qué pasa con las mascotas registradas
- [ ] Incluye advertencia de que es una acción importante
- [ ] Describe cómo contactar soporte si se eliminó por error

**Archivos:**
- `UserManual/profile-management.md` (actualizar)

---

## Epic 3: Gestión de Mascotas - Portal de Propietarios

### US-3.1: Documentar registro de mascota
**Como** propietario de mascota
**Quiero** entender cómo registrar mi mascota en el sistema
**Para** llevar un registro completo de su información

**Criterios de aceptación:**
- [ ] Documento explica cómo acceder al formulario de nueva mascota
- [ ] Lista todos los campos (nombre, especie, raza, sexo, fecha de nacimiento)
- [ ] Explica campos opcionales (color, peso, esterilización, microchip)
- [ ] Incluye screenshots del formulario
- [ ] Describe estados de adopción y cuándo usarlos
- [ ] Explica que la mascota se asigna automáticamente al propietario

**Archivos:**
- `UserManual/my-pets.md` (nuevo)
- `UserManual/Index.md` (actualizar)

---

### US-3.2: Documentar visualización de mascotas
**Como** propietario de múltiples mascotas
**Quiero** entender cómo ver y buscar mis mascotas
**Para** acceder rápidamente a su información

**Criterios de aceptación:**
- [ ] Documento explica cómo navegar a la lista de mascotas
- [ ] Describe las vistas disponibles (lista, tarjetas)
- [ ] Explica cómo buscar por nombre
- [ ] Incluye screenshots de la interfaz
- [ ] Describe la información mostrada en cada vista

**Archivos:**
- `UserManual/my-pets.md` (actualizar)

---

### US-3.3: Documentar edición de mascota
**Como** propietario de mascota
**Quiero** saber cómo actualizar la información de mi mascota
**Para** mantener sus datos correctos

**Criterios de aceptación:**
- [ ] Documento explica cómo acceder al formulario de edición
- [ ] Lista qué campos se pueden editar
- [ ] Explica validaciones (peso positivo, fecha no futura)
- [ ] Incluye screenshots del formulario de edición
- [ ] Describe cómo cancelar la edición

**Archivos:**
- `UserManual/my-pets.md` (actualizar)

---

### US-3.4: Documentar gestión de fotos
**Como** propietario de mascota
**Quiero** entender cómo subir y eliminar fotos de mis mascotas
**Para** tener un registro visual

**Criterios de aceptación:**
- [ ] Documento explica cómo subir una foto
- [ ] Lista formatos aceptados (JPEG, PNG)
- [ ] Explica límite de tamaño
- [ ] Incluye cómo eliminar foto existente
- [ ] Screenshots del proceso

**Archivos:**
- `UserManual/my-pets.md` (actualizar)

---

### US-3.5: Documentar eliminación de mascota
**Como** propietario de mascota
**Quiero** entender cómo eliminar una mascota del sistema
**Para** mantener mi lista organizada

**Criterios de aceptación:**
- [ ] Documento explica cómo eliminar una mascota
- [ ] Advierte que es soft delete (datos se preservan)
- [ ] Explica que mascotas eliminadas no aparecen en la lista
- [ ] Incluye advertencia de confirmación
- [ ] Describe cómo contactar admin si se eliminó por error

**Archivos:**
- `UserManual/my-pets.md` (actualizar)

---

## Epic 4: Gestión de Mascotas - Administración

### US-4.1: Documentar vista administrativa de mascotas
**Como** administrador o veterinario
**Quiero** entender cómo ver todas las mascotas del sistema
**Para** gestionar el inventario completo

**Criterios de aceptación:**
- [ ] Documento explica cómo acceder al módulo admin de mascotas
- [ ] Describe permisos requeridos (admin, vet)
- [ ] Lista filtros disponibles (especie, estado adopción, propietario)
- [ ] Explica búsqueda por nombre de mascota
- [ ] Explica búsqueda por propietario (nombre, cédula, email)
- [ ] Incluye screenshots de la interfaz administrativa

**Archivos:**
- `UserManual/admin-pets.md` (nuevo)
- `UserManual/Index.md` (actualizar)

---

### US-4.2: Documentar creación de mascota por admin
**Como** administrador
**Quiero** entender cómo crear mascotas para cualquier propietario
**Para** ayudar a los clientes con el registro

**Criterios de aceptación:**
- [ ] Documento explica formulario de creación admin
- [ ] Describe cómo seleccionar propietario (Owner o User)
- [ ] Explica campo `proprietary_type` ('Owner' o 'User')
- [ ] Incluye casos de uso: mascota de cliente, mascota de rescate asignada a staff, mascota sin dueño
- [ ] Screenshots del formulario con selección de propietario

**Archivos:**
- `UserManual/admin-pets.md` (actualizar)

---

### US-4.3: Documentar asignación polimórfica de propietario
**Como** administrador
**Quiero** entender el sistema de propietarios polimórficos
**Para** asignar mascotas correctamente

**Criterios de aceptación:**
- [ ] Documento explica concepto de propietario polimórfico
- [ ] Describe diferencia entre Owner (cliente) y User (staff)
- [ ] Explica cuándo asignar a User (mascotas de rescate)
- [ ] Explica cuándo dejar NULL (mascotas para adopción sin dueño)
- [ ] Incluye ejemplos de cada caso
- [ ] Describe cómo cambiar propietario

**Archivos:**
- `UserManual/admin-pets.md` (actualizar)

---

### US-4.4: Documentar filtros avanzados
**Como** administrador buscando mascotas específicas
**Quiero** entender todos los filtros disponibles
**Para** encontrar mascotas rápidamente

**Criterios de aceptación:**
- [ ] Documento lista todos los filtros: especie, estado adopción, propietario
- [ ] Explica búsqueda de propietario polimórfica (busca en Owner y User)
- [ ] Describe filtro "incluir inactivos"
- [ ] Incluye ejemplos de búsquedas comunes
- [ ] Screenshots de interfaz de filtros

**Archivos:**
- `UserManual/admin-pets.md` (actualizar)

---

## Epic 5: Gestión de Adopciones

### US-5.1: Documentar proceso de adopción
**Como** administrador procesando adopciones
**Quiero** entender cómo registrar una adopción
**Para** formalizar la transferencia de propiedad

**Criterios de aceptación:**
- [ ] Documento explica flujo completo de adopción
- [ ] Describe cómo verificar que mascota está disponible para adopción
- [ ] Explica búsqueda de adoptante existente
- [ ] Describe creación de nuevo propietario si es necesario
- [ ] Lista validaciones (fecha no futura, adoptante != propietario actual)
- [ ] Explica que `pet.proprietary` se actualiza automáticamente al adoptante

**Archivos:**
- `UserManual/admin-adoptions.md` (nuevo)
- `UserManual/Index.md` (actualizar)

---

### US-5.2: Documentar registro de adoptante nuevo
**Como** administrador con adoptante que no está en el sistema
**Quiero** saber cómo crear el perfil del adoptante durante la adopción
**Para** completar el proceso en un solo paso

**Criterios de aceptación:**
- [ ] Documento explica formulario de nuevo adoptante
- [ ] Lista campos requeridos (nombre, cédula, email, username, contraseña)
- [ ] Explica que se crea automáticamente como Owner
- [ ] Describe validaciones (email único, username único)
- [ ] Incluye screenshots del formulario

**Archivos:**
- `UserManual/admin-adoptions.md` (actualizar)

---

### US-5.3: Documentar historial de adopciones
**Como** administrador revisando historial
**Quiero** entender cómo ver y filtrar adopciones pasadas
**Para** generar reportes o auditar procesos

**Criterios de aceptación:**
- [ ] Documento explica cómo acceder al historial de adopciones
- [ ] Describe filtros por fecha (from_date, to_date)
- [ ] Explica información mostrada (mascota, adoptante, staff que procesó, fecha, notas)
- [ ] Incluye paginación
- [ ] Screenshots de la interfaz de historial

**Archivos:**
- `UserManual/admin-adoptions.md` (actualizar)

---

## Epic 6: Gestión de Usuarios Staff

### US-6.1: Documentar gestión de usuarios
**Como** administrador o HR
**Quiero** entender cómo crear y gestionar usuarios staff
**Para** administrar el equipo

**Criterios de aceptación:**
- [ ] Documento explica permisos (solo admin y hr pueden gestionar usuarios)
- [ ] Describe roles disponibles (admin, hr, vet, assistant)
- [ ] Lista responsabilidades de cada rol
- [ ] Explica cómo crear nuevo usuario staff
- [ ] Incluye screenshots de formularios

**Archivos:**
- `UserManual/admin-users.md` (nuevo)
- `UserManual/Index.md` (actualizar)

---

### US-6.2: Documentar campos profesionales de veterinarios
**Como** HR registrando veterinarios
**Quiero** entender qué información profesional se requiere
**Para** completar correctamente el perfil

**Criterios de aceptación:**
- [ ] Documento lista campos profesionales (college_number, college_region, runsai_number, sacs_number)
- [ ] Explica certificaciones (brucellosis_code, brucellosis_date)
- [ ] Describe permisos especiales (can_vaccinate, can_issue_guides, can_issue_certificates)
- [ ] Incluye cuándo cada campo es requerido vs opcional
- [ ] Screenshots de formulario de veterinario

**Archivos:**
- `UserManual/admin-users.md` (actualizar)

---

### US-6.3: Documentar desactivación de usuarios
**Como** administrador o HR
**Quiero** entender cómo desactivar usuarios staff
**Para** gestionar personal que ya no trabaja

**Criterios de aceptación:**
- [ ] Documento explica proceso de desactivación (soft delete)
- [ ] Describe qué pasa con registros asociados (se preservan)
- [ ] Explica que el usuario no puede volver a hacer login
- [ ] Incluye cómo reactivar usuario si es necesario (contactar desarrollo)
- [ ] Advertencias de confirmación

**Archivos:**
- `UserManual/admin-users.md` (actualizar)

---

## Epic 7: Actualización del Index

### US-7.1: Actualizar Index.md con nuevas guías
**Como** usuario del manual
**Quiero** que el índice refleje todas las guías disponibles
**Para** navegar fácilmente a la información que necesito

**Criterios de aceptación:**
- [ ] Index.md lista todas las nuevas guías por categoría
- [ ] Categorías claras: Autenticación, Perfil, Mis Mascotas, Administración
- [ ] Links funcionan correctamente
- [ ] Descripción breve de cada guía
- [ ] Orden lógico (usuario básico → avanzado → admin)

**Archivos:**
- `UserManual/Index.md` (actualizar)

---

## Orden de Implementación

### Fase 1: Usuario Básico (US-1, US-2, US-3)
Prioridad ALTA - Funcionalidades que todo usuario necesita
1. US-1.1, US-1.2, US-1.3 → `authentication.md`
2. US-2.1, US-2.2, US-2.3 → `profile-management.md`
3. US-3.1, US-3.2, US-3.3, US-3.4, US-3.5 → `my-pets.md`

### Fase 2: Administración (US-4, US-5, US-6)
Prioridad MEDIA - Funcionalidades administrativas
4. US-4.1, US-4.2, US-4.3, US-4.4 → `admin-pets.md`
5. US-5.1, US-5.2, US-5.3 → `admin-adoptions.md`
6. US-6.1, US-6.2, US-6.3 → `admin-users.md`

### Fase 3: Organización (US-7)
Prioridad ALTA - Actualizar navegación
7. US-7.1 → Actualizar `Index.md`

---

## Estructura Final del UserManual/

```
UserManual/
├── Index.md                          # ✅ Actualizar
├── color-palette-configuration.md    # ✅ Existente
├── landing-configuration.md          # ✅ Existente
├── authentication.md                 # 🆕 Nuevo (Fase 1)
├── profile-management.md             # 🆕 Nuevo (Fase 1)
├── my-pets.md                        # 🆕 Nuevo (Fase 1)
├── admin-pets.md                     # 🆕 Nuevo (Fase 2)
├── admin-adoptions.md                # 🆕 Nuevo (Fase 2)
└── admin-users.md                    # 🆕 Nuevo (Fase 2)
```

---

## Plantilla de Documento

Cada nuevo documento debe seguir esta estructura:

```markdown
# Título de la Guía

Descripción breve de la funcionalidad (1-2 párrafos).

## 📋 Tabla de Contenidos

- [Sección 1](#sección-1)
- [Sección 2](#sección-2)
- [Ejemplos](#ejemplos)

## Sección 1

Contenido con explicaciones paso a paso...

## 💡 Ejemplos

Ejemplos prácticos con screenshots...

## ✅ Checklist

- [ ] Paso 1
- [ ] Paso 2

## ⚠️ Troubleshooting

Problemas comunes y soluciones...

---

**Nota**: Información adicional o advertencias importantes.
```

---

## Notas de Implementación

1. **Screenshots**: Agregar screenshots de las interfaces cuando estén disponibles
2. **Emojis**: Usar emojis para mejorar legibilidad (como en guías existentes)
3. **Lenguaje**: Amigable para usuarios no técnicos
4. **Formato**: Seguir convención de guías existentes (color-palette, landing)
5. **Links**: Verificar que todos los links internos funcionen
6. **Ejemplos**: Incluir casos de uso reales y comunes
7. **Advertencias**: Resaltar acciones irreversibles o importantes
