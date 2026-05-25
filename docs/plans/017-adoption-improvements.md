<!--
STATUS: 📋 PENDIENTE
Creado: 2026-01-12
-->

# Plan: Adoption Portal Improvements & Clinic Settings

## Descripción General

Mejorar el portal público de adopciones con:
- **Modal de detalle**: Reemplazar vista de detalle por modal con información extendida
- **Información médica**: Vacunas, enfermedades crónicas, propietario/clínica
- **Sistema de apadrinamiento**: Flujo de sponsorship con autenticación
- **Modelo de Clinic Settings**: Configuración general de la clínica (nombre, medios de pago)
- **Admin Settings Page**: Página de configuración en admin dashboard

---

## Arquitectura Actual vs. Propuesta

### Estado Actual

**Frontend:**
```
app/frontend/pages/Adoption.tsx
- Vista: 'list' | 'detail' (useState)
- Click en card → cambia a vista 'detail' (página completa)
- Botón "Apadrinar" → router.visit('/auth') (sin contexto)
```

**Backend:**
```
Modelo Pet:
  - Campos básicos: name, species, breed, sex, birth_date
  - NO tiene: vacunas, enfermedades crónicas
  - proprietary: polimórfico (Owner o User)

Modelo EmailCredential:
  - Solo configuración SMTP
  - NO incluye: nombre de clínica, medios de pago
```

### Arquitectura Propuesta

**Frontend:**
```
app/frontend/pages/Adoption.tsx
- Vista: solo 'list'
- Click en card → abre modal PetDetailModal
- Modal muestra: info básica + vacunas + enfermedades + propietario

app/frontend/components/adoption/
├── PetDetailModal.tsx          # Modal con toda la información
├── SponsorshipDialog.tsx       # Dialog para apadrinar (con login)
└── VaccinationCard.tsx         # Card de vacunas

app/frontend/pages/admin/settings/
└── ClinicSettingsIndex.tsx     # Configuración de clínica
```

**Backend:**
```
Modelo Pet (actualizado):
  - Nuevos campos JSONB:
    - vaccinations (array de objetos: {name, date, next_date})
    - chronic_conditions (array de strings)

Modelo ClinicSetting (nuevo):
  - clinic_name: string
  - payment_methods: jsonb [{type, name, account}]
  - logo_url: string (opcional)
  - address: string
  - phone: string
  - (campos de EmailCredential migrados aquí)

Migración EmailCredential → ClinicSetting:
  - Mover campos SMTP a ClinicSetting
  - Deprecar EmailCredential (o mantener como legacy)
```

---

## User Stories por Epic

### Epic 1: Extended Pet Information

#### US-1.1: Add Vaccinations to Pet Model
**Como** veterinario
**Quiero** registrar las vacunas de cada mascota
**Para** tener un historial médico completo visible en adopciones

**Criterios de aceptación:**
- [ ] Migración: agregar campo `vaccinations:jsonb` a tabla `pets`
- [ ] Modelo Pet: método `vaccinations` retorna array de hashes
- [ ] Estructura de vacuna: `{ name: string, date: date, next_date: date? }`
- [ ] Validación: JSON válido
- [ ] Seeds: agregar vacunas a mascotas de ejemplo

**Archivos:**
- `db/migrate/XXXXXX_add_vaccinations_to_pets.rb`
- `app/models/pet.rb` (actualizar)
- `db/seeds/pets.rb` (actualizar)

---

#### US-1.2: Add Chronic Conditions to Pet Model
**Como** veterinario
**Quiero** registrar enfermedades crónicas de cada mascota
**Para** que los adoptantes conozcan condiciones especiales

**Criterios de aceptación:**
- [ ] Migración: agregar campo `chronic_conditions:jsonb` a tabla `pets`
- [ ] Modelo Pet: método `chronic_conditions` retorna array de strings
- [ ] Estructura: `["Diabetes", "Artritis", ...]`
- [ ] Validación: JSON válido
- [ ] Seeds: agregar condiciones a algunas mascotas

**Archivos:**
- `db/migrate/XXXXXX_add_chronic_conditions_to_pets.rb`
- `app/models/pet.rb` (actualizar)
- `db/seeds/pets.rb` (actualizar)

---

#### US-1.3: Update PublicAdoption API to Include Medical Info
**Como** visitante del portal
**Quiero** ver las vacunas y condiciones de salud de las mascotas
**Para** tomar una decisión informada sobre adopción

**Criterios de aceptación:**
- [ ] Actualizar `AdoptionController#show` para incluir:
  - `vaccinations` (array)
  - `chronic_conditions` (array)
  - `proprietary_info` (hash con tipo y nombre)
- [ ] Si proprietary es User → retornar nombre de clínica (de ClinicSetting)
- [ ] Si proprietary es Owner → retornar nombre del owner
- [ ] Si no tiene proprietary → retornar nombre de clínica
- [ ] Actualizar tipos TypeScript en `PublicAdoption.ts`

**Archivos:**
- `app/controllers/adoption_controller.rb` (actualizar)
- `app/frontend/api/PublicAdoption.ts` (actualizar tipos)

---

### Epic 2: Modal UI for Pet Details

#### US-2.1: PetDetailModal Component
**Como** visitante
**Quiero** ver la información de una mascota en un modal
**Para** mantener el contexto de la lista mientras navego

**Criterios de aceptación:**
- [ ] Componente `PetDetailModal.tsx` en `components/adoption/`
- [ ] Recibe props: `pet: PublicPet | null`, `open: boolean`, `onOpenChange: (open: boolean) => void`
- [ ] Usa Dialog de shadcn/ui
- [ ] Tamaño: `max-w-4xl`
- [ ] Layout: 2 columnas en desktop (foto | info)
- [ ] Responsive: 1 columna en móvil
- [ ] Secciones:
  - Foto + nombre
  - Info básica (especie, raza, sexo, edad)
  - Vacunas (VaccinationCard)
  - Condiciones crónicas (si tiene)
  - Propietario/Clínica
  - Características distintivas
  - Botones: "Apadrinar" y "Quiero adoptar"

**Archivos:**
- `app/frontend/components/adoption/PetDetailModal.tsx`

---

#### US-2.2: VaccinationCard Component
**Como** visitante
**Quiero** ver las vacunas de una mascota de forma clara
**Para** saber si está al día con sus vacunas

**Criterios de aceptación:**
- [ ] Componente `VaccinationCard.tsx` en `components/adoption/`
- [ ] Recibe: `vaccinations: Array<{name, date, next_date}>`
- [ ] Muestra tabla con columnas: Vacuna, Fecha aplicada, Próxima dosis
- [ ] Badge verde si está al día (next_date > hoy)
- [ ] Badge amarillo si próxima dosis cercana (< 30 días)
- [ ] Badge rojo si vencida (next_date < hoy)
- [ ] Si no tiene vacunas: mensaje "Sin registro de vacunas"

**Archivos:**
- `app/frontend/components/adoption/VaccinationCard.tsx`

---

#### US-2.3: Update Adoption Page to Use Modal
**Como** visitante
**Quiero** que el click en una mascota abra un modal
**Para** ver detalles sin perder mi posición en la lista

**Criterios de aceptación:**
- [ ] Eliminar vista 'detail' de useState
- [ ] Agregar estado: `selectedPet: PublicPet | null`, `modalOpen: boolean`
- [ ] Click en card → `setSelectedPet(pet)` + `setModalOpen(true)`
- [ ] Renderizar `<PetDetailModal pet={selectedPet} open={modalOpen} onOpenChange={setModalOpen} />`
- [ ] Al cerrar modal → `setSelectedPet(null)`
- [ ] Eliminar función `renderDetail()`
- [ ] Actualizar rutas: eliminar `/adoption/pets/:id` (ya no se necesita)

**Archivos:**
- `app/frontend/pages/Adoption.tsx` (refactorizar)
- `config/routes.rb` (eliminar ruta show)

---

### Epic 3: Clinic Settings System

#### US-3.1: Create ClinicSetting Model
**Como** administrador
**Quiero** tener un modelo centralizado de configuración de clínica
**Para** gestionar nombre, medios de pago y configuración SMTP

**Criterios de aceptación:**
- [ ] Migración: crear tabla `clinic_settings`
  - `clinic_name:string` (nombre de la clínica)
  - `address:text` (dirección)
  - `phone:string` (teléfono)
  - `email:string` (email general)
  - `logo_url:string` (logo, opcional)
  - `payment_methods:jsonb` (medios de pago)
  - Campos SMTP (migrados de EmailCredential):
    - `smtp_address:string`
    - `smtp_port:integer`
    - `smtp_username:string` (encrypted)
    - `smtp_password:string` (encrypted)
    - `smtp_domain:string`
    - `smtp_authentication:string`
    - `smtp_enable_starttls_auto:boolean`
    - `from_email:string`
    - `from_name:string`
  - `active:boolean` (solo un setting activo)
  - `timestamps`
- [ ] Modelo con validaciones
- [ ] Encriptación de credenciales SMTP
- [ ] Método `self.current` para obtener configuración activa
- [ ] Estructura de `payment_methods`: `[{type: "transfer|cash|card", name: string, account: string}]`

**Archivos:**
- `db/migrate/XXXXXX_create_clinic_settings.rb`
- `app/models/clinic_setting.rb`

---

#### US-3.2: Migrate EmailCredential to ClinicSetting
**Como** desarrollador
**Quiero** migrar datos de EmailCredential a ClinicSetting
**Para** consolidar configuraciones en un solo modelo

**Criterios de aceptación:**
- [ ] Migración de datos: copiar EmailCredential activo → ClinicSetting
- [ ] Seed: crear ClinicSetting por defecto con:
  - `clinic_name: "PawCare Veterinaria"`
  - `payment_methods: [{type: "transfer", name: "Banco Venezuela", account: "0102-XXXX-XX-XXXXXXXXXX"}]`
  - Campos SMTP de seeds existentes
- [ ] Actualizar `ApplicationMailer` para usar `ClinicSetting.current`
- [ ] Deprecar modelo `EmailCredential` (mover a `app/models/_deprecated/`)
- [ ] Actualizar seeds para no crear EmailCredential

**Archivos:**
- `db/migrate/XXXXXX_migrate_email_credentials_to_clinic_settings.rb`
- `db/seeds/clinic_settings.rb` (crear)
- `app/mailers/application_mailer.rb` (actualizar)
- `app/models/email_credential.rb` → `app/models/_deprecated/email_credential.rb`

---

#### US-3.3: Clinic Settings API
**Como** administrador
**Quiero** tener endpoints para gestionar la configuración de clínica
**Para** poder editarla desde el admin dashboard

**Criterios de aceptación:**
- [ ] Controlador: `Admin::ClinicSettingsController`
- [ ] Endpoints:
  - `GET /admin/clinic-settings` → show (retorna current setting)
  - `PATCH /admin/clinic-settings` → update
- [ ] Strong params: permitir todos los campos excepto `id`, `created_at`, `updated_at`
- [ ] Action: `Admin::ClinicSettings::Update`
- [ ] Validar que `payment_methods` sea JSON válido
- [ ] Request specs

**Archivos:**
- `app/controllers/admin/clinic_settings_controller.rb`
- `app/actions/admin/clinic_settings/update.rb`
- `config/routes.rb` (agregar rutas)
- `spec/requests/admin/clinic_settings_spec.rb`

---

### Epic 4: Admin Settings Page

#### US-4.1: Clinic Settings Page
**Como** administrador
**Quiero** una página en el admin para configurar la clínica
**Para** actualizar nombre, dirección, medios de pago y SMTP

**Criterios de aceptación:**
- [ ] Página: `ClinicSettingsIndex.tsx` en `pages/admin/settings/`
- [ ] Ruta: `GET /admin/settings/clinic`
- [ ] Usa `AdminLayout`
- [ ] Secciones en tabs:
  - **Información General**: nombre, dirección, teléfono, email, logo
  - **Medios de Pago**: lista editable de métodos de pago
  - **Configuración SMTP**: campos de email
- [ ] Botón "Guardar Cambios"
- [ ] Hook: `useClinicSettings()` para fetch y update
- [ ] API: `app/frontend/api/ClinicSettings.ts`

**Archivos:**
- `app/frontend/pages/admin/settings/ClinicSettingsIndex.tsx`
- `app/frontend/hooks/useClinicSettings.ts`
- `app/frontend/api/ClinicSettings.ts`
- `app/controllers/admin_pages_controller.rb` (agregar action)
- `config/routes.rb` (agregar ruta)

---

#### US-4.2: Payment Methods Manager
**Como** administrador
**Quiero** gestionar dinámicamente los medios de pago
**Para** agregar, editar o eliminar métodos

**Criterios de aceptación:**
- [ ] Componente: `PaymentMethodsManager.tsx` en `pages/admin/settings/components/`
- [ ] Lista de métodos con:
  - Tipo (Transferencia, Efectivo, Tarjeta)
  - Nombre del banco/método
  - Número de cuenta
  - Botones: Editar, Eliminar
- [ ] Botón "Agregar Método de Pago"
- [ ] Form fields:
  - Select: Tipo (transfer, cash, card)
  - Input: Nombre
  - Input: Cuenta/Referencia
- [ ] Validación: al menos 1 método de pago
- [ ] Estado local: array de métodos

**Archivos:**
- `app/frontend/pages/admin/settings/components/PaymentMethodsManager.tsx`

---

#### US-4.3: Update AdminSidebar with Settings Link
**Como** administrador
**Quiero** acceder a la configuración desde el sidebar
**Para** encontrar fácilmente las opciones de clínica

**Criterios de aceptación:**
- [ ] Actualizar `AdminSidebar.tsx`
- [ ] En sección "CONFIGURACIÓN", agregar:
  - `{ href: '/admin/settings/clinic', label: 'Clínica', icon: Building }`
- [ ] Debe aparecer junto a "Configuración de Email", "Servidor SMTP", etc.
- [ ] Importar icono `Building` de lucide-react

**Archivos:**
- `app/frontend/pages/admin/components/AdminSidebar.tsx`

---

### Epic 5: Sponsorship with Authentication

#### US-5.1: SponsorshipDialog Component
**Como** visitante
**Quiero** ver un dialog cuando hago click en "Apadrinar"
**Para** loguearme o indicar cuánto voy a colaborar

**Criterios de aceptación:**
- [ ] Componente: `SponsorshipDialog.tsx` en `components/adoption/`
- [ ] Recibe props: `pet: PublicPet`, `open: boolean`, `onOpenChange: (open: boolean) => void`
- [ ] Usa Dialog de shadcn/ui
- [ ] Verifica autenticación con `useAuth()`
- [ ] Si NO está logueado:
  - Muestra mensaje: "Inicia sesión para apadrinar a {pet.name}"
  - Botón: "Iniciar Sesión" (guarda URL de retorno en sessionStorage)
  - Link: "¿No tienes cuenta? Regístrate"
- [ ] Si SÍ está logueado:
  - Muestra info de la mascota
  - Input: "Cantidad mensual" (número)
  - Select: Método de pago (desde ClinicSetting.payment_methods)
  - Botón: "Confirmar Apadrinamiento"
  - Al confirmar → crear sponsorship via API

**Archivos:**
- `app/frontend/components/adoption/SponsorshipDialog.tsx`

---

#### US-5.2: Return to Adoption After Login
**Como** visitante que quiere apadrinar
**Quiero** volver al modal de la mascota después de loguearme
**Para** completar el apadrinamiento sin perder contexto

**Criterios de aceptación:**
- [ ] En `SponsorshipDialog`: al hacer click en "Iniciar Sesión":
  - Guardar en `sessionStorage`: `{ returnUrl: '/adoption', petId: pet.id }`
  - Navegar a `/auth`
- [ ] En `useLogin`: después de login exitoso:
  - Verificar si existe `sessionStorage.returnUrl`
  - Si existe y es `/adoption`:
    - Navegar a `/adoption`
    - Abrir modal con `petId` de sessionStorage
    - Limpiar sessionStorage
  - Si no existe: redirección normal (según rol)
- [ ] En `Adoption.tsx`: al montar, verificar sessionStorage
  - Si hay `petId`, cargar ese pet y abrir modal

**Archivos:**
- `app/frontend/components/adoption/SponsorshipDialog.tsx` (actualizar)
- `app/frontend/hooks/useLogin.ts` (actualizar)
- `app/frontend/pages/Adoption.tsx` (actualizar)

---

#### US-5.3: Create Sponsorship via Dialog
**Como** propietario logueado
**Quiero** crear un apadrinamiento desde el dialog
**Para** empezar a colaborar con la mascota

**Criterios de aceptación:**
- [ ] En `SponsorshipDialog`: al enviar form (si está logueado):
  - Llamar `api.sponsorships.create({ pet_id, monthly_amount, payment_method })`
  - Mostrar toast de éxito
  - Cerrar dialog
  - Actualizar contador de padrinos en el modal/card
- [ ] Backend: usar endpoint existente `POST /sponsorships`
- [ ] Validación: `monthly_amount > 0`

**Archivos:**
- `app/frontend/components/adoption/SponsorshipDialog.tsx` (actualizar)
- Backend ya existe: `SponsorshipsController#create`

---

### Epic 6: Display Proprietary Info in Modal

#### US-6.1: Show Proprietary Info in PetDetailModal
**Como** visitante
**Quiero** saber quién es el dueño de la mascota o si es de la clínica
**Para** entender la situación de la mascota

**Criterios de aceptación:**
- [ ] En `PetDetailModal`: agregar sección "Propietario"
- [ ] Si `pet.proprietary_info.type === 'Owner'`:
  - Mostrar: "Propietario: {nombre del owner}"
- [ ] Si `pet.proprietary_info.type === 'User'`:
  - Mostrar: "Clínica: {clinic_name de ClinicSetting}"
- [ ] Si no tiene proprietary:
  - Mostrar: "Clínica: {clinic_name de ClinicSetting}"
- [ ] Usar Card con icono de usuario o edificio

**Archivos:**
- `app/frontend/components/adoption/PetDetailModal.tsx` (actualizar)

---

## Orden de Implementación

### Fase 1: Backend Foundation (US-1.1, US-1.2, US-1.3, US-3.1, US-3.2)
**Objetivo:** Crear modelos y migraciones para información extendida
**Duración estimada:** 4-5 horas
**Entregables:**
- Tabla pets con vaccinations y chronic_conditions
- Modelo ClinicSetting con payment_methods
- Migración EmailCredential → ClinicSetting
- API actualizada para retornar info médica

### Fase 2: Modal UI (US-2.1, US-2.2, US-2.3, US-6.1)
**Objetivo:** Reemplazar vista detail por modal
**Duración estimada:** 3-4 horas
**Entregables:**
- PetDetailModal funcionando
- VaccinationCard mostrando vacunas
- Info de propietario/clínica visible

### Fase 3: Admin Settings (US-3.3, US-4.1, US-4.2, US-4.3)
**Objetivo:** Página de configuración de clínica en admin
**Duración estimada:** 4-5 horas
**Entregables:**
- Página /admin/settings/clinic
- Gestión de medios de pago
- Link en sidebar

### Fase 4: Sponsorship Flow (US-5.1, US-5.2, US-5.3)
**Objetivo:** Flujo completo de apadrinamiento con autenticación
**Duración estimada:** 3-4 horas
**Entregables:**
- SponsorshipDialog con login/form
- Return URL después de login
- Creación de sponsorship desde modal

---

## Dependencias

### Fase 1-2: Sin dependencias
- Pueden implementarse inmediatamente
- Backend nuevo pero no depende de otros sistemas

### Fase 3: Depende de Fase 1
- Necesita ClinicSetting creado

### Fase 4: Depende de Fase 2
- Necesita PetDetailModal para abrir desde botón

---

## Migraciones SQL

### Migration 1: Add Medical Info to Pets
```ruby
class AddMedicalInfoToPets < ActiveRecord::Migration[8.0]
  def change
    add_column :pets, :vaccinations, :json, default: []
    add_column :pets, :chronic_conditions, :json, default: []
  end
end
```

### Migration 2: Create Clinic Settings
```ruby
class CreateClinicSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :clinic_settings do |t|
      # Clinic info
      t.string :clinic_name, null: false
      t.text :address
      t.string :phone
      t.string :email
      t.string :logo_url
      t.json :payment_methods, default: []

      # SMTP settings
      t.string :smtp_address
      t.integer :smtp_port
      t.string :smtp_username
      t.string :smtp_password
      t.string :smtp_domain
      t.string :smtp_authentication
      t.boolean :smtp_enable_starttls_auto, default: true
      t.string :from_email
      t.string :from_name

      t.boolean :active, default: true, null: false
      t.timestamps
    end

    add_index :clinic_settings, :active
  end
end
```

### Migration 3: Migrate Email Credentials
```ruby
class MigrateEmailCredentialsToClinicSettings < ActiveRecord::Migration[8.0]
  def up
    # Copiar EmailCredential activo a ClinicSetting
    if (cred = EmailCredential.active.first)
      ClinicSetting.create!(
        clinic_name: cred.app_name,
        smtp_address: cred.smtp_address,
        smtp_port: cred.smtp_port,
        smtp_username: cred.smtp_username,
        smtp_password: cred.smtp_password,
        smtp_domain: cred.smtp_domain,
        smtp_authentication: cred.smtp_authentication,
        smtp_enable_starttls_auto: cred.smtp_enable_starttls_auto,
        from_email: cred.from_email,
        from_name: cred.from_name,
        payment_methods: [
          { type: 'transfer', name: 'Banco Venezuela', account: '0102-XXXX-XX-XXXXXXXXXX' }
        ],
        active: true
      )
    end
  end

  def down
    # No rollback
  end
end
```

---

## Ejemplo de Datos

### Pet con información médica
```json
{
  "id": 1,
  "name": "Mimi",
  "species": "cat",
  "vaccinations": [
    {
      "name": "Rabia",
      "date": "2025-06-15",
      "next_date": "2026-06-15"
    },
    {
      "name": "Triple Felina",
      "date": "2025-07-20",
      "next_date": "2026-07-20"
    }
  ],
  "chronic_conditions": ["Diabetes tipo 2"],
  "proprietary_info": {
    "type": "User",
    "name": "PawCare Veterinaria"
  }
}
```

### ClinicSetting
```json
{
  "clinic_name": "PawCare Veterinaria",
  "address": "Av. Principal #123, Ciudad",
  "phone": "+58 123 456 7890",
  "email": "info@pawcare.com",
  "payment_methods": [
    {
      "type": "transfer",
      "name": "Banco Venezuela",
      "account": "0102-1234-56-7890123456"
    },
    {
      "type": "transfer",
      "name": "Banco Mercantil",
      "account": "0105-9876-54-3210987654"
    },
    {
      "type": "cash",
      "name": "Efectivo",
      "account": "Pago en clínica"
    }
  ]
}
```

---

## Criterios de Éxito del Plan Completo

- [ ] Click en mascota abre modal (no nueva página)
- [ ] Modal muestra vacunas con estado (al día / vencida)
- [ ] Modal muestra enfermedades crónicas si tiene
- [ ] Modal muestra propietario o nombre de clínica
- [ ] Botón "Apadrinar" solo visible si está logueado
- [ ] Si no está logueado, muestra opción de login en dialog
- [ ] Después de login, vuelve al modal de la mascota
- [ ] Puede crear sponsorship desde el dialog
- [ ] Admin puede configurar clínica en /admin/settings/clinic
- [ ] Admin puede agregar/editar/eliminar medios de pago
- [ ] Nombre de clínica se muestra cuando mascota no tiene owner
- [ ] EmailCredential deprecado, todo en ClinicSetting

---

## Notas de Implementación

1. **JSONB vs JSON**: Usar `:json` en migrations (Rails lo convierte a JSONB en MySQL 8.0+)
2. **Encriptación**: ClinicSetting debe usar `encrypts` para smtp_username y smtp_password
3. **Singleton Pattern**: ClinicSetting.current debe retornar el setting activo (solo puede haber uno)
4. **Return URL**: Usar sessionStorage para mantener contexto después de login
5. **Dark Mode**: Todos los componentes deben usar variables CSS
6. **Mobile**: Modal debe ser responsivo (full screen en móvil < 768px)
7. **Testing**: Request specs para todas las rutas nuevas
8. **Seeds**: Actualizar seeds para incluir vacunas y condiciones en mascotas
