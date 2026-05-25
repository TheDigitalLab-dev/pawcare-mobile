<!--
STATUS: ✅ COMPLETADO
Implementado en: commits b5be479 + 4c90336
Incluye: MetricsSnapshot model, 10 Calculate Actions, RefreshMetricsJob, Controller, MetricsIndex page
Backend: Models, Actions, Controller, Jobs
Frontend: Types, API, Hook, Redux, MetricsIndex page
Coverage: 84.8%
-->

# Plan: Módulo de Métricas (Metrics Module)

## Resumen

Implementar un módulo de métricas completo con dashboards interactivos usando D3.js para visualizar:
- **Consultas**: Total, por veterinario, por tipo, tendencias
- **Pacientes**: Nuevos registros, activos, por especie
- **Ingresos**: Totales, por servicio, por período
- **Visitas**: Citas completadas, cancelaciones, no-shows
- **Vacunaciones**: Aplicadas, pendientes, vencidas
- **Adopciones**: Completadas, en proceso
- **Apadrinamientos**: Activos, ingresos recurrentes
- **Finanzas**: Ingresos vs egresos, pagos pendientes

**Acceso**: Roles `admin`, `vet` (parcial), `finances` (parcial)

---

## Arquitectura

### Estrategia de Cache (Escalabilidad)

**Los datos de métricas se almacenan en una tabla `metrics_snapshots` que se actualiza cada 2 horas mediante un job.**

Esto garantiza:
- **Performance**: Las consultas al dashboard son instantáneas (lectura de JSON precalculado)
- **Escalabilidad**: A medida que crecen los datos, no hay impacto en el tiempo de respuesta
- **Consistencia**: Todos los usuarios ven los mismos datos hasta el próximo refresh

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE CACHE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐    cada 2h    ┌──────────────────────┐   │
│   │  Tablas Base │ ───────────▶  │  metrics_snapshots   │   │
│   │  (pets,      │               │  (JSON precalculado) │   │
│   │  appointments│               └──────────┬───────────┘   │
│   │  payments...)│                          │               │
│   └──────────────┘                          ▼               │
│                                    ┌─────────────────┐      │
│   RefreshMetricsJob ──────────────▶│   Controller    │      │
│   (Solid Queue, cada 2h)           │   (lectura)     │      │
│                                    └────────┬────────┘      │
│                                             │               │
│                                             ▼               │
│                                    ┌─────────────────┐      │
│                                    │   Frontend      │      │
│                                    │   (D3.js)       │      │
│                                    └─────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Modelo MetricsSnapshot

```
MetricsSnapshot
├── metric_type (string, indexed) - 'dashboard', 'consultations', 'patients', etc.
├── period_type (string) - 'daily', 'weekly', 'monthly', 'all_time'
├── period_start (date)
├── period_end (date)
├── data (JSON) - datos precalculados
├── calculated_at (datetime)
└── expires_at (datetime)
```

### Endpoints

```
Admin::MetricsController
├── dashboard     # Lee de metrics_snapshots donde metric_type = 'dashboard'
├── consultations # Lee de metrics_snapshots donde metric_type = 'consultations'
├── patients      # Lee de metrics_snapshots donde metric_type = 'patients'
├── revenue       # Lee de metrics_snapshots donde metric_type = 'revenue'
├── appointments  # Lee de metrics_snapshots donde metric_type = 'appointments'
├── vaccinations  # Lee de metrics_snapshots donde metric_type = 'vaccinations'
├── adoptions     # Lee de metrics_snapshots donde metric_type = 'adoptions'
├── sponsorships  # Lee de metrics_snapshots donde metric_type = 'sponsorships'
├── financial     # Lee de metrics_snapshots donde metric_type = 'financial'
└── refresh       # Endpoint manual para forzar refresh (admin only)
```

### Flujo de Datos

```
1. Job (cada 2h) → Calcula métricas → Guarda en metrics_snapshots
2. Controller → Lee de metrics_snapshots → JSON Response
3. Frontend → Renderiza con D3.js
```

### Período de Tiempo

El job calcula snapshots para múltiples períodos:
- `daily`: Últimos 30 días (día por día)
- `weekly`: Últimas 12 semanas
- `monthly`: Últimos 12 meses
- `all_time`: Totales históricos

---

## User Stories

### Epic 0: Base de Datos y Modelo de Cache

#### US-0.1: Crear migración para MetricsSnapshot
**Como** desarrollador
**Quiero** una tabla para almacenar métricas precalculadas
**Para** servir dashboards de forma rápida

**Criterios de aceptación:**
- [ ] Crear migración `db/migrate/xxx_create_metrics_snapshots.rb`
- [ ] Campos:
  - `metric_type` (string, not null) - tipo de métrica
  - `period_type` (string, not null) - daily, weekly, monthly, all_time
  - `period_start` (date)
  - `period_end` (date)
  - `data` (JSON/LONGTEXT, not null) - datos calculados
  - `calculated_at` (datetime, not null)
  - `expires_at` (datetime)
- [ ] Índices: (metric_type, period_type), calculated_at
- [ ] Índice único: (metric_type, period_type, period_start)
- [ ] Ejecutar migración

**Archivos:**
- `db/migrate/xxx_create_metrics_snapshots.rb` (nuevo)

---

#### US-0.2: Crear modelo MetricsSnapshot
**Como** desarrollador
**Quiero** el modelo MetricsSnapshot
**Para** gestionar el cache de métricas

**Criterios de aceptación:**
- [ ] Crear `app/models/metrics_snapshot.rb`
- [ ] Validaciones: metric_type, period_type, data, calculated_at required
- [ ] Scopes:
  - `for_type(type)` - filtrar por metric_type
  - `for_period(period_type)` - filtrar por período
  - `current` - no expirados (expires_at > now OR expires_at IS NULL)
  - `latest` - ordenar por calculated_at desc
- [ ] Class methods:
  - `self.get(metric_type, period_type = 'all_time')` - obtener snapshot más reciente
  - `self.refresh_all!` - recalcular todas las métricas
  - `self.stale?` - verificar si hay snapshots vencidos
- [ ] Crear factory y model spec

**Archivos:**
- `app/models/metrics_snapshot.rb` (nuevo)
- `spec/factories/metrics_snapshots.rb` (nuevo)
- `spec/models/metrics_snapshot_spec.rb` (nuevo)

---

#### US-0.3: Crear seed inicial para MetricsSnapshot
**Como** desarrollador
**Quiero** datos iniciales de métricas
**Para** que el dashboard funcione desde el inicio

**Criterios de aceptación:**
- [ ] Crear `db/seeds/23_metrics_snapshots.rb`
- [ ] Ejecutar cálculo inicial de todas las métricas
- [ ] Guardar snapshots para todos los tipos y períodos

**Archivos:**
- `db/seeds/23_metrics_snapshots.rb` (nuevo)

---

### Epic 1: Backend - Actions de Cálculo de Métricas

#### US-1.1: Crear Action Metrics::CalculateDashboard
**Como** sistema
**Quiero** calcular métricas del dashboard
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_dashboard.rb`
- [ ] Input: `period_start`, `period_end`
- [ ] Calcular:
  - Total consultas del período
  - Total ingresos del período
  - Citas completadas vs canceladas
  - Nuevos pacientes
  - Vacunaciones aplicadas
  - Adopciones completadas
  - Apadrinamientos activos
  - Comparativa con período anterior (%)
- [ ] Retornar `Result.success(data:)` con hash de métricas
- [ ] Crear spec `spec/actions/admin/metrics/calculate_dashboard_spec.rb`

**Archivos:**
- `app/actions/admin/metrics/calculate_dashboard.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_dashboard_spec.rb` (nuevo)

---

#### US-1.2: Crear Action Metrics::CalculateConsultations
**Como** sistema
**Quiero** calcular métricas de consultas
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_consultations.rb`
- [ ] Input: `period_start`, `period_end`, `granularity`
- [ ] Calcular:
  - Serie temporal de consultas
  - Consultas por veterinario
  - Diagnósticos más frecuentes (top 10)
  - Distribución por día de la semana
- [ ] Retornar `Result.success(data:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/calculate_consultations.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_consultations_spec.rb` (nuevo)

---

#### US-1.3: Crear Action Metrics::CalculatePatients
**Como** sistema
**Quiero** calcular métricas de pacientes
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_patients.rb`
- [ ] Calcular:
  - Total mascotas activas
  - Nuevos registros por período (serie temporal)
  - Distribución por especie
  - Distribución por sexo
  - Mascotas con vacunas vencidas (count)
  - Edad promedio de pacientes
- [ ] Retornar `Result.success(data:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/calculate_patients.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_patients_spec.rb` (nuevo)

---

#### US-1.4: Crear Action Metrics::CalculateRevenue
**Como** sistema
**Quiero** calcular métricas de ingresos
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_revenue.rb`
- [ ] Calcular:
  - Serie temporal de ingresos
  - Ingresos por servicio (top 10)
  - Ingresos por método de pago
  - Ticket promedio
  - Comparativa con período anterior
- [ ] Retornar `Result.success(data:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/calculate_revenue.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_revenue_spec.rb` (nuevo)

---

#### US-1.5: Crear Action Metrics::CalculateAppointments
**Como** sistema
**Quiero** calcular métricas de citas
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_appointments.rb`
- [ ] Calcular:
  - Serie temporal de citas
  - Distribución por estado (completadas, canceladas, no-show)
  - Tasa de cancelación
  - Horarios más demandados (heatmap data)
  - Servicios más solicitados
  - Citas por día de la semana
- [ ] Retornar `Result.success(data:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/calculate_appointments.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_appointments_spec.rb` (nuevo)

---

#### US-1.6: Crear Action Metrics::CalculateVaccinations
**Como** sistema
**Quiero** calcular métricas de vacunaciones
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_vaccinations.rb`
- [ ] Calcular:
  - Serie temporal de vacunaciones
  - Vacunas por tipo
  - Vacunas vencidas pendientes (count)
  - Vacunas próximas (7 días, count)
  - Cobertura vacunal por especie
  - Vacunaciones por veterinario
- [ ] Retornar `Result.success(data:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/calculate_vaccinations.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_vaccinations_spec.rb` (nuevo)

---

#### US-1.7: Crear Action Metrics::CalculateAdoptions
**Como** sistema
**Quiero** calcular métricas de adopciones
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_adoptions.rb`
- [ ] Calcular:
  - Serie temporal de adopciones
  - Mascotas disponibles vs adoptadas
  - Tiempo promedio hasta adopción
  - Adopciones por especie
- [ ] Retornar `Result.success(data:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/calculate_adoptions.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_adoptions_spec.rb` (nuevo)

---

#### US-1.8: Crear Action Metrics::CalculateSponsorships
**Como** sistema
**Quiero** calcular métricas de apadrinamientos
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_sponsorships.rb`
- [ ] Calcular:
  - Total apadrinamientos activos
  - Ingresos recurrentes mensuales (MRR)
  - Nuevos apadrinamientos por período
  - Cancelaciones
  - Promedio de duración
  - Top sponsors por monto (top 10)
- [ ] Retornar `Result.success(data:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/calculate_sponsorships.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_sponsorships_spec.rb` (nuevo)

---

#### US-1.9: Crear Action Metrics::CalculateFinancial
**Como** sistema
**Quiero** calcular resumen financiero
**Para** almacenar en cache

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/calculate_financial.rb`
- [ ] Calcular:
  - Ingresos totales
  - Egresos totales (cuando exista tabla Expense)
  - Balance
  - Pagos pendientes (draft, pending)
  - Pagos vencidos (overdue)
  - Proyección de ingresos (apadrinamientos MRR)
  - Comparativa mensual
- [ ] Retornar `Result.success(data:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/calculate_financial.rb` (nuevo)
- `spec/actions/admin/metrics/calculate_financial_spec.rb` (nuevo)

---

#### US-1.10: Crear Action Metrics::RefreshAllSnapshots
**Como** sistema
**Quiero** refrescar todos los snapshots
**Para** mantener métricas actualizadas

**Criterios de aceptación:**
- [ ] Crear `app/actions/admin/metrics/refresh_all_snapshots.rb`
- [ ] Orquestar el cálculo de todos los tipos de métricas
- [ ] Para cada tipo, calcular múltiples períodos:
  - `daily`: últimos 30 días
  - `weekly`: últimas 12 semanas
  - `monthly`: últimos 12 meses
  - `all_time`: desde el inicio
- [ ] Guardar/actualizar MetricsSnapshot para cada combinación
- [ ] Establecer expires_at = calculated_at + 2.hours
- [ ] Retornar `Result.success(refreshed_count:)`
- [ ] Crear spec

**Archivos:**
- `app/actions/admin/metrics/refresh_all_snapshots.rb` (nuevo)
- `spec/actions/admin/metrics/refresh_all_snapshots_spec.rb` (nuevo)

---

### Epic 2: Job de Refresh Automático

#### US-2.1: Crear RefreshMetricsJob
**Como** sistema
**Quiero** un job que refresque métricas automáticamente
**Para** mantener cache actualizado

**Criterios de aceptación:**
- [ ] Crear `app/jobs/refresh_metrics_job.rb`
- [ ] Hereda de ApplicationJob
- [ ] Queue: :default (o :low_priority)
- [ ] Lógica en `perform`:
  - Llamar `Admin::Metrics::RefreshAllSnapshots.new.call`
  - Log resultado (refreshed_count, tiempo de ejecución)
- [ ] Manejo de errores con log
- [ ] Crear spec `spec/jobs/refresh_metrics_job_spec.rb`

**Archivos:**
- `app/jobs/refresh_metrics_job.rb` (nuevo)
- `spec/jobs/refresh_metrics_job_spec.rb` (nuevo)

---

#### US-2.2: Configurar Solid Queue para refresh cada 2 horas
**Como** desarrollador
**Quiero** ejecutar el job automáticamente
**Para** mantener métricas frescas

**Criterios de aceptación:**
- [ ] Agregar en `config/recurring.yml`:
  ```yaml
  refresh_metrics:
    class: RefreshMetricsJob
    schedule: every 2 hours
    description: "Refresh metrics cache every 2 hours"
  ```
- [ ] Documentar cómo ejecutar manualmente:
  - `RefreshMetricsJob.perform_now`
  - `Admin::Metrics::RefreshAllSnapshots.new.call`

**Archivos:**
- `config/recurring.yml` (modificar o crear)

---

### Epic 3: Backend - Controller y Rutas

#### US-3.1: Tests TDD para Metrics Controller
**Como** desarrollador
**Quiero** escribir tests antes de implementar
**Para** seguir TDD

**Criterios de aceptación:**
- [ ] Crear `spec/requests/admin/metrics_spec.rb`
- [ ] Tests para cada endpoint (leyendo de snapshots)
- [ ] Verificar autorización por rol
- [ ] Verificar respuesta cuando no hay snapshots
- [ ] Test para endpoint de refresh manual
- [ ] Tests deben fallar inicialmente

**Archivos:**
- `spec/requests/admin/metrics_spec.rb` (nuevo)

---

#### US-3.2: Implementar Admin::MetricsController
**Como** admin
**Quiero** endpoints de métricas
**Para** consumir desde el frontend

**Criterios de aceptación:**
- [ ] Crear `app/controllers/admin/metrics_controller.rb`
- [ ] Include Authenticatable
- [ ] before_action :authenticate_staff!
- [ ] Actions que leen de MetricsSnapshot:
  - `dashboard`: lee snapshot tipo 'dashboard'
  - `consultations`: lee snapshot tipo 'consultations'
  - `patients`: lee snapshot tipo 'patients'
  - `revenue`: lee snapshot tipo 'revenue'
  - `appointments`: lee snapshot tipo 'appointments'
  - `vaccinations`: lee snapshot tipo 'vaccinations'
  - `adoptions`: lee snapshot tipo 'adoptions'
  - `sponsorships`: lee snapshot tipo 'sponsorships'
  - `financial`: lee snapshot tipo 'financial'
  - `refresh`: trigger manual (admin only)
- [ ] Params: period_type (default 'monthly')
- [ ] Incluir `calculated_at` y `expires_at` en response
- [ ] Autorización por rol:
  - admin: todos
  - vet: consultations, patients, vaccinations
  - finances: revenue, financial
- [ ] Tests deben pasar

**Archivos:**
- `app/controllers/admin/metrics_controller.rb` (nuevo)

---

#### US-3.3: Agregar rutas de Metrics
**Como** desarrollador
**Quiero** rutas para métricas
**Para** que el frontend pueda consumir

**Criterios de aceptación:**
- [ ] Modificar `config/routes.rb`
- [ ] En namespace admin:
  ```ruby
  namespace :metrics do
    get :dashboard
    get :consultations
    get :patients
    get :revenue
    get :appointments
    get :vaccinations
    get :adoptions
    get :sponsorships
    get :financial
    post :refresh  # Solo admin
  end
  ```

**Archivos:**
- `config/routes.rb` (modificar)

---

### Epic 4: Frontend - Tipos, API y Estado

#### US-4.1: Crear tipos TypeScript para Metrics
**Como** desarrollador frontend
**Quiero** tipos para métricas
**Para** tener type safety

**Criterios de aceptación:**
- [ ] Crear `app/frontend/types/Metrics.ts`
- [ ] Tipos:
  - `MetricsPeriodType = 'daily' | 'weekly' | 'monthly' | 'all_time'`
  - `MetricsResponse<T>` - wrapper con calculated_at, expires_at, data
  - `DashboardMetrics`
  - `TimeSeriesData` (date, value)
  - `DistributionData` (label, value, percentage)
  - `ComparisonData` (current, previous, change_percentage)
  - Tipos específicos para cada endpoint

**Archivos:**
- `app/frontend/types/Metrics.ts` (nuevo)

---

#### US-4.2: Crear API client para Metrics
**Como** desarrollador frontend
**Quiero** cliente API para métricas
**Para** consumir los endpoints

**Criterios de aceptación:**
- [ ] Crear `app/frontend/api/Metrics.ts`
- [ ] Métodos para cada endpoint
- [ ] Parámetro de period_type
- [ ] Método para refresh manual
- [ ] Export instancia `metricsApi`

**Archivos:**
- `app/frontend/api/Metrics.ts` (nuevo)

---

#### US-4.3: Crear hook useMetrics
**Como** desarrollador frontend
**Quiero** hook para gestionar métricas
**Para** separar lógica

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/useMetrics.ts`
- [ ] Métodos para fetch de cada tipo de métrica
- [ ] Estado de period_type seleccionado
- [ ] Manejo de loading/error
- [ ] Mostrar última actualización (calculated_at)
- [ ] Método para trigger refresh manual
- [ ] Indicador de datos stale (expires_at < now)

**Archivos:**
- `app/frontend/hooks/useMetrics.ts` (nuevo)

---

### Epic 5: Frontend - Componentes D3.js

#### US-5.1: Instalar y configurar D3.js
**Como** desarrollador
**Quiero** D3.js configurado
**Para** crear visualizaciones

**Criterios de aceptación:**
- [ ] Agregar dependencia: `npm install d3 @types/d3`
- [ ] Verificar tipos TypeScript
- [ ] Crear helper de colores para gráficos (usar tokens del tema)

**Archivos:**
- `package.json` (modificar)
- `app/frontend/lib/chartColors.ts` (nuevo)

---

#### US-5.2: Crear componente LineChart
**Como** usuario
**Quiero** gráficos de líneas
**Para** ver tendencias temporales

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/charts/LineChart.tsx`
- [ ] Props: data, xKey, yKey, width, height, color
- [ ] Responsive
- [ ] Tooltip en hover
- [ ] Soporte dark mode
- [ ] Animación suave

**Archivos:**
- `app/frontend/components/charts/LineChart.tsx` (nuevo)

---

#### US-5.3: Crear componente BarChart
**Como** usuario
**Quiero** gráficos de barras
**Para** comparar categorías

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/charts/BarChart.tsx`
- [ ] Props: data, xKey, yKey, orientation (horizontal/vertical)
- [ ] Responsive
- [ ] Tooltip en hover
- [ ] Colores por categoría
- [ ] Soporte dark mode

**Archivos:**
- `app/frontend/components/charts/BarChart.tsx` (nuevo)

---

#### US-5.4: Crear componente PieChart
**Como** usuario
**Quiero** gráficos de torta/dona
**Para** ver distribuciones

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/charts/PieChart.tsx`
- [ ] Props: data, labelKey, valueKey, donut (boolean)
- [ ] Leyenda
- [ ] Porcentajes
- [ ] Tooltip en hover
- [ ] Soporte dark mode

**Archivos:**
- `app/frontend/components/charts/PieChart.tsx` (nuevo)

---

#### US-5.5: Crear componente StatCard
**Como** usuario
**Quiero** tarjetas de estadísticas
**Para** ver KPIs importantes

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/charts/StatCard.tsx`
- [ ] Props: title, value, icon, trend (up/down/neutral), change
- [ ] Colores según tendencia
- [ ] Animación de números (opcional)

**Archivos:**
- `app/frontend/components/charts/StatCard.tsx` (nuevo)

---

#### US-5.6: Crear componente DateRangePicker (Period Selector)
**Como** usuario
**Quiero** selector de período
**Para** cambiar vista de métricas

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/charts/PeriodSelector.tsx`
- [ ] Opciones: Diario, Semanal, Mensual, Todo el tiempo
- [ ] Mostrar última actualización
- [ ] Botón de refresh manual (admin only)

**Archivos:**
- `app/frontend/components/charts/PeriodSelector.tsx` (nuevo)

---

#### US-5.7: Crear componente MetricsLastUpdated
**Como** usuario
**Quiero** ver cuándo se actualizaron las métricas
**Para** saber qué tan frescos son los datos

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/charts/MetricsLastUpdated.tsx`
- [ ] Mostrar: "Actualizado hace X minutos"
- [ ] Indicador visual si datos están stale (> 2.5 horas)
- [ ] Tooltip con fecha/hora exacta

**Archivos:**
- `app/frontend/components/charts/MetricsLastUpdated.tsx` (nuevo)

---

### Epic 6: Frontend - Páginas de Métricas

#### US-6.1: Crear página MetricsIndex (Dashboard)
**Como** admin
**Quiero** un dashboard de métricas
**Para** ver resumen general

**Criterios de aceptación:**
- [ ] Crear `app/frontend/pages/admin/metrics/MetricsIndex.tsx`
- [ ] PeriodSelector arriba + MetricsLastUpdated
- [ ] Grid de StatCards con KPIs principales
- [ ] Gráfico de líneas: ingresos por período
- [ ] Gráfico de barras: citas por estado
- [ ] Gráfico de torta: mascotas por especie
- [ ] Quick links a métricas detalladas
- [ ] Envuelto en AdminLayout

**Archivos:**
- `app/frontend/pages/admin/metrics/MetricsIndex.tsx` (nuevo)

---

#### US-6.2: Crear vistas detalladas de métricas
**Como** admin
**Quiero** vistas detalladas por categoría
**Para** analizar cada área

**Criterios de aceptación:**
- [ ] Crear componentes en `app/frontend/pages/admin/metrics/components/`:
  - `ConsultationsMetrics.tsx`
  - `PatientsMetrics.tsx`
  - `RevenueMetrics.tsx`
  - `AppointmentsMetrics.tsx`
  - `VaccinationsMetrics.tsx`
  - `AdoptionsMetrics.tsx`
  - `SponsorshipsMetrics.tsx`
  - `FinancialMetrics.tsx`
- [ ] Cada componente con gráficos específicos
- [ ] Navegación con tabs o vista interna

**Archivos:**
- `app/frontend/pages/admin/metrics/components/ConsultationsMetrics.tsx` (nuevo)
- `app/frontend/pages/admin/metrics/components/PatientsMetrics.tsx` (nuevo)
- `app/frontend/pages/admin/metrics/components/RevenueMetrics.tsx` (nuevo)
- `app/frontend/pages/admin/metrics/components/AppointmentsMetrics.tsx` (nuevo)
- `app/frontend/pages/admin/metrics/components/VaccinationsMetrics.tsx` (nuevo)
- `app/frontend/pages/admin/metrics/components/AdoptionsMetrics.tsx` (nuevo)
- `app/frontend/pages/admin/metrics/components/SponsorshipsMetrics.tsx` (nuevo)
- `app/frontend/pages/admin/metrics/components/FinancialMetrics.tsx` (nuevo)

---

#### US-6.3: Habilitar página Metrics en sidebar y rutas
**Como** usuario admin
**Quiero** acceder a Métricas desde el sidebar
**Para** ver dashboards

**Criterios de aceptación:**
- [ ] Modificar `app/actions/admin/build_sidebar.rb`:
  - Habilitar item "metrics" (remover disabled: true)
- [ ] Agregar en routes.rb: `get 'metrics', to: 'admin_pages#metrics'`
- [ ] Agregar action en AdminPagesController

**Archivos:**
- `app/actions/admin/build_sidebar.rb` (modificar)
- `config/routes.rb` (modificar)
- `app/controllers/admin_pages_controller.rb` (modificar)

---

## Modelo de Datos

### MetricsSnapshot

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | bigint | PK | Auto |
| metric_type | string | ✓ | dashboard, consultations, patients, etc. |
| period_type | string | ✓ | daily, weekly, monthly, all_time |
| period_start | date | - | Inicio del período calculado |
| period_end | date | - | Fin del período calculado |
| data | JSON/LONGTEXT | ✓ | Métricas precalculadas |
| calculated_at | datetime | ✓ | Cuándo se calculó |
| expires_at | datetime | - | Cuándo expira (calculated_at + 2h) |

**Índices:**
- `(metric_type, period_type)` - para búsquedas
- `(metric_type, period_type, period_start)` - único
- `calculated_at` - para ordenamiento

---

## Endpoints API

| Método | Ruta | Acción | Roles | Fuente |
|--------|------|--------|-------|--------|
| GET | /admin/metrics/dashboard | dashboard | admin | snapshot |
| GET | /admin/metrics/consultations | consultations | admin, vet | snapshot |
| GET | /admin/metrics/patients | patients | admin, vet | snapshot |
| GET | /admin/metrics/revenue | revenue | admin, finances | snapshot |
| GET | /admin/metrics/appointments | appointments | admin | snapshot |
| GET | /admin/metrics/vaccinations | vaccinations | admin, vet | snapshot |
| GET | /admin/metrics/adoptions | adoptions | admin | snapshot |
| GET | /admin/metrics/sponsorships | sponsorships | admin | snapshot |
| GET | /admin/metrics/financial | financial | admin, finances | snapshot |
| POST | /admin/metrics/refresh | refresh | admin | trigger job |

---

## Orden de Implementación

### Fase 1: Base de Datos y Modelo (US 0.1 - 0.3)
1. Migración MetricsSnapshot
2. Modelo con scopes y validaciones
3. Seeds inicial

### Fase 2: Actions de Cálculo (US 1.1 - 1.10)
4. CalculateDashboard
5. CalculateConsultations
6. CalculatePatients
7. CalculateRevenue
8. CalculateAppointments
9. CalculateVaccinations
10. CalculateAdoptions
11. CalculateSponsorships
12. CalculateFinancial
13. RefreshAllSnapshots

### Fase 3: Job de Refresh (US 2.1 - 2.2)
14. RefreshMetricsJob
15. Configurar Solid Queue

### Fase 4: Backend Controller (US 3.1 - 3.3)
16. Tests TDD
17. Controller
18. Rutas

### Fase 5: Frontend Base (US 4.1 - 4.3, 5.1)
19. Tipos TypeScript
20. API client
21. Hook useMetrics
22. Instalar D3.js

### Fase 6: Componentes de Gráficos (US 5.2 - 5.7)
23. LineChart
24. BarChart
25. PieChart
26. StatCard
27. PeriodSelector
28. MetricsLastUpdated

### Fase 7: Páginas (US 6.1 - 6.3)
29. MetricsIndex (dashboard)
30. Vistas detalladas
31. Habilitar en sidebar

---

## Verificación

### Tests Backend
```bash
bundle exec rspec spec/models/metrics_snapshot_spec.rb
bundle exec rspec spec/actions/admin/metrics/
bundle exec rspec spec/jobs/refresh_metrics_job_spec.rb
bundle exec rspec spec/requests/admin/metrics_spec.rb
```

### Verificar Job Manual
```bash
# En rails console
RefreshMetricsJob.perform_now
MetricsSnapshot.count
MetricsSnapshot.last.calculated_at
```

### E2E Manual
1. Ejecutar job: `RefreshMetricsJob.perform_now`
2. Navegar a /admin/metrics
3. Verificar que cargan gráficos
4. Verificar "Actualizado hace X minutos"
5. Cambiar período y verificar actualización
6. Click en refresh manual (admin)
7. Verificar responsive en móvil
8. Verificar dark mode

### CI
```bash
npm run push
```
