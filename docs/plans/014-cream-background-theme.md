<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2026-01-11
Archivos modificados: app/frontend/styles/tokens.css
Cambios:
  - --background: 0 0% 98% → 43 44% 97% (#FAF8F3 crema cálido)
  - --muted: 174 20% 96% → 42 25% 92% (#F0EDE6 contraste sutil)
  - --sidebar-background: 0 0% 98% → 43 44% 97% (consistencia)
-->

# Plan: Cambiar Fondo Blanco a Color Crema

## Descripción General

Mejorar la experiencia visual de la aplicación cambiando el fondo blanco brillante (#FFFFFF) por un tono crema más suave y menos agresivo para la vista. Este cambio afecta el color de fondo principal (`--background`) y ajusta los contrastes necesarios para mantener la accesibilidad.

**Problema actual:**
- Fondo blanco puro (#FFFFFF) es muy brillante y puede causar fatiga visual
- Especialmente problemático en sesiones largas de uso
- Contraste muy alto que puede ser incómodo

**Solución:**
- Usar un tono crema cálido (#FAF8F3 o similar)
- Mantener la legibilidad y accesibilidad (WCAG AA)
- Ajustar colores relacionados para armonía visual

---

## Stack Tecnológico

### Dependencias Existentes
- Tailwind CSS v4 con @theme en tokens.css
- CSS custom properties
- Sistema de design tokens ya establecido

**No se requieren nuevas dependencias.**

---

## Epics y User Stories

### Epic 1: Investigación y Definición de Paleta

#### US-1.1: Seleccionar color crema óptimo
**Como** diseñador UX
**Quiero** seleccionar un tono crema que sea cómodo para la vista
**Para** reducir la fatiga visual sin comprometer la legibilidad

**Criterios de aceptación:**
- [ ] Probar al menos 3 tonos de crema diferentes:
  - Opción 1: `#FAF8F3` (crema cálido)
  - Opción 2: `#F5F3EE` (crema neutral)
  - Opción 3: `#FBF9F4` (crema muy claro)
- [ ] Verificar contraste con texto oscuro (ratio mínimo 4.5:1 para WCAG AA)
- [ ] Verificar en diferentes pantallas (laptop, monitor, móvil)
- [ ] Verificar con diferentes niveles de brillo
- [ ] Seleccionar el tono final

**Archivos:**
- Ninguno (investigación visual)

**Herramientas de validación:**
- https://webaim.org/resources/contrastchecker/
- https://coolors.co/contrast-checker

---

#### US-1.2: Documentar paleta de colores actualizada
**Como** desarrollador
**Quiero** documentar los cambios en la paleta
**Para** mantener consistencia en el proyecto

**Criterios de aceptación:**
- [ ] Crear tabla comparativa antes/después:
  - `--background`: `#FFFFFF` → `#FAF8F3` (o el seleccionado)
  - `--card`: `#FFFFFF` → `#FFFFFF` (cards permanecen blancos para contraste)
  - `--muted`: ajustar si es necesario
- [ ] Documentar en comentarios de tokens.css
- [ ] Agregar nota en `.docs/application-overview.md` sobre el cambio

**Archivos:**
- `.docs/application-overview.md` (modificar - agregar nota de diseño)
- `app/frontend/styles/tokens.css` (agregar comentarios)

---

### Epic 2: Implementación de Cambios

#### US-2.1: Actualizar variable --background en tokens.css
**Como** desarrollador
**Quiero** cambiar el color de fondo principal
**Para** aplicar el nuevo tono crema

**Criterios de aceptación:**
- [ ] Abrir `app/frontend/styles/tokens.css`
- [ ] Localizar `--background` en el bloque `@theme`
- [ ] Cambiar de `#FFFFFF` a `#FAF8F3` (o el tono seleccionado)
- [ ] Verificar que no hay otros lugares donde se defina background
- [ ] Ejecutar `npm run dev` y verificar cambios en tiempo real

**Archivos:**
- `app/frontend/styles/tokens.css` (modificar)

**Antes:**
```css
@theme {
  --background: #FFFFFF;
  /* ... */
}
```

**Después:**
```css
@theme {
  /* Color de fondo principal - Crema suave para reducir fatiga visual */
  --background: #FAF8F3;
  /* Cards permanecen blancos para contraste y jerarquía visual */
  --card: #FFFFFF;
  /* ... */
}
```

---

#### US-2.2: Ajustar --muted y --accent si es necesario
**Como** diseñador UX
**Quiero** ajustar colores secundarios
**Para** mantener armonía visual con el nuevo fondo

**Criterios de aceptación:**
- [ ] Revisar `--muted` (color de fondo para áreas secundarias)
- [ ] Si `--muted` era muy similar a `--background`, ajustarlo ligeramente más oscuro
- [ ] Ejemplo: `--muted: #F0EDE6` (un poco más oscuro que el nuevo background)
- [ ] Revisar `--accent` si usa el background como base
- [ ] Verificar visualmente en componentes como Sidebar, Footer, Cards secundarios

**Archivos:**
- `app/frontend/styles/tokens.css` (modificar)

**Ajuste sugerido:**
```css
@theme {
  --background: #FAF8F3;
  --muted: #F0EDE6;      /* Ligeramente más oscuro para contraste sutil */
  --muted-foreground: #6B7280;
  /* ... */
}
```

---

#### US-2.3: Verificar contraste de textos
**Como** desarrollador de accesibilidad
**Quiero** verificar que todos los textos mantengan contraste adecuado
**Para** cumplir con estándares WCAG AA

**Criterios de aceptación:**
- [ ] Verificar contraste `--foreground` (texto principal) sobre `--background`:
  - Ratio mínimo: 4.5:1 para texto normal
  - Ratio mínimo: 3:1 para texto grande (18px+)
- [ ] Verificar `--muted-foreground` sobre `--muted`
- [ ] Verificar textos en botones, links, badges
- [ ] Si algún contraste falla, ajustar el color del texto (oscurecer ligeramente)
- [ ] Usar herramienta de contraste para validar

**Archivos:**
- `app/frontend/styles/tokens.css` (modificar si es necesario)

**Validación:**
```
Background: #FAF8F3
Foreground: #1F2937 (texto oscuro)
Ratio esperado: ~14:1 ✅ (excelente)
```

---

### Epic 3: Testing y Validación

#### US-3.1: Testing visual en todas las páginas
**Como** QA
**Quiero** revisar todas las páginas de la aplicación
**Para** asegurar que el cambio se ve bien en todos los contextos

**Criterios de aceptación:**
- [ ] Revisar páginas públicas:
  - Landing page (Hero, Features, Footer)
  - About, Services, Contact
  - Terms, Privacy
- [ ] Revisar páginas autenticadas:
  - Dashboard
  - My Pets
  - Admin Pets, Adoptions, Sponsorships
- [ ] Revisar componentes UI:
  - Cards, Dialogs, Dropdowns
  - Inputs, Buttons
  - Tables, Lists
- [ ] Verificar que cards blancos contrastan bien con el fondo crema
- [ ] Tomar screenshots antes/después para comparación

**Archivos:**
- Ninguno (testing visual)

---

#### US-3.2: Testing en diferentes dispositivos
**Como** QA
**Quiero** probar en diferentes dispositivos y resoluciones
**Para** asegurar que el color se ve bien en todas las pantallas

**Criterios de aceptación:**
- [ ] Probar en desktop (1920x1080)
- [ ] Probar en laptop (1366x768)
- [ ] Probar en tablet (768px width)
- [ ] Probar en móvil (375px width)
- [ ] Probar con diferentes niveles de brillo (50%, 75%, 100%)
- [ ] Verificar en modo claro de navegador

**Archivos:**
- Ninguno (testing visual)

---

#### US-3.3: Validación de accesibilidad automatizada
**Como** desarrollador
**Quiero** ejecutar herramientas de accesibilidad
**Para** detectar problemas de contraste automáticamente

**Criterios de aceptación:**
- [ ] Instalar extensión de navegador (ej: axe DevTools, WAVE)
- [ ] Ejecutar escaneo en 5 páginas principales:
  - Landing page
  - Dashboard
  - Admin Pets
  - My Pets
  - Auth page
- [ ] Verificar que no hay errores de contraste
- [ ] Corregir cualquier warning encontrado
- [ ] Documentar resultados

**Archivos:**
- Ninguno (validación con herramientas)

---

### Epic 4: Ajustes Finos y Pulido

#### US-4.1: Ajustar gradientes si existen
**Como** diseñador
**Quiero** actualizar gradientes que usan background
**Para** mantener coherencia visual

**Criterios de aceptación:**
- [ ] Buscar gradientes en el código: `grep -r "bg-gradient" app/frontend/`
- [ ] Buscar gradientes en tokens.css
- [ ] Si existen gradientes que van de `background` a otro color, ajustarlos
- [ ] Ejemplo en Hero: `from-primary/5 via-background to-secondary/5`
- [ ] Verificar que gradientes se ven suaves y naturales

**Archivos:**
- `app/frontend/components/landing/Hero.tsx` (potencialmente)
- `app/frontend/styles/tokens.css` (si hay gradientes definidos)

**Búsqueda:**
```bash
grep -r "bg-gradient\|gradient-to\|from-background\|via-background\|to-background" app/frontend/
```

---

#### US-4.2: Revisar sombras (shadows)
**Como** diseñador
**Quiero** verificar que las sombras se ven bien con el nuevo fondo
**Para** mantener la profundidad visual adecuada

**Criterios de aceptación:**
- [ ] Revisar componentes con shadow: Cards, Dialogs, Dropdowns
- [ ] Verificar que sombras no se ven demasiado fuertes o débiles
- [ ] Ajustar opacidad de sombras si es necesario en tokens.css
- [ ] Sombras típicas: `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`
- [ ] Si necesario, ajustar `--shadow` en tokens.css

**Archivos:**
- `app/frontend/styles/tokens.css` (modificar si es necesario)

**Ejemplo de ajuste:**
```css
/* Si las sombras se ven muy fuertes */
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08);
/* Reducir opacidad de 0.1 a 0.08 */
```

---

#### US-4.3: Actualizar screenshots/mockups si existen
**Como** documentador
**Quiero** actualizar capturas de pantalla en la documentación
**Para** reflejar el nuevo diseño

**Criterios de aceptación:**
- [ ] Revisar si hay screenshots en:
  - README.md
  - UserManual/*.md
  - .docs/*.md
- [ ] Tomar nuevos screenshots de:
  - Landing page
  - Dashboard
  - Admin panel
- [ ] Reemplazar screenshots antiguos
- [ ] Actualizar referencias si las URLs cambiaron

**Archivos:**
- `README.md` (potencialmente)
- `UserManual/*.md` (potencialmente)

---

### Epic 5: Documentación y Comunicación

#### US-5.1: Actualizar guía de colores en UserManual
**Como** documentador
**Quiero** actualizar la guía de configuración de colores
**Para** reflejar el cambio de diseño

**Criterios de aceptación:**
- [ ] Abrir `UserManual/color-palette-configuration.md`
- [ ] Actualizar valor de `--background` en los ejemplos
- [ ] Agregar nota explicando el cambio de blanco a crema
- [ ] Agregar recomendaciones de contraste
- [ ] Incluir tabla de colores actualizada

**Archivos:**
- `UserManual/color-palette-configuration.md` (modificar)

---

#### US-5.2: Crear commit descriptivo
**Como** desarrollador
**Quiero** crear un commit claro sobre el cambio
**Para** mantener historial de git comprensible

**Criterios de aceptación:**
- [ ] Commit message siguiendo conventional commits:
  ```
  style(tokens): change background from white to cream

  Replace bright white (#FFFFFF) with warm cream (#FAF8F3) to reduce
  visual fatigue during long usage sessions. Adjusted related tokens
  (muted, shadows) to maintain visual harmony and accessibility.

  WCAG AA compliance verified for all text contrasts.
  ```
- [ ] Incluir todos los archivos modificados
- [ ] NO incluir cambios no relacionados

**Archivos:**
- Todos los modificados en este plan

---

## Orden de Implementación

### Fase 1: Investigación (Epic 1)
1. US-1.1: Seleccionar color crema
2. US-1.2: Documentar paleta

### Fase 2: Implementación (Epic 2)
3. US-2.1: Actualizar --background
4. US-2.2: Ajustar --muted y --accent
5. US-2.3: Verificar contraste de textos

### Fase 3: Validación (Epic 3)
6. US-3.1: Testing visual en páginas
7. US-3.2: Testing en dispositivos
8. US-3.3: Validación de accesibilidad

### Fase 4: Ajustes (Epic 4)
9. US-4.1: Ajustar gradientes
10. US-4.2: Revisar sombras
11. US-4.3: Actualizar screenshots

### Fase 5: Documentación (Epic 5)
12. US-5.1: Actualizar UserManual
13. US-5.2: Crear commit

---

## Archivos Afectados

### Modificados (2-4 archivos)
```
app/frontend/styles/tokens.css          # Principal - cambio de colores
UserManual/color-palette-configuration.md  # Documentación actualizada
.docs/application-overview.md           # Nota sobre cambio de diseño (opcional)
app/frontend/components/landing/Hero.tsx   # Solo si tiene gradientes (opcional)
```

### Sin cambios en código lógico
- No se requieren cambios en JavaScript/TypeScript
- No se requieren cambios en Ruby/Rails
- No se requieren cambios en componentes (solo CSS)

---

## Paleta de Colores Propuesta

### Opción Recomendada: Crema Cálido

```css
/* ANTES */
--background: #FFFFFF;
--card: #FFFFFF;
--muted: #F3F4F6;

/* DESPUÉS */
--background: #FAF8F3;     /* Crema cálido base */
--card: #FFFFFF;            /* Cards permanecen blancos para contraste */
--muted: #F0EDE6;          /* Muted ligeramente más oscuro */
```

### Justificación del Color

**#FAF8F3** (Crema Cálido)
- **R:** 250 (98%)
- **G:** 248 (97%)
- **B:** 243 (95%)
- **Calidez:** Tono ligeramente amarillento que da sensación cálida
- **Contraste con blanco:** Suficiente para que cards se distingan
- **Contraste con texto:** Excelente (>14:1 con texto oscuro)
- **Fatiga visual:** Muy reducida comparado con blanco puro

### Alternativas

**#F5F3EE** (Crema Neutral)
- Más neutro, menos amarillo
- Bueno para entornos profesionales

**#FBF9F4** (Crema Muy Claro)
- Casi blanco, cambio más sutil
- Bueno si se quiere un cambio conservador

---

## Testing

### Checklist de Testing Visual

- [ ] **Landing Page**
  - [ ] Hero section
  - [ ] Features cards
  - [ ] Footer
- [ ] **Auth Pages**
  - [ ] Login form
  - [ ] Register form
- [ ] **Dashboard**
  - [ ] Sidebar
  - [ ] Main content area
  - [ ] Cards
- [ ] **Admin Pages**
  - [ ] Pets list
  - [ ] Adoptions
  - [ ] Forms
- [ ] **Components**
  - [ ] Buttons (todos los variants)
  - [ ] Inputs y forms
  - [ ] Dialogs y modals
  - [ ] Dropdowns
  - [ ] Tables

### Herramientas de Testing

1. **Contraste:**
   - WebAIM Contrast Checker
   - Chrome DevTools Contrast Ratio

2. **Accesibilidad:**
   - axe DevTools (extensión Chrome)
   - WAVE (extensión Chrome)
   - Lighthouse (Chrome DevTools)

3. **Visual:**
   - Chrome DevTools responsive mode
   - Real devices (móvil, tablet)

---

## Criterios de Éxito

- [ ] Color de fondo cambiado de blanco a crema en tokens.css
- [ ] Todos los contrastes de texto cumplen WCAG AA (4.5:1 mínimo)
- [ ] Cards blancos contrastan bien con fondo crema
- [ ] No hay problemas de accesibilidad reportados
- [ ] Todas las páginas se ven visualmente correctas
- [ ] Gradientes y sombras ajustados si es necesario
- [ ] Documentación actualizada
- [ ] Commit creado con mensaje descriptivo

---

## Notas de Implementación

### Por qué Crema en vez de Blanco

1. **Fatiga Visual:** El blanco puro (#FFFFFF) refleja 100% de la luz, causando fatiga en sesiones largas
2. **Contraste Natural:** Un tono crema reduce el contraste extremo sin perder legibilidad
3. **Calidez:** Tonos cálidos son más acogedores, apropiado para aplicación de cuidado de mascotas
4. **Jerarquía Visual:** Permite que cards blancos destaquen sobre el fondo

### Consideraciones de Accesibilidad

- El cambio de blanco a crema NO afecta negativamente la accesibilidad
- El contraste con texto oscuro sigue siendo excelente (>14:1)
- Algunos usuarios con sensibilidad a la luz pueden preferir crema
- Compatible con lectores de pantalla (no afecta semántica)

### Impacto en Modo Oscuro (futuro)

- Este cambio NO interfiere con Plan 015 (Dark Mode)
- El modo claro tendrá fondo crema
- El modo oscuro tendrá su propia paleta
- Variables CSS permiten cambiar fácilmente entre modos

---

## Rollback Plan

Si el cambio no es bien recibido:

1. **Reversar commit:**
   ```bash
   git revert <commit-hash>
   ```

2. **O cambiar manualmente:**
   ```css
   --background: #FFFFFF;  /* Volver a blanco */
   --muted: #F3F4F6;       /* Restaurar valor original */
   ```

3. **Probar tono intermedio:**
   ```css
   --background: #FCFBF9;  /* Crema muy sutil */
   ```
