<!--
STATUS: ✅ COMPLETADO
Implementado en: commits b5be479 + 4c90336
Incluye: Promotion, Announcement, LandingConfig, EmailCampaign models, CampaignMailer, SendEmailCampaignJob
Backend: Models, Actions, Controller, Mailer, Jobs
Frontend: Types, API, Hook, ContentIndex, PromotionsTab, AnnouncementsTab, EmailCampaignsTab, LandingConfigTab
-->

# Plan: Módulo de Gestión de Contenido (Content Management Module)

## Resumen

Implementar un módulo completo de gestión de contenido que permita:
- **Promociones**: Banners y ofertas para el landing
- **Secciones del landing**: Visibilidad y configuración de secciones
- **Productos y servicios visibles**: Control de qué se muestra públicamente
- **Horarios públicos**: Configuración de horarios mostrados en landing
- **Avisos importantes**: Alertas y noticias de la clínica
- **Mensajes masivos**: Envío de emails a listas de owners con filtros
- **Logo**: Carga y gestión del logo de la clínica

**Acceso**: Roles `admin`

---

## Arquitectura

### Modelos

#### Promotion (Nuevo)
Promociones y banners para el landing.

```
Promotion
├── title (string)
├── description (text)
├── discount_percentage (decimal)
├── discount_amount (decimal)
├── start_date (date)
├── end_date (date)
├── is_active (boolean)
├── display_order (integer)
├── link_url (string)
├── link_text (string)
├── created_by_id (FK users)
└── has_one_attached :banner_image
```

#### Announcement (Nuevo)
Avisos importantes de la clínica.

```
Announcement
├── title (string)
├── content (text)
├── announcement_type (integer enum)
├── severity (integer enum)
├── start_date (datetime)
├── end_date (datetime)
├── is_active (boolean)
├── show_on_landing (boolean)
├── show_on_dashboard (boolean)
├── created_by_id (FK users)
```

#### LandingConfig (Nuevo)
Configuración de secciones del landing.

```
LandingConfig
├── key (string unique)
├── value (jsonb)
├── updated_by_id (FK users)
```

#### EmailCampaign (Nuevo)
Campañas de email masivo.

```
EmailCampaign
├── name (string)
├── subject (string)
├── body (text - plain text)
├── filters (jsonb)
├── recipient_count (integer)
├── sent_count (integer)
├── status (integer enum)
├── scheduled_at (datetime)
├── sent_at (datetime)
├── created_by_id (FK users)
```

---

## User Stories

### Epic 1: Base de Datos y Modelos

#### US-1.1: Crear migración para Promotion
**Como** desarrollador
**Quiero** una tabla para promociones
**Para** gestionar banners del landing

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_promotions.rb`
- [ ] Campos: title, description, discount_percentage, discount_amount, start_date, end_date, is_active, display_order, link_url, link_text, created_by_id
- [ ] Índices en is_active, start_date, end_date, display_order
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_promotions.rb` (nuevo)

---

#### US-1.2: Crear migración para Announcement
**Como** desarrollador
**Quiero** una tabla para avisos
**Para** publicar noticias importantes

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_announcements.rb`
- [ ] Campos: title, content, announcement_type, severity, start_date, end_date, is_active, show_on_landing, show_on_dashboard, created_by_id
- [ ] Índices en is_active, show_on_landing, show_on_dashboard, start_date
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_announcements.rb` (nuevo)

---

#### US-1.3: Crear migración para LandingConfig
**Como** desarrollador
**Quiero** una tabla para configuración del landing
**Para** controlar secciones visibles

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_landing_configs.rb`
- [ ] Campos: key, value (jsonb), updated_by_id
- [ ] Índice único en key
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_landing_configs.rb` (nuevo)

---

#### US-1.4: Crear migración para EmailCampaign
**Como** desarrollador
**Quiero** una tabla para campañas de email
**Para** gestionar envíos masivos

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_email_campaigns.rb`
- [ ] Campos: name, subject, body, filters (jsonb), recipient_count, sent_count, status, scheduled_at, sent_at, created_by_id
- [ ] Índices en status, scheduled_at, created_by_id
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_email_campaigns.rb` (nuevo)

---

#### US-1.5: Crear modelo Promotion
**Como** desarrollador
**Quiero** el modelo Promotion
**Para** manejar promociones

**Criterios de aceptación:**
- [ ] Crear `app/models/promotion.rb`
- [ ] Asociaciones:
  - `belongs_to :created_by, class_name: 'User'`
  - `has_one_attached :banner_image`
- [ ] Validaciones: title required, fechas válidas
- [ ] Scopes: `active`, `current` (activo y en rango de fechas), `ordered`
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/promotion.rb` (nuevo)
- `spec/factories/promotions.rb` (nuevo)
- `spec/models/promotion_spec.rb` (nuevo)

---

#### US-1.6: Crear modelo Announcement
**Como** desarrollador
**Quiero** el modelo Announcement
**Para** manejar avisos

**Criterios de aceptación:**
- [ ] Crear `app/models/announcement.rb`
- [ ] Asociaciones:
  - `belongs_to :created_by, class_name: 'User'`
- [ ] Enum announcement_type: `{ info: 0, update: 1, event: 2, alert: 3, holiday: 4 }`
- [ ] Enum severity: `{ low: 0, medium: 1, high: 2, critical: 3 }`
- [ ] Validaciones: title, content required
- [ ] Scopes: `active`, `for_landing`, `for_dashboard`, `current`
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/announcement.rb` (nuevo)
- `spec/factories/announcements.rb` (nuevo)
- `spec/models/announcement_spec.rb` (nuevo)

---

#### US-1.7: Crear modelo LandingConfig
**Como** desarrollador
**Quiero** el modelo LandingConfig
**Para** manejar configuración del landing

**Criterios de aceptación:**
- [ ] Crear `app/models/landing_config.rb`
- [ ] Asociaciones:
  - `belongs_to :updated_by, class_name: 'User', optional: true`
- [ ] Validaciones: key unique
- [ ] Class methods:
  - `self.get(key)` - obtener valor
  - `self.set(key, value, user)` - establecer valor
  - `self.section_visible?(section_key)` - verificar visibilidad
- [ ] Keys predefinidas:
  - `sections_visibility` - {hero: true, services: true, ...}
  - `services_order` - array de IDs en orden
  - `public_hours` - horarios a mostrar
  - `logo_url` - URL del logo
  - `contact_info` - info de contacto
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/landing_config.rb` (nuevo)
- `spec/factories/landing_configs.rb` (nuevo)
- `spec/models/landing_config_spec.rb` (nuevo)

---

#### US-1.8: Crear modelo EmailCampaign
**Como** desarrollador
**Quiero** el modelo EmailCampaign
**Para** manejar campañas de email

**Criterios de aceptación:**
- [ ] Crear `app/models/email_campaign.rb`
- [ ] Asociaciones:
  - `belongs_to :created_by, class_name: 'User'`
- [ ] Enum status: `{ draft: 0, scheduled: 1, sending: 2, completed: 3, failed: 4, cancelled: 5 }`
- [ ] Validaciones: name, subject, body required (cuando no draft)
- [ ] Métodos:
  - `build_recipient_query` - construye query desde filters
  - `recipients` - AR relation de owners
  - `sendable?` - puede enviarse
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/email_campaign.rb` (nuevo)
- `spec/factories/email_campaigns.rb` (nuevo)
- `spec/models/email_campaign_spec.rb` (nuevo)

---

#### US-1.9: Crear modelo ClinicLogo (ActiveStorage)
**Como** desarrollador
**Quiero** gestionar el logo de la clínica
**Para** personalizar la marca

**Criterios de aceptación:**
- [ ] Agregar ActiveStorage attachment para logo en LandingConfig o modelo dedicado
- [ ] Considerar usar EmailCredential.logo o crear nuevo registro
- [ ] Método para obtener URL pública del logo
- [ ] Validar tipos de imagen permitidos (png, jpg, svg)

**Archivos:**
- Posiblemente `app/models/clinic_settings.rb` (nuevo) o modificar LandingConfig

---

#### US-1.10: Crear seeds para Content
**Como** desarrollador
**Quiero** datos de prueba
**Para** probar el módulo

**Criterios de aceptación:**
- [ ] Crear `db/seeds/19_promotions.rb`
- [ ] Crear `db/seeds/20_announcements.rb`
- [ ] Crear `db/seeds/21_landing_configs.rb`
- [ ] Crear `db/seeds/22_email_campaigns.rb` (borrador de ejemplo)
- [ ] Usar find_or_create_by!

**Archivos:**
- `db/seeds/19_promotions.rb` (nuevo)
- `db/seeds/20_announcements.rb` (nuevo)
- `db/seeds/21_landing_configs.rb` (nuevo)
- `db/seeds/22_email_campaigns.rb` (nuevo)

---

### Epic 2: Actions de Promociones

#### US-2.1: Crear Action Content::ListPromotions
**Como** admin
**Quiero** listar promociones
**Para** ver banners configurados

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/list_promotions.rb`
- [ ] Input: include_inactive (boolean)
- [ ] Ordenar por display_order
- [ ] Retornar `Result.success(promotions:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/list_promotions.rb` (nuevo)
- `spec/actions/admin/content/list_promotions_spec.rb` (nuevo)

---

#### US-2.2: Crear Action Content::CreatePromotion
**Como** admin
**Quiero** crear promoción
**Para** agregar banners al landing

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/create_promotion.rb`
- [ ] Input: params, current_user
- [ ] Manejar upload de banner_image
- [ ] Retornar `Result.success(promotion:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/create_promotion.rb` (nuevo)
- `spec/actions/admin/content/create_promotion_spec.rb` (nuevo)

---

#### US-2.3: Crear Action Content::UpdatePromotion
**Como** admin
**Quiero** editar promoción
**Para** modificar banners

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/update_promotion.rb`
- [ ] Input: promotion, params
- [ ] Manejar upload de banner_image
- [ ] Retornar `Result.success(promotion:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/update_promotion.rb` (nuevo)
- `spec/actions/admin/content/update_promotion_spec.rb` (nuevo)

---

#### US-2.4: Crear Action Content::DeletePromotion
**Como** admin
**Quiero** eliminar promoción
**Para** remover banners

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/delete_promotion.rb`
- [ ] Input: promotion
- [ ] Eliminar imagen adjunta
- [ ] Retornar `Result.success()` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/delete_promotion.rb` (nuevo)
- `spec/actions/admin/content/delete_promotion_spec.rb` (nuevo)

---

#### US-2.5: Crear Action Content::ReorderPromotions
**Como** admin
**Quiero** reordenar promociones
**Para** controlar el orden de display

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/reorder_promotions.rb`
- [ ] Input: ordered_ids (array de IDs en nuevo orden)
- [ ] Actualizar display_order de cada promoción
- [ ] Retornar `Result.success(promotions:)` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/reorder_promotions.rb` (nuevo)
- `spec/actions/admin/content/reorder_promotions_spec.rb` (nuevo)

---

### Epic 3: Actions de Avisos

#### US-3.1: Crear Action Content::ListAnnouncements
**Como** admin
**Quiero** listar avisos
**Para** ver noticias configuradas

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/list_announcements.rb`
- [ ] Input: include_inactive, type, for_landing, for_dashboard
- [ ] Ordenar por start_date desc
- [ ] Retornar `Result.success(announcements:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/list_announcements.rb` (nuevo)
- `spec/actions/admin/content/list_announcements_spec.rb` (nuevo)

---

#### US-3.2: Crear Action Content::CreateAnnouncement
**Como** admin
**Quiero** crear aviso
**Para** publicar noticias

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/create_announcement.rb`
- [ ] Input: params, current_user
- [ ] Retornar `Result.success(announcement:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/create_announcement.rb` (nuevo)
- `spec/actions/admin/content/create_announcement_spec.rb` (nuevo)

---

#### US-3.3: Crear Action Content::UpdateAnnouncement
**Como** admin
**Quiero** editar aviso
**Para** modificar noticias

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/update_announcement.rb`
- [ ] Input: announcement, params
- [ ] Retornar `Result.success(announcement:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/update_announcement.rb` (nuevo)
- `spec/actions/admin/content/update_announcement_spec.rb` (nuevo)

---

#### US-3.4: Crear Action Content::DeleteAnnouncement
**Como** admin
**Quiero** eliminar aviso
**Para** remover noticias

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/delete_announcement.rb`
- [ ] Input: announcement
- [ ] Retornar `Result.success()` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/delete_announcement.rb` (nuevo)
- `spec/actions/admin/content/delete_announcement_spec.rb` (nuevo)

---

### Epic 4: Actions de Configuración del Landing

#### US-4.1: Crear Action Content::GetLandingConfig
**Como** admin
**Quiero** obtener configuración del landing
**Para** ver estado actual

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/get_landing_config.rb`
- [ ] Retornar todas las configuraciones como objeto
- [ ] Incluir valores por defecto para keys no configuradas
- [ ] Retornar `Result.success(config:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/get_landing_config.rb` (nuevo)
- `spec/actions/admin/content/get_landing_config_spec.rb` (nuevo)

---

#### US-4.2: Crear Action Content::UpdateLandingConfig
**Como** admin
**Quiero** actualizar configuración del landing
**Para** modificar visibilidad de secciones

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/update_landing_config.rb`
- [ ] Input: config_updates (hash), current_user
- [ ] Upsert cada key-value
- [ ] Retornar `Result.success(config:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/update_landing_config.rb` (nuevo)
- `spec/actions/admin/content/update_landing_config_spec.rb` (nuevo)

---

#### US-4.3: Crear Action Content::UploadLogo
**Como** admin
**Quiero** subir logo de la clínica
**Para** personalizar la marca

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/upload_logo.rb`
- [ ] Input: logo file, current_user
- [ ] Validar tipo de imagen
- [ ] Almacenar con ActiveStorage
- [ ] Actualizar LandingConfig con URL
- [ ] Retornar `Result.success(logo_url:)` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/upload_logo.rb` (nuevo)
- `spec/actions/admin/content/upload_logo_spec.rb` (nuevo)

---

### Epic 5: Actions de Campañas de Email

#### US-5.1: Crear Action Content::ListEmailCampaigns
**Como** admin
**Quiero** listar campañas de email
**Para** ver envíos masivos

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/list_email_campaigns.rb`
- [ ] Input: status (opcional)
- [ ] Ordenar por created_at desc
- [ ] Retornar `Result.success(campaigns:, pagination:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/list_email_campaigns.rb` (nuevo)
- `spec/actions/admin/content/list_email_campaigns_spec.rb` (nuevo)

---

#### US-5.2: Crear Action Content::CreateEmailCampaign
**Como** admin
**Quiero** crear campaña de email
**Para** preparar envío masivo

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/create_email_campaign.rb`
- [ ] Input: params, current_user
- [ ] Status inicial: draft
- [ ] Retornar `Result.success(campaign:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/create_email_campaign.rb` (nuevo)
- `spec/actions/admin/content/create_email_campaign_spec.rb` (nuevo)

---

#### US-5.3: Crear Action Content::UpdateEmailCampaign
**Como** admin
**Quiero** editar campaña
**Para** modificar contenido antes de enviar

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/update_email_campaign.rb`
- [ ] Input: campaign, params
- [ ] Solo si status es draft o scheduled
- [ ] Retornar `Result.success(campaign:)` o `Result.failure(errors:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/update_email_campaign.rb` (nuevo)
- `spec/actions/admin/content/update_email_campaign_spec.rb` (nuevo)

---

#### US-5.4: Crear Action Content::PreviewCampaignRecipients
**Como** admin
**Quiero** previsualizar destinatarios
**Para** verificar filtros antes de enviar

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/preview_campaign_recipients.rb`
- [ ] Input: filters (JSON)
- [ ] Construir query sin ejecutar envío
- [ ] Retornar:
  - Total de recipients
  - Primeros 10 como muestra
- [ ] Retornar `Result.success(count:, sample:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/preview_campaign_recipients.rb` (nuevo)
- `spec/actions/admin/content/preview_campaign_recipients_spec.rb` (nuevo)

---

#### US-5.5: Crear Action Content::SendEmailCampaign
**Como** admin
**Quiero** enviar campaña
**Para** distribuir emails masivos

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/send_email_campaign.rb`
- [ ] Input: campaign
- [ ] Validar: status debe ser draft o scheduled
- [ ] Calcular recipient_count
- [ ] Encolar job para envío
- [ ] Cambiar status a sending
- [ ] Retornar `Result.success(campaign:)` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/send_email_campaign.rb` (nuevo)
- `spec/actions/admin/content/send_email_campaign_spec.rb` (nuevo)

---

#### US-5.6: Crear Action Content::CancelEmailCampaign
**Como** admin
**Quiero** cancelar campaña
**Para** detener envío programado

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/content/cancel_email_campaign.rb`
- [ ] Input: campaign
- [ ] Solo si status es scheduled o sending (parcial)
- [ ] Cambiar status a cancelled
- [ ] Retornar `Result.success(campaign:)` o `Result.failure(error:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/content/cancel_email_campaign.rb` (nuevo)
- `spec/actions/admin/content/cancel_email_campaign_spec.rb` (nuevo)

---

### Epic 6: Job y Mailer para Campañas

#### US-6.1: Crear CampaignMailer
**Como** sistema
**Quiero** un mailer para campañas
**Para** enviar emails masivos

**Criterios de aceptación:**
- [ ] Crear `app/mailers/campaign_mailer.rb`
- [ ] Método `campaign_email(owner, campaign)`:
  - Subject desde campaign.subject
  - Body en texto plano desde campaign.body
- [ ] Template simple solo texto
- [ ] Crear spec

**Archivos:**
- `app/mailers/campaign_mailer.rb` (nuevo)
- `app/views/campaign_mailer/campaign_email.text.erb` (nuevo)
- `app/views/campaign_mailer/campaign_email.html.erb` (nuevo - simple)
- `spec/mailers/campaign_mailer_spec.rb` (nuevo)

---

#### US-6.2: Crear SendEmailCampaignJob
**Como** sistema
**Quiero** job para enviar campaña
**Para** procesar envíos en background

**Criterios de aceptación:**
- [ ] Crear `app/jobs/send_email_campaign_job.rb`
- [ ] Hereda de ApplicationJob
- [ ] Queue: :mailers
- [ ] Lógica:
  - Cargar campaign
  - Construir query de recipients desde filters
  - Para cada owner: encolar email con deliver_later
  - Actualizar sent_count
  - Al finalizar: status completed, sent_at = now
- [ ] Manejo de errores: status failed si hay problemas
- [ ] Crear spec

**Archivos:**
- `app/jobs/send_email_campaign_job.rb` (nuevo)
- `spec/jobs/send_email_campaign_job_spec.rb` (nuevo)

---

### Epic 7: Backend - Controller y Rutas

#### US-7.1: Tests TDD para Content Controller
**Como** desarrollador
**Quiero** escribir tests antes de implementar
**Para** seguir TDD

**Criterios de aceptación:**
- [ ] Crear `spec/requests/admin/content_spec.rb`
- [ ] Tests para todos los endpoints
- [ ] Verificar autorización (solo admin)
- [ ] Tests deben fallar inicialmente

**Archivos:**
- `spec/requests/admin/content_spec.rb` (nuevo)

---

#### US-7.2: Implementar Admin::ContentController
**Como** admin
**Quiero** endpoints de contenido
**Para** gestionar contenido

**Criterios de aceptación:**
- [ ] Crear `app/controllers/admin/content_controller.rb`
- [ ] Include Authenticatable
- [ ] before_action :authenticate_admin!
- [ ] Actions para:
  - Promotions: index, create, update, destroy, reorder
  - Announcements: index, create, update, destroy
  - Landing Config: show, update
  - Logo: upload
  - Email Campaigns: index, show, create, update, preview_recipients, send, cancel
- [ ] Tests deben pasar

**Archivos:**
- `app/controllers/admin/content_controller.rb` (nuevo)

---

#### US-7.3: Agregar rutas de Content
**Como** desarrollador
**Quiero** rutas para contenido
**Para** que el frontend pueda consumir

**Criterios de aceptación:**
- [ ] Modificar `config/routes.rb`
- [ ] En namespace admin:
  ```ruby
  namespace :content do
    resources :promotions do
      collection do
        patch :reorder
      end
    end

    resources :announcements

    resource :landing_config, only: [:show, :update]
    post :upload_logo

    resources :email_campaigns do
      member do
        post :send_campaign
        post :cancel
      end
      collection do
        post :preview_recipients
      end
    end
  end
  ```

**Archivos:**
- `config/routes.rb` (modificar)

---

### Epic 8: Modificar Landing para Soportar Configuración

#### US-8.1: Crear endpoint público para contenido del landing
**Como** visitante
**Quiero** ver contenido configurado
**Para** ver promociones y avisos

**Criterios de aceptación:**
- [ ] Crear `app/controllers/public/landing_controller.rb`
- [ ] Endpoint `GET /api/landing` (o similar)
- [ ] Retornar:
  - Secciones visibles
  - Promociones activas
  - Avisos para landing
  - Eventos especiales visibles
  - Logo URL
  - Horarios públicos
- [ ] No requiere autenticación
- [ ] Crear spec

**Archivos:**
- `app/controllers/public/landing_controller.rb` (nuevo)
- `spec/requests/public/landing_spec.rb` (nuevo)

---

#### US-8.2: Modificar componentes del landing
**Como** visitante
**Quiero** ver contenido dinámico
**Para** ver promociones y avisos

**Criterios de aceptación:**
- [ ] Modificar `app/frontend/pages/Home.tsx`
- [ ] Crear hook `useLandingContent` para fetch de configuración
- [ ] Renderizar condicionalmente secciones según visibilidad
- [ ] Agregar sección de promociones (carousel o grid)
- [ ] Agregar sección de avisos (banner superior)
- [ ] Mostrar eventos especiales si hay activos
- [ ] Usar logo desde configuración

**Archivos:**
- `app/frontend/pages/Home.tsx` (modificar)
- `app/frontend/hooks/useLandingContent.ts` (nuevo)
- `app/frontend/components/landing/PromotionsBanner.tsx` (nuevo)
- `app/frontend/components/landing/AnnouncementBar.tsx` (nuevo)

---

### Epic 9: Frontend - Tipos, API y Estado

#### US-9.1: Crear tipos TypeScript para Content
**Como** desarrollador frontend
**Quiero** tipos para contenido
**Para** tener type safety

**Criterios de aceptación:**
- [ ] Crear `app/frontend/types/Content.ts`
- [ ] Tipos:
  - `Promotion`, `PromotionParams`
  - `Announcement`, `AnnouncementType`, `Severity`
  - `LandingConfig`, `SectionVisibility`
  - `EmailCampaign`, `CampaignStatus`, `CampaignFilters`

**Archivos:**
- `app/frontend/types/Content.ts` (nuevo)

---

#### US-9.2: Crear API client para Content
**Como** desarrollador frontend
**Quiero** cliente API para contenido
**Para** consumir los endpoints

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/Content.ts`
- [ ] Métodos para cada operación
- [ ] Export instancia `contentApi`

**Archivos:**
- `app/frontend/api/Content.ts` (nuevo)

---

#### US-9.3: Crear hook useContent
**Como** desarrollador frontend
**Quiero** hook para gestionar contenido
**Para** separar lógica

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/useContent.ts`
- [ ] Métodos para cada operación
- [ ] Manejo de loading/error
- [ ] Toast notifications

**Archivos:**
- `app/frontend/hooks/useContent.ts` (nuevo)

---

### Epic 10: Frontend - Páginas y Componentes Admin

#### US-10.1: Crear página ContentIndex
**Como** admin
**Quiero** una página de gestión de contenido
**Para** administrar landing y comunicaciones

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/ContentIndex.tsx`
- [ ] Tabs: Promociones, Avisos, Configuración, Email Marketing
- [ ] Vista interna con useState
- [ ] Envuelto en AdminLayout

**Archivos:**
- `app/frontend/pages/admin/content/ContentIndex.tsx` (nuevo)

---

#### US-10.2: Crear componente PromotionsList
**Como** admin
**Quiero** listar promociones
**Para** gestionar banners

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/components/PromotionsList.tsx`
- [ ] Cards con: imagen, título, fechas, estado
- [ ] Drag & drop para reordenar
- [ ] Botón nuevo
- [ ] Acciones: editar, eliminar, toggle activo

**Archivos:**
- `app/frontend/pages/admin/content/components/PromotionsList.tsx` (nuevo)

---

#### US-10.3: Crear componente PromotionForm
**Como** admin
**Quiero** formulario de promoción
**Para** crear/editar banners

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/components/PromotionForm.tsx`
- [ ] Campos: título, descripción, descuento, fechas, link
- [ ] Upload de imagen
- [ ] Preview de banner
- [ ] Modo create/edit

**Archivos:**
- `app/frontend/pages/admin/content/components/PromotionForm.tsx` (nuevo)

---

#### US-10.4: Crear componente AnnouncementsList
**Como** admin
**Quiero** listar avisos
**Para** gestionar noticias

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/components/AnnouncementsList.tsx`
- [ ] Tabla con: título, tipo, severidad, fechas, destino
- [ ] Filtros por tipo y destino
- [ ] Botón nuevo
- [ ] Acciones: editar, eliminar

**Archivos:**
- `app/frontend/pages/admin/content/components/AnnouncementsList.tsx` (nuevo)

---

#### US-10.5: Crear componente AnnouncementForm
**Como** admin
**Quiero** formulario de aviso
**Para** crear/editar noticias

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/components/AnnouncementForm.tsx`
- [ ] Campos: título, contenido, tipo, severidad, fechas
- [ ] Checkboxes: mostrar en landing, mostrar en dashboard
- [ ] Modo create/edit

**Archivos:**
- `app/frontend/pages/admin/content/components/AnnouncementForm.tsx` (nuevo)

---

#### US-10.6: Crear componente LandingConfigEditor
**Como** admin
**Quiero** configurar el landing
**Para** controlar visibilidad y contenido

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/components/LandingConfigEditor.tsx`
- [ ] Secciones:
  - Visibilidad de secciones (toggles)
  - Upload de logo
  - Horarios públicos
  - Información de contacto
- [ ] Guardar cambios

**Archivos:**
- `app/frontend/pages/admin/content/components/LandingConfigEditor.tsx` (nuevo)

---

#### US-10.7: Crear componente EmailCampaignsList
**Como** admin
**Quiero** listar campañas de email
**Para** gestionar envíos masivos

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/components/EmailCampaignsList.tsx`
- [ ] Tabla con: nombre, asunto, estado, destinatarios, fecha
- [ ] Filtros por estado
- [ ] Botón nueva campaña
- [ ] Acciones según estado: editar, enviar, cancelar, ver estadísticas

**Archivos:**
- `app/frontend/pages/admin/content/components/EmailCampaignsList.tsx` (nuevo)

---

#### US-10.8: Crear componente EmailCampaignEditor
**Como** admin
**Quiero** crear/editar campaña
**Para** preparar envío masivo

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/components/EmailCampaignEditor.tsx`
- [ ] Campos: nombre, asunto, cuerpo (textarea texto plano)
- [ ] Sección de filtros:
  - Por mascota (especie, estado)
  - Por owner (activo, con citas recientes)
  - Por veterinario asignado
  - Por servicio recibido
  - Por citas (próximas, pasadas)
- [ ] Preview de destinatarios (count + muestra)
- [ ] Botones: Guardar borrador, Enviar ahora, Programar

**Archivos:**
- `app/frontend/pages/admin/content/components/EmailCampaignEditor.tsx` (nuevo)

---

#### US-10.9: Crear componente RecipientFilterBuilder
**Como** admin
**Quiero** construir filtros para destinatarios
**Para** segmentar envíos

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/content/components/RecipientFilterBuilder.tsx`
- [ ] Filtros disponibles:
  - Por mascota:
    - Especie (perro, gato, etc.)
    - Estado de adopción
    - Con vacunas vencidas
  - Por owner:
    - Activos
    - Con citas en últimos X días
  - Por veterinario:
    - Atendidos por X veterinario
  - Por servicio:
    - Han recibido servicio X
  - Por citas:
    - Con cita próxima en X días
    - Sin citas hace X días
- [ ] UI de añadir/remover filtros
- [ ] Actualización en tiempo real del count

**Archivos:**
- `app/frontend/pages/admin/content/components/RecipientFilterBuilder.tsx` (nuevo)

---

#### US-10.10: Habilitar página Content en sidebar y rutas
**Como** usuario admin
**Quiero** acceder a Contenido desde el sidebar
**Para** gestionar contenido

**Criterios de aceptación:**
- [ ] Modificar `app/actions/admin/build_sidebar.rb`:
  - Habilitar item "content" (remover disabled: true)
  - Solo para admin
- [ ] Agregar en routes.rb: `get 'content', to: 'admin_pages#content'`
- [ ] Agregar action en AdminPagesController

**Archivos:**
- `app/actions/admin/build_sidebar.rb` (modificar)
- `config/routes.rb` (modificar)
- `app/controllers/admin_pages_controller.rb` (modificar)

---

## Modelo de Datos

### Promotion

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| title | string | ✓ | Max 255 |
| description | text | - | - |
| discount_percentage | decimal(5,2) | - | 0-100 |
| discount_amount | decimal(10,2) | - | Monto fijo |
| start_date | date | - | - |
| end_date | date | - | - |
| is_active | boolean | ✓ | Default: true |
| display_order | integer | ✓ | Default: 0 |
| link_url | string | - | URL de destino |
| link_text | string | - | Texto del botón |
| created_by_id | bigint | ✓ | FK users |

### Announcement

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| title | string | ✓ | Max 255 |
| content | text | ✓ | - |
| announcement_type | integer | ✓ | Enum |
| severity | integer | ✓ | Enum |
| start_date | datetime | - | - |
| end_date | datetime | - | - |
| is_active | boolean | ✓ | Default: true |
| show_on_landing | boolean | ✓ | Default: false |
| show_on_dashboard | boolean | ✓ | Default: true |
| created_by_id | bigint | ✓ | FK users |

### LandingConfig

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| key | string | ✓ | Unique |
| value | jsonb | - | Configuración |
| updated_by_id | bigint | - | FK users |

### EmailCampaign

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| name | string | ✓ | Max 255 |
| subject | string | ✓* | *Si no draft |
| body | text | ✓* | Texto plano |
| filters | jsonb | - | Criterios de selección |
| recipient_count | integer | ✓ | Default: 0 |
| sent_count | integer | ✓ | Default: 0 |
| status | integer | ✓ | Enum |
| scheduled_at | datetime | - | - |
| sent_at | datetime | - | - |
| created_by_id | bigint | ✓ | FK users |

---

## Filtros de Email Campaign (JSON Schema)

```json
{
  "pet_filters": {
    "species": ["dog", "cat"],
    "adoption_status": "adopted",
    "has_overdue_vaccines": true
  },
  "owner_filters": {
    "is_active": true,
    "has_appointments_in_days": 30
  },
  "service_filters": {
    "received_service_ids": [1, 2, 3]
  },
  "appointment_filters": {
    "has_upcoming_in_days": 7,
    "no_appointments_in_days": 90
  },
  "veterinarian_id": 5
}
```

---

## Endpoints API

| Método | Ruta | Acción | Roles |
|--------|------|--------|-------|
| GET | /admin/content/promotions | list_promotions | admin |
| POST | /admin/content/promotions | create_promotion | admin |
| PATCH | /admin/content/promotions/:id | update_promotion | admin |
| DELETE | /admin/content/promotions/:id | delete_promotion | admin |
| PATCH | /admin/content/promotions/reorder | reorder_promotions | admin |
| GET | /admin/content/announcements | list_announcements | admin |
| POST | /admin/content/announcements | create_announcement | admin |
| PATCH | /admin/content/announcements/:id | update_announcement | admin |
| DELETE | /admin/content/announcements/:id | delete_announcement | admin |
| GET | /admin/content/landing_config | get_landing_config | admin |
| PATCH | /admin/content/landing_config | update_landing_config | admin |
| POST | /admin/content/upload_logo | upload_logo | admin |
| GET | /admin/content/email_campaigns | list_campaigns | admin |
| GET | /admin/content/email_campaigns/:id | show_campaign | admin |
| POST | /admin/content/email_campaigns | create_campaign | admin |
| PATCH | /admin/content/email_campaigns/:id | update_campaign | admin |
| POST | /admin/content/email_campaigns/preview_recipients | preview | admin |
| POST | /admin/content/email_campaigns/:id/send_campaign | send | admin |
| POST | /admin/content/email_campaigns/:id/cancel | cancel | admin |
| GET | /api/landing | public_landing_content | público |

---

## Orden de Implementación

### Fase 1: Base de Datos y Modelos (US 1.1 - 1.10)
1. Migraciones
2. Modelos con validaciones
3. Factories y model specs
4. Seeds

### Fase 2: Actions de Promociones (US 2.1 - 2.5)
5. CRUD de promociones
6. Reordenamiento

### Fase 3: Actions de Avisos (US 3.1 - 3.4)
7. CRUD de avisos

### Fase 4: Actions de Landing Config (US 4.1 - 4.3)
8. Get/Update config
9. Upload logo

### Fase 5: Actions de Email Campaigns (US 5.1 - 5.6)
10. CRUD de campañas
11. Preview recipients
12. Send/Cancel

### Fase 6: Job y Mailer (US 6.1 - 6.2)
13. CampaignMailer
14. SendEmailCampaignJob

### Fase 7: Backend Controller (US 7.1 - 7.3)
15. Tests TDD
16. Controller
17. Rutas

### Fase 8: Modificar Landing (US 8.1 - 8.2)
18. Endpoint público
19. Componentes dinámicos

### Fase 9: Frontend Base (US 9.1 - 9.3)
20. Tipos TypeScript
21. API client
22. Hook useContent

### Fase 10: Páginas y Componentes (US 10.1 - 10.10)
23. ContentIndex
24. Promociones UI
25. Avisos UI
26. Landing Config UI
27. Email Campaigns UI
28. Habilitar en sidebar

---

## Verificación

### Tests Backend
```bash
bundle exec rspec spec/models/promotion_spec.rb
bundle exec rspec spec/models/announcement_spec.rb
bundle exec rspec spec/models/landing_config_spec.rb
bundle exec rspec spec/models/email_campaign_spec.rb
bundle exec rspec spec/actions/admin/content/
bundle exec rspec spec/requests/admin/content_spec.rb
bundle exec rspec spec/jobs/send_email_campaign_job_spec.rb
bundle exec rspec spec/mailers/campaign_mailer_spec.rb
```

### E2E Manual
1. Navegar a /admin/content
2. Crear y ordenar promociones
3. Crear aviso y verificar en landing
4. Configurar visibilidad de secciones
5. Subir nuevo logo
6. Crear campaña de email con filtros
7. Previsualizar destinatarios
8. Enviar campaña (verificar con letter_opener)
9. Verificar landing refleja cambios

### CI
```bash
npm run push
```
