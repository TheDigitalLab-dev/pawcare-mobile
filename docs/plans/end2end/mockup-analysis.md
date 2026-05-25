# Análisis del Mockup Original de PawCare

**URL del Mockup**: https://vet-dashboard.lovable.app
**Fecha de Análisis**: 2026-01-11
**Propósito**: Comparar el mockup original con la implementación actual para identificar gaps y planificar desarrollo futuro

---

## 📋 Resumen Ejecutivo

El mockup original de PawCare (VetCare) es un sistema veterinario completo con **3 portales distintos**:
1. **CLÍNICA** - Operaciones diarias del veterinario
2. **GESTIÓN** - Administración del negocio
3. **PROPIETARIO** - Portal para dueños de mascotas

**Estado actual de implementación**: ~30% del mockup original está implementado, principalmente enfocado en el módulo de Gestión (Mascotas, Adopciones, Apadrinamientos).

---

## 🎨 Diseño y UX del Mockup Original

### Layout General
```
┌────────────────────────────────────────────────────────────┐
│  [Logo VetCare]         [Search Bar]      [🔔] [👤]        │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│ CLÍNICA  │                                                 │
│ • Citas  │                                                 │
│ • Prop.  │                                                 │
│ • Hist.  │            CONTENIDO PRINCIPAL                  │
│ • Conslt │                                                 │
│ • Pagos  │                                                 │
│ • Report │                                                 │
│          │                                                 │
│ GESTIÓN  │                                                 │
│ • Métric │                                                 │
│ • Person │                                                 │
│ • Turnos │                                                 │
│ • Financ │                                                 │
│ • Prod&S │                                                 │
│ • Conten │                                                 │
│          │                                                 │
│ PROPIETA │                                                 │
│ • Perfil │                                                 │
│ • Mascot │                                                 │
│ • Citas  │                                                 │
│ • H.Pago │                                                 │
│ • Regist │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

### Características de Diseño
- **Sidebar siempre visible** con 3 secciones colapsables
- **Search bar global** en header
- **Iconos + texto** en navegación
- **Color primario**: Teal/Verde azulado (#14B8A6)
- **Badges de estado**: Verde (Activo), Rojo (Crítico), Amarillo (Pendiente)
- **Cards con sombra** para cada entidad
- **Tabs** para alternar vistas (Propietarios/Mascotas, etc.)

---

## 📊 Módulos del Mockup Original

### 1️⃣ CLÍNICA (6 módulos)

#### ✅ Implementados (0/6)
Ninguno

#### ⏳ Pendientes (6/6)

| Módulo | Descripción | Prioridad | Complejidad |
|--------|-------------|-----------|-------------|
| **Citas** | Calendario de citas con vista Día/Semana/Mes. Filtros por veterinario. Acciones: Reagendar, Cancelar, Comenzar Consulta, Ver Historial | **Alta** | Media |
| **Propietarios / Pacientes** | Gestión unificada de propietarios y mascotas. Tabs para alternar entre ambos. Búsqueda por nombre, email, teléfono, especie. Filtros por ciudad y especie | Media | Baja |
| **Historial Médico** | Historial completo por paciente. Selector de paciente. Timeline de consultas, tratamientos, cirugías | **Alta** | Alta |
| **Nueva Consulta** | Wizard para crear consulta médica. Seleccionar paciente, registrar síntomas, diagnóstico, tratamiento, receta | **Alta** | Alta |
| **Pagos** | Registro de pagos por consulta/servicio. Estados: Pagado, Pendiente, Vencido | Media | Media |
| **Reportes Médicos** | Generación de reportes médicos en PDF. Filtros por fecha, veterinario, tipo de consulta | Baja | Media |

---

### 2️⃣ GESTIÓN (6 módulos)

#### ✅ Implementados (2/6)

| Módulo | Estado | Ruta Actual | Notas |
|--------|--------|-------------|-------|
| **Mascotas** | ✅ Parcial | `/admin/pets` | Lista con filtros, crear/editar. **Falta**: Vista detalle con historial médico |
| **Apadrinamientos** | ✅ Parcial | `/admin/sponsorships` | CRUD básico implementado |

#### ⏳ Pendientes (4/6)

| Módulo | Descripción | Prioridad | Complejidad |
|--------|-------------|-----------|-------------|
| **Métricas** | Dashboard con KPIs: Ingresos, Citas, Nuevos Clientes. Widgets: Estado del Personal, Quirófano, Hospitalizaciones, Servicios Más Vendidos, Anuncios | **Alta** | Alta |
| **Personal** | Gestión de empleados: Veterinarios, Asistentes, Recepcionistas. Roles y permisos. Estados: Activo, De Licencia, Inactivo | Media | Media |
| **Turnos** | Gestión de turnos del personal. Calendario de trabajo. Asignación de turnos | Media | Media |
| **Financiero** | Reportes financieros, ingresos vs gastos, cuentas por cobrar/pagar | Baja | Alta |
| **Productos & Servicios** | Catálogo de productos (comida, medicamentos) y servicios (consultas, cirugías). Gestión de precios, stock | Media | Media |
| **Gestión de Contenido** | Publicación de anuncios, promociones, noticias para propietarios | Baja | Baja |

---

### 3️⃣ PROPIETARIO (5 módulos)

#### ✅ Implementados (0/5)
Ninguno (existe un dashboard básico sin funcionalidad)

#### ⏳ Pendientes (5/5)

| Módulo | Descripción | Prioridad | Complejidad |
|--------|-------------|-----------|-------------|
| **Perfil** | Ver/editar información personal del propietario. Cambiar contraseña | Media | Baja |
| **Mis Mascotas** | Vista de mascotas del propietario con tabs: Lista, Tratamientos Activos, Próximas Citas. Badges de vacunación | **Alta** | Media |
| **Mis Citas** | Ver citas programadas, historial de citas. Reagendar/Cancelar citas | **Alta** | Media |
| **Historial de Pagos** | Ver facturas, recibos, pagos pendientes | Media | Baja |
| **Registros Activos** | Ver tratamientos activos, medicamentos prescritos | Media | Media |

---

## 🆚 Comparación: Mockup vs Implementación Actual

### Arquitectura de Navegación

| Aspecto | Mockup Original | Implementación Actual | Gap |
|---------|----------------|----------------------|-----|
| **Sidebar** | 3 secciones: CLÍNICA, GESTIÓN, PROPIETARIO | 1 sección: Gestión (sin agrupar) | ❌ Falta estructura de 3 portales |
| **Navegación** | Iconos + texto | Iconos + texto | ✅ Similar |
| **Search global** | Presente en header | ❌ No existe | ❌ Falta search bar global |
| **User menu** | Avatar + dropdown (Ver perfil, Configuración, Cerrar sesión) | Avatar + dropdown | ✅ Similar |
| **Responsive** | Sidebar colapsable en mobile | ❌ Sidebar siempre visible | ❌ No funciona en mobile |

---

### Módulos Implementados vs Mockup

| Módulo Mockup | Ruta Mockup | Implementado | Ruta Actual | Diferencias |
|---------------|-------------|--------------|-------------|-------------|
| Propietarios/Pacientes (tabs) | `/propietarios` | ❌ No | - | Mockup unifica propietarios y mascotas con tabs. Actual: separado |
| Mascotas | `/propietarios` (tab) | ✅ Parcial | `/admin/pets` | Mockup muestra estado de vacunación, alergias. Actual: más simple |
| Adopciones | - | ✅ Parcial | `/admin/adoptions` | **No existe en mockup**. Feature única de PawCare actual |
| Apadrinamientos | - | ✅ Parcial | `/admin/sponsorships` | **No existe en mockup**. Feature única de PawCare actual |
| Citas | `/citas` | ❌ No | - | Mockup tiene calendario con Día/Semana/Mes |
| Manual de Usuario | - | ✅ Completo | `/admin/user-manual` | **No existe en mockup**. Feature única de PawCare actual |

---

### Diseño Visual

| Elemento | Mockup | Implementación Actual | Recomendación |
|----------|--------|----------------------|---------------|
| **Color primario** | Teal (#14B8A6) | Teal (#14B8A6) | ✅ Mantener |
| **Cards** | Con sombra sutil | Con borde y sombra sutil | ✅ Similar, mantener |
| **Badges de estado** | Verde/Rojo/Amarillo con texto | Verde/Rojo | ✅ Mejorar: agregar más estados |
| **Tabs** | Horizontal con iconos | Básico sin iconos | ❌ Mejorar: agregar iconos |
| **Filters** | Dropdowns + search en misma línea | Múltiples inputs en grid | ✅ Ambos válidos |
| **Empty states** | Iconos grandes + texto explicativo | Texto simple | ❌ Mejorar: agregar iconos y mensajes |

---

## 🎯 Recomendaciones de Adaptación

### 1. Estructura de Navegación (Prioridad Alta)

**Problema**: El mockup tiene 3 portales (CLÍNICA, GESTIÓN, PROPIETARIO) pero la implementación actual solo tiene uno (Admin).

**Recomendación**:
```
Sidebar Propuesto:
├── CLÍNICA (para staff)
│   ├── 📅 Citas
│   ├── 👥 Propietarios / Pacientes
│   ├── 📋 Historial Médico
│   ├── ⚕️ Nueva Consulta
│   └── 💰 Pagos
├── GESTIÓN (admin only)
│   ├── 📊 Métricas (nuevo)
│   ├── 🐾 Mascotas (ya existe)
│   ├── ❤️ Adopciones (ya existe)
│   ├── 💝 Apadrinamientos (ya existe)
│   ├── 👨‍⚕️ Personal (nuevo)
│   ├── 📚 Manual de Usuario (ya existe)
│   └── ⚙️ Configuración (nuevo)
└── PROPIETARIO (owner portal - separado)
    ├── 👤 Mi Perfil
    ├── 🐕 Mis Mascotas
    ├── 📅 Mis Citas
    └── 💳 Historial de Pagos
```

**Implementación**:
1. Modificar `AdminSidebar.tsx` para aceptar prop `sections` con estructura jerárquica
2. Crear lógica para mostrar/ocultar secciones según rol del usuario
3. Agregar colapsables para cada sección (CLÍNICA, GESTIÓN, PROPIETARIO)

---

### 2. Unificar Propietarios / Pacientes (Prioridad Media)

**Problema**: El mockup tiene una sola vista con tabs para Propietarios y Mascotas. Actual: son secciones separadas.

**Recomendación**:
- Crear ruta `/admin/clients` que unifique:
  - Tab "Propietarios" (owners)
  - Tab "Mascotas" (pets)
- Search bar único que busca en ambos
- Filtros compartidos (ciudad, especie)

**Beneficios**:
- UX más intuitiva (buscar propietario → ver sus mascotas)
- Reduce navegación entre secciones

---

### 3. Agregar Módulo de Citas (Prioridad Alta)

**Problema**: El mockup tiene un módulo de Citas completo. Actual: no existe.

**Recomendación**:
- Implementar plan 013 (Appointments System) que ya existe en `.docs/`
- Usar calendario con vista Día/Semana/Mes (similar a mockup)
- Acciones: Reagendar, Cancelar, Comenzar Consulta
- Filtros por veterinario

---

### 4. Módulo de Métricas/Dashboard (Prioridad Alta)

**Problema**: El mockup tiene un dashboard robusto con KPIs. Actual: dashboard genérico sin métricas.

**Recomendación**:
- Crear `/admin/metrics` o convertir `/admin/dashboard` en dashboard real
- Widgets:
  - 💰 Ingresos (con % vs período anterior)
  - 📅 Citas (confirmadas, completadas, canceladas)
  - 👥 Nuevos Clientes
  - 👨‍⚕️ Estado del Personal (quién está activo/libre)
  - 🏥 Mascotas en Hospitalización (si aplica)
  - 📊 Servicios Más Vendidos

---

### 5. Dark Mode (Prioridad Alta)

**Problema**: El mockup soporta dark mode (visible en screenshots). Actual: no funciona.

**Recomendación**:
- Implementar dark mode funcional (ya detectamos que NO está funcionando en pruebas E2E)
- Usar variables CSS de `tokens.css`
- Agregar toggle en user menu o configuración

**Pasos**:
1. Verificar que clase `.dark` se agrega al `<html>` cuando `prefers-color-scheme: dark`
2. Revisar que todas las variables CSS dark están definidas en `tokens.css`
3. Agregar hook/script para detectar preferencia del sistema
4. Opcional: Agregar toggle manual en settings

---

### 6. Search Bar Global (Prioridad Media)

**Problema**: El mockup tiene search bar en header. Actual: no existe.

**Recomendación**:
- Agregar search bar en `AdminHeader.tsx`
- Búsqueda multi-entidad:
  - Propietarios (por nombre, email, teléfono)
  - Mascotas (por nombre, especie, raza)
  - Citas (por propietario, mascota, fecha)
- Resultados con categorización

---

### 7. Responsive Design en Mobile (Prioridad Alta)

**Problema**: El sidebar NO se oculta en mobile (detectado en pruebas E2E).

**Recomendación**:
- Ocultar sidebar en mobile (< 768px) con clase `hidden md:block`
- Agregar botón hamburguesa visible en header (clase `md:hidden`)
- Sidebar como drawer/overlay cuando está abierto en mobile
- Implementar estado `sidebarOpen` en `AdminLayout`

**Archivos a modificar**:
- `AdminLayout.tsx`
- `AdminSidebar.tsx`
- `AdminHeader.tsx`

---

### 8. Módulos Únicos de PawCare Actual (Mantener)

**Features que NO están en mockup pero SÍ en implementación actual**:
1. ✅ **Adopciones** - Mantener y mejorar
2. ✅ **Apadrinamientos** - Mantener y mejorar
3. ✅ **Manual de Usuario** - Mantener (ya completo con search, bookmarks, PDF)

**Recomendación**: Integrar estos módulos en la nueva estructura de sidebar bajo sección "GESTIÓN".

---

## 📝 Plan de Implementación Sugerido

### Fase 1: Correcciones Críticas (1-2 semanas)
1. ✅ **Fix Dark Mode** - Hacer que funcione correctamente
2. ✅ **Fix Responsive Sidebar** - Ocultar en mobile, agregar hamburguesa
3. ✅ **Corregir texto "owner"** en header - Mostrar rol correcto (Admin/Staff)
4. ⬜ **Agregar Search Bar Global** en header

### Fase 2: Restructuración de Navegación (2-3 semanas)
5. ⬜ **Implementar estructura de 3 portales** (CLÍNICA, GESTIÓN, PROPIETARIO)
6. ⬜ **Unificar Propietarios/Mascotas** en `/admin/clients` con tabs
7. ⬜ **Separar portal de Owners** con su propio layout

### Fase 3: Módulos Prioritarios (4-6 semanas)
8. ⬜ **Implementar módulo de Citas** (plan 013)
9. ⬜ **Crear Dashboard de Métricas** con KPIs
10. ⬜ **Implementar Historial Médico** por paciente

### Fase 4: Módulos Complementarios (4-6 semanas)
11. ⬜ **Nueva Consulta** (wizard)
12. ⬜ **Gestión de Personal** (empleados, roles, turnos)
13. ⬜ **Módulo de Pagos**
14. ⬜ **Productos & Servicios**

### Fase 5: Portal de Propietarios (3-4 semanas)
15. ⬜ **Mis Mascotas** (owner view)
16. ⬜ **Mis Citas** (owner view)
17. ⬜ **Mi Perfil** (owner view)
18. ⬜ **Historial de Pagos** (owner view)

---

## 🎨 Elementos de Diseño a Adoptar del Mockup

### ✅ Ya implementados correctamente:
- Color primario Teal (#14B8A6)
- Cards con sombra sutil
- Badges de estado con colores
- Layout general (Sidebar + Header + Main)
- Avatares con iniciales

### ⏳ Por implementar:
- **Empty States**: Iconos grandes + texto explicativo
- **Tabs con iconos**: Agregar iconos a tabs existentes
- **Filters en línea**: Agrupar search + filtros en una sola línea
- **Status Badges variados**: Agregar más colores (Amarillo para Pendiente, Gris para Inactivo)
- **Action Buttons**: Botones secundarios con iconos (Editar, Ver, Eliminar)
- **Timeline UI**: Para historial médico (línea vertical con eventos)
- **Calendar UI**: Vista de calendario para citas (Día/Semana/Mes)
- **Tooltips**: En iconos y acciones

---

## 📊 Estadísticas de Implementación

| Categoría | Mockup Original | Implementado | % Completado |
|-----------|----------------|--------------|--------------|
| **Módulos CLÍNICA** | 6 | 0 | 0% |
| **Módulos GESTIÓN** | 6 | 2 parciales | ~30% |
| **Módulos PROPIETARIO** | 5 | 0 | 0% |
| **Features Únicas Actuales** | 0 | 3 (Adopciones, Apadrinamientos, Manual) | - |
| **Total General** | 17 | ~5 | ~29% |

---

## 🚀 Próximos Pasos Inmediatos

1. ✅ **Corregir issues del AdminLayout** (dark mode, responsive, header)
2. ⬜ **Decidir prioridad de módulos** con el equipo/cliente
3. ⬜ **Implementar estructura de 3 portales** en sidebar
4. ⬜ **Empezar con módulo de Citas** (plan 013 ya existe)
5. ⬜ **Crear dashboard de métricas** básico

---

## 📸 Screenshots del Mockup

Todos los screenshots están guardados en `.playwright-mcp/`:
- `mockup-01-citas.png` - Vista de citas con calendario
- `mockup-02-propietarios.png` - Lista de propietarios
- `mockup-03-mascotas.png` - Lista de mascotas (tab)
- `mockup-04-historial.png` - Historial médico (empty state)
- `mockup-05-nueva-consulta.png` - Selector de paciente para consulta
- `mockup-06-metricas.png` - Dashboard de métricas
- `mockup-07-personal.png` - Gestión de empleados
- `mockup-08-productos-servicios.png` - Catálogo de productos
- `mockup-09-propietario-mascotas.png` - Portal de propietario

---

**Conclusión**: El mockup original es significativamente más completo que la implementación actual. PawCare actual tiene un buen fundamento técnico (TDD, Actions, Redux) pero necesita expandirse para alcanzar la visión completa del mockup. Las features únicas (Adopciones, Apadrinamientos, Manual) son valiosas y deben mantenerse mientras se agregan los módulos faltantes.
