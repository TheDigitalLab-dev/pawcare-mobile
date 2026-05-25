<!--
STATUS: ✅ COMPLETADO
Implementado en: commit e888272 (feat(admin): add settings pages and fix user manual #39)
Incluye: Fix UserManual Index.md, card rendering, overflow; Settings pages (Email, SMTP, Currency, General)
Backend: Actions, Controller endpoints
Frontend: UserManualIndex fixes, Settings pages, SettingCard component
-->

# Plan: Correcciones del Manual de Usuario y Secciones de Configuración

## Resumen

Este plan aborda dos áreas principales:

1. **Correcciones del Manual de Usuario (Frontend)**:
   - Las tarjetas en el índice muestran contenido completo en lugar de títulos informativos
   - El `Index.md` debe mostrarse primero como página principal
   - Elementos con overflow horizontal que rompen el layout

2. **Nuevas Secciones de Configuración del Admin**:
   - Configuración de Email
   - Servidor SMTP
   - Moneda y Símbolos
   - Configuración General

3. **Activación de links de configuración** en el sidebar (actualmente deshabilitados)

**Acceso**: Rol `admin` para todas las configuraciones

---

## Arquitectura

### Secciones de Configuración

Cada sección de configuración será una página independiente dentro del namespace `/admin/settings/`:

```
/admin/settings/email        → Configuración de plantillas de email
/admin/settings/smtp         → Servidor SMTP y credenciales
/admin/settings/currency     → Moneda, formato de números, símbolos
/admin/settings/general      → Configuración general de la aplicación
```

### Estructura de Archivos (Frontend)

```
app/frontend/pages/admin/
├── user-manual/
│   └── UserManualIndex.tsx     # Modificar - corregir issues
└── settings/
    ├── components/
    │   └── SettingCard.tsx     # Card reutilizable para settings
    ├── EmailSettingsIndex.tsx  # Nueva página
    ├── SmtpSettingsIndex.tsx   # Nueva página
    ├── CurrencySettingsIndex.tsx # Nueva página
    └── GeneralSettingsIndex.tsx  # Nueva página
```

### Estructura de Archivos (Backend)

```
app/controllers/
└── admin_pages_controller.rb   # Agregar actions para settings

app/actions/admin/
├── build_sidebar.rb            # Modificar - habilitar settings
└── settings/
    ├── get_email_settings.rb   # Leer configuración de email
    ├── update_email_settings.rb
    ├── get_smtp_settings.rb
    ├── update_smtp_settings.rb
    ├── get_currency_settings.rb
    ├── update_currency_settings.rb
    ├── get_general_settings.rb
    └── update_general_settings.rb
```

---

## User Stories

### Epic 1: Correcciones del Manual de Usuario

#### US-1.1: Mostrar Index.md como página principal
**Como** usuario del admin
**Quiero** ver el índice del manual como vista principal al entrar
**Para** tener una navegación clara desde el inicio

**Criterios de aceptación:**
- [ ] Al entrar a `/admin/user-manual`, cargar automáticamente `Index.md`
- [ ] Mostrar el contenido renderizado del Index.md como vista principal
- [ ] La lista de archivos en el sidebar sigue disponible para navegación
- [ ] El botón "Volver al índice" regresa al Index.md (no a la vista de tarjetas)

**Archivos:**
- `app/frontend/pages/admin/user-manual/UserManualIndex.tsx` (modificar)
- `app/actions/admin/user_manual/list_files.rb` (verificar ordenamiento)

---

#### US-1.2: Corregir tarjetas del índice de archivos
**Como** usuario del admin
**Quiero** ver tarjetas con títulos informativos y descripciones breves
**Para** identificar rápidamente el contenido de cada guía

**Criterios de aceptación:**
- [ ] Las tarjetas muestran solo: icono, título y descripción truncada (máx 2 líneas)
- [ ] NO mostrar contenido completo del archivo en la tarjeta
- [ ] Agregar clase `line-clamp-2` a la descripción
- [ ] El título usa `CardTitle` con `truncate` para evitar overflow
- [ ] Si no hay descripción, mostrar "Ver documentación completa"

**Archivos:**
- `app/frontend/pages/admin/user-manual/UserManualIndex.tsx` (modificar sección de tarjetas)

---

#### US-1.3: Corregir overflow horizontal en contenido markdown
**Como** usuario del admin
**Quiero** que las tablas y bloques de código no rompan el layout
**Para** tener una experiencia de lectura sin scroll horizontal en toda la página

**Criterios de aceptación:**
- [ ] Agregar `overflow-x-auto` al contenedor principal del markdown
- [ ] Las tablas tienen wrapper con `overflow-x-auto` (ya existe en MarkdownRenderer)
- [ ] Los bloques de código `pre` tienen `max-w-full overflow-x-auto`
- [ ] El contenedor padre tiene `min-w-0` para permitir flex shrinking
- [ ] Verificar que no hay elementos con `white-space: nowrap` sin container

**Archivos:**
- `app/frontend/styles/markdown.css` (modificar - agregar overflow rules)
- `app/frontend/pages/admin/user-manual/UserManualIndex.tsx` (verificar contenedores)

---

#### US-1.4: Mejorar layout responsivo del visor
**Como** usuario del admin
**Quiero** que el visor del manual funcione bien en todas las pantallas
**Para** poder consultar la documentación desde cualquier dispositivo

**Criterios de aceptación:**
- [ ] Sidebar de archivos oculto en móvil, visible en `lg:`
- [ ] TOC (tabla de contenidos) oculta en móvil, visible en `xl:`
- [ ] Contenido principal ocupa todo el ancho disponible en móvil
- [ ] Toolbar con scroll horizontal si es necesario en móvil

**Archivos:**
- `app/frontend/pages/admin/user-manual/UserManualIndex.tsx` (modificar clases responsive)

---

### Epic 2: Backend - Habilitar Secciones de Configuración

#### US-2.1: Habilitar links de configuración en el sidebar
**Como** admin
**Quiero** que los links de configuración estén activos en el sidebar
**Para** poder acceder a las secciones de configuración

**Criterios de aceptación:**
- [ ] Modificar `app/actions/admin/build_sidebar.rb`
- [ ] Remover `disabled: true` de los items:
  - `email_settings` (línea 60)
  - `smtp` (línea 61)
  - `currency` (línea 62)
  - `general` (línea 63)
- [ ] Verificar que solo rol `admin` tiene acceso (ya configurado)

**Archivos:**
- `app/actions/admin/build_sidebar.rb` (modificar líneas 60-63)

---

#### US-2.2: Agregar rutas para páginas de configuración
**Como** desarrollador
**Quiero** definir las rutas para las páginas de configuración
**Para** que el frontend pueda navegar a ellas

**Criterios de aceptación:**
- [ ] Agregar rutas en `config/routes.rb` dentro del scope `:admin`:
  - `get "settings/email", to: "admin_pages#email_settings"`
  - `get "settings/smtp", to: "admin_pages#smtp_settings"`
  - `get "settings/currency", to: "admin_pages#currency_settings"`
  - `get "settings/general", to: "admin_pages#general_settings"`
- [ ] Verificar con `rails routes | grep settings`

**Archivos:**
- `config/routes.rb` (modificar)

---

#### US-2.3: Agregar actions en AdminPagesController para settings
**Como** desarrollador
**Quiero** actions que rendericen las páginas de configuración
**Para** servir las páginas de Inertia

**Criterios de aceptación:**
- [ ] Agregar `before_action :authenticate_admin!` para actions de settings
- [ ] Crear action `email_settings` que renderiza `admin/settings/EmailSettingsIndex`
- [ ] Crear action `smtp_settings` que renderiza `admin/settings/SmtpSettingsIndex`
- [ ] Crear action `currency_settings` que renderiza `admin/settings/CurrencySettingsIndex`
- [ ] Crear action `general_settings` que renderiza `admin/settings/GeneralSettingsIndex`
- [ ] Agregar estos actions a `page_action?` para manejo de errores

**Archivos:**
- `app/controllers/admin_pages_controller.rb` (modificar)

---

### Epic 3: Frontend - Páginas de Configuración

#### US-3.1: Crear componente SettingCard reutilizable
**Como** desarrollador frontend
**Quiero** un componente de card para configuraciones
**Para** mantener consistencia visual en las páginas de settings

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/settings/components/SettingCard.tsx`
- [ ] Props: `title`, `description`, `icon`, `children` (formulario)
- [ ] Usar Card de shadcn/ui con header y content
- [ ] Soporte para dark mode (usar variables CSS)
- [ ] Estado de loading y disabled

**Archivos:**
- `app/frontend/pages/admin/settings/components/SettingCard.tsx` (nuevo)

---

#### US-3.2: Crear página de Configuración de Email
**Como** admin
**Quiero** configurar las plantillas de email del sistema
**Para** personalizar las comunicaciones con usuarios

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/settings/EmailSettingsIndex.tsx`
- [ ] Usar AdminLayout con sidebarConfig
- [ ] Secciones:
  - Remitente por defecto (nombre, email)
  - Plantillas de email (preview de templates disponibles)
  - Configuración de recordatorios (activar/desactivar)
- [ ] Mostrar nota: "Las credenciales SMTP se configuran en Servidor SMTP"
- [ ] Botón guardar (placeholder - implementación backend en fase futura)

**Descripción para el usuario:**
> Esta sección permite configurar el remitente de los emails automáticos del sistema, visualizar las plantillas disponibles y activar/desactivar los recordatorios automáticos (citas, pagos).

**Archivos:**
- `app/frontend/pages/admin/settings/EmailSettingsIndex.tsx` (nuevo)

---

#### US-3.3: Crear página de Servidor SMTP
**Como** admin
**Quiero** configurar las credenciales del servidor SMTP
**Para** que el sistema pueda enviar emails

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/settings/SmtpSettingsIndex.tsx`
- [ ] Usar AdminLayout con sidebarConfig
- [ ] Campos:
  - Host SMTP (input text)
  - Puerto (input number)
  - Usuario/Email (input text)
  - Contraseña (input password con toggle visibility)
  - Tipo de autenticación (select: plain, login, cram_md5)
  - TLS/SSL (checkbox)
- [ ] Botón "Probar conexión" (placeholder)
- [ ] Mostrar estado actual: Configurado ✓ / No configurado ✗
- [ ] Advertencia de seguridad sobre credenciales

**Descripción para el usuario:**
> Configura el servidor SMTP para el envío de emails. Necesitarás las credenciales de tu proveedor de email (Gmail, SendGrid, Mailgun, etc.). Para más detalles, consulta el Manual de Usuario.

**Archivos:**
- `app/frontend/pages/admin/settings/SmtpSettingsIndex.tsx` (nuevo)

---

#### US-3.4: Crear página de Moneda y Símbolos
**Como** admin
**Quiero** configurar la moneda y formato de números
**Para** mostrar precios correctamente según mi región

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/settings/CurrencySettingsIndex.tsx`
- [ ] Usar AdminLayout con sidebarConfig
- [ ] Campos:
  - Moneda (select: USD, EUR, MXN, COP, etc.)
  - Símbolo de moneda (input text: $, €, etc.)
  - Posición del símbolo (select: antes/después del número)
  - Separador de miles (select: coma, punto, espacio)
  - Separador decimal (select: punto, coma)
  - Cantidad de decimales (input number: 0-4)
- [ ] Preview en tiempo real del formato

**Descripción para el usuario:**
> Define cómo se mostrarán los precios y montos en todo el sistema. El formato aplica a facturas, pagos, y todas las vistas donde se muestren cantidades monetarias.

**Archivos:**
- `app/frontend/pages/admin/settings/CurrencySettingsIndex.tsx` (nuevo)

---

#### US-3.5: Crear página de Configuración General
**Como** admin
**Quiero** configurar opciones generales del sistema
**Para** personalizar el comportamiento de la aplicación

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/settings/GeneralSettingsIndex.tsx`
- [ ] Usar AdminLayout con sidebarConfig
- [ ] Secciones:
  - **Información de la Clínica**:
    - Nombre de la clínica
    - Dirección
    - Teléfono
    - Email de contacto
    - Horario de atención
  - **Preferencias del Sistema**:
    - Idioma por defecto (select: es, en)
    - Zona horaria (select)
    - Formato de fecha (select: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
    - Formato de hora (select: 12h, 24h)
  - **Opciones de Citas**:
    - Duración por defecto de citas (minutos)
    - Permitir citas fuera de horario (checkbox)
    - Días de anticipación máxima para reservar

**Descripción para el usuario:**
> Configuración general de la aplicación incluyendo información de la clínica, preferencias de idioma/formato, y opciones predeterminadas para citas.

**Archivos:**
- `app/frontend/pages/admin/settings/GeneralSettingsIndex.tsx` (nuevo)

---

### Epic 4: Backend - Actions para Settings (Lectura)

> Nota: En esta fase solo implementamos lectura de configuración. Las acciones de escritura se implementarán cuando se defina el modelo de persistencia.

#### US-4.1: Crear Action para leer configuración de Email
**Como** sistema
**Quiero** leer la configuración actual de email
**Para** mostrarla en el frontend

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/settings/get_email_settings.rb`
- [ ] Leer de `EmailCredential` o variables de entorno según disponibilidad
- [ ] Retornar: sender_name, sender_email, reminders_enabled
- [ ] Retornar valores por defecto si no hay configuración

**Archivos:**
- `app/actions/admin/settings/get_email_settings.rb` (nuevo)

---

#### US-4.2: Crear Action para leer configuración SMTP
**Como** sistema
**Quiero** leer la configuración actual de SMTP
**Para** mostrar el estado en el frontend

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/settings/get_smtp_settings.rb`
- [ ] Leer de `EmailCredential` modelo existente
- [ ] Retornar: host, port, user, auth_type, tls_enabled, is_configured
- [ ] NO retornar la contraseña en la respuesta
- [ ] Indicar si está configurado o no

**Archivos:**
- `app/actions/admin/settings/get_smtp_settings.rb` (nuevo)

---

#### US-4.3: Crear endpoints API para leer settings
**Como** desarrollador
**Quiero** endpoints para obtener configuraciones
**Para** que el frontend pueda cargar los datos

**Criterios de aceptación:**
- [ ] Agregar rutas en `config/routes.rb`:
  - `get 'settings/email-config', to: 'settings#email'`
  - `get 'settings/smtp-config', to: 'settings#smtp'`
- [ ] Crear `app/controllers/admin/settings_controller.rb`
- [ ] Incluir Authenticatable, authenticate_admin!
- [ ] Implementar actions email y smtp usando los Actions creados

**Archivos:**
- `config/routes.rb` (modificar - agregar en namespace admin)
- `app/controllers/admin/settings_controller.rb` (nuevo)

---

### Epic 5: Tipos TypeScript y API Client

#### US-5.1: Crear tipos TypeScript para Settings
**Como** desarrollador frontend
**Quiero** tipos para las configuraciones
**Para** tener type safety

**Criterios de aceptación:**
- [ ] Crear `app/frontend/types/Settings.ts`
- [ ] Tipos:
  - `EmailSettings`: sender_name, sender_email, reminders_enabled
  - `SmtpSettings`: host, port, user, auth_type, tls_enabled, is_configured
  - `CurrencySettings`: currency, symbol, position, thousands_sep, decimal_sep, decimals
  - `GeneralSettings`: clinic_name, address, phone, etc.

**Archivos:**
- `app/frontend/types/Settings.ts` (nuevo)

---

#### US-5.2: Crear API client para Settings
**Como** desarrollador frontend
**Quiero** un cliente API para settings
**Para** consumir los endpoints

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/Settings.ts`
- [ ] Métodos: getEmailSettings, getSmtpSettings
- [ ] Métodos placeholder: getCurrencySettings, getGeneralSettings (retornan defaults)
- [ ] Export instancia `settingsApi`

**Archivos:**
- `app/frontend/api/Settings.ts` (nuevo)

---

## Dependencias del Index.md

El archivo `UserManual/Index.md` debe existir y contener la estructura de índice. Según el archivo ya existente:

```markdown
# Manual de Usuario - PawCare

## 📋 Tabla de Contenidos
### 🛠️ Instalación y Desarrollo
- [Instalación para Desarrollo](development-installation.md)
...
```

Este archivo será la vista principal del visor.

---

## Orden de Implementación

### Fase 1: Correcciones del Manual (US 1.1 - 1.4)
1. Corregir overflow horizontal en CSS
2. Modificar UserManualIndex para mostrar Index.md primero
3. Arreglar tarjetas para mostrar solo título y descripción
4. Verificar responsividad

### Fase 2: Backend Settings (US 2.1 - 2.3)
5. Habilitar links en sidebar (build_sidebar.rb)
6. Agregar rutas de páginas
7. Agregar actions en controller

### Fase 3: Frontend Settings (US 3.1 - 3.5)
8. Crear componente SettingCard
9. Crear página EmailSettingsIndex
10. Crear página SmtpSettingsIndex
11. Crear página CurrencySettingsIndex
12. Crear página GeneralSettingsIndex

### Fase 4: Backend API Settings (US 4.1 - 4.3)
13. Crear Action GetEmailSettings
14. Crear Action GetSmtpSettings
15. Crear controller y endpoints

### Fase 5: Frontend API (US 5.1 - 5.2)
16. Crear tipos TypeScript
17. Crear API client

---

## Notas de Implementación

### Persistencia de Configuración

Para esta fase inicial, las páginas de settings mostrarán:
- **Email/SMTP**: Lee del modelo `EmailCredential` existente
- **Currency/General**: Valores por defecto (persistencia en fase futura)

En una fase futura se puede crear una tabla `settings` con key-value o un modelo `AppConfig`.

### Manual de Usuario - Referencia

Las páginas de configuración deben incluir links al Manual de Usuario para documentación detallada:

```tsx
<Link href="/admin/user-manual" className="text-primary hover:underline">
  Ver guía completa en el Manual de Usuario
</Link>
```

---

## Verificación

### Tests de Correcciones del Manual
```bash
# Verificar visualmente:
1. Navegar a /admin/user-manual
2. Verificar que Index.md se carga automáticamente
3. Verificar que no hay overflow horizontal
4. Verificar tarjetas en vista de archivos
5. Probar en móvil (DevTools)
```

### Tests de Settings
```bash
# Verificar navegación:
1. Sidebar muestra links de configuración activos
2. Navegar a cada sección de settings
3. Verificar que solo admin tiene acceso
4. Verificar layouts responsivos
```

### CI
```bash
npm run push
```

---

## Archivos Modificados/Creados (Resumen)

### Modificaciones
- `app/actions/admin/build_sidebar.rb` - Habilitar links
- `config/routes.rb` - Agregar rutas settings
- `app/controllers/admin_pages_controller.rb` - Agregar actions
- `app/frontend/pages/admin/user-manual/UserManualIndex.tsx` - Corregir issues
- `app/frontend/styles/markdown.css` - Corregir overflow

### Nuevos Archivos
- `app/frontend/pages/admin/settings/components/SettingCard.tsx`
- `app/frontend/pages/admin/settings/EmailSettingsIndex.tsx`
- `app/frontend/pages/admin/settings/SmtpSettingsIndex.tsx`
- `app/frontend/pages/admin/settings/CurrencySettingsIndex.tsx`
- `app/frontend/pages/admin/settings/GeneralSettingsIndex.tsx`
- `app/actions/admin/settings/get_email_settings.rb`
- `app/actions/admin/settings/get_smtp_settings.rb`
- `app/controllers/admin/settings_controller.rb`
- `app/frontend/types/Settings.ts`
- `app/frontend/api/Settings.ts`
