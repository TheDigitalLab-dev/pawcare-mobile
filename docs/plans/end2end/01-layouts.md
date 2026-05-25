# 01 - Layouts y Navegación

## 🎯 Objetivo

Verificar que los layouts principales de la aplicación (AdminLayout, AdminSidebar, AdminHeader) funcionan correctamente en:
- ✅ Diferentes tamaños de pantalla (mobile, tablet, desktop)
- ✅ Modo claro y oscuro
- ✅ Navegación entre secciones
- ✅ Estados hover, active, focus
- ✅ Responsive design (sidebar colapsable en mobile)

---

## 📍 URLs a Probar

Todas las páginas admin usan `AdminLayout` y deben probarse:

| URL | Página | Componente |
|-----|--------|------------|
| `/admin/pets` | Gestión de Mascotas | PetsIndex.tsx |
| `/admin/adoptions` | Gestión de Adopciones | AdoptionsIndex.tsx |
| `/admin/sponsorships` | Gestión de Apadrinamientos | SponsorshipsIndex.tsx |
| `/admin/user-manual` | Manual de Usuario | UserManualIndex.tsx |

---

## 🧩 Componentes a Verificar

### AdminLayout (`app/frontend/pages/admin/components/AdminLayout.tsx`)
- Estructura: Sidebar + (Header + Main Content)
- Props: `user: AuthUser`, `children: React.ReactNode`
- Estado: `sidebarCollapsed` para mobile

### AdminSidebar (`app/frontend/pages/admin/components/AdminSidebar.tsx`)
- Navegación con items:
  - 🏠 Dashboard (pendiente implementar)
  - 🐾 Mascotas (`/admin/pets`)
  - ❤️ Adopciones (`/admin/adoptions`)
  - 💝 Apadrinamientos (`/admin/sponsorships`)
  - 📚 Manual de Usuario (`/admin/user-manual`)
- Indicador de página activa: `bg-primary/10` + `border-l-4`
- Logo/título en la parte superior

### AdminHeader (`app/frontend/pages/admin/components/AdminHeader.tsx`)
- Avatar con iniciales del usuario
- Dropdown con:
  - Ver perfil
  - Configuración
  - Cerrar sesión
- Botón hamburguesa para toggle sidebar (mobile)

---

## ✅ Checklist de Pruebas

### Desktop (>= 1024px)
- [ ] Sidebar visible y fijo en el lado izquierdo
- [ ] Header en la parte superior con user menu
- [ ] Navegación funciona correctamente
- [ ] Item activo se muestra con bg-primary/10 y border-l-4
- [ ] Hover en items cambia el background
- [ ] Logo es clickeable (debería ir a dashboard cuando se implemente)
- [ ] User dropdown funciona (Ver perfil, Configuración, Cerrar sesión)
- [ ] Contenido principal se muestra correctamente

### Tablet (768px - 1023px)
- [ ] Sidebar colapsado (solo iconos) o visible completo
- [ ] Header completo y funcional
- [ ] Navegación funciona
- [ ] Contenido se adapta al espacio disponible

### Mobile (< 768px)
- [ ] Sidebar oculto por defecto
- [ ] Botón hamburguesa visible en header
- [ ] Click en hamburguesa abre sidebar como drawer/overlay
- [ ] Sidebar overlay cubre contenido principal
- [ ] Click fuera del sidebar lo cierra
- [ ] Navegación funciona desde sidebar mobile
- [ ] User menu funcional en mobile

### Dark Mode
- [ ] Sidebar tiene colores apropiados (bg-card, border-border)
- [ ] Header tiene colores apropiados
- [ ] Item activo se ve claramente en dark mode
- [ ] Hover states funcionan en dark mode
- [ ] User dropdown legible en dark mode
- [ ] No hay texto invisible (blanco sobre blanco, etc.)

### Navegación
- [ ] Click en "Mascotas" navega a `/admin/pets`
- [ ] Click en "Adopciones" navega a `/admin/adoptions`
- [ ] Click en "Apadrinamientos" navega a `/admin/sponsorships`
- [ ] Click en "Manual de Usuario" navega a `/admin/user-manual`
- [ ] Item activo se actualiza correctamente al navegar
- [ ] URL cambia correctamente (Inertia.js)

---

## 🔍 Casos de Prueba Detallados

### Caso 1: Verificar AdminLayout en Desktop Light Mode

**Precondiciones:**
- Usuario autenticado como admin
- Navegador en modo claro (light mode)
- Ventana de 1440px de ancho

**Pasos:**
1. Navegar a `http://localhost:3000/admin/pets`
2. Tomar snapshot de accesibilidad
3. Tomar screenshot de página completa
4. Verificar que sidebar está visible a la izquierda
5. Verificar que header está en la parte superior
6. Verificar que "Mascotas" está marcado como activo (bg-primary/10 + border-l-4)
7. Hover sobre "Adopciones" y verificar cambio de color
8. Click en avatar de usuario y verificar dropdown

**Resultado esperado:**
- Layout completo visible: Sidebar (izquierda) + Header (arriba) + Content (centro)
- Item "Mascotas" resaltado con fondo primary y borde izquierdo
- Dropdown de usuario con 3 opciones: Ver perfil, Configuración, Cerrar sesión
- Colores apropiados para light mode

**Screenshots:**
- `01-admin-layout-desktop-light.png`
- `01-admin-layout-desktop-light-dropdown.png`

---

### Caso 2: Verificar AdminLayout en Desktop Dark Mode

**Precondiciones:**
- Usuario autenticado como admin
- Navegador en modo oscuro (dark mode)
- Ventana de 1440px de ancho

**Pasos:**
1. Activar dark mode en DevTools (Rendering > Emulate CSS media feature prefers-color-scheme: dark)
2. Navegar a `http://localhost:3000/admin/adoptions`
3. Tomar screenshot de página completa
4. Verificar contraste de colores
5. Verificar que todos los textos son legibles
6. Hover sobre items del sidebar
7. Abrir dropdown de usuario

**Resultado esperado:**
- Sidebar con bg-card oscuro
- Header con bg-card oscuro
- Item "Adopciones" resaltado claramente
- Texto legible en todo el layout
- No hay elementos "invisibles" (blanco sobre blanco, etc.)

**Screenshots:**
- `02-admin-layout-desktop-dark.png`
- `02-admin-layout-desktop-dark-dropdown.png`

---

### Caso 3: Verificar Responsive en Tablet (768px)

**Precondiciones:**
- Usuario autenticado como admin
- Ventana redimensionada a 768px de ancho

**Pasos:**
1. Redimensionar navegador a 768px × 1024px
2. Navegar a `http://localhost:3000/admin/sponsorships`
3. Verificar comportamiento del sidebar (¿colapsado? ¿visible?)
4. Verificar header completo
5. Navegar entre secciones

**Resultado esperado:**
- Layout se adapta a tablet
- Sidebar puede estar colapsado (solo iconos) o visible completo
- Header funcional
- Navegación funciona correctamente

**Screenshots:**
- `03-admin-layout-tablet.png`

---

### Caso 4: Verificar Responsive en Mobile (375px)

**Precondiciones:**
- Usuario autenticado como admin
- Ventana redimensionada a 375px de ancho

**Pasos:**
1. Redimensionar navegador a 375px × 667px
2. Navegar a `http://localhost:3000/admin/user-manual`
3. Verificar que sidebar está oculto por defecto
4. Verificar que botón hamburguesa es visible en header
5. Click en botón hamburguesa
6. Verificar que sidebar se abre como overlay/drawer
7. Verificar que sidebar cubre el contenido principal
8. Click fuera del sidebar (en overlay)
9. Verificar que sidebar se cierra
10. Abrir sidebar nuevamente y navegar a otra sección

**Resultado esperado:**
- Sidebar oculto inicialmente
- Botón hamburguesa visible y funcional
- Sidebar se abre como drawer sobre contenido
- Overlay semitransparente visible
- Click fuera del sidebar lo cierra
- Navegación desde sidebar funciona
- Al navegar, sidebar se cierra automáticamente (deseable)

**Screenshots:**
- `04-admin-layout-mobile-closed.png`
- `04-admin-layout-mobile-open.png`
- `04-admin-layout-mobile-overlay.png`

---

### Caso 5: Verificar Navegación entre Secciones

**Precondiciones:**
- Usuario autenticado como admin
- Ventana de 1440px de ancho

**Pasos:**
1. Navegar a `http://localhost:3000/admin/pets`
2. Verificar que "Mascotas" está activo
3. Click en "Adopciones" en sidebar
4. Verificar que URL cambia a `/admin/adoptions`
5. Verificar que "Adopciones" ahora está activo
6. Verificar que "Mascotas" ya no está activo
7. Navegar a cada sección y verificar estado activo

**Resultado esperado:**
- Navegación funciona sin recargar página (Inertia.js)
- Item activo se actualiza correctamente
- Solo un item activo a la vez
- URL refleja la sección actual
- Contenido principal cambia según la sección

**Screenshots:**
- `05-navigation-pets.png`
- `05-navigation-adoptions.png`
- `05-navigation-sponsorships.png`
- `05-navigation-user-manual.png`

---

### Caso 6: Verificar User Dropdown

**Precondiciones:**
- Usuario autenticado como admin con datos:
  - first_name: "Admin"
  - last_name: "User"
  - email: "admin@example.com"

**Pasos:**
1. Navegar a cualquier página admin
2. Verificar avatar con iniciales "AU" en header
3. Click en avatar
4. Verificar dropdown con opciones:
   - Ver perfil
   - Configuración
   - Cerrar sesión
5. Hover sobre cada opción
6. Click fuera del dropdown para cerrarlo

**Resultado esperado:**
- Avatar muestra iniciales correctas
- Dropdown se abre al hacer click
- 3 opciones visibles
- Hover cambia el background de cada opción
- Click fuera cierra el dropdown

**Screenshots:**
- `06-user-dropdown-open.png`
- `06-user-dropdown-hover.png`

---

## 🐛 Issues Encontrados

### Issue 1: [Ejemplo - Remover al empezar pruebas reales]
- **Descripción**: Sidebar no se cierra en mobile al navegar
- **Pasos para reproducir**: Abrir sidebar en mobile, navegar a otra sección
- **Comportamiento esperado**: Sidebar debería cerrarse automáticamente
- **Comportamiento actual**: Sidebar permanece abierto
- **Prioridad**: Media
- **Screenshot**: `issue-01-sidebar-mobile.png`

---

## 📝 Notas Técnicas

### Archivos Relacionados

```
app/frontend/pages/admin/
├── components/
│   ├── AdminLayout.tsx       # Layout wrapper
│   ├── AdminSidebar.tsx      # Sidebar con navegación
│   └── AdminHeader.tsx       # Header con user menu
├── pets/PetsIndex.tsx        # Usa AdminLayout
├── adoptions/AdoptionsIndex.tsx
├── sponsorships/SponsorshipsIndex.tsx
└── user-manual/UserManualIndex.tsx
```

### Props Esperadas

```typescript
// AdminLayout.tsx
interface AdminLayoutProps {
  user: AuthUser
  children: React.ReactNode
}

// AdminSidebar.tsx (interno)
interface AdminSidebarProps {
  currentPath: string
  collapsed: boolean
  onClose?: () => void  // Para mobile
}

// AdminHeader.tsx (interno)
interface AdminHeaderProps {
  user: AuthUser
  onMenuToggle: () => void  // Toggle sidebar en mobile
}
```

### Breakpoints Tailwind

```css
/* Default (mobile) */
< 640px

/* sm: */
>= 640px

/* md: (tablet) */
>= 768px

/* lg: (desktop) */
>= 1024px

/* xl: */
>= 1280px

/* 2xl: */
>= 1536px
```

---

## 🔄 Estado de Pruebas

| Caso de Prueba | Estado | Tester | Fecha |
|----------------|--------|--------|-------|
| Caso 1: Desktop Light Mode | ⏳ Pendiente | - | - |
| Caso 2: Desktop Dark Mode | ⏳ Pendiente | - | - |
| Caso 3: Tablet Responsive | ⏳ Pendiente | - | - |
| Caso 4: Mobile Responsive | ⏳ Pendiente | - | - |
| Caso 5: Navegación | ⏳ Pendiente | - | - |
| Caso 6: User Dropdown | ⏳ Pendiente | - | - |

---

## ✅ Criterios de Aceptación

Para marcar esta sección como completa:

- [ ] Todos los casos de prueba ejecutados en light mode
- [ ] Todos los casos de prueba ejecutados en dark mode
- [ ] Screenshots capturados para cada caso
- [ ] Issues documentados en sección 🐛
- [ ] Issues críticos resueltos
- [ ] Código pasa revisión de accesibilidad (snapshots)
- [ ] Layout funciona en 375px, 768px, 1024px, 1440px

---

**Última actualización**: 2026-01-11
**Próxima revisión**: Después de implementar correcciones
