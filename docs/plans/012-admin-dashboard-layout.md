<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2026-01-11 (PR #23)
Archivos creados:
  - app/frontend/pages/admin/components/AdminLayout.tsx
  - app/frontend/pages/admin/components/AdminSidebar.tsx
  - app/frontend/pages/admin/components/AdminHeader.tsx
  - .claude/rules/frontend/admin-components.md (documentación)
Notas:
  - Ubicación final: pages/admin/components/ (no components/admin/)
  - VetSidebar.tsx movido a components/_unused/
  - Todas las páginas admin usan AdminLayout
  - Sidebar responsive con overlay en móvil
  - Header con dropdown de usuario
-->

# Plan: Admin Dashboard Layout System

## Descripción General

Crear un sistema de layout consistente para todas las páginas del admin dashboard que incluya:
- **Sidebar de navegación**: Menú lateral con enlaces a todas las secciones del admin
- **Header superior**: Barra con información del usuario, notificaciones y acciones globales
- **Layout responsivo**: Sidebar colapsable en móvil/tablet
- **Active states**: Indicador visual de la página actual
- **Estructura de componentes**: Separación clara entre componentes generales y específicos de dominio

Este sistema unifica la experiencia de usuario en todo el admin dashboard y aprovecha el `VetSidebar.tsx` existente pero no utilizado.

---

## Arquitectura Actual vs. Propuesta

### Estado Actual
```
app/frontend/pages/admin/
├── pets/
│   ├── PetsIndex.tsx           # Sin layout, renderizado directo
│   └── components/
│       └── AdminPetForm.tsx
├── adoptions/
│   ├── AdoptionsIndex.tsx      # Sin layout, renderizado directo
│   └── components/
│       └── AdoptionForm.tsx
└── sponsorships/
    └── SponsorshipsIndex.tsx   # Sin layout, renderizado directo

app/frontend/components/dashboard/
└── VetSidebar.tsx              # Existe pero NO se usa
```

### Estado Propuesto
```
app/frontend/components/admin/
├── AdminLayout.tsx             # Layout wrapper (Header + Sidebar + children)
├── AdminSidebar.tsx            # Sidebar de navegación (adaptado de VetSidebar)
└── AdminHeader.tsx             # Header superior

app/frontend/pages/admin/
├── pets/
│   ├── PetsIndex.tsx           # Envuelto en AdminLayout
│   └── components/
│       └── AdminPetForm.tsx    # Componentes específicos del dominio
├── adoptions/
│   ├── AdoptionsIndex.tsx      # Envuelto en AdminLayout
│   └── components/
│       └── AdoptionForm.tsx    # Componentes específicos del dominio
└── sponsorships/
    └── SponsorshipsIndex.tsx   # Envuelto en AdminLayout
```

**Regla de ubicación:**
- `components/admin/` → Componentes generales de admin (Layout, Sidebar, Header)
- `pages/admin/{domain}/components/` → Componentes específicos del dominio (Forms, Cards, etc.)

---

## Rutas Admin Existentes

| Ruta | Controlador | Componente |
|------|-------------|------------|
| `/admin/pets` | `admin_pages#pets` | `admin/pets/PetsIndex.tsx` |
| `/admin/adoptions` | `admin_pages#adoptions` | `admin/adoptions/AdoptionsIndex.tsx` |
| `/admin/sponsorships` | `admin_pages#sponsorships` | `admin/sponsorships/SponsorshipsIndex.tsx` |

---

## Stack Tecnológico

### Dependencias Existentes
- React 19.2.0
- Inertia.js (routing)
- Tailwind CSS (estilos)
- shadcn/ui (componentes base)
- lucide-react (iconos)

**No se requieren nuevas dependencias NPM.**

---

## Epics y User Stories

### Epic 1: Fundación - Componentes Base Admin

#### US-1.1: Crear AdminSidebar component
**Como** desarrollador del admin
**Quiero** un componente sidebar reutilizable
**Para** mantener navegación consistente en todas las páginas del admin

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/admin/AdminSidebar.tsx`
- [ ] Adaptar estructura de `VetSidebar.tsx` (no copiarlo, usarlo como referencia)
- [ ] Incluir items de navegación: Pets, Adoptions, Sponsorships
- [ ] Usar iconos de lucide-react: `PawPrint`, `Heart`, `DollarSign`
- [ ] Detectar ruta actual usando `window.location.pathname` o Inertia page props
- [ ] Aplicar estado activo con clases Tailwind (bg-primary/10, text-primary)
- [ ] Incluir logo/título del admin en la parte superior
- [ ] Soporte para scroll con `ScrollArea` de shadcn/ui

**Archivos:**
- `app/frontend/components/admin/AdminSidebar.tsx` (nuevo)

**Tipos:**
```typescript
interface AdminNavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}
```

---

#### US-1.2: Crear AdminHeader component
**Como** usuario del admin
**Quiero** un header con mi información y acciones globales
**Para** acceder rápidamente a mi perfil y configuración

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/admin/AdminHeader.tsx`
- [ ] Mostrar nombre y rol del usuario actual (desde props)
- [ ] Incluir botón de menu hamburguesa para móvil (toggle sidebar)
- [ ] Incluir botón de perfil con dropdown
- [ ] Dropdown con opciones: "Ver perfil", "Configuración", "Cerrar sesión"
- [ ] Usar `DropdownMenu` de shadcn/ui
- [ ] Responsive: altura fija, sticky top-0

**Archivos:**
- `app/frontend/components/admin/AdminHeader.tsx` (nuevo)

**Tipos:**
```typescript
interface AdminHeaderProps {
  user: AuthUser
  onMenuToggle?: () => void
}

interface AuthUser {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
}
```

---

#### US-1.3: Crear AdminLayout wrapper
**Como** desarrollador del admin
**Quiero** un componente layout que combine Header + Sidebar + contenido
**Para** evitar duplicación de código en cada página

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/admin/AdminLayout.tsx`
- [ ] Recibir `user` y `children` como props
- [ ] Layout con grid: sidebar fija a la izquierda, header arriba, contenido en el centro
- [ ] Sidebar: ancho 240px en desktop, colapsable en móvil
- [ ] Header: sticky con z-index alto
- [ ] Área de contenido: padding adecuado, scroll independiente
- [ ] Estado de sidebar colapsado/expandido (useState)
- [ ] Responsive: sidebar se oculta en < 768px, se muestra con overlay al toggle

**Archivos:**
- `app/frontend/components/admin/AdminLayout.tsx` (nuevo)

**Tipos:**
```typescript
interface AdminLayoutProps {
  user: AuthUser
  children: React.ReactNode
}
```

**Estructura HTML:**
```tsx
<div className="flex h-screen">
  {/* Sidebar */}
  <aside className={cn(/* responsive classes */)}>
    <AdminSidebar currentPath={currentPath} />
  </aside>

  {/* Main */}
  <div className="flex-1 flex flex-col">
    {/* Header */}
    <header className="sticky top-0 z-40">
      <AdminHeader user={user} onMenuToggle={handleToggle} />
    </header>

    {/* Content */}
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
</div>
```

---

### Epic 2: Integración - Aplicar Layout a Páginas Existentes

#### US-2.1: Aplicar AdminLayout a PetsIndex
**Como** usuario del admin
**Quiero** que la página de Pets tenga el layout consistente
**Para** navegar fácilmente entre secciones

**Criterios de aceptación:**
- [ ] Modificar `app/frontend/pages/admin/pets/PetsIndex.tsx`
- [ ] Importar `AdminLayout`
- [ ] Envolver todo el contenido de la página en `<AdminLayout user={user}>`
- [ ] Pasar prop `user` desde Inertia page props
- [ ] Verificar que navegación funciona correctamente
- [ ] Verificar que estado activo se aplica a "Pets" en sidebar

**Archivos:**
- `app/frontend/pages/admin/pets/PetsIndex.tsx` (modificar)

**Antes:**
```tsx
export default function PetsIndex() {
  return (
    <>
      <Head title="Admin - Mascotas" />
      <div className="container mx-auto p-6">
        {/* contenido */}
      </div>
    </>
  )
}
```

**Después:**
```tsx
export default function PetsIndex({ user }: { user: AuthUser }) {
  return (
    <AdminLayout user={user}>
      <Head title="Admin - Mascotas" />
      <div className="container mx-auto">
        {/* contenido */}
      </div>
    </AdminLayout>
  )
}
```

---

#### US-2.2: Aplicar AdminLayout a AdoptionsIndex
**Como** usuario del admin
**Quiero** que la página de Adoptions tenga el layout consistente
**Para** navegar fácilmente entre secciones

**Criterios de aceptación:**
- [ ] Modificar `app/frontend/pages/admin/adoptions/AdoptionsIndex.tsx`
- [ ] Importar `AdminLayout`
- [ ] Envolver todo el contenido en `<AdminLayout user={user}>`
- [ ] Pasar prop `user` desde Inertia page props
- [ ] Verificar navegación y estado activo

**Archivos:**
- `app/frontend/pages/admin/adoptions/AdoptionsIndex.tsx` (modificar)

---

#### US-2.3: Aplicar AdminLayout a SponsorshipsIndex
**Como** usuario del admin
**Quiero** que la página de Sponsorships tenga el layout consistente
**Para** navegar fácilmente entre secciones

**Criterios de aceptación:**
- [ ] Modificar `app/frontend/pages/admin/sponsorships/SponsorshipsIndex.tsx`
- [ ] Importar `AdminLayout`
- [ ] Envolver todo el contenido en `<AdminLayout user={user}>`
- [ ] Pasar prop `user` desde Inertia page props
- [ ] Verificar navegación y estado activo

**Archivos:**
- `app/frontend/pages/admin/sponsorships/SponsorshipsIndex.tsx` (modificar)

---

### Epic 3: Mejoras de UX - Responsive y Estados

#### US-3.1: Sidebar responsivo con overlay en móvil
**Como** usuario en móvil
**Quiero** poder abrir/cerrar el sidebar con un botón
**Para** navegar sin que el sidebar ocupe toda la pantalla

**Criterios de aceptación:**
- [ ] En < 768px, sidebar oculto por defecto
- [ ] Botón hamburguesa en header abre sidebar
- [ ] Sidebar se muestra con overlay (backdrop oscuro)
- [ ] Click en overlay o en link cierra el sidebar
- [ ] Transición suave (transform + opacity)
- [ ] Estado de apertura sincronizado entre Header y Layout

**Archivos:**
- `app/frontend/components/admin/AdminLayout.tsx` (modificar)
- `app/frontend/components/admin/AdminHeader.tsx` (modificar)

**Clases Tailwind:**
```tsx
<aside className={cn(
  "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r",
  "transform transition-transform duration-300",
  "md:translate-x-0 md:relative",
  !isOpen && "max-md:-translate-x-full"
)}>
```

---

#### US-3.2: Active state en navegación
**Como** usuario del admin
**Quiero** ver visualmente en qué sección estoy
**Para** orientarme mejor en la aplicación

**Criterios de aceptación:**
- [ ] Item activo tiene bg-primary/10 y text-primary
- [ ] Item activo tiene border-left de 4px en color primary
- [ ] Items no activos tienen hover state (bg-muted)
- [ ] Transición suave de colores
- [ ] Detección automática basada en pathname

**Archivos:**
- `app/frontend/components/admin/AdminSidebar.tsx` (modificar)

**Implementación:**
```tsx
const isActive = currentPath.startsWith(item.href)

<Link href={item.href}>
  <Button
    variant={isActive ? 'secondary' : 'ghost'}
    className={cn(
      'w-full justify-start gap-3',
      isActive && 'bg-primary/10 text-primary border-l-4 border-primary'
    )}
  >
    <item.icon className="h-5 w-5" />
    {item.label}
  </Button>
</Link>
```

---

#### US-3.3: Dropdown de usuario en Header
**Como** usuario del admin
**Quiero** acceder a mi perfil y cerrar sesión desde el header
**Para** gestionar mi cuenta sin salir del admin

**Criterios de aceptación:**
- [ ] Avatar del usuario (iniciales o foto)
- [ ] Dropdown con opciones:
  - "Ver perfil" → `/profile`
  - "Configuración" → `/admin/settings` (placeholder)
  - "Cerrar sesión" → Logout action
- [ ] Usar `DropdownMenu` de shadcn/ui
- [ ] Mostrar nombre y rol del usuario en el header

**Archivos:**
- `app/frontend/components/admin/AdminHeader.tsx` (modificar)

**Componentes UI necesarios:**
- `components/ui/dropdown-menu.tsx` (shadcn/ui)
- `components/ui/avatar.tsx` (shadcn/ui)

---

### Epic 4: Limpieza y Documentación

#### US-4.1: Evaluar VetSidebar.tsx
**Como** desarrollador
**Quiero** decidir qué hacer con VetSidebar.tsx
**Para** evitar código muerto en el repo

**Criterios de aceptación:**
- [ ] Revisar si VetSidebar.tsx se usa en alguna parte (grep)
- [ ] Si no se usa: eliminarlo o moverlo a un directorio `_archive/`
- [ ] Si se planea usar para veterinarios: renombrar a `VetDashboardSidebar.tsx` y documentar
- [ ] Actualizar imports si es necesario
- [ ] Documentar decisión en commit message

**Archivos:**
- `app/frontend/components/dashboard/VetSidebar.tsx` (evaluar)

**Opciones:**
1. Eliminar si no se usa
2. Mover a `components/_unused/` si se quiere preservar como referencia
3. Adaptar para dashboard de veterinarios si ese feature existe

---

#### US-4.2: Documentar estructura de componentes
**Como** nuevo desarrollador
**Quiero** entender dónde van los componentes de admin
**Para** mantener la arquitectura consistente

**Criterios de aceptación:**
- [ ] Crear o actualizar `.claude/rules/admin-components.md`
- [ ] Documentar regla: componentes generales de admin → `components/admin/`
- [ ] Documentar regla: componentes específicos de dominio → `pages/admin/{domain}/components/`
- [ ] Incluir ejemplos de cada tipo
- [ ] Incluir árbol de directorios como referencia

**Archivos:**
- `.claude/rules/admin-components.md` (nuevo)

**Contenido del documento:**
```markdown
# Admin Components Structure

## Regla de Ubicación

- **Componentes generales de admin**: `app/frontend/components/admin/`
  - Layout, Sidebar, Header, etc.
  - Reutilizables en todo el admin

- **Componentes específicos de dominio**: `app/frontend/pages/admin/{domain}/components/`
  - Forms, Cards, Modals específicos de Pets, Adoptions, etc.
  - Solo se usan en ese dominio

## Ejemplos

### ✅ Correcto
- `components/admin/AdminLayout.tsx` → Layout general de admin
- `pages/admin/pets/components/AdminPetForm.tsx` → Form específico de Pets
- `pages/admin/adoptions/components/AdoptionCard.tsx` → Card específico de Adoptions

### ❌ Incorrecto
- `components/AdminPetForm.tsx` → Debería estar en `pages/admin/pets/components/`
- `pages/admin/pets/AdminLayout.tsx` → Debería estar en `components/admin/`
```

---

## Orden de Implementación

### Fase 1: Fundación (Epic 1)
1. US-1.1: AdminSidebar
2. US-1.2: AdminHeader
3. US-1.3: AdminLayout

### Fase 2: Integración (Epic 2)
4. US-2.1: PetsIndex
5. US-2.2: AdoptionsIndex
6. US-2.3: SponsorshipsIndex

### Fase 3: Mejoras UX (Epic 3)
7. US-3.1: Sidebar responsivo
8. US-3.2: Active states
9. US-3.3: Dropdown usuario

### Fase 4: Limpieza (Epic 4)
10. US-4.1: VetSidebar cleanup
11. US-4.2: Documentación

**Duración estimada por fase:** No se especifican timelines (seguir regla de planning.md)

---

## Archivos Afectados

### Nuevos (7 archivos)
```
app/frontend/components/admin/
├── AdminLayout.tsx
├── AdminSidebar.tsx
└── AdminHeader.tsx

app/frontend/components/ui/
├── dropdown-menu.tsx    # shadcn/ui (si no existe)
└── avatar.tsx           # shadcn/ui (si no existe)

.claude/rules/
└── admin-components.md
```

### Modificados (3 archivos)
```
app/frontend/pages/admin/pets/PetsIndex.tsx
app/frontend/pages/admin/adoptions/AdoptionsIndex.tsx
app/frontend/pages/admin/sponsorships/SponsorshipsIndex.tsx
```

### A evaluar (1 archivo)
```
app/frontend/components/dashboard/VetSidebar.tsx
```

---

## Resumen de Cambios Backend

**No se requieren cambios en el backend.** Solo necesitamos asegurar que `AdminPagesController` pasa `user` en las props de Inertia (ya lo hace actualmente).

```ruby
# app/controllers/admin_pages_controller.rb (ya implementado)
def pets
  render inertia: "admin/pets/PetsIndex", props: {
    user: user_response(current_user)  # ✅ Ya pasa user
  }
end
```

---

## Testing

### Frontend (Jest + React Testing Library)
```typescript
// AdminSidebar.test.tsx
describe('AdminSidebar', () => {
  it('renders all navigation items', () => {})
  it('highlights active item based on currentPath', () => {})
  it('navigates on click', () => {})
})

// AdminLayout.test.tsx
describe('AdminLayout', () => {
  it('renders header, sidebar and children', () => {})
  it('toggles sidebar on mobile', () => {})
  it('passes user to header', () => {})
})
```

### Backend
No se requieren tests nuevos de backend (no hay cambios).

---

## Notas de Implementación

### Convenciones de Código
- Seguir `.claude/rules/react-architecture.md`: componentes dumb
- Seguir `.claude/rules/typescript.md`: strict types, interfaces con `Props` suffix
- Seguir `.claude/rules/styling.md`: solo Tailwind CSS

### Accesibilidad
- [ ] Sidebar navegable con teclado (Tab, Enter)
- [ ] Botón hamburguesa con `aria-label="Toggle menu"`
- [ ] Overlay con `aria-modal="true"` en móvil
- [ ] Active item con `aria-current="page"`

### Performance
- [ ] Sidebar no re-renderiza en cada cambio de ruta (React.memo si es necesario)
- [ ] Layout no causa hydration mismatch

---

## Recursos Adicionales

### Componentes shadcn/ui a instalar (si no existen)
```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
```

### Iconos lucide-react usados
- `PawPrint` (Pets)
- `Heart` (Adoptions)
- `DollarSign` (Sponsorships)
- `Menu` (Hamburguesa)
- `User` (Avatar)
- `Settings` (Config)
- `LogOut` (Cerrar sesión)

---

## Criterios de Éxito

- [ ] Todas las páginas de admin tienen Header y Sidebar consistentes
- [ ] Navegación funciona correctamente entre secciones
- [ ] Estado activo se muestra claramente
- [ ] Sidebar es responsivo (desktop + móvil)
- [ ] Usuario puede acceder a perfil y logout desde el header
- [ ] Código sigue las convenciones del proyecto
- [ ] No hay duplicación de componentes
- [ ] VetSidebar.tsx resuelto (eliminado o reutilizado)
