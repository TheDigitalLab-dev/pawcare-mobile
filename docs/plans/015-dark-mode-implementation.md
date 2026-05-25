<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2026-01-11
Archivos creados:
  - app/frontend/hooks/useTheme.ts (hook para manejo de tema)
  - app/frontend/components/ThemeToggle.tsx (componente toggle)
  - .claude/rules/frontend-design.md (regla de dark mode + mobile-first)
Archivos modificados:
  - app/views/layouts/application.html.erb (script anti-FOUT)
  - app/frontend/components/landing/Navbar.tsx (integración ThemeToggle)
  - app/frontend/styles/tokens.css (ya tenía .dark, se mantiene)
Notas:
  - Variables CSS en tokens.css ya tenían soporte .dark
  - Script anti-FOUT previene flash de tema incorrecto
  - ThemeToggle disponible en variantes 'simple' y 'dropdown'
-->

# Plan: Implementación de Modo Oscuro (Dark Mode)

## Descripción General

Implementar un sistema completo de modo oscuro que permita a los usuarios alternar entre modo claro y oscuro. El sistema debe:
- **Detectar preferencias del sistema** (prefers-color-scheme)
- **Persistir la selección** del usuario en localStorage
- **Aplicar cambios instantáneos** sin recargar la página
- **Mantener accesibilidad** en ambos modos (WCAG AA)
- **Componente toggle** visible y accesible

**Beneficios:**
- Reduce fatiga visual en ambientes con poca luz
- Ahorra batería en dispositivos con pantallas OLED
- Preferencia común entre desarrolladores y usuarios avanzados

---

## Stack Tecnológico

### Dependencias Existentes
- React 19.2.0 + TypeScript
- Tailwind CSS v4 con @theme
- localStorage (API nativa del navegador)

### Nuevas Dependencias
```bash
# Iconos para el toggle (si no están instalados)
# lucide-react ya está instalado, usaremos Sun y Moon icons
```

**No se requieren nuevas dependencias NPM.**

---

## Arquitectura del Sistema

### Flujo de Funcionamiento

```
1. Usuario carga la página
   ↓
2. Hook useTheme se inicializa
   ↓
3. Verificar localStorage (¿hay preferencia guardada?)
   ├─ SÍ → Aplicar preferencia guardada
   └─ NO → Detectar preferencia del sistema (prefers-color-scheme)
   ↓
4. Aplicar clase 'dark' al elemento <html> si corresponde
   ↓
5. CSS aplica variables de modo oscuro automáticamente
   ↓
6. Usuario hace toggle
   ↓
7. Actualizar localStorage + clase HTML
   ↓
8. CSS reacciona instantáneamente
```

### Estructura de Archivos

```
app/frontend/
├── hooks/
│   └── useTheme.ts                    # Hook para manejar tema
├── components/
│   └── ThemeToggle.tsx                # Componente botón toggle
├── styles/
│   └── tokens.css                     # Variables CSS duplicadas para dark mode
└── pages/
    └── ... (todos usan useTheme via context)
```

---

## Epics y User Stories

### Epic 1: Fundación - CSS Variables para Dark Mode

#### US-1.1: Definir paleta de colores para modo oscuro
**Como** diseñador
**Quiero** definir una paleta oscura accesible y armoniosa
**Para** que el modo oscuro sea cómodo de usar

**Criterios de aceptación:**
- [ ] Definir colores base para dark mode:
  - Background: `#0F172A` (slate oscuro, no negro puro)
  - Foreground: `#F1F5F9` (texto claro)
  - Card: `#1E293B` (ligeramente más claro que background)
  - Muted: `#334155` (gris oscuro)
  - Primary: mantener o ajustar ligeramente
- [ ] Verificar contrastes (mínimo 4.5:1 para WCAG AA)
- [ ] Crear tabla comparativa light vs dark
- [ ] Documentar decisiones de diseño

**Archivos:**
- Ninguno (diseño conceptual)

**Paleta Recomendada (Dark Mode):**
```css
--background: #0F172A;      /* Slate 900 */
--foreground: #F1F5F9;      /* Slate 100 */
--card: #1E293B;            /* Slate 800 */
--card-foreground: #F1F5F9;
--muted: #334155;           /* Slate 700 */
--muted-foreground: #94A3B8; /* Slate 400 */
--border: #334155;
--input: #334155;
```

---

#### US-1.2: Duplicar variables CSS con selector .dark
**Como** desarrollador
**Quiero** duplicar todas las variables CSS para modo oscuro
**Para** que Tailwind aplique los colores correctos según el modo

**Criterios de aceptación:**
- [ ] Abrir `app/frontend/styles/tokens.css`
- [ ] Agregar bloque `.dark` después del `@theme` principal
- [ ] Duplicar TODAS las variables de color:
  - background, foreground
  - card, card-foreground
  - popover, popover-foreground
  - primary, secondary, accent
  - muted, destructive, etc.
- [ ] Ajustar valores para modo oscuro
- [ ] Mantener variables no relacionadas con color (radius, fonts) sin duplicar

**Archivos:**
- `app/frontend/styles/tokens.css` (modificar)

**Estructura:**
```css
@theme {
  /* Light mode (default) */
  --background: #FAF8F3;
  --foreground: #1F2937;
  /* ... todas las variables light ... */
}

.dark {
  /* Dark mode - override variables */
  --background: #0F172A;
  --foreground: #F1F5F9;
  /* ... todas las variables dark ... */
}
```

---

#### US-1.3: Configurar Tailwind para dark mode con clase
**Como** desarrollador
**Quiero** configurar Tailwind para usar estrategia de clase
**Para** tener control programático del modo oscuro

**Criterios de aceptación:**
- [ ] Verificar configuración de Tailwind CSS v4
- [ ] En CSS, el selector `.dark` ya funciona automáticamente
- [ ] NO se requiere configuración adicional en tailwind.config (v4 es CSS-first)
- [ ] Verificar que `dark:` prefix funciona en componentes

**Archivos:**
- Ninguno (Tailwind v4 maneja dark mode por CSS automáticamente)

**Test:**
```tsx
// En cualquier componente, esto debería funcionar:
<div className="bg-background dark:bg-background">
  Text
</div>
```

---

### Epic 2: Lógica de Tema - Hook useTheme

#### US-2.1: Crear hook useTheme con detección de preferencia
**Como** desarrollador
**Quiero** un hook custom para manejar el tema
**Para** centralizar la lógica de dark mode

**Criterios de aceptación:**
- [ ] Crear `app/frontend/hooks/useTheme.ts`
- [ ] Detectar preferencia del sistema con `matchMedia('(prefers-color-scheme: dark)')`
- [ ] Leer localStorage (`theme` key)
- [ ] Prioridad: localStorage > sistema > light (default)
- [ ] Aplicar clase `dark` al `<html>` element
- [ ] Retornar: `{ theme, setTheme, toggleTheme }`

**Archivos:**
- `app/frontend/hooks/useTheme.ts` (nuevo)

**Implementación:**
```typescript
import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Verificar localStorage
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) return stored

    // 2. Detectar preferencia del sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    // 3. Default: light
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement

    // Resolver tema efectivo (si es 'system', determinar light/dark)
    const effectiveTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme

    // Aplicar clase 'dark' si corresponde
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Guardar en localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, setTheme, toggleTheme }
}
```

---

#### US-2.2: Escuchar cambios en preferencia del sistema
**Como** usuario
**Quiero** que la app respete cambios en mi preferencia del sistema
**Para** sincronizar con mi configuración global

**Criterios de aceptación:**
- [ ] Modificar `useTheme` para escuchar cambios de `prefers-color-scheme`
- [ ] Solo aplicar si el usuario eligió `theme: 'system'`
- [ ] Usar `matchMedia().addEventListener('change', handler)`
- [ ] Limpiar listener en cleanup de useEffect

**Archivos:**
- `app/frontend/hooks/useTheme.ts` (modificar)

**Código adicional:**
```typescript
useEffect(() => {
  if (theme !== 'system') return

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (e: MediaQueryListEvent) => {
    const root = document.documentElement
    if (e.matches) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}, [theme])
```

---

### Epic 3: Componente ThemeToggle

#### US-3.1: Crear componente ThemeToggle básico
**Como** usuario
**Quiero** un botón para cambiar entre modo claro y oscuro
**Para** elegir mi preferencia visual

**Criterios de aceptación:**
- [ ] Crear `app/frontend/components/ThemeToggle.tsx`
- [ ] Usar hook `useTheme()`
- [ ] Botón con icono Sun (light) / Moon (dark)
- [ ] Toggle entre light y dark (no 'system' por ahora)
- [ ] Transición suave de iconos
- [ ] Accesible: `aria-label` descriptivo

**Archivos:**
- `app/frontend/components/ThemeToggle.tsx` (nuevo)

**Implementación:**
```typescript
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}
```

---

#### US-3.2: Mejorar ThemeToggle con opción 'system'
**Como** usuario avanzado
**Quiero** opción para seguir preferencia del sistema
**Para** sincronizar con mi configuración global

**Criterios de aceptación:**
- [ ] Cambiar toggle simple por dropdown con 3 opciones
- [ ] Usar `DropdownMenu` de shadcn/ui
- [ ] Opciones: Light, Dark, System
- [ ] Checkmark en opción activa
- [ ] Iconos para cada opción

**Archivos:**
- `app/frontend/components/ThemeToggle.tsx` (modificar)

**Implementación mejorada:**
```typescript
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {theme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : theme === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

### Epic 4: Integración en la Aplicación

#### US-4.1: Agregar ThemeToggle al Navbar público
**Como** visitante del sitio
**Quiero** cambiar el tema desde la landing page
**Para** personalizar mi experiencia de navegación

**Criterios de aceptación:**
- [ ] Abrir `app/frontend/components/landing/Navbar.tsx`
- [ ] Importar `ThemeToggle`
- [ ] Agregar entre botones de Login y Register
- [ ] Verificar que funciona en desktop y móvil
- [ ] En móvil, agregar también en el menú colapsado

**Archivos:**
- `app/frontend/components/landing/Navbar.tsx` (modificar)

**Ubicación:**
```tsx
<div className="hidden md:flex items-center gap-4">
  <ThemeToggle />  {/* ← Agregar aquí */}
  <Button variant="ghost" asChild>
    <Link href="/auth">Login</Link>
  </Button>
  <Button asChild>
    <Link href="/auth">Register</Link>
  </Button>
</div>
```

---

#### US-4.2: Agregar ThemeToggle al AdminHeader
**Como** usuario admin
**Quiero** cambiar el tema desde el admin panel
**Para** trabajar cómodamente en ambientes oscuros

**Criterios de aceptación:**
- [ ] Si AdminHeader existe (Plan 012), agregar ThemeToggle
- [ ] Si NO existe, agregar en cada página admin temporalmente
- [ ] Ubicación: al lado del dropdown de usuario
- [ ] Verificar que funciona en todas las páginas admin

**Archivos:**
- `app/frontend/components/admin/AdminHeader.tsx` (modificar, si existe)
- O `app/frontend/pages/admin/*/Index.tsx` (modificar temporalmente)

**Nota:** Si Plan 012 no está implementado, agregar ThemeToggle en cada página admin individualmente hasta que AdminHeader exista.

---

#### US-4.3: Prevenir flash de contenido no temático (FOUT)
**Como** usuario
**Quiero** que el tema correcto se aplique inmediatamente al cargar
**Para** no ver un "flash" de modo claro antes de modo oscuro

**Criterios de aceptación:**
- [ ] Crear script inline que se ejecuta ANTES de React
- [ ] Leer localStorage y aplicar clase 'dark' inmediatamente
- [ ] Agregar script en `app/views/layouts/application.html.erb`
- [ ] Script debe ser inline (no archivo externo)
- [ ] Verificar que NO hay flash al recargar en modo oscuro

**Archivos:**
- `app/views/layouts/application.html.erb` (modificar)

**Script anti-FOUT:**
```html
<!-- app/views/layouts/application.html.erb -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ANTI-FOUT SCRIPT - Debe ir ANTES de CSS y JS -->
    <script>
      (function() {
        const theme = localStorage.getItem('theme') || 'system'
        if (
          theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
          document.documentElement.classList.add('dark')
        }
      })()
    </script>

    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <%= vite_client_tag %>
    <%= vite_react_refresh_tag %>
    <%= vite_typescript_tag 'application' %>
    <!-- ... resto del head ... -->
  </head>
  <body>
    <%= yield %>
  </body>
</html>
```

---

### Epic 5: Ajustes de Componentes para Dark Mode

#### US-5.1: Revisar y ajustar componentes shadcn/ui
**Como** desarrollador
**Quiero** verificar que todos los componentes UI se ven bien en dark mode
**Para** mantener consistencia visual

**Criterios de aceptación:**
- [ ] Revisar componentes en `app/frontend/components/ui/`:
  - Button (todos los variants)
  - Card, Dialog, Dropdown
  - Input, Textarea, Select
  - Table, Badge, Alert
- [ ] Verificar que usan variables CSS correctamente
- [ ] Si algún componente usa colores hardcoded, cambiar a variables
- [ ] Probar cada componente en ambos modos

**Archivos:**
- `app/frontend/components/ui/*.tsx` (potencialmente varios)

**Patrón correcto:**
```tsx
// ✅ Correcto - Usa variable CSS
className="bg-background text-foreground"

// ❌ Incorrecto - Color hardcoded
className="bg-white text-black"
```

---

#### US-5.2: Ajustar componentes custom con colores hardcoded
**Como** desarrollador
**Quiero** encontrar y corregir colores hardcoded en componentes custom
**Para** que respeten el tema activo

**Criterios de aceptación:**
- [ ] Buscar colores hardcoded en componentes:
  ```bash
  grep -r "bg-white\|text-black\|bg-gray-\|text-gray-" app/frontend/components/ --include="*.tsx"
  ```
- [ ] Reemplazar con clases de Tailwind que usan variables:
  - `bg-white` → `bg-background` o `bg-card`
  - `text-black` → `text-foreground`
  - `bg-gray-100` → `bg-muted`
  - `text-gray-600` → `text-muted-foreground`
- [ ] Usar `dark:` prefix solo si necesitas override específico
- [ ] Verificar visualmente en ambos modos

**Archivos:**
- `app/frontend/components/**/*.tsx` (varios, según hallazgos)

---

#### US-5.3: Ajustar imágenes y logos para dark mode
**Como** diseñador
**Quiero** que imágenes y logos se vean bien en ambos modos
**Para** mantener legibilidad y estética

**Criterios de aceptación:**
- [ ] Identificar logos/imágenes con fondo blanco
- [ ] Opciones para logos:
  - **Opción A:** Logo con transparencia (PNG)
  - **Opción B:** Dos versiones (light y dark), cambiar con JS
  - **Opción C:** Logo SVG con colores que se adaptan
- [ ] Aplicar solución elegida
- [ ] Verificar en Hero, Navbar, Footer

**Archivos:**
- `app/frontend/components/landing/Navbar.tsx` (modificar)
- `app/frontend/components/landing/Hero.tsx` (modificar)
- `public/logo-dark.png` (nuevo, si se usa Opción B)

**Ejemplo con dos versiones:**
```tsx
<img
  src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
  alt="Logo"
/>
```

---

### Epic 6: Testing y Validación

#### US-6.1: Testing visual en todas las páginas (ambos modos)
**Como** QA
**Quiero** revisar todas las páginas en light y dark mode
**Para** asegurar que ambos se ven correctos

**Criterios de aceptación:**
- [ ] Crear checklist de páginas:
  - Landing, About, Services, Contact
  - Auth (Login, Register)
  - Dashboard, My Pets
  - Admin Pets, Adoptions, Sponsorships
- [ ] Para CADA página, verificar:
  - Light mode: se ve bien
  - Dark mode: se ve bien
  - Toggle funciona
  - No hay elementos ilegibles
- [ ] Tomar screenshots de ambos modos

**Archivos:**
- Ninguno (testing visual)

---

#### US-6.2: Testing de persistencia y detección del sistema
**Como** QA
**Quiero** verificar que el tema se guarda y detecta correctamente
**Para** asegurar buena UX

**Criterios de aceptación:**
- [ ] **Test 1: Persistencia**
  - Cambiar a dark mode
  - Recargar página
  - Verificar que permanece en dark mode
- [ ] **Test 2: Detección del sistema**
  - Borrar localStorage
  - Cambiar preferencia del sistema a dark
  - Recargar página
  - Verificar que aplica dark mode
- [ ] **Test 3: Opción 'system'**
  - Elegir "System" en dropdown
  - Cambiar preferencia del sistema
  - Verificar que UI cambia automáticamente
- [ ] **Test 4: Sin FOUT**
  - Activar dark mode
  - Recargar (hard refresh)
  - Verificar que NO hay flash de light mode

**Archivos:**
- Ninguno (testing funcional)

---

#### US-6.3: Validación de contraste en dark mode
**Como** desarrollador de accesibilidad
**Quiero** verificar contrastes en dark mode
**Para** cumplir WCAG AA

**Criterios de aceptación:**
- [ ] Verificar contraste `--foreground` sobre `--background` en dark:
  - Mínimo 4.5:1 para texto normal
  - Mínimo 3:1 para texto grande
- [ ] Verificar contraste en botones primary, secondary
- [ ] Verificar contraste en estados (hover, active, disabled)
- [ ] Usar herramientas automáticas (axe DevTools en dark mode)
- [ ] Corregir cualquier problema encontrado

**Archivos:**
- `app/frontend/styles/tokens.css` (modificar si hay problemas)

**Ejemplo de validación:**
```
Dark Mode:
Background: #0F172A
Foreground: #F1F5F9
Ratio: ~14:1 ✅ (excelente)
```

---

### Epic 7: Documentación y Refinamiento

#### US-7.1: Documentar sistema de temas en código
**Como** desarrollador futuro
**Quiero** comentarios claros en el código
**Para** entender cómo funciona el sistema de temas

**Criterios de aceptación:**
- [ ] Agregar comentarios en `useTheme.ts` explicando:
  - Orden de prioridad (localStorage > sistema > default)
  - Por qué usamos clase en `<html>`
  - Cómo funciona la sincronización con sistema
- [ ] Comentar script anti-FOUT en layout
- [ ] Comentar variables CSS en tokens.css

**Archivos:**
- `app/frontend/hooks/useTheme.ts` (agregar comentarios)
- `app/views/layouts/application.html.erb` (agregar comentarios)
- `app/frontend/styles/tokens.css` (agregar comentarios)

---

#### US-7.2: Actualizar UserManual con información de dark mode
**Como** usuario final
**Quiero** saber cómo usar el modo oscuro
**Para** personalizar mi experiencia

**Criterios de aceptación:**
- [ ] Crear o actualizar archivo en UserManual (ej: `themes.md`)
- [ ] Explicar cómo cambiar entre modos
- [ ] Explicar opción "System"
- [ ] Incluir screenshots del toggle
- [ ] Mencionar en `UserManual/Index.md`

**Archivos:**
- `UserManual/themes.md` (nuevo)
- `UserManual/Index.md` (modificar)

---

#### US-7.3: Documentar paleta dark mode en color-palette-configuration.md
**Como** desarrollador/diseñador
**Quiero** ver la paleta completa de dark mode
**Para** mantener consistencia en futuros cambios

**Criterios de aceptación:**
- [ ] Abrir `UserManual/color-palette-configuration.md`
- [ ] Agregar sección "Dark Mode"
- [ ] Tabla con todas las variables dark
- [ ] Código CSS completo de tokens.css (dark section)
- [ ] Recomendaciones de contraste

**Archivos:**
- `UserManual/color-palette-configuration.md` (modificar)

---

### Epic 8: Features Opcionales (Nice to Have)

#### US-8.1: Transición suave al cambiar tema
**Como** usuario
**Quiero** una transición suave al cambiar de tema
**Para** que el cambio no sea abrupto

**Criterios de aceptación:**
- [ ] Agregar transición CSS a elementos principales
- [ ] Usar `transition: background-color 0.3s, color 0.3s`
- [ ] Aplicar en body, cards, buttons
- [ ] Verificar que no afecta performance

**Archivos:**
- `app/frontend/styles/tokens.css` (agregar CSS)

**CSS:**
```css
@theme {
  /* ... variables ... */
}

/* Smooth theme transitions */
body,
.card,
.button {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

---

#### US-8.2: Guardar preferencia en backend (futuro)
**Como** usuario registrado
**Quiero** que mi preferencia de tema se sincronice entre dispositivos
**Para** tener experiencia consistente

**Criterios de aceptación:**
- [ ] Agregar campo `theme_preference` a modelo User/Owner
- [ ] Al cambiar tema, enviar request a backend
- [ ] Al login, cargar preferencia desde backend
- [ ] Prioridad: backend > localStorage > sistema

**Archivos:**
- `db/migrate/xxx_add_theme_preference_to_users.rb` (nuevo)
- `app/models/user.rb` (modificar)
- `app/frontend/hooks/useTheme.ts` (modificar)

**Nota:** Este US es opcional y puede implementarse en el futuro.

---

## Orden de Implementación

### Fase 1: CSS y Variables (Epic 1)
1. US-1.1: Definir paleta dark
2. US-1.2: Duplicar variables en tokens.css
3. US-1.3: Configurar Tailwind

### Fase 2: Lógica de Tema (Epic 2)
4. US-2.1: Crear hook useTheme
5. US-2.2: Escuchar cambios del sistema

### Fase 3: UI del Toggle (Epic 3)
6. US-3.1: Crear ThemeToggle básico
7. US-3.2: Mejorar con opción 'system'

### Fase 4: Integración (Epic 4)
8. US-4.1: Agregar a Navbar público
9. US-4.2: Agregar a AdminHeader
10. US-4.3: Prevenir FOUT

### Fase 5: Ajustes (Epic 5)
11. US-5.1: Revisar componentes shadcn/ui
12. US-5.2: Ajustar componentes custom
13. US-5.3: Ajustar imágenes/logos

### Fase 6: Testing (Epic 6)
14. US-6.1: Testing visual completo
15. US-6.2: Testing de persistencia
16. US-6.3: Validación de contraste

### Fase 7: Documentación (Epic 7)
17. US-7.1: Comentarios en código
18. US-7.2: UserManual
19. US-7.3: Documentar paleta

### Fase 8: Opcional (Epic 8)
20. US-8.1: Transiciones suaves
21. US-8.2: Sincronización backend (futuro)

---

## Archivos Afectados

### Nuevos (3 archivos)
```
app/frontend/hooks/useTheme.ts
app/frontend/components/ThemeToggle.tsx
UserManual/themes.md
```

### Modificados (5-10 archivos)
```
app/frontend/styles/tokens.css                    # Variables dark mode
app/views/layouts/application.html.erb            # Script anti-FOUT
app/frontend/components/landing/Navbar.tsx        # Agregar ThemeToggle
app/frontend/components/admin/AdminHeader.tsx     # Agregar ThemeToggle (si existe)
UserManual/Index.md                               # Link a themes.md
UserManual/color-palette-configuration.md         # Documentar dark mode
app/frontend/components/ui/*.tsx                  # Ajustes (si necesario)
```

---

## Paleta Completa Light vs Dark

### Light Mode (después de Plan 014)
```css
@theme {
  --background: #FAF8F3;      /* Crema cálido */
  --foreground: #1F2937;      /* Gray 800 */
  --card: #FFFFFF;            /* Blanco */
  --card-foreground: #1F2937;
  --muted: #F0EDE6;           /* Crema oscuro */
  --muted-foreground: #6B7280; /* Gray 500 */
  --border: #E5E7EB;          /* Gray 200 */
  --input: #E5E7EB;
  --primary: #3B82F6;         /* Blue 500 */
  --primary-foreground: #FFFFFF;
  /* ... más variables ... */
}
```

### Dark Mode
```css
.dark {
  --background: #0F172A;      /* Slate 900 */
  --foreground: #F1F5F9;      /* Slate 100 */
  --card: #1E293B;            /* Slate 800 */
  --card-foreground: #F1F5F9;
  --muted: #334155;           /* Slate 700 */
  --muted-foreground: #94A3B8; /* Slate 400 */
  --border: #334155;
  --input: #334155;
  --primary: #3B82F6;         /* Blue 500 (mantener) */
  --primary-foreground: #FFFFFF;
  --secondary: #475569;       /* Slate 600 */
  --secondary-foreground: #F1F5F9;
  --accent: #334155;
  --accent-foreground: #F1F5F9;
  --destructive: #EF4444;     /* Red 500 */
  --destructive-foreground: #FFFFFF;
  /* ... más variables ... */
}
```

---

## Testing

### Checklist de Testing Visual (Dark Mode)

**Componentes UI:**
- [ ] Buttons (all variants) en dark
- [ ] Cards en dark
- [ ] Dialogs/Modals en dark
- [ ] Forms (Input, Select, Textarea) en dark
- [ ] Tables en dark
- [ ] Dropdowns en dark
- [ ] Alerts/Badges en dark

**Páginas:**
- [ ] Landing page en dark
- [ ] Auth pages en dark
- [ ] Dashboard en dark
- [ ] Admin pages en dark
- [ ] My Pets en dark

**Funcionalidad:**
- [ ] Toggle funciona en todas las páginas
- [ ] Preferencia persiste después de reload
- [ ] Opción "System" respeta cambios del sistema
- [ ] No hay FOUT al recargar en dark
- [ ] Transiciones suaves (si se implementaron)

---

## Criterios de Éxito

- [ ] Variables CSS duplicadas para dark mode en tokens.css
- [ ] Hook useTheme funciona correctamente
- [ ] ThemeToggle visible y funcional en Navbar y AdminHeader
- [ ] Preferencia se guarda en localStorage
- [ ] Opción "System" detecta y respeta preferencias del OS
- [ ] No hay flash de contenido no temático (FOUT)
- [ ] Todos los componentes se ven bien en ambos modos
- [ ] Contrastes cumplen WCAG AA en dark mode
- [ ] Documentación actualizada
- [ ] Testing completo realizado

---

## Notas de Implementación

### Por qué usar clase en <html>

Aplicar la clase `dark` en el elemento `<html>` (en lugar de `<body>`) permite:
1. CSS se aplica antes de que React renderice
2. Evita FOUT más efectivamente
3. Tailwind detecta la clase automáticamente
4. Scope global para todos los elementos

### Estrategia de Variables CSS

En lugar de usar `prefers-color-scheme` directamente en CSS, usamos clase `.dark` porque:
1. Permite override manual del usuario
2. Facilita persistencia en localStorage
3. Da control programático desde JavaScript
4. Permite opción "System" como preferencia elegible

### Performance

- localStorage es síncrono y rápido
- Script anti-FOUT es inline para ejecución inmediata
- No afecta bundle size (solo ~2KB)
- Transiciones CSS son performantes (GPU-accelerated)

---

## Dependencias con Otros Planes

**Plan 014 (Fondo Crema):**
- ✅ Recomendado completar ANTES de Plan 015
- El fondo crema será el light mode base
- Dark mode usará su propia paleta oscura

**Plan 012 (Admin Layout):**
- ⚠️ Opcional: Si existe AdminHeader, agregar ThemeToggle ahí
- Si no existe, agregar en cada página admin

**Plan 010, 013:**
- ❌ Sin dependencia
- Dark mode es cosmético, no afecta funcionalidad

---

## Rollback Plan

Si el dark mode causa problemas:

1. **Reversar commit:**
   ```bash
   git revert <commit-hash>
   ```

2. **O deshabilitar temporalmente:**
   - Comentar sección `.dark` en tokens.css
   - Ocultar ThemeToggle component
   - Usuarios en dark mode volverán a light

3. **Depuración:**
   - Verificar console del navegador
   - Verificar localStorage (key: 'theme')
   - Verificar clase 'dark' en `<html>`
   - Verificar variables CSS con DevTools
