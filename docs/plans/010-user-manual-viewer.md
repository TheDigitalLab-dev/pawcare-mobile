<!--
STATUS: ❌ NO IMPLEMENTADO
Pendiente: Crear página /admin/user-manual con renderizado de markdown
Requiere: react-markdown, remark-gfm, rehype plugins, jspdf para PDF export
-->

# Plan: Visor de Manual de Usuario para Administradores

## Descripción General

Crear un sistema de visualización del UserManual para administradores que permita:
- **Visualización tipo libro**: Renderizado de Markdown con navegación fluida
- **Navegación eficiente**: Sidebar, índice, tabla de contenidos, breadcrumbs
- **Exportación a PDF**: Generación de documentos para distribución offline
- **Búsqueda simple**: Búsqueda en el frontend sin backend adicional
- **Bookmarks locales**: Marcadores guardados en localStorage del navegador

Este sistema convierte los archivos `.md` estáticos en una interfaz de lectura moderna y profesional.

---

## Stack Tecnológico

### Dependencias NPM

```bash
npm install react-markdown remark-gfm rehype-raw rehype-highlight highlight.js
npm install jspdf html2canvas
```

| Librería | Versión | Propósito |
|----------|---------|-----------|
| `react-markdown` | ^9.0.0 | Renderizado base de Markdown |
| `remark-gfm` | ^4.0.0 | GitHub Flavored Markdown (tablas, checkboxes) |
| `rehype-raw` | ^7.0.0 | HTML dentro de Markdown (sanitizado) |
| `rehype-highlight` | ^7.0.0 | Syntax highlighting automático |
| `highlight.js` | ^11.9.0 | Temas de syntax highlighting |
| `jspdf` | ^2.5.1 | Generación de PDF |
| `html2canvas` | ^1.4.1 | Captura de contenido para PDF |

---

## Arquitectura de la Aplicación

### Convención SPA

```
Dominio: /admin/user-manual
  └── Una sola página Inertia
      └── Vistas internas (useState):
          - "index"   → Índice de guías
          - "reader"  → Lector tipo libro
```

### Estructura Visual - Modo Lector

```
┌─────────────────────────────────────────────────────────────────┐
│ Navbar Admin                                    [👤]             │
├──────────────┬─────────────────────────────────┬────────────────┤
│              │  📚 Manual de Usuario           │                │
│  Sidebar     │  ─────────────────────          │  TOC           │
│  Navegación  │                                  │  ────          │
│              │  [🔍 Buscar en esta guía...]    │  • Intro       │
│  🔐 Auth     │                                  │  • Paso 1      │
│  • Login     │  ## Iniciar Sesión              │  • Paso 2      │
│  • Register  │                                  │    - Sub 2.1   │
│              │  Esta guía explica...            │  • Ejemplos    │
│  🐾 Pets     │                                  │                │
│  • My Pets   │  ### Paso 1                     │  [📌 Marcar]   │
│              │  Contenido renderizado...        │                │
│  🏥 Admin    │                                  │  Progreso      │
│  • Pets      │  ```javascript                  │  ████░░ 60%    │
│  • Adoptions │  const code = highlighted        │                │
│              │  ```                             │                │
│  [📄 PDF]    │                                  │  💾 3 marcas   │
│              │  [⬅️ Anterior] [Siguiente ➡️]    │                │
└──────────────┴─────────────────────────────────┴────────────────┘
```

---

## Epic 1: Setup y Fundación

### US-1.1: Instalar y configurar dependencias de Markdown
**Como** desarrollador
**Quiero** instalar las librerías necesarias
**Para** renderizar Markdown y generar PDFs

**Criterios de aceptación:**
- [ ] Instalar `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-highlight`, `highlight.js`
- [ ] Instalar `jspdf`, `html2canvas`
- [ ] Agregar a `package.json`
- [ ] Verificar compatibilidad con React 19.2.0
- [ ] Importar tema de highlight.js (github-dark)

**Archivos:**
- `package.json` (actualizar)

**Comando:**
```bash
npm install react-markdown remark-gfm rehype-raw rehype-highlight highlight.js jspdf html2canvas
```

---

### US-1.2: Crear tipos TypeScript
**Como** desarrollador
**Quiero** tipos bien definidos
**Para** tener type safety

**Criterios de aceptación:**
- [ ] Interface `ManualFile` (filename, title, category, description, icon)
- [ ] Interface `ManualContent` (filename, content, metadata)
- [ ] Interface `TocItem` (id, text, level, children)
- [ ] Interface `ManualSearchResult` (file, matches)
- [ ] Interface `ManualBookmark` (filename, section_id, note, created_at)
- [ ] Type `ManualCategory` (auth, profile, pets, admin, config)

**Archivos:**
- `app/frontend/types/UserManual.ts` (nuevo)

**Código:**
```typescript
// app/frontend/types/UserManual.ts

export type ManualCategory = 'auth' | 'profile' | 'pets' | 'admin' | 'config'

export interface ManualFile {
  filename: string
  title: string
  category: ManualCategory
  description?: string
  icon?: string
}

export interface ManualContent {
  filename: string
  content: string
  metadata: {
    title: string
    last_updated?: string
  }
}

export interface TocItem {
  id: string
  text: string
  level: number
  children?: TocItem[]
}

export interface ManualSearchResult {
  sectionId: string
  sectionTitle: string
  preview: string
  lineNumber: number
}

export interface ManualBookmark {
  filename: string
  section_id: string
  note?: string
  created_at: string
}
```

---

### US-1.3: Implementar cliente API básico
**Como** componente React
**Quiero** un cliente para obtener archivos del manual
**Para** cargar contenido

**Criterios de aceptación:**
- [ ] Método `listFiles()` - obtiene lista de archivos con metadata
- [ ] Método `getContent(filename)` - obtiene contenido raw de un archivo
- [ ] Manejo de errores (404, 500)
- [ ] Tipos TypeScript completos

**Archivos:**
- `app/frontend/api/UserManual.ts` (nuevo)

**Código:**
```typescript
// app/frontend/api/UserManual.ts
import { request } from '@/lib/request'
import type { ManualFile, ManualContent } from '@/types/UserManual'

export class UserManual {
  /**
   * Obtiene la lista de archivos disponibles en el manual
   */
  async listFiles(): Promise<{ files: ManualFile[] }> {
    return request({
      method: 'GET',
      url: '/admin/user-manual-files',
    })
  }

  /**
   * Obtiene el contenido raw de un archivo específico
   * @param filename - Nombre del archivo (ej: "authentication.md")
   */
  async getContent(filename: string): Promise<ManualContent> {
    return request({
      method: 'GET',
      url: '/admin/user-manual-content',
      params: { file: filename },
    })
  }
}

export const userManual = new UserManual()
```

---

## Epic 2: Componentes de Renderizado

### US-2.1: Crear componente MarkdownRenderer
**Como** desarrollador
**Quiero** un componente para renderizar Markdown
**Para** mostrar contenido con formato rico

**Criterios de aceptación:**
- [ ] Soporta GitHub Flavored Markdown (tablas, checkboxes, strikethrough)
- [ ] Syntax highlighting de código con `highlight.js`
- [ ] Custom components para links internos (navegar entre guías)
- [ ] Custom components para tablas responsive
- [ ] IDs automáticos en headers (H1, H2, H3) para TOC
- [ ] Estilos con Tailwind CSS
- [ ] Seguridad: sanitización HTML
- [ ] Callback `onLinkClick` para links .md
- [ ] Callback `onHeadingRender` para construir TOC

**Archivos:**
- `app/frontend/components/MarkdownRenderer.tsx` (nuevo)
- `app/frontend/styles/markdown.css` (nuevo)

**Código:**
```tsx
// app/frontend/components/MarkdownRenderer.tsx
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import '@/styles/markdown.css'

interface MarkdownRendererProps {
  content: string
  onLinkClick?: (href: string) => void
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export const MarkdownRenderer = memo(({
  content,
  onLinkClick,
}: MarkdownRendererProps) => {
  return (
    <div className="markdown-body prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Headers con IDs automáticos para TOC
          h1: ({ children, ...props }) => {
            const text = String(children)
            const id = slugify(text)
            return <h1 id={id} {...props}>{children}</h1>
          },
          h2: ({ children, ...props }) => {
            const text = String(children)
            const id = slugify(text)
            return <h2 id={id} {...props}>{children}</h2>
          },
          h3: ({ children, ...props }) => {
            const text = String(children)
            const id = slugify(text)
            return <h3 id={id} {...props}>{children}</h3>
          },

          // Links: internos (.md) y externos
          a: ({ href, children, ...props }) => {
            if (href?.endsWith('.md')) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault()
                    onLinkClick?.(href)
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                  {...props}
                >
                  {children}
                </a>
              )
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
                {...props}
              >
                {children}
              </a>
            )
          },

          // Tablas responsive
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-300" {...props}>
                {children}
              </table>
            </div>
          ),

          // Código inline y bloques
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return <code className={className} {...props}>{children}</code>
          },

          // Imágenes lazy loading
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className="max-w-full h-auto rounded-lg shadow-md my-4"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

MarkdownRenderer.displayName = 'MarkdownRenderer'
```

**Estilos:**
```css
/* app/frontend/styles/markdown.css */

.markdown-body {
  @apply text-gray-900 dark:text-gray-100;
}

/* Headers */
.markdown-body h1 {
  @apply text-4xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700;
}

.markdown-body h2 {
  @apply text-3xl font-semibold mt-6 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700;
}

.markdown-body h3 {
  @apply text-2xl font-semibold mt-4 mb-2;
}

/* Tablas */
.markdown-body table {
  @apply border-collapse w-full;
}

.markdown-body th {
  @apply bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold border border-gray-300 dark:border-gray-600;
}

.markdown-body td {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600;
}

/* Checkboxes */
.markdown-body input[type="checkbox"] {
  @apply mr-2;
}

/* Listas */
.markdown-body ul {
  @apply list-disc list-inside my-3 space-y-1;
}

.markdown-body ol {
  @apply list-decimal list-inside my-3 space-y-1;
}

/* Blockquotes */
.markdown-body blockquote {
  @apply border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4;
}

/* Code blocks */
.markdown-body pre {
  @apply my-4 rounded-lg overflow-x-auto;
}

/* Horizontal rule */
.markdown-body hr {
  @apply my-6 border-t border-gray-300 dark:border-gray-700;
}
```

---

### US-2.2: Crear hook useMarkdownNavigation
**Como** desarrollador
**Quiero** un hook para extraer TOC y detectar posición
**Para** generar navegación automática

**Criterios de aceptación:**
- [ ] Extrae todos los headers H2 y H3 del contenido
- [ ] Genera IDs únicos para cada header (slug)
- [ ] Retorna estructura jerárquica de TOC
- [ ] Scroll spy: detecta sección actual mientras se scrollea
- [ ] Función `scrollToSection(id)` con smooth scroll
- [ ] Calcula progreso de lectura (0-100%)

**Archivos:**
- `app/frontend/hooks/useMarkdownNavigation.ts` (nuevo)

**Código:**
```typescript
// app/frontend/hooks/useMarkdownNavigation.ts
import { useMemo, useState, useEffect, useCallback } from 'react'
import type { TocItem } from '@/types/UserManual'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

/**
 * Extrae headers (## y ###) del contenido Markdown
 */
function extractHeaders(content: string): TocItem[] {
  const lines = content.split('\n')
  const headers: TocItem[] = []
  const stack: TocItem[] = []

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)

    if (h2Match) {
      const text = h2Match[1].replace(/[📋🔐🐾🏥🎨✅⚠️💡]/g, '').trim()
      const item: TocItem = {
        id: slugify(text),
        text,
        level: 2,
        children: [],
      }
      headers.push(item)
      stack.length = 0
      stack.push(item)
    } else if (h3Match && stack.length > 0) {
      const text = h3Match[1].replace(/[📋🔐🐾🏥🎨✅⚠️💡]/g, '').trim()
      const item: TocItem = {
        id: slugify(text),
        text,
        level: 3,
      }
      stack[stack.length - 1].children = stack[stack.length - 1].children || []
      stack[stack.length - 1].children!.push(item)
    }
  }

  return headers
}

export function useMarkdownNavigation(content: string) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [scrollProgress, setScrollProgress] = useState(0)

  // Generar TOC
  const toc = useMemo(() => extractHeaders(content), [content])

  // Scroll spy: detectar sección actual
  useEffect(() => {
    const handleScroll = () => {
      // Progreso de scroll
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(Math.min(Math.round(progress), 100))

      // Detectar sección activa
      const headings = document.querySelectorAll('h2[id], h3[id]')
      let current = ''

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        // Si el heading está en el viewport superior
        if (rect.top <= 120 && rect.bottom >= 0) {
          current = heading.id
        }
      })

      if (current) {
        setActiveSection(current)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Llamar inmediatamente

    return () => window.removeEventListener('scroll', handleScroll)
  }, [content])

  // Scroll suave a una sección
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Offset para navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }, [])

  return {
    toc,
    activeSection,
    scrollProgress,
    scrollToSection,
  }
}
```

---

## Epic 3: Navegación y Layout

### US-3.1: Crear página principal AdminUserManual
**Como** administrador
**Quiero** una página centralizada para el manual
**Para** acceder a toda la documentación

**Criterios de aceptación:**
- [ ] Página `app/frontend/pages/admin/UserManual.tsx`
- [ ] Vistas internas: `"index"` (índice) y `"reader"` (lector)
- [ ] Estado: `view`, `selectedFile`, `content`, `files`, `loading`
- [ ] Layout de 3 columnas: sidebar navegación + contenido + TOC/herramientas
- [ ] Carga lista de archivos al montar
- [ ] Navegación interna sin cambio de URL
- [ ] Loading states con spinners

**Archivos:**
- `app/frontend/pages/admin/UserManual.tsx` (nuevo)

---

### US-3.2: Crear sidebar de navegación
**Como** usuario
**Quiero** un sidebar con categorías y guías
**Para** navegar fácilmente

**Criterios de aceptación:**
- [ ] Agrupación por categorías con iconos/emojis
- [ ] Highlight de guía actual
- [ ] Botón "Volver al índice"
- [ ] Búsqueda rápida de guías (filtro en frontend)
- [ ] Colapsable en móvil
- [ ] Scroll interno si hay muchas guías

**Archivos:**
- `app/frontend/pages/admin/UserManual/components/ManualSidebar.tsx` (nuevo)

---

### US-3.3: Crear índice visual de guías
**Como** usuario
**Quiero** ver un índice visual de todas las guías
**Para** elegir qué leer

**Criterios de aceptación:**
- [ ] Grid responsive de cards
- [ ] Agrupado por categoría
- [ ] Muestra: título, descripción, emoji
- [ ] Click en card carga la guía
- [ ] Animaciones sutiles (hover)

**Archivos:**
- `app/frontend/pages/admin/UserManual/components/ManualIndex.tsx` (nuevo)

---

### US-3.4: Crear lector con TOC y herramientas
**Como** usuario
**Quiero** leer documentos con tabla de contenidos
**Para** navegar secciones fácilmente

**Criterios de aceptación:**
- [ ] Renderizado de Markdown con MarkdownRenderer
- [ ] TOC en sidebar derecho con scroll spy
- [ ] Breadcrumbs de navegación
- [ ] Toolbar flotante: exportar PDF, búsqueda en página, bookmarks
- [ ] Barra de progreso de lectura (scroll)
- [ ] Botones "Guía anterior" y "Guía siguiente"
- [ ] Scroll suave a secciones

**Archivos:**
- `app/frontend/pages/admin/UserManual/components/ManualReader.tsx` (nuevo)
- `app/frontend/pages/admin/UserManual/components/ManualTableOfContents.tsx` (nuevo)
- `app/frontend/pages/admin/UserManual/components/ReaderToolbar.tsx` (nuevo)

---

### US-3.5: Implementar tabla de contenidos (TOC)
**Como** usuario
**Quiero** una tabla de contenidos
**Para** navegar rápidamente entre secciones

**Criterios de aceptación:**
- [ ] Muestra estructura jerárquica (H2 > H3)
- [ ] Indica sección actual (scroll spy)
- [ ] Click hace scroll suave
- [ ] Fixed position en sidebar derecho
- [ ] Colapsable en móvil
- [ ] Barra de progreso de lectura

**Archivos:**
- `app/frontend/pages/admin/UserManual/components/ManualTableOfContents.tsx` (nuevo)

---

## Epic 4: Herramientas de Productividad

### US-4.1: Implementar búsqueda en la guía actual
**Como** usuario
**Quiero** buscar palabras clave en la guía actual
**Para** encontrar información rápidamente

**Criterios de aceptación:**
- [ ] Input de búsqueda en toolbar
- [ ] Busca en contenido de la guía actual
- [ ] Muestra resultados con preview y highlights
- [ ] Navegación entre resultados (anterior/siguiente)
- [ ] Scroll automático al resultado
- [ ] Debounce 300ms
- [ ] Shortcut: Ctrl+F o Cmd+F

**Archivos:**
- `app/frontend/pages/admin/UserManual/components/InPageSearch.tsx` (nuevo)
- `app/frontend/hooks/useInPageSearch.ts` (nuevo)

---

### US-4.2: Implementar marcadores locales
**Como** usuario
**Quiero** marcar secciones favoritas
**Para** acceder rápidamente a ellas

**Criterios de aceptación:**
- [ ] Botón "⭐ Marcar" en cada sección H2/H3 (aparece en hover)
- [ ] Panel de bookmarks en sidebar derecho
- [ ] Permite agregar nota personal al bookmark
- [ ] Click en bookmark navega a la sección y guía
- [ ] Eliminar bookmark
- [ ] Persistencia en localStorage (por navegador)

**Archivos:**
- `app/frontend/pages/admin/UserManual/components/BookmarksPanel.tsx` (nuevo)
- `app/frontend/hooks/useBookmarks.ts` (nuevo)

---

## Epic 5: Exportación a PDF

### US-5.1: Exportar guía individual a PDF
**Como** administrador
**Quiero** exportar una guía a PDF
**Para** distribuir documentación offline

**Criterios de aceptación:**
- [ ] Botón "📄 Exportar PDF" en toolbar del lector
- [ ] Renderiza contenido completo con estilos
- [ ] Incluye: portada, tabla de contenidos, contenido, footer con paginación
- [ ] Sintaxis highlighting preservado
- [ ] Tablas e imágenes correctamente formateadas
- [ ] Metadata: título, fecha de exportación
- [ ] Indicador de progreso durante generación

**Archivos:**
- `app/frontend/lib/pdfExporter.ts` (nuevo)
- `app/frontend/pages/admin/UserManual/components/ExportButton.tsx` (nuevo)

---

### US-5.2: Botón de exportación con progress
**Como** usuario
**Quiero** un botón de exportación claro
**Para** generar PDF fácilmente

**Criterios de aceptación:**
- [ ] Botón "📄 Exportar PDF" en toolbar
- [ ] Dialog con opciones: incluir TOC, formato
- [ ] Progress bar durante generación
- [ ] Mensaje de éxito al completar
- [ ] Manejo de errores (mostrar mensaje)

**Archivos:**
- `app/frontend/pages/admin/UserManual/components/ExportButton.tsx` (nuevo)

---

## Epic 6: Backend Mínimo

### US-6.1: Endpoint para listar archivos
**Como** frontend
**Quiero** obtener la lista de archivos .md
**Para** mostrar el índice

**Criterios de aceptación:**
- [ ] Endpoint `GET /admin/user-manual-files`
- [ ] Retorna JSON con lista de archivos
- [ ] Incluye metadata hardcoded (título, categoría, descripción)
- [ ] Solo archivos .md en `UserManual/`
- [ ] Requiere autenticación (staff)
- [ ] Tests de request spec

**Archivos:**
- `config/routes.rb` (actualizar)
- `app/controllers/admin/user_manual_controller.rb` (nuevo)
- `app/actions/admin/user_manual/list_files.rb` (nuevo)
- `spec/requests/admin/user_manual_spec.rb` (nuevo)

---

### US-6.2: Página Inertia para el visor
**Como** administrador
**Quiero** acceder a /admin/user-manual
**Para** ver la página del visor

**Criterios de aceptación:**
- [ ] Ruta `GET /admin/user-manual`
- [ ] Requiere autenticación (staff)
- [ ] Renderiza `admin/UserManual` Inertia
- [ ] Props: `user`

**Archivos:**
- `app/controllers/admin_pages_controller.rb` (actualizar)

---

## Orden de Implementación

### Fase 1: Setup (US-1.1, US-1.2, US-1.3)
1. Instalar dependencias NPM
2. Crear tipos TypeScript
3. Implementar cliente API

### Fase 2: Renderizado (US-2.1, US-2.2)
4. Componente MarkdownRenderer
5. Hook useMarkdownNavigation
6. Estilos de Markdown

### Fase 3: Navegación (US-3.1, US-3.2, US-3.3, US-3.4, US-3.5)
7. Sidebar de navegación
8. Índice visual
9. Página principal AdminUserManual
10. Lector con TOC
11. Tabla de contenidos

### Fase 4: Herramientas (US-4.1, US-4.2)
12. Búsqueda en página
13. Marcadores locales

### Fase 5: Exportación (US-5.1, US-5.2)
14. Librería de exportación PDF
15. Botón de exportación

### Fase 6: Backend (US-6.1, US-6.2)
16. Action ListFiles
17. Action ReadFile
18. Controlador UserManualController
19. Página Inertia
20. Tests

---

## Resumen Ejecutivo

**Total User Stories**: 18
**Total Epics**: 6
**Archivos Frontend Nuevos**: ~15
**Archivos Backend Nuevos**: ~5
**Modelos de BD Nuevos**: 0
**Dependencias NPM**: 7 paquetes

---

## Features Principales

### ✅ Visualización y Lectura
- Renderizado completo de Markdown con GFM
- Navegación SPA tipo libro
- Tabla de contenidos automática con scroll spy
- Sidebar de categorías y guías
- Breadcrumbs de ubicación
- Enlaces internos entre guías
- Syntax highlighting de código
- Barra de progreso de lectura

### ✅ Productividad
- Búsqueda en la guía actual con highlights
- Marcadores/favoritos en localStorage
- Navegación por teclado

### ✅ Exportación
- PDF de guía individual
- Preservación de estilos y formato
- Portada, paginación y metadata

### ✅ Seguridad
- Solo accesible para staff
- Protección contra path traversal
- Sanitización de HTML

---

## Beneficios del Sistema

1. **Accesibilidad**: Toda la documentación accesible desde el admin
2. **Experiencia moderna**: UI fluida tipo SPA
3. **Distribución**: Exportación a PDF para uso offline
4. **Productividad**: Búsqueda y bookmarks
5. **Sin complejidad**: No requiere BD adicional, solo archivos estáticos

---

## Notas de Implementación

1. **Seguridad**: Solo permitir lectura de archivos en `UserManual/` (evitar path traversal)
2. **Performance**: Cachear contenido de archivos en frontend
3. **Búsqueda**: Implementar en frontend con regex simple
4. **Bookmarks**: Usar localStorage (no requiere backend)
5. **PDF**: Considerar que la generación puede tardar unos segundos
6. **Responsive**: Sidebars colapsables en móvil
7. **Tests**: Priorizar tests de seguridad (path traversal, autenticación)

---

## Extensiones Futuras (Post-MVP)

- Búsqueda global en todas las guías
- Exportación del manual completo a PDF
- Modo oscuro manual
- Impresión optimizada (CSS print)
- Marcadores sincronizados (backend)
- Estadísticas de uso

---

## Checklist de Inicio

- [ ] Revisar plan con stakeholders
- [ ] Confirmar permisos de acceso (solo staff)
- [ ] Preparar archivos .md de ejemplo para testing
- [ ] Configurar ambiente de desarrollo con dependencias
- [ ] Crear rama feature: `feat/user-manual-viewer`
