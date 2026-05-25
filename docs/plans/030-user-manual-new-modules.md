<!--
STATUS: ✅ COMPLETADO
Implementado: Documentación de nuevos módulos en UserManual
Creados: admin-metrics.md, admin-shifts.md, admin-financial.md, admin-content.md, admin-products.md, admin-services.md
Actualizado: Index.md con nuevas secciones y guías por rol
-->

# Plan: Documentación de Nuevos Módulos en UserManual

## Resumen

Crear documentación de usuario para los nuevos módulos implementados en el sistema:
- **Métricas**: Dashboards y estadísticas de la clínica
- **Turnos**: Gestión de horarios de clínica y personal
- **Finanzas**: Gastos, eventos especiales y reembolsos
- **Gestión de Contenido**: Promociones, avisos y campañas de email
- **Productos y Servicios**: Inventario y catálogo de servicios

**Audiencia**: Administradores y personal de la clínica

---

## Estado Actual del UserManual

### Archivos Existentes
```
UserManual/
├── Index.md                      ✅ Índice principal
├── admin-adoptions.md            ✅ Adopciones
├── admin-pets.md                 ✅ Mascotas (admin)
├── admin-users.md                ✅ Usuarios/Personal
├── authentication.md             ✅ Autenticación
├── color-palette-configuration.md ✅ Paleta de colores
├── dark-mode.md                  ✅ Modo oscuro
├── development-installation.md   ✅ Instalación
├── landing-configuration.md      ✅ Landing page
├── my-pets.md                    ✅ Mis mascotas (owner)
├── payment-system.md             ✅ Pagos
└── profile-management.md         ✅ Perfil
```

### Archivos Por Crear
```
UserManual/
├── admin-metrics.md              ❌ NUEVO - Métricas y dashboards
├── admin-shifts.md               ❌ NUEVO - Turnos y horarios
├── admin-financial.md            ❌ NUEVO - Finanzas
├── admin-content.md              ❌ NUEVO - Gestión de contenido
├── admin-products.md             ❌ NUEVO - Productos e inventario
└── admin-services.md             ❌ NUEVO - Categorías de servicios
```

---

## User Stories

### Epic 1: Documentación de Métricas

#### US-1.1: Crear admin-metrics.md
**Como** administrador de la clínica
**Quiero** documentación del módulo de métricas
**Para** entender cómo usar los dashboards y estadísticas

**Criterios de aceptación:**
- [ ] Crear archivo `UserManual/admin-metrics.md`
- [ ] Sección: Acceso al módulo (sidebar > Métricas)
- [ ] Sección: Dashboard principal
  - Cards de KPIs (consultas, ingresos, citas, pacientes)
  - Selector de período (diario, semanal, mensual, todo)
  - Indicador de última actualización
- [ ] Sección: Métricas de Consultas
  - Total de consultas
  - Consultas por veterinario
  - Diagnósticos frecuentes
- [ ] Sección: Métricas de Pacientes
  - Nuevos registros
  - Distribución por especie
  - Vacunas vencidas
- [ ] Sección: Métricas de Ingresos
  - Ingresos por período
  - Ingresos por servicio
  - Ticket promedio
- [ ] Sección: Métricas de Citas
  - Tasa de cancelación
  - Horarios más demandados
  - Servicios más solicitados
- [ ] Sección: Refresh manual (solo admin)
- [ ] Incluir capturas de pantalla si es posible

**Archivos:**
- `UserManual/admin-metrics.md` (nuevo)

---

### Epic 2: Documentación de Turnos

#### US-2.1: Crear admin-shifts.md
**Como** administrador o HR
**Quiero** documentación del módulo de turnos
**Para** gestionar horarios correctamente

**Criterios de aceptación:**
- [ ] Crear archivo `UserManual/admin-shifts.md`
- [ ] Sección: Acceso al módulo (sidebar > Turnos)
- [ ] Sección: Horario de la Clínica
  - Configurar días de apertura
  - Establecer horas de apertura/cierre
  - Días cerrados
- [ ] Sección: Turnos del Personal
  - Asignar horarios a empleados
  - Ver disponibilidad por día
  - Modificar turnos existentes
- [ ] Sección: Calendario Semanal
  - Vista de calendario
  - Navegación entre semanas
  - Colores por empleado/estado
- [ ] Sección: Excepciones de Horario
  - Registrar vacaciones
  - Días festivos
  - Permisos y ausencias
  - Aprobar/rechazar solicitudes
- [ ] Sección: Roles con acceso (admin, hr)

**Archivos:**
- `UserManual/admin-shifts.md` (nuevo)

---

### Epic 3: Documentación de Finanzas

#### US-3.1: Crear admin-financial.md
**Como** administrador o encargado de finanzas
**Quiero** documentación del módulo financiero
**Para** gestionar gastos y eventos especiales

**Criterios de aceptación:**
- [ ] Crear archivo `UserManual/admin-financial.md`
- [ ] Sección: Acceso al módulo (sidebar > Finanzas)
- [ ] Sección: Resumen Financiero
  - Balance general
  - Ingresos vs egresos
  - Comparativas por período
- [ ] Sección: Gestión de Gastos
  - Registrar nuevo gasto
  - Categorías de gastos
  - Adjuntar recibos
  - Editar/eliminar gastos
- [ ] Sección: Eventos Especiales
  - Crear jornada de vacunación
  - Día de consultas con descuento
  - Configurar descuentos
  - Seleccionar servicios incluidos
  - Visibilidad en landing
- [ ] Sección: Reembolsos
  - Solicitar reembolso
  - Procesar reembolso
  - Estados de reembolso
- [ ] Sección: Pagos Pendientes
  - Lista de pagos por cobrar
  - Pagos vencidos
  - Acciones rápidas
- [ ] Sección: Roles con acceso (admin, finances)

**Archivos:**
- `UserManual/admin-financial.md` (nuevo)

---

### Epic 4: Documentación de Gestión de Contenido

#### US-4.1: Crear admin-content.md
**Como** administrador
**Quiero** documentación del módulo de contenido
**Para** gestionar promociones y comunicaciones

**Criterios de aceptación:**
- [ ] Crear archivo `UserManual/admin-content.md`
- [ ] Sección: Acceso al módulo (sidebar > Contenido)
- [ ] Sección: Promociones
  - Crear promoción/banner
  - Configurar descuento
  - Fechas de vigencia
  - Subir imagen
  - Reordenar promociones (drag & drop)
  - Activar/desactivar
- [ ] Sección: Avisos
  - Crear aviso/noticia
  - Tipos de aviso (info, alerta, evento, festivo)
  - Severidad (baja, media, alta, crítica)
  - Mostrar en landing vs dashboard
  - Programar fechas
- [ ] Sección: Configuración del Landing
  - Visibilidad de secciones
  - Subir logo
  - Horarios públicos
  - Información de contacto
- [ ] Sección: Campañas de Email
  - Crear campaña
  - Escribir asunto y contenido
  - Configurar filtros de destinatarios
  - Previsualizar destinatarios
  - Enviar campaña
  - Ver estado de envío
- [ ] Sección: Filtros de Destinatarios
  - Por mascota (especie, estado)
  - Por propietario (activo, con citas)
  - Por veterinario
  - Por servicio recibido

**Archivos:**
- `UserManual/admin-content.md` (nuevo)

---

### Epic 5: Documentación de Productos

#### US-5.1: Crear admin-products.md
**Como** administrador
**Quiero** documentación del módulo de productos
**Para** gestionar el inventario

**Criterios de aceptación:**
- [ ] Crear archivo `UserManual/admin-products.md`
- [ ] Sección: Acceso al módulo (sidebar > Productos/Servicios)
- [ ] Sección: Catálogo de Productos
  - Lista de productos
  - Filtros (categoría, estado, bajo stock)
  - Búsqueda
- [ ] Sección: Crear Producto
  - Información básica (nombre, SKU, código de barras)
  - Categoría (medicamento, vacuna, alimento, accesorio, etc.)
  - Precios (compra y venta)
  - Stock (actual, mínimo, máximo)
  - Fecha de expiración
  - Subir imagen
- [ ] Sección: Gestión de Stock
  - Agregar stock (entrada)
  - Registrar salida
  - Ajustar inventario
  - Número de lote
  - Fecha de expiración de lote
- [ ] Sección: Movimientos de Stock
  - Historial de movimientos
  - Tipos (compra, venta, ajuste, devolución)
  - Trazabilidad
- [ ] Sección: Alertas
  - Productos con bajo stock
  - Productos próximos a expirar
  - Notificaciones automáticas
- [ ] Sección: Visibilidad en Landing
  - Mostrar producto en página pública

**Archivos:**
- `UserManual/admin-products.md` (nuevo)

---

### Epic 6: Documentación de Categorías de Servicios

#### US-6.1: Crear admin-services.md
**Como** administrador
**Quiero** documentación de categorías de servicios
**Para** organizar el catálogo de servicios

**Criterios de aceptación:**
- [ ] Crear archivo `UserManual/admin-services.md`
- [ ] Sección: Acceso (dentro de Productos/Servicios)
- [ ] Sección: Categorías de Servicios
  - Crear categoría
  - Categorías jerárquicas (padre/hijo)
  - Iconos por categoría
  - Orden de visualización
- [ ] Sección: Asignar Servicios a Categorías
  - Seleccionar categoría para servicio
  - Filtrar servicios por categoría
- [ ] Sección: Visibilidad de Servicios
  - Mostrar en landing
  - Orden de display
  - Especies aplicables
  - Requiere cita

**Archivos:**
- `UserManual/admin-services.md` (nuevo)

---

### Epic 7: Actualizar Index.md

#### US-7.1: Actualizar Index.md con nuevos módulos
**Como** usuario
**Quiero** encontrar los nuevos módulos en el índice
**Para** acceder fácilmente a la documentación

**Criterios de aceptación:**
- [ ] Agregar sección "Métricas y Reportes" con link a admin-metrics.md
- [ ] Agregar sección "Gestión de Personal" con link a admin-shifts.md
- [ ] Agregar sección "Finanzas" con link a admin-financial.md
- [ ] Agregar sección "Marketing y Contenido" con link a admin-content.md
- [ ] Agregar sección "Inventario" con links a admin-products.md y admin-services.md
- [ ] Actualizar guías rápidas por rol
- [ ] Remover items de "Próximamente" que ya están documentados

**Archivos:**
- `UserManual/Index.md` (modificar)

---

## Orden de Implementación

### Fase 1: Documentación de Módulos Core
1. US-1.1: admin-metrics.md (Métricas)
2. US-2.1: admin-shifts.md (Turnos)
3. US-3.1: admin-financial.md (Finanzas)

### Fase 2: Documentación de Contenido e Inventario
4. US-4.1: admin-content.md (Gestión de Contenido)
5. US-5.1: admin-products.md (Productos)
6. US-6.1: admin-services.md (Servicios)

### Fase 3: Actualización del Índice
7. US-7.1: Actualizar Index.md

---

## Estructura de Cada Archivo

Cada archivo de documentación debe seguir esta estructura:

```markdown
# [Título del Módulo]

Descripción breve del módulo y su propósito.

## 📋 Tabla de Contenidos

- [Acceso al Módulo](#acceso-al-módulo)
- [Sección 1](#sección-1)
- [Sección 2](#sección-2)
- ...

## 🔐 Acceso al Módulo

**Roles permitidos:** admin, [otros roles]

**Ubicación:** Sidebar > [Nombre en sidebar]

## [Sección 1]

Contenido...

## [Sección 2]

Contenido...

## ❓ Preguntas Frecuentes

### ¿Pregunta 1?
Respuesta...

---

**Ver también:**
- [Documento relacionado 1](documento1.md)
- [Documento relacionado 2](documento2.md)
```

---

## Verificación

### Checklist por Archivo
- [ ] Título claro y descriptivo
- [ ] Tabla de contenidos funcional
- [ ] Roles de acceso documentados
- [ ] Todas las funciones principales explicadas
- [ ] Formato consistente con otros archivos
- [ ] Links internos funcionan
- [ ] Sin errores de ortografía

### Verificación Final
- [ ] Index.md actualizado con todos los nuevos links
- [ ] Links entre documentos funcionan
- [ ] Sección "Próximamente" actualizada
- [ ] Guías rápidas por rol actualizadas
