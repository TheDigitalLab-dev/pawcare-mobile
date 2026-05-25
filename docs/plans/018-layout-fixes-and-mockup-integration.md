# Plan 014: Layout Fixes & Mockup Integration

**Estado**: NO IMPLEMENTADO
**Prioridad**: ALTA
**Fecha de Creación**: 2026-01-11
**Última Actualización**: 2026-01-11

---

## Objetivo General

Corregir los issues críticos del AdminLayout actual y luego integrar progresivamente los módulos del mockup original de PawCare, manteniendo la separación entre los portales de Admin (Staff) y Owner (Propietarios).

---

## Contexto

Basado en:
- Análisis del mockup original: `.docs/end2end/mockup-analysis.md`
- Pruebas E2E del AdminLayout: `.docs/end2end/01-layouts.md`
- Issues detectados: Dark mode no funciona, Sidebar no responsive, falta search global

**Principio fundamental**: El portal de Propietarios estará completamente separado del portal de Admin/Staff.

---

## Epic 1: Correcciones Críticas del Layout Actual

**Objetivo**: Resolver los 4 issues críticos detectados en las pruebas E2E del AdminLayout

### User Stories

#### US-1.1: Dark Mode Funcional
**Como** usuario del sistema
**Quiero** que el modo oscuro funcione correctamente
**Para** reducir la fatiga visual al trabajar de noche

**Criterios de Aceptación**:
- [ ] Cuando el sistema operativo está en modo oscuro, la app debe cambiar automáticamente a dark mode
- [ ] Los colores del sidebar, header y contenido deben cambiar apropiadamente
- [ ] El contraste debe cumplir con WCAG AA (4.5:1 mínimo)
- [ ] Los badges, botones y cards deben ser legibles en ambos modos
- [ ] El dropdown de usuario debe verse correctamente en dark mode

**Tareas Técnicas**:
```typescript
// 1. Agregar hook para detectar preferencia de dark mode
// hooks/useDarkMode.ts
export function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return { isDark, setIsDark }
}

// 2. Usar hook en app root o layout principal
// Agregar en AdminLayout.tsx
const { isDark } = useDarkMode()

// 3. Verificar que tokens.css tiene todas las variables dark definidas
// app/frontend/styles/tokens.css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  /* ... verificar todas las variables */
}
```

**Archivos a Modificar**:
- `app/frontend/hooks/useDarkMode.ts` (crear)
- `app/frontend/pages/admin/components/AdminLayout.tsx`
- `app/frontend/styles/tokens.css` (verificar)

**Tests**:
- Verificar en E2E que dark mode cambia colores correctamente
- Screenshot comparativo light vs dark

---

#### US-1.2: Sidebar Responsive en Mobile
**Como** usuario que accede desde móvil
**Quiero** que el sidebar se oculte por defecto y pueda abrirlo con un botón
**Para** tener más espacio para el contenido principal

**Criterios de Aceptación**:
- [ ] En pantallas < 768px, el sidebar debe estar oculto por defecto
- [ ] Debe haber un botón hamburguesa visible en el header (esquina superior izquierda)
- [ ] Al hacer click en hamburguesa, el sidebar se abre como drawer/overlay
- [ ] El sidebar debe cubrir el contenido con un overlay semitransparente
- [ ] Al hacer click fuera del sidebar o en un link, el sidebar se cierra
- [ ] En pantallas >= 768px, el sidebar debe estar siempre visible

**Tareas Técnicas**:
```typescript
// 1. Agregar estado de sidebar en AdminLayout
const [sidebarOpen, setSidebarOpen] = useState(false)

// 2. Pasar props a AdminSidebar
<AdminSidebar
  currentPath={currentPath}
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>

// 3. Modificar AdminSidebar para soportar responsive
<aside className={cn(
  "fixed md:static inset-y-0 left-0 z-50",
  "w-64 bg-card border-r",
  "transform transition-transform duration-300 ease-in-out",
  isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
  "md:block" // Siempre visible en desktop
)}>
  {/* Contenido del sidebar */}
</aside>

// 4. Agregar overlay en mobile
{isOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40 md:hidden"
    onClick={onClose}
  />
)}

// 5. AdminHeader recibe onMenuToggle
<AdminHeader
  user={user}
  onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
/>

// 6. AdminHeader muestra botón hamburguesa en mobile
<button
  onClick={onMenuToggle}
  className="md:hidden p-2 rounded-md hover:bg-accent"
  aria-label="Toggle menu"
>
  <Menu className="h-6 w-6" />
</button>
```

**Archivos a Modificar**:
- `app/frontend/pages/admin/components/AdminLayout.tsx`
- `app/frontend/pages/admin/components/AdminSidebar.tsx`
- `app/frontend/pages/admin/components/AdminHeader.tsx`

**Tests**:
- E2E en 375px: verificar sidebar oculto, botón hamburguesa visible
- E2E: abrir sidebar, verificar overlay, cerrar al click fuera

---

#### US-1.3: Botón Hamburguesa Visible
**Como** usuario en móvil
**Quiero** ver claramente el botón de menú
**Para** poder abrir la navegación fácilmente

**Criterios de Aceptación**:
- [ ] El botón hamburguesa debe ser visible solo en mobile (< 768px)
- [ ] Debe estar en la esquina superior izquierda del header
- [ ] El icono debe ser claro (3 líneas horizontales)
- [ ] Debe tener hover state
- [ ] Debe tener aria-label para accesibilidad

**Tareas Técnicas**:
```typescript
// AdminHeader.tsx
<div className="flex items-center gap-4">
  {/* Botón hamburguesa - solo mobile */}
  <button
    onClick={onMenuToggle}
    className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
    aria-label="Abrir menú de navegación"
  >
    <Menu className="h-6 w-6" />
  </button>

  {/* Resto del header */}
</div>
```

**Archivos a Modificar**:
- `app/frontend/pages/admin/components/AdminHeader.tsx`

**Tests**:
- E2E en 375px: verificar botón visible
- E2E en 1024px: verificar botón oculto

---

#### US-1.4: Mostrar Rol Correcto en Header
**Como** usuario autenticado
**Quiero** ver mi rol real (Admin/Vet/Staff) en el header
**Para** saber con qué permisos estoy trabajando

**Criterios de Aceptación**:
- [ ] Si el usuario es admin, debe mostrar "Admin" o "Administrador"
- [ ] Si el usuario es vet, debe mostrar "Veterinario"
- [ ] Si el usuario es staff (no admin ni vet), debe mostrar "Staff" o "Personal"
- [ ] El texto debe estar visible junto al avatar
- [ ] El rol también debe aparecer en el dropdown de usuario

**Tareas Técnicas**:
```typescript
// AdminHeader.tsx
const getRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrador',
    vet: 'Veterinario',
    staff: 'Personal',
  }
  return roleLabels[role] || 'Usuario'
}

// En el render
<div className="flex items-center gap-2">
  <p className="text-sm text-muted-foreground">
    {getRoleLabel(user.role)}
  </p>
</div>
```

**Archivos a Modificar**:
- `app/frontend/pages/admin/components/AdminHeader.tsx`

**Tests**:
- Verificar con usuario admin → muestra "Administrador"
- Verificar con usuario vet → muestra "Veterinario"

---

## Epic 2: Reestructuración de Navegación (3 Portales)

**Objetivo**: Implementar la estructura de navegación del mockup con 3 portales separados

### User Stories

#### US-2.1: Sidebar con Secciones Colapsables
**Como** usuario del sistema
**Quiero** ver la navegación organizada en secciones CLÍNICA, GESTIÓN y PROPIETARIO
**Para** encontrar rápidamente las funcionalidades según mi contexto de trabajo

**Criterios de Aceptación**:
- [ ] El sidebar debe tener 3 secciones claramente separadas
- [ ] Cada sección debe tener un título: "CLÍNICA", "GESTIÓN", "PROPIETARIO"
- [ ] Cada sección debe ser colapsable (opcional, puede implementarse después)
- [ ] Los items deben tener iconos + texto
- [ ] El item activo debe resaltarse con bg-primary/10 y border-l-4
- [ ] Las secciones solo deben mostrarse si el usuario tiene permisos

**Tareas Técnicas**:
```typescript
// types/navigation.ts
export interface NavSection {
  title: string
  key: 'clinic' | 'management' | 'owner'
  items: NavItem[]
  roles: UserRole[] // Qué roles pueden ver esta sección
}

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType
}

// AdminSidebar.tsx
const navigationSections: NavSection[] = [
  {
    title: 'CLÍNICA',
    key: 'clinic',
    roles: ['admin', 'vet', 'staff'],
    items: [
      { name: 'Citas', href: '/admin/appointments', icon: Calendar },
      { name: 'Propietarios / Pacientes', href: '/admin/clients', icon: Users },
      { name: 'Historial Médico', href: '/admin/medical-records', icon: FileText },
      { name: 'Nueva Consulta', href: '/admin/consult', icon: Stethoscope },
      { name: 'Pagos', href: '/admin/payments', icon: CreditCard },
    ]
  },
  {
    title: 'GESTIÓN',
    key: 'management',
    roles: ['admin'],
    items: [
      { name: 'Métricas', href: '/admin/metrics', icon: BarChart },
      { name: 'Mascotas', href: '/admin/pets', icon: PawPrint },
      { name: 'Adopciones', href: '/admin/adoptions', icon: Heart },
      { name: 'Apadrinamientos', href: '/admin/sponsorships', icon: HeartHandshake },
      { name: 'Personal', href: '/admin/staff', icon: Users },
      { name: 'Manual de Usuario', href: '/admin/user-manual', icon: Book },
    ]
  },
  {
    title: 'PROPIETARIO',
    key: 'owner',
    roles: [], // No se muestra en admin panel
    items: []
  }
]

// Filtrar secciones por rol
const visibleSections = navigationSections.filter(section =>
  section.roles.includes(user.role)
)
```

**Archivos a Modificar**:
- `app/frontend/types/navigation.ts` (crear)
- `app/frontend/pages/admin/components/AdminSidebar.tsx`
- `app/frontend/pages/admin/components/AdminLayout.tsx`

**Tests**:
- Usuario admin ve CLÍNICA + GESTIÓN
- Usuario vet ve solo CLÍNICA
- Secciones están separadas visualmente

---

#### US-2.2: Portal de Propietarios Separado
**Como** propietario de mascota
**Quiero** tener mi propio portal separado del admin
**Para** ver solo la información relevante para mí (mis mascotas, citas, pagos)

**Criterios de Aceptación**:
- [ ] El portal de propietarios debe tener su propio layout (OwnerLayout)
- [ ] Las rutas deben ser `/owner/*` (no `/admin/*`)
- [ ] El sidebar debe mostrar solo opciones de propietario
- [ ] El header debe tener branding diferente (opcional)
- [ ] Los propietarios NO deben poder acceder a rutas `/admin/*`

**Tareas Técnicas**:
```typescript
// 1. Crear OwnerLayout.tsx
// app/frontend/pages/owner/components/OwnerLayout.tsx
export function OwnerLayout({ user, children }: OwnerLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <OwnerSidebar user={user} />
      <div className="flex-1 flex flex-col">
        <OwnerHeader user={user} />
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

// 2. Crear OwnerSidebar.tsx con navegación de propietario
const ownerNavigation: NavItem[] = [
  { name: 'Mi Perfil', href: '/owner/profile', icon: User },
  { name: 'Mis Mascotas', href: '/owner/pets', icon: PawPrint },
  { name: 'Mis Citas', href: '/owner/appointments', icon: Calendar },
  { name: 'Historial de Pagos', href: '/owner/payments', icon: CreditCard },
  { name: 'Registros Activos', href: '/owner/active-records', icon: Activity },
]

// 3. Rutas en Rails
# config/routes.rb
scope :owner do
  get "profile", to: "owner_pages#profile"
  get "pets", to: "owner_pages#pets"
  get "appointments", to: "owner_pages#appointments"
  get "payments", to: "owner_pages#payments"
  get "active-records", to: "owner_pages#active_records"
end

# 4. Controller para owner
# app/controllers/owner_pages_controller.rb
class OwnerPagesController < ApplicationController
  include Authenticatable
  before_action :authenticate_owner!

  def pets
    render inertia: "owner/pets/PetsIndex", props: {
      user: user_response(current_user)
    }
  end
  # ...
end
```

**Archivos a Crear**:
- `app/frontend/pages/owner/components/OwnerLayout.tsx`
- `app/frontend/pages/owner/components/OwnerSidebar.tsx`
- `app/frontend/pages/owner/components/OwnerHeader.tsx`
- `app/controllers/owner_pages_controller.rb`

**Tests**:
- Owner solo puede acceder a `/owner/*`
- Owner NO puede acceder a `/admin/*`
- Sidebar muestra opciones de propietario

---

#### US-2.3: Search Bar Global en Header
**Como** usuario del sistema
**Quiero** una barra de búsqueda global en el header
**Para** buscar rápidamente propietarios, mascotas o citas

**Criterios de Aceptación**:
- [ ] El search bar debe estar en el header, centrado
- [ ] Debe tener placeholder "Buscar pacientes, propietarios..."
- [ ] Debe tener icono de búsqueda
- [ ] Al escribir 3+ caracteres, debe mostrar resultados
- [ ] Los resultados deben estar categorizados (Propietarios, Mascotas, Citas)
- [ ] Al hacer click en resultado, navega a la entidad

**Tareas Técnicas**:
```typescript
// 1. Componente GlobalSearch
// components/GlobalSearch.tsx
export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ owners: [], pets: [], appointments: [] })
  const [isOpen, setIsOpen] = useState(false)

  const debouncedSearch = useDebouncedCallback(async (q: string) => {
    if (q.length < 3) return
    const data = await api.search.global(q)
    setResults(data)
    setIsOpen(true)
  }, 300)

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar pacientes, propietarios..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          debouncedSearch(e.target.value)
        }}
        className="pl-9"
      />
      {isOpen && (
        <SearchResults results={results} onSelect={() => setIsOpen(false)} />
      )}
    </div>
  )
}

// 2. API endpoint
# app/controllers/search_controller.rb
class SearchController < ApplicationController
  def global
    query = params[:q]

    results = {
      owners: Owner.search(query).limit(5),
      pets: Pet.search(query).limit(5),
      appointments: Appointment.search(query).limit(5)
    }

    render json: results
  end
end
```

**Archivos a Crear**:
- `app/frontend/components/GlobalSearch.tsx`
- `app/frontend/components/SearchResults.tsx`
- `app/frontend/hooks/useDebouncedCallback.ts`
- `app/controllers/search_controller.rb`

**Archivos a Modificar**:
- `app/frontend/pages/admin/components/AdminHeader.tsx`

**Tests**:
- Buscar con 2 caracteres → no muestra resultados
- Buscar con 3+ caracteres → muestra resultados categorizados
- Click en resultado → navega a detalle

---

## Epic 3: Módulo de Citas (Alta Prioridad)

**Objetivo**: Implementar el módulo de citas con calendario y gestión completa

**Referencia**: Plan 013 ya existe (`.docs/013-appointments-system.md`)

### User Stories

#### US-3.1: Ver Calendario de Citas
**Como** veterinario
**Quiero** ver un calendario con todas las citas
**Para** organizar mi agenda diaria/semanal/mensual

**Criterios de Aceptación**:
- [ ] Debe haber 3 vistas: Día, Semana, Mes
- [ ] Las citas deben mostrarse en el horario correspondiente
- [ ] Cada cita debe mostrar: Mascota, Propietario, Hora, Veterinario, Motivo
- [ ] Debe haber navegación anterior/siguiente
- [ ] Debe mostrar contador "X citas confirmadas"

**Referencia**: Implementar según plan 013

---

#### US-3.2: Gestionar Citas (Reagendar, Cancelar)
**Como** recepcionista
**Quiero** poder reagendar o cancelar citas
**Para** manejar cambios en la agenda

**Criterios de Aceptación**:
- [ ] Cada cita debe tener botones: Reagendar, Cancelar, Comenzar Consulta
- [ ] Reagendar debe abrir modal con selector de fecha/hora
- [ ] Cancelar debe pedir confirmación
- [ ] Al reagendar/cancelar, debe notificar al propietario (futuro)

**Referencia**: Implementar según plan 013

---

## Epic 4: Dashboard de Métricas

**Objetivo**: Crear dashboard con KPIs y widgets del mockup

### User Stories

#### US-4.1: Ver KPIs Principales
**Como** administrador
**Quiero** ver métricas clave del negocio
**Para** monitorear el rendimiento de la clínica

**Criterios de Aceptación**:
- [ ] Debe mostrar 3 cards principales: Ingresos, Citas, Nuevos Clientes
- [ ] Cada card debe mostrar valor actual + % vs período anterior
- [ ] Debe haber selector de período (Mensual, Trimestral, Anual)
- [ ] Los números deben ser grandes y legibles
- [ ] El % debe tener color: verde (positivo), rojo (negativo)

**Tareas Técnicas**:
```typescript
// components/MetricCard.tsx
interface MetricCardProps {
  title: string
  value: string | number
  change: number // Porcentaje vs período anterior
  icon: React.ComponentType
}

export function MetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold">{value}</p>
        <p className={cn(
          "text-sm",
          change >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {change >= 0 ? '+' : ''}{change}% vs período anterior
        </p>
      </div>
    </div>
  )
}
```

**Archivos a Crear**:
- `app/frontend/pages/admin/metrics/MetricsIndex.tsx`
- `app/frontend/components/MetricCard.tsx`
- `app/controllers/admin_pages_controller.rb` (método metrics)

---

#### US-4.2: Ver Estado del Personal
**Como** administrador
**Quiero** ver qué empleados están activos/disponibles
**Para** saber quién está trabajando en cada turno

**Criterios de Aceptación**:
- [ ] Widget que muestra lista de empleados
- [ ] Cada empleado muestra: Nombre, Especialidad, Turno, Estado
- [ ] Estados: Activo (verde), Descanso (amarillo), Libre (gris)
- [ ] Se actualiza según el turno actual

---

#### US-4.3: Ver Quirófano - Programación
**Como** veterinario
**Quiero** ver las cirugías programadas del día
**Para** prepararme para cada procedimiento

**Criterios de Aceptación**:
- [ ] Widget con timeline de cirugías del día
- [ ] Cada cirugía muestra: Hora, Mascota, Tipo de cirugía, Veterinario
- [ ] Estados: En Progreso (azul), Programado (gris), Disponible (verde)

---

## Epic 5: Unificación Propietarios/Mascotas

**Objetivo**: Unificar la vista de Propietarios y Mascotas con tabs como en el mockup

### User Stories

#### US-5.1: Vista Unificada con Tabs
**Como** veterinario
**Quiero** alternar entre propietarios y mascotas en la misma pantalla
**Para** tener contexto completo al buscar pacientes

**Criterios de Aceptación**:
- [ ] Ruta `/admin/clients` debe tener 2 tabs: Propietarios (3), Mascotas (3)
- [ ] El contador debe mostrar total de cada categoría
- [ ] El search bar debe buscar en ambas categorías
- [ ] Los filtros deben ser compartidos (ciudad, especie)

**Tareas Técnicas**:
```typescript
// pages/admin/clients/ClientsIndex.tsx
type TabView = 'owners' | 'pets'

export default function ClientsIndex() {
  const [activeTab, setActiveTab] = useState<TabView>('owners')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabView)}>
        <TabsList>
          <TabsTrigger value="owners">
            <Users className="h-4 w-4 mr-2" />
            Propietarios ({ownersCount})
          </TabsTrigger>
          <TabsTrigger value="pets">
            <PawPrint className="h-4 w-4 mr-2" />
            Mascotas ({petsCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owners">
          <OwnersList query={searchQuery} />
        </TabsContent>

        <TabsContent value="pets">
          <PetsList query={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Archivos a Crear**:
- `app/frontend/pages/admin/clients/ClientsIndex.tsx`
- `app/frontend/pages/admin/clients/components/OwnersList.tsx`
- `app/frontend/pages/admin/clients/components/PetsList.tsx`

---

## Priorización de Epics

| Epic | Prioridad | Esfuerzo | Valor de Negocio | Orden |
|------|-----------|----------|------------------|-------|
| Epic 1: Correcciones del Layout | 🔴 Crítica | 1 semana | Alto (UX) | 1 |
| Epic 2: Navegación 3 Portales | 🟡 Alta | 2 semanas | Alto (Arquitectura) | 2 |
| Epic 3: Módulo de Citas | 🔴 Crítica | 3-4 semanas | Muy Alto (Core) | 3 |
| Epic 4: Dashboard Métricas | 🟡 Alta | 2-3 semanas | Alto (Gestión) | 4 |
| Epic 5: Unificación Clientes | 🟢 Media | 1 semana | Medio (UX) | 5 |

---

## Plan de Implementación

### Fase 1: Correcciones Críticas (Semana 1)
**Epic 1 completo**

- [ ] US-1.1: Dark Mode Funcional
- [ ] US-1.2: Sidebar Responsive
- [ ] US-1.3: Botón Hamburguesa
- [ ] US-1.4: Rol Correcto en Header

**Entregable**: AdminLayout funcional en mobile + dark mode

---

### Fase 2: Reestructuración (Semanas 2-3)
**Epic 2 completo**

- [ ] US-2.1: Sidebar con Secciones
- [ ] US-2.2: Portal de Propietarios Separado
- [ ] US-2.3: Search Bar Global

**Entregable**: Navegación con 3 portales separados + búsqueda global

---

### Fase 3: Módulo de Citas (Semanas 4-7)
**Epic 3 completo** (seguir plan 013)

- [ ] Calendario de citas (Día/Semana/Mes)
- [ ] CRUD de citas
- [ ] Reagendar/Cancelar
- [ ] Comenzar Consulta

**Entregable**: Sistema de citas funcional

---

### Fase 4: Dashboard y Métricas (Semanas 8-10)
**Epic 4 completo**

- [ ] KPIs principales
- [ ] Widgets de personal
- [ ] Quirófano programación
- [ ] Servicios más vendidos

**Entregable**: Dashboard con métricas clave

---

### Fase 5: Mejoras de UX (Semana 11)
**Epic 5 completo**

- [ ] Unificación Propietarios/Mascotas
- [ ] Tabs con iconos
- [ ] Búsqueda unificada

**Entregable**: Vista unificada de clientes

---

## Criterios de Éxito General

- [ ] Todos los issues del layout están resueltos
- [ ] Dark mode funciona correctamente
- [ ] Layout es responsive (mobile, tablet, desktop)
- [ ] Navegación separada en 3 portales (CLÍNICA, GESTIÓN, PROPIETARIO)
- [ ] Portal de propietarios totalmente separado en `/owner/*`
- [ ] Search bar global funcional
- [ ] Módulo de citas implementado
- [ ] Dashboard con métricas básicas
- [ ] Cobertura de tests > 80%

---

## Notas de Implementación

### Convenciones de Código

**Rutas**:
- Admin/Staff: `/admin/*`
- Propietarios: `/owner/*`
- Público: `/` (landing, login, register)

**Permisos**:
- Admin: acceso a TODO (CLÍNICA + GESTIÓN)
- Vet: acceso a CLÍNICA
- Staff: acceso a CLÍNICA (limitado)
- Owner: acceso solo a portal `/owner/*`

**Components**:
- AdminLayout → para admin/staff
- OwnerLayout → para propietarios
- No mezclar componentes entre portales

**Tests**:
- Cada US debe tener request specs
- E2E para flujos críticos (citas, búsqueda)
- Visual regression tests para layouts

---

## Referencias

- Mockup original: https://vet-dashboard.lovable.app
- Análisis del mockup: `.docs/end2end/mockup-analysis.md`
- Plan de citas: `.docs/013-appointments-system.md`
- Pruebas E2E: `.docs/end2end/01-layouts.md`
- Screenshots: `.playwright-mcp/mockup-*.png`

---

**Estado Actual**: Listo para comenzar Fase 1 (Correcciones del Layout)
