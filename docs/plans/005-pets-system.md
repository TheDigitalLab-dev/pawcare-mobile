<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2024-2025
Backend: app/models/pet.rb, app/controllers/pets_controller.rb, app/controllers/admin/pets_controller.rb
Frontend: app/frontend/pages/pets/PetsIndex.tsx, app/frontend/pages/admin/pets/PetsIndex.tsx
-->

# 005 - Sistema de Mascotas

## Resumen

Sistema CRUD para gestionar mascotas registradas por dueños y por la clínica. Incluye manejo de mascotas en adopción con registro de adopciones completadas.

---

## Alcance (Scope)

**Incluido:**
- ✅ CRUD completo de mascotas
- ✅ Portal del cliente: owner registra sus mascotas
- ✅ Portal de la clínica: staff registra cualquier mascota
- ✅ Enum `adoption_status` para identificar mascotas en adopción
- ✅ Proceso de adopción: crear nuevo Owner + registro de AdoptionRecord
- ✅ Historial de adopciones

**No incluido (futuro):**
- ❌ Hogares temporales (FosterCare)
- ❌ Perfil de adopción extendido
- ❌ Portal público de adopción
- ❌ Solicitudes de adopción
- ❌ Galería de fotos

---

## Estado de Implementación (Actualizado: 2026-01-05)

### ✅ Completado (Backend)

**Modelos:**
- ✅ Pet model (validaciones, enums, métodos, ActiveStorage, asociación polimórfica proprietary)
- ✅ AdoptionRecord model (validaciones, callbacks, auto-update pet status)
- ✅ Sponsorship model (validaciones, enums, métodos) - Solo modelo, sin API

**Controllers:**
- ✅ PetsController (Owner portal - CRUD completo)
- ✅ Admin::PetsController (Staff portal - CRUD + filtros avanzados)
- ✅ Admin::AdoptionsController (Crear adopciones + historial)
- ✅ Admin::OwnersController (Listar owners para selector)

**Actions (Patrón Result):**
- ✅ Pets::CreatePet, UpdatePet, DestroyPet, UploadPhoto, DeletePhoto, FilterPets
- ✅ Admin::Pets::CreatePet, UpdatePet, DestroyPet, UploadPhoto, DeletePhoto
- ✅ Admin::Adoptions::CreateAdoption, FilterAdoptions
- ✅ Admin::Owners::FilterOwners

**Tests:**
- ✅ 562 tests pasando (models + request specs + mailers)
- ✅ 0 vulnerabilidades de seguridad

### ✅ Completado (Frontend)

**Epic 1: Owner Portal - Gestión de Mascotas** (`/my-pets`)
- ✅ PetsIndex.tsx con vistas internas (list, detail, create, edit)
- ✅ PetForm.tsx - Formulario crear/editar
- ✅ PetCard.tsx - Card de mascota
- ✅ PetDetail.tsx - Detalles con upload de foto
- ✅ Diálogo de confirmación para eliminar
- ✅ Hook useMyPets() + Redux petsSlice

**Epic 2: Admin Portal - Gestión de Mascotas** (`/admin/pets`)
- ✅ PetsIndex.tsx con vistas internas (list, detail, edit)
- ✅ AdminPetForm.tsx con selector de propietario (búsqueda de owners)
- ✅ Filtros avanzados (nombre mascota, nombre/email dueño, especie, estado adopción)
- ✅ Paginación
- ✅ Hook useAdminPets() + Redux petsSlice

**Admin Portal - Gestión de Adopciones** (`/admin/adoptions`)
- ✅ AdoptionsIndex.tsx con vistas internas (list, detail, create)
- ✅ AdoptionForm.tsx - Crear adopción con owner existente o nuevo
- ✅ Filtros por fecha
- ✅ Hook useAdminAdoptions() + Redux adoptionsSlice

**Epic 3: Portal Público de Adopción** (`/adoption`)
- ✅ AdoptionController - API pública sin autenticación
- ✅ Página pública `/adoption` con grid de mascotas
- ✅ Filtros por especie y sexo
- ✅ Vista detalle de mascota con info pública
- ✅ Muestra cantidad de padrinos activos
- ✅ API client PublicAdoption.ts + hook usePublicAdoption

**Epic 4: Sistema de Apadrinamientos**
- ✅ SponsorshipsController (owner portal: index, show, create, cancel)
- ✅ Admin::SponsorshipsController (index, show)
- ✅ Actions: CreateSponsorship, CancelSponsorship, FilterSponsorships
- ✅ Actions Admin: FilterSponsorships, CompleteSponsorships
- ✅ SponsorshipsIndex.tsx (`/my-sponsorships`) - Owner portal
- ✅ AdminSponsorshipsIndex.tsx (`/admin/sponsorships`) - Admin portal
- ✅ API client Sponsorships.ts + hooks useMySponsorships, useAdminSponsorships
- ✅ Redux sponsorshipsSlice

**Epic 5: Emails y Notificaciones**
- ✅ SponsorshipMailer (confirmation, cancellation, pet_adopted)
- ✅ AdoptionMailer (welcome)
- ✅ Vistas HTML y texto para todos los emails
- ✅ Integración automática: emails se envían desde actions
- ✅ Auto-completar sponsorships cuando mascota es adoptada

---

## Modelo de Datos

### Pet (Mascota)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto-generado |
| name | string | Sí | Nombre de la mascota |
| proprietary_id | bigint | No | FK polimórfica (Owner o User, NULL si está en adopción sin dueño) |
| proprietary_type | string | No | Tipo de propietario: 'Owner' o 'User' |
| species | enum | Sí | dog, cat, bird, rabbit, hamster, reptile, fish, other |
| breed | string | No | Raza |
| sex | enum | Sí | male, female |
| birth_date | date | No | Fecha de nacimiento |
| distinctive_features | text | No | Señas características (color, marcas, peso, etc.) |
| microchip_id | string | No | Número de microchip (único) - FUTURO |
| adoption_status | enum | Sí | not_for_adoption, available_for_adoption, adopted |
| active | boolean | Sí | Mascota activa (default: true) |
| created_at | datetime | Auto | |
| updated_at | datetime | Auto | |

### Enums

```ruby
enum :species, {
  dog: 0,
  cat: 1,
  bird: 2,
  rabbit: 3,
  hamster: 4,
  reptile: 5,
  fish: 6,
  other: 7
}

enum :sex, {
  male: 0,
  female: 1
}

enum :adoption_status, {
  not_for_adoption: 0,      # Mascota con dueño, no en adopción
  available_for_adoption: 1, # Disponible para adopción
  adopted: 2                 # Ya fue adoptada (historial)
}
```

### Validaciones

```ruby
validates :name, presence: true, length: { maximum: 100 }
validates :species, presence: true
validates :sex, presence: true
validates :adoption_status, presence: true
validates :breed, length: { maximum: 100 }, allow_nil: true

# NOTA: proprietary es siempre opcional (asociación polimórfica)
# Una mascota puede:
# - Pertenecer a un Owner (cliente registrado)
# - Pertenecer a un User (staff de la clínica)
# - No tener propietario (NULL) si está en adopción sin dueño previo (rescatada)
# - Tener propietario Y estar en adopción (dueño la da en adopción)

# NOTA: microchip_id será implementado en el futuro
# validates :microchip_id, uniqueness: { case_sensitive: false }, allow_nil: true
```

### Asociaciones

```ruby
# Pet
belongs_to :proprietary, polymorphic: true, optional: true
has_many :adoption_records, dependent: :destroy
has_one_attached :photo  # ActiveStorage: foto principal

# Owner
has_many :pets, as: :proprietary, dependent: :destroy
has_many :adoptions_given, class_name: "AdoptionRecord", foreign_key: "adopter_id", dependent: :nullify

# User (Staff)
has_many :pets, as: :proprietary, dependent: :destroy
has_many :processed_adoptions, class_name: "AdoptionRecord", foreign_key: "adopted_by_user_id"
```

### Métodos Útiles

```ruby
def age
  return nil unless birth_date

  now = Time.current.to_date
  years = now.year - birth_date.year
  months = now.month - birth_date.month

  years -= 1 if months < 0
  months += 12 if months < 0

  { years: years, months: months }
end

def age_display
  return "Edad desconocida" unless birth_date

  age_data = age
  if age_data[:years] > 0
    "#{age_data[:years]} año#{'s' if age_data[:years] != 1}"
  else
    "#{age_data[:months]} mes#{'es' if age_data[:months] != 1}"
  end
end

def available_for_adoption?
  adoption_status == "available_for_adoption"
end

def can_be_edited_by?(user)
  return true if user.is_a?(User) && user.role.in?(["admin", "vet"])
  return true if proprietary == user
  false
end

def proprietary_name
  proprietary&.full_name || "Sin propietario"
end
```

---

---

### Sponsorship (Apadrinamiento)

Sistema de donaciones para apadrinar mascotas en adopción.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto-generado |
| pet_id | bigint | Sí | FK a pets (mascota apadrinada) |
| sponsor_id | bigint | Sí | FK a owners (padrino) |
| amount | decimal(10,2) | Sí | Monto de la donación |
| recurrence | enum | Sí | one_time, monthly |
| status | enum | Sí | active, cancelled, completed |
| start_date | date | Sí | Fecha de inicio del apadrinamiento |
| end_date | date | No | Fecha de finalización (si es cancelado o mascota adoptada) |
| notes | text | No | Notas del padrino |
| created_at | datetime | Auto | |
| updated_at | datetime | Auto | |

### Enums - Sponsorship

```ruby
enum :recurrence, {
  one_time: 0,   # Donación única
  monthly: 1     # Donación mensual recurrente
}

enum :status, {
  active: 0,      # Activo (recurrente en curso o única pendiente)
  cancelled: 1,   # Cancelado por el padrino
  completed: 2    # Completado (mascota adoptada o donación única procesada)
}
```

### Validaciones - Sponsorship

```ruby
validates :pet_id, presence: true
validates :sponsor_id, presence: true
validates :amount, presence: true, numericality: { greater_than: 0 }
validates :recurrence, presence: true
validates :status, presence: true
validates :start_date, presence: true

# Validación: solo se pueden apadrinar mascotas en adopción
validate :pet_must_be_available_for_adoption

private

def pet_must_be_available_for_adoption
  return unless pet

  unless pet.available_for_adoption?
    errors.add(:pet, "debe estar disponible para adopción para ser apadrinada")
  end
end
```

### Asociaciones - Sponsorship

```ruby
# Sponsorship
belongs_to :pet
belongs_to :sponsor, class_name: "Owner"

# Pet
has_many :sponsorships, dependent: :destroy
has_many :sponsors, through: :sponsorships, source: :sponsor

# Owner
has_many :sponsorships, foreign_key: :sponsor_id, dependent: :destroy
has_many :sponsored_pets, through: :sponsorships, source: :pet
```

### Métodos Útiles - Sponsorship

```ruby
def monthly?
  recurrence == "monthly"
end

def one_time?
  recurrence == "one_time"
end

def active?
  status == "active"
end

def cancel!
  update!(status: :cancelled, end_date: Date.current)
end

def complete!
  update!(status: :completed, end_date: Date.current)
end

# Total aportado (para recurrentes, calcular meses transcurridos)
def total_contributed
  return amount if one_time?

  return 0 unless start_date

  end_date_for_calc = end_date || Date.current
  months = ((end_date_for_calc.year - start_date.year) * 12) +
           (end_date_for_calc.month - start_date.month) + 1

  amount * [months, 0].max
end
```

---

### AdoptionRecord (Registro de Adopción)

Registro histórico de cuándo y a quién se adoptó una mascota.

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto-generado |
| pet_id | bigint | Sí | FK a pets |
| adopter_id | bigint | Sí | FK a owners (nuevo dueño) |
| adopted_by_user_id | bigint | Sí | FK a users (staff que procesó la adopción) |
| adoption_date | date | Sí | Fecha de adopción |
| notes | text | No | Notas sobre la adopción |
| created_at | datetime | Auto | |
| updated_at | datetime | Auto | |

### Validaciones

```ruby
validates :pet_id, presence: true
validates :adopter_id, presence: true
validates :adopted_by_user_id, presence: true
validates :adoption_date, presence: true
```

### Asociaciones

```ruby
# AdoptionRecord
belongs_to :pet
belongs_to :adopter, class_name: "Owner"
belongs_to :adopted_by_user, class_name: "User"

# Pet
has_many :adoption_records, dependent: :destroy

# Owner
has_many :adoptions_given, class_name: "AdoptionRecord", foreign_key: "adopter_id"

# User
has_many :processed_adoptions, class_name: "AdoptionRecord", foreign_key: "adopted_by_user_id"
```

---

---

## ActiveStorage - Fotos de Mascotas

### Configuración

```ruby
# app/models/pet.rb
has_one_attached :photo

# Validación de tipo de archivo
validate :acceptable_photo

private

def acceptable_photo
  return unless photo.attached?

  unless photo.blob.byte_size <= 5.megabytes
    errors.add(:photo, "es demasiado grande (máximo 5MB)")
  end

  acceptable_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  unless acceptable_types.include?(photo.content_type)
    errors.add(:photo, "debe ser JPEG, PNG o WebP")
  end
end
```

### Variantes (Thumbnails)

```ruby
# Generar thumbnail al mostrar
pet.photo.variant(resize_to_limit: [300, 300])

# Versión grande para detalles
pet.photo.variant(resize_to_limit: [800, 800])
```

### En Controllers

```ruby
# Permitir photo en params
def pet_params
  params.require(:pet).permit(
    :name, :species, :breed, :sex, :birth_date,
    :distinctive_features, :microchip_id, :adoption_status,
    :photo  # ActiveStorage attachment
  )
end
```

### En Frontend

```tsx
// Subir foto en formulario
<input
  type="file"
  accept="image/jpeg,image/jpg,image/png,image/webp"
  onChange={(e) => setPhoto(e.target.files[0])}
/>

// Enviar con FormData
const formData = new FormData();
formData.append("pet[name]", data.name);
formData.append("pet[species]", data.species);
// ...
if (photo) {
  formData.append("pet[photo]", photo);
}

// Request
await axios.post("/pets", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

---

## Endpoints API

### Portal Público - Adopción

```
GET    /adoption           # Página pública: mascotas en adopción (HTML - Inertia)
GET    /api/adoption/pets  # API: listar mascotas en adopción (JSON)
GET    /api/adoption/pets/:id  # API: ver detalles de mascota en adopción (JSON)
```

### Pets - Owner Portal

```
GET    /pets           # Listar mis mascotas
POST   /pets           # Crear mascota (owner_id automático, adoption_status: not_for_adoption)
GET    /pets/:id       # Ver mi mascota
PATCH  /pets/:id       # Actualizar mi mascota (incluye foto)
DELETE /pets/:id       # Eliminar mi mascota
```

### Pets - Staff Portal (Admin/Vet)

```
GET    /admin/pets              # Listar todas las mascotas
POST   /admin/pets              # Crear mascota (puede ser de cualquier owner o sin owner)
GET    /admin/pets/:id          # Ver cualquier mascota
PATCH  /admin/pets/:id          # Actualizar cualquier mascota
DELETE /admin/pets/:id          # Eliminar cualquier mascota
```

### Adoption - Staff Portal (Admin/Vet)

```
POST   /admin/adoptions         # Completar adopción (crear owner si no existe + adoption record)
GET    /admin/adoptions         # Historial de adopciones
GET    /admin/adoptions/:id     # Ver registro de adopción
```

### Sponsorships (Apadrinamientos)

```
# Owner Portal (autenticado)
GET    /sponsorships            # Mis apadrinamientos
POST   /sponsorships            # Crear nuevo apadrinamiento
GET    /sponsorships/:id        # Ver mi apadrinamiento
PATCH  /sponsorships/:id        # Actualizar (cancelar)

# Admin Portal
GET    /admin/sponsorships      # Todos los apadrinamientos
GET    /admin/sponsorships/:id  # Ver apadrinamiento
PATCH  /admin/sponsorships/:id  # Marcar como completado cuando mascota es adoptada
```

---

## User Stories

### Epic 1: Gestión de Mascotas - Owner Portal

#### US-1.1: Registrar mi mascota
**Como** dueño de mascota
**Quiero** registrar mi mascota en el sistema
**Para** acceder a servicios veterinarios

**Criterios de aceptación:**
- [ ] Formulario con: nombre (req), especie (req), raza, sexo (req), fecha nacimiento, señas características
- [ ] proprietary se asigna automáticamente al owner autenticado
- [ ] adoption_status se establece como "not_for_adoption" automáticamente
- [ ] Validación de campos requeridos
- [ ] Mensaje de éxito
- [ ] Redirección a lista de mis mascotas

**Archivos:**
- `app/models/pet.rb`
- `app/controllers/pets_controller.rb`
- `spec/models/pet_spec.rb`
- `spec/requests/pets_spec.rb`
- `app/frontend/pages/pets/NewPet.tsx`
- `app/frontend/hooks/usePetForm.ts`

#### US-1.2: Ver mis mascotas
**Como** dueño de mascota
**Quiero** ver la lista de mis mascotas
**Para** acceder a su información

**Criterios de aceptación:**
- [ ] Lista con cards: nombre, especie, edad
- [ ] Click en card → detalles
- [ ] Botón "Agregar mascota"
- [ ] Empty state si no hay mascotas
- [ ] Solo muestra mascotas del owner autenticado (proprietary = current_user)

**Archivos:**
- `app/frontend/pages/pets/MyPets.tsx`
- `app/frontend/components/pets/PetCard.tsx`
- `app/frontend/hooks/useMyPets.ts`

#### US-1.3: Actualizar mi mascota
**Como** dueño de mascota
**Quiero** actualizar la información de mi mascota
**Para** mantenerla al día

**Criterios de aceptación:**
- [ ] Formulario pre-llenado
- [ ] Puede actualizar todos los campos excepto proprietary y adoption_status
- [ ] Validación
- [ ] Mensaje de éxito

**Archivos:**
- `app/frontend/pages/pets/EditPet.tsx`

#### US-1.4: Eliminar mi mascota
**Como** dueño de mascota
**Quiero** eliminar una mascota
**Para** mantener mi lista limpia

**Criterios de aceptación:**
- [ ] Diálogo de confirmación
- [ ] Soft delete (active: false)
- [ ] Mensaje de éxito
- [ ] Redirección

---

### Epic 2: Gestión de Mascotas - Staff Portal

#### US-2.1: Registrar mascota para cliente
**Como** veterinario o admin
**Quiero** registrar una mascota para un cliente
**Para** iniciar su expediente

**Criterios de aceptación:**
- [ ] Formulario extendido con todos los campos
- [ ] Puede seleccionar propietario existente (Owner o User) de un dropdown/search
- [ ] Puede crear sin propietario (dejar proprietary NULL)
- [ ] Puede establecer adoption_status (not_for_adoption o available_for_adoption)
- [ ] Si adoption_status es "available_for_adoption", proprietary puede ser NULL o existente (dueño la da en adopción)
- [ ] Mensaje de éxito

**Archivos:**
- `app/controllers/admin/pets_controller.rb`
- `app/frontend/pages/admin/pets/NewPet.tsx`

#### US-2.2: Registrar mascota en adopción
**Como** veterinario o admin
**Quiero** registrar una mascota disponible para adopción
**Para** ofrecerla a posibles adoptantes

**Criterios de aceptación:**
- [ ] Formulario igual pero con adoption_status: "available_for_adoption"
- [ ] proprietary puede ser NULL (mascota rescatada) o existente (dueño la da en adopción)
- [ ] Mensaje de éxito

**Archivos:**
- Mismo formulario que US-2.1

#### US-2.3: Ver todas las mascotas
**Como** veterinario o admin
**Quiero** ver todas las mascotas registradas
**Para** gestionarlas

**Criterios de aceptación:**
- [ ] Lista con cards de todas las mascotas
- [ ] Filtros: especie, adoption_status, con/sin propietario
- [ ] Búsqueda por nombre de mascota o nombre de propietario
- [ ] Click en card → detalles
- [ ] Indica adoption_status con badge visual
- [ ] Muestra tipo de propietario (Owner/User) si existe

**Archivos:**
- `app/frontend/pages/admin/pets/AllPets.tsx`
- `app/frontend/hooks/useAllPets.ts`

#### US-2.4: Actualizar cualquier mascota
**Como** veterinario o admin
**Quiero** actualizar cualquier mascota
**Para** corregir información

**Criterios de aceptación:**
- [ ] Puede cambiar proprietary (Owner o User)
- [ ] Puede cambiar adoption_status
- [ ] Validación: si adoption_status = not_for_adoption, proprietary debe existir
- [ ] Permite proprietary NULL para mascotas rescatadas

**Archivos:**
- `app/frontend/pages/admin/pets/EditPet.tsx`

---

### Epic 3: Portal Público de Adopción

#### US-3.1: Ver mascotas en adopción (Público)
**Como** visitante del sitio
**Quiero** ver las mascotas disponibles para adopción
**Para** encontrar una mascota que pueda adoptar

**Criterios de aceptación:**
- [ ] Página pública accesible sin login en `/adoption`
- [ ] Muestra solo mascotas con adoption_status = "available_for_adoption"
- [ ] Grid de cards con: foto, nombre, especie, edad aproximada
- [ ] Si no hay foto, mostrar placeholder según especie
- [ ] Filtros básicos: especie, sexo
- [ ] Click en card lleva a detalles
- [ ] Responsive (mobile-first)

**Archivos:**
- `app/controllers/pages_controller.rb` → método `adoption`
- `app/controllers/api/adoption_controller.rb` → endpoint JSON
- `app/frontend/pages/Adoption.tsx`
- `app/frontend/components/adoption/AdoptionPetCard.tsx`
- `app/frontend/hooks/useAdoptionPets.ts`

#### US-3.2: Ver detalles de mascota en adopción (Público)
**Como** visitante interesado
**Quiero** ver todos los detalles de una mascota en adopción
**Para** saber si es adecuada para mí

**Criterios de aceptación:**
- [ ] Página de detalles con toda la información
- [ ] Foto grande (o placeholder)
- [ ] Información: nombre, especie, raza, sexo, edad, señas características
- [ ] Muestra cuántos padrinos tiene y total recaudado
- [ ] Información de contacto: "Para adoptar, contáctanos al [teléfono/email]"
- [ ] Dos CTAs: "Adoptar" (contacto) y "Apadrinar" (requiere login o registro)
- [ ] Botón para volver a lista

**Archivos:**
- `app/frontend/pages/AdoptionPetDetails.tsx`

#### US-3.3: Apadrinar mascota desde portal público
**Como** visitante o owner
**Quiero** apadrinar una mascota en adopción
**Para** ayudar con sus cuidados aunque no pueda adoptarla

**Criterios de aceptación:**
- [ ] Botón "Apadrinar" en página de detalles de mascota
- [ ] Si no está autenticado → redirige a login/register
- [ ] Si está autenticado → muestra formulario de apadrinamiento
- [ ] Formulario con: monto sugerido (opciones: $10, $20, $50, personalizado), recurrencia (única o mensual), notas opcionales
- [ ] Validación: monto > 0
- [ ] Confirmación antes de enviar
- [ ] Mensaje de éxito con detalles del apadrinamiento
- [ ] Por ahora: registra intención (no procesa pago real)
- [ ] Email de confirmación al padrino

**Archivos:**
- `app/frontend/components/adoption/SponsorshipForm.tsx`
- `app/controllers/sponsorships_controller.rb`
- `app/mailers/sponsorship_mailer.rb`

---

### Epic 4: Proceso de Adopción (Staff)

#### US-3.1: Completar adopción
**Como** veterinario o admin
**Quiero** registrar que una mascota fue adoptada
**Para** asignarle su nuevo dueño y crear el registro

**Criterios de aceptación:**
- [ ] Solo para mascotas con adoption_status = "available_for_adoption"
- [ ] Formulario con:
  - Opción 1: Seleccionar owner existente
  - Opción 2: Crear nuevo owner (nombre, apellido, email, etc.)
- [ ] Campo: fecha de adopción (default: hoy)
- [ ] Campo: notas opcionales
- [ ] Al confirmar:
  - Si es nuevo owner: crear Owner con datos proporcionados
  - Asignar pet.proprietary al adoptante (Owner)
  - Cambiar pet.adoption_status a "adopted"
  - Crear AdoptionRecord con: pet_id, adopter_id, processed_by (current_user), adoption_date, notes
- [ ] Mensaje de éxito
- [ ] Email de bienvenida al nuevo owner (opcional)

**Archivos:**
- `app/controllers/admin/adoptions_controller.rb`
- `app/frontend/pages/admin/adoptions/CompleteAdoption.tsx`
- `app/frontend/hooks/useCompleteAdoption.ts`

#### US-4.2: Ver historial de adopciones
**Como** admin
**Quiero** ver todas las adopciones registradas
**Para** llevar un historial

**Criterios de aceptación:**
- [ ] Lista con: mascota, adoptante, fecha, procesado por
- [ ] Filtros por fecha
- [ ] Click en registro → detalles completos

**Archivos:**
- `app/frontend/pages/admin/adoptions/AdoptionHistory.tsx`

---

### Epic 5: Gestión de Apadrinamientos (Owner Portal)

#### US-5.1: Ver mis apadrinamientos
**Como** owner autenticado
**Quiero** ver las mascotas que estoy apadrinando
**Para** hacer seguimiento de mis donaciones

**Criterios de aceptación:**
- [ ] Página "/sponsorships" en dashboard del owner
- [ ] Lista de apadrinamientos activos
- [ ] Cada card muestra: foto de mascota, nombre, monto, recurrencia, fecha inicio
- [ ] Badge de estado: activo, cancelado, completado (mascota adoptada)
- [ ] Muestra total donado (para recurrentes, calcular meses × monto)
- [ ] Click en card → detalles
- [ ] Botón "Apadrinar otra mascota" → redirección a /adoption

**Archivos:**
- `app/frontend/pages/sponsorships/MySponsorships.tsx`
- `app/frontend/components/sponsorships/SponsorshipCard.tsx`
- `app/frontend/hooks/useMySponsorships.ts`

#### US-5.2: Ver detalles de mi apadrinamiento
**Como** owner
**Quiero** ver los detalles de un apadrinamiento
**Para** revisar mi contribución

**Criterios de aceptación:**
- [ ] Muestra toda la información: mascota, monto, recurrencia, fecha inicio, estado
- [ ] Muestra total aportado hasta la fecha
- [ ] Si es recurrente activo, muestra próximo cargo (mes siguiente)
- [ ] Botón "Cancelar apadrinamiento" si está activo
- [ ] Confirmación antes de cancelar
- [ ] Mensaje de agradecimiento si está completado (mascota adoptada)

**Archivos:**
- `app/frontend/pages/sponsorships/SponsorshipDetails.tsx`

#### US-5.3: Cancelar apadrinamiento recurrente
**Como** owner
**Quiero** cancelar mi apadrinamiento recurrente
**Para** dejar de recibir cargos mensuales

**Criterios de aceptación:**
- [ ] Solo disponible para apadrinamientos recurrentes activos
- [ ] Diálogo de confirmación con advertencia
- [ ] Al confirmar: status → cancelled, end_date → hoy
- [ ] Mensaje de confirmación
- [ ] Email de confirmación de cancelación
- [ ] Muestra total que aportó durante el tiempo activo

**Archivos:**
- `app/frontend/components/sponsorships/CancelSponsorshipDialog.tsx`

---

### Epic 6: Gestión de Apadrinamientos (Admin Portal)

#### US-6.1: Ver todos los apadrinamientos
**Como** admin
**Quiero** ver todos los apadrinamientos registrados
**Para** gestionarlos y hacer seguimiento

**Criterios de aceptación:**
- [ ] Lista de todos los apadrinamientos
- [ ] Filtros: estado, recurrencia, mascota, padrino
- [ ] Muestra: padrino, mascota, monto, recurrencia, estado, total aportado
- [ ] Click → detalles
- [ ] Totales al final: apadrinamientos activos, total recaudado mensual estimado

**Archivos:**
- `app/frontend/pages/admin/sponsorships/AllSponsorships.tsx`

#### US-6.2: Marcar apadrinamientos como completados
**Como** admin
**Quiero** marcar apadrinamientos como completados cuando una mascota es adoptada
**Para** actualizar el estado automáticamente

**Criterios de aceptación:**
- [ ] Cuando se completa una adopción (US-4.1), se ejecuta automáticamente
- [ ] Encuentra todos los sponsorships activos de esa mascota
- [ ] Cambia status a "completed" y end_date a hoy
- [ ] Envía email a cada padrino agradeciéndole e informando que la mascota fue adoptada
- [ ] Muestra total final aportado por cada padrino

**Archivos:**
- `app/services/complete_pet_sponsorships.rb` (acción cuando mascota es adoptada)
- `app/mailers/sponsorship_mailer.rb`

---

## Estructura de Archivos

### Backend

```
app/
├── models/
│   ├── pet.rb
│   ├── adoption_record.rb
│   └── sponsorship.rb
├── controllers/
│   ├── pets_controller.rb                   # Owner: CRUD sus mascotas
│   ├── sponsorships_controller.rb           # Owner: gestiona sus apadrinamientos
│   ├── pages_controller.rb                  # adoption method (portal público)
│   ├── api/
│   │   └── adoption_controller.rb           # API JSON para portal público
│   └── admin/
│       ├── pets_controller.rb               # Staff: CRUD todas las mascotas
│       ├── adoptions_controller.rb          # Staff: completar adopciones
│       └── sponsorships_controller.rb       # Staff: ver apadrinamientos
├── services/
│   └── complete_pet_sponsorships.rb         # Auto-completar sponsorships cuando se adopta
└── mailers/
    ├── adoption_mailer.rb
    └── sponsorship_mailer.rb

spec/
├── models/
│   ├── pet_spec.rb
│   ├── adoption_record_spec.rb
│   └── sponsorship_spec.rb
├── requests/
│   ├── pets_spec.rb
│   ├── sponsorships_spec.rb
│   ├── api/adoption_spec.rb
│   ├── admin/pets_spec.rb
│   ├── admin/adoptions_spec.rb
│   └── admin/sponsorships_spec.rb
├── services/
│   └── complete_pet_sponsorships_spec.rb
└── factories/
    ├── pets.rb
    ├── adoption_records.rb
    └── sponsorships.rb
```

### Frontend

```
app/frontend/
├── pages/
│   ├── pets/
│   │   ├── MyPets.tsx              # Owner: lista
│   │   ├── NewPet.tsx              # Owner: crear
│   │   ├── EditPet.tsx             # Owner: editar
│   │   └── PetDetails.tsx          # Owner: ver
│   └── admin/
│       ├── pets/
│       │   ├── AllPets.tsx         # Staff: todas las mascotas
│       │   ├── NewPet.tsx          # Staff: crear
│       │   └── EditPet.tsx         # Staff: editar
│       └── adoptions/
│           ├── CompleteAdoption.tsx
│           └── AdoptionHistory.tsx
├── components/
│   ├── pets/
│   │   ├── PetCard.tsx
│   │   ├── PetForm.tsx
│   │   └── PetFilters.tsx
│   └── adoptions/
│       ├── OwnerSelector.tsx
│       └── NewOwnerForm.tsx
├── hooks/
│   ├── useMyPets.ts
│   ├── usePetForm.ts
│   ├── useAllPets.ts
│   └── useCompleteAdoption.ts
├── store/slices/
│   ├── petsSlice.ts
│   └── adoptionsSlice.ts
└── api/
    ├── Pets.ts
    └── Adoptions.ts
```

---

## Implementación por Fases (TDD)

### Fase 1: Pet Model
1. Escribir specs de Pet model
2. Migración de pets
3. Implementar Pet model con validaciones
4. Factory de Pet
5. Tests pasando

### Fase 2: AdoptionRecord Model
1. Escribir specs de AdoptionRecord
2. Migración de adoption_records
3. Implementar AdoptionRecord
4. Factory de AdoptionRecord
5. Tests pasando

### Fase 3: PetsController (Owner Portal)
1. Request specs para CRUD de owner
2. Implementar PetsController
3. Verificar autorización
4. Tests pasando

### Fase 4: Admin::PetsController
1. Request specs para admin
2. Implementar Admin::PetsController
3. Verificar solo admin/vet
4. Tests pasando

### Fase 5: Admin::AdoptionsController
1. Request specs para adopciones
2. Implementar create (completar adopción)
3. Implementar index (historial)
4. Tests pasando

### Fase 6: Frontend API Clients
1. `api/Pets.ts` (myPets, createPet, updatePet, deletePet)
2. `api/AdminPets.ts` (allPets, etc.)
3. `api/Adoptions.ts` (completeAdoption, history)
4. TypeScript interfaces

### Fase 7: Frontend Redux Slices
1. `petsSlice.ts`
2. `adoptionsSlice.ts`

### Fase 8: Frontend - Owner Portal
1. MyPets.tsx
2. NewPet.tsx
3. EditPet.tsx
4. PetDetails.tsx
5. Hooks correspondientes

### Fase 9: Frontend - Admin Pets
1. AllPets.tsx
2. NewPet.tsx (admin version)
3. EditPet.tsx (admin version)

### Fase 10: Frontend - Adoptions
1. CompleteAdoption.tsx
2. AdoptionHistory.tsx
3. Hooks correspondientes

---

## Validaciones Importantes

### Al crear mascota (Owner):
- `proprietary` = current_user (automático)
- `adoption_status` = "not_for_adoption" (automático)
- No puede cambiar adoption_status

### Al crear mascota (Staff):
- Puede elegir proprietary (Owner o User) o dejarlo NULL
- Puede elegir adoption_status
- Si adoption_status = "not_for_adoption" → proprietary DEBE existir
- Si adoption_status = "available_for_adoption" → proprietary puede ser NULL o existente

### Al completar adopción:
- Pet DEBE tener adoption_status = "available_for_adoption"
- Crear Owner si no existe
- Asignar proprietary al adoptante (tipo Owner)
- Cambiar adoption_status a "adopted"
- Crear AdoptionRecord

---

## Rutas

```ruby
# config/routes.rb

# Owner portal
resources :pets, only: [:index, :show, :create, :update, :destroy]

# Admin portal
namespace :admin do
  resources :pets, only: [:index, :show, :create, :update, :destroy]

  resources :adoptions, only: [:index, :show, :create]
end
```

---

## Consideraciones

**Soft Delete:**
- Campo `active` para no perder historial médico
- Mostrar solo activas por default

**Edad:**
- Calcular desde birth_date cuando existe
- Método `age_display` para mostrar en UI

**Microchip:**
- Único a nivel global
- Opcional pero recomendado

**Adopciones:**
- AdoptionRecord es inmutable (no se edita, solo se crea)
- Mantiene historial completo

**Email de adopción:**
- Opcional: enviar email de bienvenida al nuevo owner
- Incluir información de la mascota
- Próximas citas sugeridas

---

## Métricas de Éxito

- [ ] Owner registra mascota en < 1 minuto
- [ ] Staff completa adopción en < 2 minutos
- [ ] 100% test coverage en modelos
- [ ] 100% test coverage en controladores
- [ ] UI intuitiva con feedback claro
