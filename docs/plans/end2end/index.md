# Índice de Pruebas End-to-End (E2E)

## 📋 Propósito

Este directorio contiene documentación para guiar las pruebas end-to-end usando **Playwright MCP**. Cada documento representa una sección o funcionalidad de la aplicación que debe ser probada visualmente para verificar comportamiento, diseño responsive, y compatibilidad con dark mode.

---

## 🎯 Objetivos de las Pruebas E2E

1. **Verificar diseño responsive** - Mobile-first (< 640px), Tablet (768px), Desktop (1024px+)
2. **Validar dark mode** - Todos los componentes deben soportar modo oscuro
3. **Probar navegación** - Links, botones, menús funcionan correctamente
4. **Verificar estados** - Loading, error, empty states se muestran bien
5. **Validar formularios** - Inputs, validaciones, mensajes de error
6. **Probar interacciones** - Hover, focus, click, scroll

---

## 📁 Estructura de Documentos

Cada documento de prueba sigue esta estructura:

```markdown
# [Nombre de la Sección]

## 🎯 Objetivo
Qué se va a probar en esta sección

## 📍 URLs a Probar
Lista de rutas relevantes

## ✅ Checklist de Pruebas
- [ ] Item 1
- [ ] Item 2

## 🔍 Casos de Prueba Detallados
### Caso 1: [Nombre]
- **Pasos**: 1, 2, 3
- **Resultado esperado**: ...
- **Screenshots**: ...

## 🐛 Issues Encontrados
Lista de problemas detectados
```

---

## 📑 Documentos de Análisis

### Mockup Original
- [mockup-analysis.md](./mockup-analysis.md) - Análisis completo del mockup original de PawCare, comparación con implementación actual, y plan de desarrollo futuro

---

## 📑 Secciones de Prueba

### 1. Layouts y Navegación
- [01-layouts.md](./01-layouts.md) - AdminLayout, AdminSidebar, AdminHeader

### 2. Autenticación
- [ ] 02-auth.md - Login, Register, Forgot Password, Reset Password

### 3. Dashboard Admin
- [ ] 03-admin-dashboard.md - Dashboard principal del admin

### 4. Gestión de Mascotas
- [ ] 04-pets-crud.md - Lista, detalle, crear, editar mascotas

### 5. Adopciones
- [ ] 05-adoptions.md - Gestión de adopciones

### 6. Apadrinamientos
- [ ] 06-sponsorships.md - Gestión de apadrinamientos

### 7. Usuarios y Owners
- [ ] 07-users-owners.md - Gestión de usuarios y propietarios

### 8. Manual de Usuario
- [ ] 08-user-manual.md - Viewer, search, bookmarks, PDF export

### 9. Perfil y Configuración
- [ ] 09-profile-settings.md - Perfil de usuario, cambio de contraseña

### 10. Dashboard Owner
- [ ] 10-owner-dashboard.md - Portal de propietarios (mis mascotas, citas)

---

## 🚀 Cómo Usar Este Índice

### Paso 1: Seleccionar Sección
Elegir qué sección se va a probar según prioridad o feature reciente

### Paso 2: Leer el Documento
Revisar el documento específico (ej: `01-layouts.md`) para entender:
- URLs a visitar
- Elementos a verificar
- Casos de prueba específicos

### Paso 3: Ejecutar Pruebas con Playwright MCP
Usar Playwright MCP tools para:
- `browser_navigate` - Navegar a URL
- `browser_snapshot` - Capturar snapshot de accesibilidad
- `browser_take_screenshot` - Tomar screenshot visual
- `browser_click` - Interactuar con elementos
- `browser_resize` - Cambiar tamaño de ventana (mobile, tablet, desktop)

### Paso 4: Documentar Hallazgos
Agregar issues encontrados en la sección **🐛 Issues Encontrados** del documento

### Paso 5: Crear Commits de Corrección
Corregir los issues detectados siguiendo conventional commits

---

## 📐 Tamaños de Pantalla Estándar

| Dispositivo | Ancho | Breakpoint Tailwind |
|-------------|-------|---------------------|
| Mobile | 375px | default (< 640px) |
| Mobile Large | 480px | default |
| Tablet | 768px | `md:` |
| Desktop | 1024px | `lg:` |
| Desktop Large | 1440px | `xl:` |
| Wide Screen | 1920px | `2xl:` |

---

## 🎨 Modos de Visualización

Para cada prueba, verificar:
- ✅ **Light Mode** - Modo claro (default)
- ✅ **Dark Mode** - Modo oscuro (preferencia del sistema)

---

## 📝 Convenciones de Nombres

- Archivos numerados: `01-`, `02-`, etc.
- Nombres descriptivos en kebab-case: `layouts.md`, `pets-crud.md`
- Un documento por sección principal de la app

---

## 🔄 Estado de Documentación

| Documento | Estado | Última Actualización |
|-----------|--------|---------------------|
| mockup-analysis.md | ✅ Creado | 2026-01-11 |
| 01-layouts.md | ✅ Creado | 2026-01-11 |
| 02-auth.md | ⏳ Pendiente | - |
| 03-admin-dashboard.md | ⏳ Pendiente | - |
| 04-pets-crud.md | ⏳ Pendiente | - |
| 05-adoptions.md | ⏳ Pendiente | - |
| 06-sponsorships.md | ⏳ Pendiente | - |
| 07-users-owners.md | ⏳ Pendiente | - |
| 08-user-manual.md | ⏳ Pendiente | - |
| 09-profile-settings.md | ⏳ Pendiente | - |
| 10-owner-dashboard.md | ⏳ Pendiente | - |

---

## 🎯 Próximos Pasos

1. **Prioridad Alta**: Completar pruebas de layouts y auth (01-02)
2. **Prioridad Media**: CRUD de mascotas y adopciones (04-05)
3. **Prioridad Baja**: Features avanzadas (manual, perfil)

---

**Nota**: Este índice se actualiza conforme se crean nuevos documentos de prueba y se detectan issues.
