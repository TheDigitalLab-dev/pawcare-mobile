<!--
STATUS: ✅ COMPLETADO
Implementado en: commit 4c90336
Incluye: Product, ServiceCategory, StockMovement models, Stock Actions (add/remove/adjust), LowStockAlertJob, ExpirationAlertJob
Backend: Models, Actions, Controllers, Jobs, InventoryMailer
Frontend: Types, API, Hooks, Redux slices
-->

# Plan: Módulo de Productos y Servicios (Products & Services Module)

## Resumen

Implementar un módulo completo de gestión de productos y servicios que incluya:
- **Productos**: Inventario de medicamentos, alimentos, accesorios
- **Categorías de servicios**: Organización jerárquica de servicios
- **Gestión de stock**: Movimientos de inventario, alertas de bajo stock
- **Precios y descuentos**: Configuración de precios por producto/servicio
- **Visibilidad**: Control de qué productos/servicios se muestran en landing
- **Reportes**: Productos más vendidos, servicios más solicitados

**Acceso**: Roles `admin`, `vet` (solo lectura para productos)

---

## Arquitectura

### Modelos Existentes

#### Service (Ya existe - Mejorar)
Añadir campos para categorización y visibilidad.

```
Service (Mejoras)
├── + category_id (FK service_categories) - NUEVO
├── + is_visible_on_landing (boolean) - NUEVO
├── + display_order (integer) - NUEVO
├── + requires_appointment (boolean) - NUEVO
├── + species_applicable (JSON array) - NUEVO ["dog", "cat", "all"]
```

### Modelos Nuevos

#### ServiceCategory (Nuevo)
Categorías para organizar servicios.

```
ServiceCategory
├── name (string)
├── description (text)
├── icon (string) - nombre de ícono
├── display_order (integer)
├── is_active (boolean)
├── parent_id (FK self) - categorías anidadas
└── created_by_id (FK users)
```

#### Product (Nuevo)
Catálogo de productos físicos.

```
Product
├── name (string)
├── description (text)
├── sku (string unique)
├── barcode (string)
├── category (integer enum)
├── unit_type (integer enum) - unidad, caja, ml, kg
├── purchase_price (decimal)
├── sale_price (decimal)
├── currency (string)
├── current_stock (integer)
├── minimum_stock (integer)
├── maximum_stock (integer)
├── expiration_date (date)
├── requires_prescription (boolean)
├── species_applicable (JSON array)
├── is_active (boolean)
├── is_visible_on_landing (boolean)
├── display_order (integer)
├── supplier (string)
├── created_by_id (FK users)
└── has_one_attached :image
```

#### StockMovement (Nuevo)
Registro de movimientos de inventario.

```
StockMovement
├── product_id (FK)
├── movement_type (integer enum) - entrada, salida, ajuste, venta
├── quantity (integer)
├── previous_stock (integer)
├── new_stock (integer)
├── unit_price (decimal)
├── total_price (decimal)
├── reason (string)
├── reference_type (string) - polymorphic
├── reference_id (bigint) - polymorphic (Appointment, Consultation, etc.)
├── batch_number (string)
├── expiration_date (date)
├── created_by_id (FK users)
└── notes (text)
```

---

## Enums

```ruby
# Product
enum :category, {
  medication: 0,          # Medicamentos
  vaccine: 1,             # Vacunas
  food: 2,                # Alimentos
  accessory: 3,           # Accesorios
  hygiene: 4,             # Higiene
  supplement: 5,          # Suplementos
  equipment: 6,           # Equipamiento
  other: 7
}

enum :unit_type, {
  unit: 0,                # Unidad
  box: 1,                 # Caja
  bottle: 2,              # Botella
  ml: 3,                  # Mililitros
  kg: 4,                  # Kilogramos
  g: 5,                   # Gramos
  dose: 6                 # Dosis
}

# StockMovement
enum :movement_type, {
  purchase: 0,            # Compra/entrada
  sale: 1,                # Venta
  adjustment: 2,          # Ajuste manual
  return: 3,              # Devolución
  expired: 4,             # Expirado
  damaged: 5,             # Dañado
  transfer: 6             # Transferencia
}
```

---

## User Stories

### Epic 1: Base de Datos y Modelos

#### US-1.1: Crear migración para ServiceCategory
**Como** desarrollador
**Quiero** una tabla para categorías de servicios
**Para** organizar los servicios jerárquicamente

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_service_categories.rb`
- [ ] Campos: name, description, icon, display_order, is_active, parent_id, created_by_id
- [ ] Índices en: name (unique), parent_id, is_active, display_order
- [ ] Foreign key a users (created_by_id)
- [ ] Self-referential FK para parent_id

**Archivos:**
- `db/migrate/xxx_create_service_categories.rb`

---

#### US-1.2: Crear modelo ServiceCategory
**Como** desarrollador
**Quiero** el modelo ServiceCategory
**Para** manejar categorías de servicios en la aplicación

**Criterios de aceptación:**
- [ ] Crear modelo con asociaciones (belongs_to :created_by, belongs_to :parent, has_many :children, has_many :services)
- [ ] Validaciones: name presence y uniqueness
- [ ] Scopes: active, ordered, root_categories
- [ ] Método: full_path (ej: "Consultas > Especialidades")

**Archivos:**
- `app/models/service_category.rb`
- `spec/models/service_category_spec.rb`

---

#### US-1.3: Migración para añadir campos a Service
**Como** desarrollador
**Quiero** añadir campos a la tabla services
**Para** soportar categorización y visibilidad

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_add_fields_to_services.rb`
- [ ] Añadir: category_id, is_visible_on_landing, display_order, requires_appointment, species_applicable
- [ ] Índices en: category_id, is_visible_on_landing
- [ ] Foreign key a service_categories

**Archivos:**
- `db/migrate/xxx_add_fields_to_services.rb`

---

#### US-1.4: Actualizar modelo Service
**Como** desarrollador
**Quiero** actualizar el modelo Service
**Para** incluir las nuevas asociaciones y validaciones

**Criterios de aceptación:**
- [ ] Añadir belongs_to :category, class_name: "ServiceCategory", optional: true
- [ ] Añadir scopes: visible_on_landing, by_species, requires_appointment
- [ ] Mantener compatibilidad con código existente

**Archivos:**
- `app/models/service.rb`
- `spec/models/service_spec.rb`

---

#### US-1.5: Crear migración para Product
**Como** desarrollador
**Quiero** una tabla para productos
**Para** gestionar el inventario de la clínica

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_products.rb`
- [ ] Todos los campos del modelo Product
- [ ] Índices en: sku (unique), barcode, category, is_active, current_stock
- [ ] Foreign key a users (created_by_id)

**Archivos:**
- `db/migrate/xxx_create_products.rb`

---

#### US-1.6: Crear modelo Product
**Como** desarrollador
**Quiero** el modelo Product
**Para** manejar productos en la aplicación

**Criterios de aceptación:**
- [ ] Crear modelo con asociaciones y enums
- [ ] Validaciones: name, sku (presence y uniqueness), prices, stock
- [ ] Scopes: active, low_stock, expiring_soon, by_category, visible_on_landing
- [ ] Callbacks: after_save para alertas de bajo stock
- [ ] Métodos: low_stock?, expired?, profit_margin

**Archivos:**
- `app/models/product.rb`
- `spec/models/product_spec.rb`

---

#### US-1.7: Crear migración para StockMovement
**Como** desarrollador
**Quiero** una tabla para movimientos de stock
**Para** rastrear el historial de inventario

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_stock_movements.rb`
- [ ] Todos los campos del modelo StockMovement
- [ ] Índices en: product_id, movement_type, created_at, reference
- [ ] Foreign keys a products y users

**Archivos:**
- `db/migrate/xxx_create_stock_movements.rb`

---

#### US-1.8: Crear modelo StockMovement
**Como** desarrollador
**Quiero** el modelo StockMovement
**Para** registrar movimientos de inventario

**Criterios de aceptación:**
- [ ] Crear modelo con asociaciones y enums
- [ ] Validaciones: product, movement_type, quantity
- [ ] Callbacks: after_create para actualizar current_stock en Product
- [ ] Scopes: by_type, by_date_range, by_product

**Archivos:**
- `app/models/stock_movement.rb`
- `spec/models/stock_movement_spec.rb`

---

### Epic 2: Seeds

#### US-2.1: Crear seed para ServiceCategory
**Como** desarrollador
**Quiero** datos de prueba para categorías de servicios
**Para** probar la funcionalidad en desarrollo

**Criterios de aceptación:**
- [ ] Crear `db/seeds/10_service_categories.rb`
- [ ] Categorías: Consultas, Vacunación, Cirugía, Estética, Laboratorio
- [ ] Usar find_or_create_by! para idempotencia

**Archivos:**
- `db/seeds/10_service_categories.rb`

---

#### US-2.2: Actualizar seed de Services
**Como** desarrollador
**Quiero** actualizar seeds de servicios con categorías
**Para** tener datos coherentes

**Criterios de aceptación:**
- [ ] Actualizar `db/seeds/` existente o crear nuevo
- [ ] Asignar categorías a servicios existentes
- [ ] Añadir is_visible_on_landing y display_order

**Archivos:**
- `db/seeds/xx_services.rb`

---

#### US-2.3: Crear seed para Products
**Como** desarrollador
**Quiero** datos de prueba para productos
**Para** probar la funcionalidad de inventario

**Criterios de aceptación:**
- [ ] Crear `db/seeds/11_products.rb`
- [ ] Productos de cada categoría (medicamentos, vacunas, alimentos, etc.)
- [ ] Incluir productos con bajo stock para probar alertas

**Archivos:**
- `db/seeds/11_products.rb`

---

### Epic 3: Actions para Productos

#### US-3.1: Action Products::Create
**Como** administrador
**Quiero** crear productos
**Para** añadir items al inventario

**Criterios de aceptación:**
- [ ] Crear Action que valide y cree producto
- [ ] Crear movimiento de stock inicial si current_stock > 0
- [ ] Retorna Result.success(product:) o Result.failure(errors:)
- [ ] Test con >80% coverage

**Archivos:**
- `app/actions/products/create.rb`
- `spec/actions/products/create_spec.rb`

---

#### US-3.2: Action Products::Update
**Como** administrador
**Quiero** actualizar productos
**Para** mantener el catálogo actualizado

**Criterios de aceptación:**
- [ ] Crear Action que valide y actualice producto
- [ ] No permitir cambiar current_stock directamente (usar StockMovement)
- [ ] Retorna Result.success(product:) o Result.failure(errors:)
- [ ] Test con >80% coverage

**Archivos:**
- `app/actions/products/update.rb`
- `spec/actions/products/update_spec.rb`

---

#### US-3.3: Action Products::AddStock
**Como** administrador
**Quiero** registrar entrada de inventario
**Para** aumentar el stock de productos

**Criterios de aceptación:**
- [ ] Crear Action que cree StockMovement tipo purchase
- [ ] Actualizar current_stock del producto
- [ ] Validar cantidad positiva
- [ ] Registrar batch_number y expiration_date opcionales
- [ ] Retorna Result.success(product:, movement:)

**Archivos:**
- `app/actions/products/add_stock.rb`
- `spec/actions/products/add_stock_spec.rb`

---

#### US-3.4: Action Products::RemoveStock
**Como** sistema/administrador
**Quiero** registrar salida de inventario
**Para** decrementar stock por venta/uso/ajuste

**Criterios de aceptación:**
- [ ] Crear Action que cree StockMovement tipo sale/adjustment
- [ ] Validar que hay suficiente stock
- [ ] Actualizar current_stock del producto
- [ ] Soportar referencia polimórfica (Appointment, Consultation)
- [ ] Retorna Result.success(product:, movement:)

**Archivos:**
- `app/actions/products/remove_stock.rb`
- `spec/actions/products/remove_stock_spec.rb`

---

#### US-3.5: Action Products::AdjustStock
**Como** administrador
**Quiero** hacer ajustes de inventario
**Para** corregir discrepancias en el stock

**Criterios de aceptación:**
- [ ] Crear Action que cree StockMovement tipo adjustment
- [ ] Permitir ajuste positivo o negativo
- [ ] Requerir razón del ajuste
- [ ] Retorna Result.success(product:, movement:)

**Archivos:**
- `app/actions/products/adjust_stock.rb`
- `spec/actions/products/adjust_stock_spec.rb`

---

### Epic 4: Actions para Servicios

#### US-4.1: Action Services::Create
**Como** administrador
**Quiero** crear servicios
**Para** añadir nuevos servicios al catálogo

**Criterios de aceptación:**
- [ ] Crear Action que valide y cree servicio
- [ ] Asignar categoría opcional
- [ ] Retorna Result.success(service:) o Result.failure(errors:)
- [ ] Test con >80% coverage

**Archivos:**
- `app/actions/services/create.rb`
- `spec/actions/services/create_spec.rb`

---

#### US-4.2: Action Services::Update
**Como** administrador
**Quiero** actualizar servicios
**Para** mantener el catálogo actualizado

**Criterios de aceptación:**
- [ ] Crear Action que valide y actualice servicio
- [ ] Retorna Result.success(service:) o Result.failure(errors:)
- [ ] Test con >80% coverage

**Archivos:**
- `app/actions/services/update.rb`
- `spec/actions/services/update_spec.rb`

---

#### US-4.3: Action ServiceCategories::Create
**Como** administrador
**Quiero** crear categorías de servicios
**Para** organizar los servicios

**Criterios de aceptación:**
- [ ] Crear Action que valide y cree categoría
- [ ] Soportar categoría padre para jerarquía
- [ ] Retorna Result.success(category:) o Result.failure(errors:)

**Archivos:**
- `app/actions/service_categories/create.rb`
- `spec/actions/service_categories/create_spec.rb`

---

### Epic 5: Controllers

#### US-5.1: ProductsController
**Como** desarrollador
**Quiero** un controlador para productos
**Para** exponer la API de gestión de productos

**Criterios de aceptación:**
- [ ] Acciones: index, show, create, update, destroy
- [ ] Filtros: category, is_active, low_stock, search
- [ ] Paginación en index
- [ ] Autenticación y autorización (admin/vet read-only)
- [ ] Request specs con >80% coverage

**Archivos:**
- `app/controllers/products_controller.rb`
- `spec/requests/products_spec.rb`

---

#### US-5.2: StockMovementsController
**Como** desarrollador
**Quiero** un controlador para movimientos de stock
**Para** exponer la API de movimientos de inventario

**Criterios de aceptación:**
- [ ] Acciones: index, show, create (add_stock, remove_stock, adjust)
- [ ] Filtros: product_id, movement_type, date_range
- [ ] Paginación en index
- [ ] Solo admin puede crear movimientos
- [ ] Request specs con >80% coverage

**Archivos:**
- `app/controllers/stock_movements_controller.rb`
- `spec/requests/stock_movements_spec.rb`

---

#### US-5.3: ServicesController (Actualizar)
**Como** desarrollador
**Quiero** actualizar el controlador de servicios
**Para** soportar las nuevas funcionalidades

**Criterios de aceptación:**
- [ ] Añadir filtros: category_id, is_visible_on_landing, species
- [ ] Incluir categoría en respuestas
- [ ] Mantener compatibilidad con código existente
- [ ] Request specs actualizados

**Archivos:**
- `app/controllers/services_controller.rb`
- `spec/requests/services_spec.rb`

---

#### US-5.4: ServiceCategoriesController
**Como** desarrollador
**Quiero** un controlador para categorías de servicios
**Para** exponer la API de categorías

**Criterios de aceptación:**
- [ ] Acciones: index, show, create, update, destroy
- [ ] Index retorna árbol jerárquico
- [ ] Solo admin puede modificar
- [ ] Request specs con >80% coverage

**Archivos:**
- `app/controllers/service_categories_controller.rb`
- `spec/requests/service_categories_spec.rb`

---

### Epic 6: Frontend - Types y API

#### US-6.1: Types para Products
**Como** desarrollador frontend
**Quiero** tipos TypeScript para productos
**Para** tipar correctamente la aplicación

**Criterios de aceptación:**
- [ ] Product interface con todos los campos
- [ ] ProductCategory enum
- [ ] UnitType enum
- [ ] ProductParams type para create/update
- [ ] StockMovement interface
- [ ] MovementType enum

**Archivos:**
- `app/frontend/types/product.ts`
- `app/frontend/types/stock-movement.ts`

---

#### US-6.2: Types para ServiceCategory
**Como** desarrollador frontend
**Quiero** tipos TypeScript para categorías de servicios
**Para** tipar correctamente la aplicación

**Criterios de aceptación:**
- [ ] ServiceCategory interface
- [ ] ServiceCategoryParams type
- [ ] Actualizar Service interface con nuevos campos

**Archivos:**
- `app/frontend/types/service-category.ts`
- `app/frontend/types/service.ts` (actualizar)

---

#### US-6.3: API client para Products
**Como** desarrollador frontend
**Quiero** un cliente API para productos
**Para** interactuar con el backend

**Criterios de aceptación:**
- [ ] Métodos: list, get, create, update, delete
- [ ] Método: addStock, removeStock, adjustStock
- [ ] Método: uploadImage, deleteImage
- [ ] Filtros tipados

**Archivos:**
- `app/frontend/api/Products.ts`

---

#### US-6.4: API client para StockMovements
**Como** desarrollador frontend
**Quiero** un cliente API para movimientos de stock
**Para** ver historial de inventario

**Criterios de aceptación:**
- [ ] Métodos: list, get
- [ ] Filtros por producto, tipo, rango de fechas

**Archivos:**
- `app/frontend/api/StockMovements.ts`

---

#### US-6.5: API client para ServiceCategories
**Como** desarrollador frontend
**Quiero** un cliente API para categorías de servicios
**Para** gestionar categorías

**Criterios de aceptación:**
- [ ] Métodos: list, get, create, update, delete
- [ ] Método: tree (retorna estructura jerárquica)

**Archivos:**
- `app/frontend/api/ServiceCategories.ts`

---

### Epic 7: Frontend - Hooks y Redux

#### US-7.1: Hook useProducts
**Como** desarrollador frontend
**Quiero** un hook para gestionar productos
**Para** encapsular la lógica de productos

**Criterios de aceptación:**
- [ ] Estados: products, loading, error, filters
- [ ] Métodos: fetchProducts, createProduct, updateProduct, deleteProduct
- [ ] Métodos: addStock, removeStock, adjustStock
- [ ] Filtrado y búsqueda local
- [ ] Paginación

**Archivos:**
- `app/frontend/hooks/useProducts.ts`

---

#### US-7.2: Hook useStockMovements
**Como** desarrollador frontend
**Quiero** un hook para movimientos de stock
**Para** ver historial de inventario

**Criterios de aceptación:**
- [ ] Estados: movements, loading, error
- [ ] Métodos: fetchMovements
- [ ] Filtrado por producto, tipo, fechas

**Archivos:**
- `app/frontend/hooks/useStockMovements.ts`

---

#### US-7.3: Redux slice para Products
**Como** desarrollador frontend
**Quiero** un slice de Redux para productos
**Para** manejar estado global de productos

**Criterios de aceptación:**
- [ ] Estado: products, selectedProduct, filters, pagination
- [ ] Thunks: fetchProducts, createProduct, updateProduct, deleteProduct
- [ ] Thunks: addStock, removeStock
- [ ] Selectores: selectAllProducts, selectLowStock, selectByCategory

**Archivos:**
- `app/frontend/store/productsSlice.ts`

---

### Epic 8: Frontend - Páginas Admin

#### US-8.1: Página ProductsIndex
**Como** administrador
**Quiero** ver lista de productos
**Para** gestionar el inventario

**Criterios de aceptación:**
- [ ] Tabla con: nombre, SKU, categoría, precio, stock, estado
- [ ] Filtros: categoría, estado, bajo stock, búsqueda
- [ ] Indicador visual de bajo stock
- [ ] Indicador de productos próximos a expirar
- [ ] Botón crear producto
- [ ] Acciones: editar, ver movimientos, eliminar

**Archivos:**
- `app/frontend/pages/admin/products/ProductsIndex.tsx`

---

#### US-8.2: Página ProductForm
**Como** administrador
**Quiero** crear/editar productos
**Para** gestionar el catálogo

**Criterios de aceptación:**
- [ ] Formulario con todos los campos del producto
- [ ] Upload de imagen
- [ ] Selector de categoría con iconos
- [ ] Preview de margen de ganancia
- [ ] Validación de campos requeridos
- [ ] Modo create y edit

**Archivos:**
- `app/frontend/pages/admin/products/ProductForm.tsx`

---

#### US-8.3: Componente ProductDetail
**Como** administrador
**Quiero** ver detalle de un producto
**Para** revisar información completa e historial

**Criterios de aceptación:**
- [ ] Información completa del producto
- [ ] Imagen del producto
- [ ] Historial de movimientos de stock
- [ ] Gráfico de evolución de stock
- [ ] Botones: editar, añadir stock, ajustar stock

**Archivos:**
- `app/frontend/pages/admin/products/components/ProductDetail.tsx`

---

#### US-8.4: Dialog StockMovementForm
**Como** administrador
**Quiero** registrar movimientos de stock
**Para** mantener el inventario actualizado

**Criterios de aceptación:**
- [ ] Tipo de movimiento: entrada, salida, ajuste
- [ ] Cantidad
- [ ] Razón/motivo
- [ ] Número de lote (opcional)
- [ ] Fecha de expiración (opcional)
- [ ] Validación de stock suficiente para salidas

**Archivos:**
- `app/frontend/pages/admin/products/components/StockMovementForm.tsx`

---

#### US-8.5: Página ServicesIndex (Actualizar)
**Como** administrador
**Quiero** ver servicios organizados por categoría
**Para** gestionar el catálogo de servicios

**Criterios de aceptación:**
- [ ] Vista por categorías (acordeón/tabs)
- [ ] Filtros: categoría, visible en landing, activo
- [ ] Drag & drop para reordenar (display_order)
- [ ] Toggle de visibilidad en landing
- [ ] Botón crear servicio

**Archivos:**
- `app/frontend/pages/admin/services/ServicesIndex.tsx`

---

#### US-8.6: Página ServiceCategoriesIndex
**Como** administrador
**Quiero** gestionar categorías de servicios
**Para** organizar los servicios

**Criterios de aceptación:**
- [ ] Lista de categorías con drag & drop
- [ ] Vista jerárquica (árbol)
- [ ] Crear, editar, eliminar categorías
- [ ] Contador de servicios por categoría

**Archivos:**
- `app/frontend/pages/admin/services/ServiceCategoriesIndex.tsx`

---

### Epic 9: Integración y Alertas

#### US-9.1: Job para alertas de bajo stock
**Como** sistema
**Quiero** enviar alertas de bajo stock
**Para** notificar al administrador

**Criterios de aceptación:**
- [ ] Job que corre diariamente
- [ ] Detecta productos con current_stock <= minimum_stock
- [ ] Envía email a administradores
- [ ] Registrar en Solid Queue

**Archivos:**
- `app/jobs/low_stock_alert_job.rb`
- `spec/jobs/low_stock_alert_job_spec.rb`

---

#### US-9.2: Job para alertas de expiración
**Como** sistema
**Quiero** alertar sobre productos próximos a expirar
**Para** evitar pérdidas de inventario

**Criterios de aceptación:**
- [ ] Job que corre diariamente
- [ ] Detecta productos expirando en 30 días
- [ ] Envía email a administradores
- [ ] Registrar en Solid Queue

**Archivos:**
- `app/jobs/expiration_alert_job.rb`
- `spec/jobs/expiration_alert_job_spec.rb`

---

#### US-9.3: Dashboard widget de inventario
**Como** administrador
**Quiero** ver resumen de inventario en dashboard
**Para** tener visión rápida del estado

**Criterios de aceptación:**
- [ ] Número de productos con bajo stock
- [ ] Número de productos próximos a expirar
- [ ] Valor total del inventario
- [ ] Link a página de productos

**Archivos:**
- `app/frontend/pages/admin/dashboard/components/InventoryWidget.tsx`

---

### Epic 10: API Pública (Landing)

#### US-10.1: Endpoint público de servicios visibles
**Como** visitante
**Quiero** ver servicios disponibles en el landing
**Para** conocer qué ofrece la clínica

**Criterios de aceptación:**
- [ ] GET /public/services
- [ ] Solo retorna servicios con is_visible_on_landing = true
- [ ] Incluye categoría
- [ ] Ordenado por display_order
- [ ] No requiere autenticación

**Archivos:**
- `app/controllers/public/services_controller.rb`
- `spec/requests/public/services_spec.rb`

---

#### US-10.2: Endpoint público de productos visibles
**Como** visitante
**Quiero** ver productos destacados en el landing
**Para** conocer qué productos ofrece la clínica

**Criterios de aceptación:**
- [ ] GET /public/products
- [ ] Solo retorna productos con is_visible_on_landing = true
- [ ] No incluye información de stock ni precios de compra
- [ ] Ordenado por display_order
- [ ] No requiere autenticación

**Archivos:**
- `app/controllers/public/products_controller.rb`
- `spec/requests/public/products_spec.rb`

---

## Orden de Implementación

### Fase 1: Base de Datos (Epic 1)
1. US-1.1: Migración ServiceCategory
2. US-1.2: Modelo ServiceCategory
3. US-1.3: Migración campos Service
4. US-1.4: Actualizar modelo Service
5. US-1.5: Migración Product
6. US-1.6: Modelo Product
7. US-1.7: Migración StockMovement
8. US-1.8: Modelo StockMovement

### Fase 2: Seeds (Epic 2)
1. US-2.1: Seed ServiceCategory
2. US-2.2: Actualizar seed Services
3. US-2.3: Seed Products

### Fase 3: Actions y Controllers (Epics 3, 4, 5)
1. US-3.1 a US-3.5: Actions Products
2. US-4.1 a US-4.3: Actions Services
3. US-5.1 a US-5.4: Controllers

### Fase 4: Frontend Base (Epics 6, 7)
1. US-6.1 a US-6.5: Types y API clients
2. US-7.1 a US-7.3: Hooks y Redux

### Fase 5: Frontend Páginas (Epic 8)
1. US-8.1 a US-8.4: Páginas Products
2. US-8.5 a US-8.6: Páginas Services actualizadas

### Fase 6: Integración (Epics 9, 10)
1. US-9.1 a US-9.3: Jobs y widgets
2. US-10.1 a US-10.2: API pública

---

## Rutas

```ruby
# config/routes.rb

# Admin - Productos
resources :products do
  member do
    post :add_stock
    post :remove_stock
    post :adjust_stock
    post :image
    delete :image, action: :delete_image
  end
end
resources :stock_movements, only: [:index, :show]

# Admin - Servicios
resources :services
resources :service_categories

# Público
namespace :public do
  resources :services, only: [:index]
  resources :products, only: [:index]
end
```

---

## Dependencias

- **Models existentes**: User, Service
- **Gems**: discard (soft delete), active_storage (imágenes)
- **Jobs**: Solid Queue para alertas programadas

---

## Métricas de Éxito

- [ ] >80% code coverage en todos los specs
- [ ] Todos los endpoints documentados
- [ ] Alertas de bajo stock funcionando
- [ ] Integración con landing page
- [ ] Performance: <200ms para listados
