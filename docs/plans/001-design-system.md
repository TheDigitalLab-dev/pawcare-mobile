<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2024
Componentes: 39 shadcn/ui components en app/frontend/components/ui/
-->

# Plan: Design System para PawCare

## Resumen

Crear un design system completo para PawCare basado en los mockups existentes:
- `frontendMockup/landing-peludog/` - Landing page pública
- `frontendMockup/vet-dashboard/` - Dashboard de gestión veterinaria

El sistema utilizará shadcn/ui como base, con personalización de colores y componentes específicos para la aplicación veterinaria.

---

## Análisis de los Mockups

### Tecnologías identificadas
- **shadcn/ui**: Librería de componentes base
- **Tailwind CSS**: Utilidades de estilo
- **Radix UI**: Primitivos de accesibilidad
- **class-variance-authority (CVA)**: Variantes de componentes
- **Lucide React**: Iconografía
- **React Query**: Estado del servidor
- **date-fns / react-day-picker**: Manejo de fechas
- **Sonner**: Notificaciones toast

### Sistema de colores (HSL)

```css
/* Colores principales */
--primary: 174 55% 57%;           /* Teal principal */
--primary-foreground: 0 0% 100%;

/* Colores de fondo */
--background: 0 0% 98%;
--foreground: 210 24% 16%;
--card: 0 0% 100%;
--card-foreground: 210 24% 16%;

/* Colores secundarios */
--secondary: 174 20% 95%;
--secondary-foreground: 174 55% 25%;
--muted: 174 20% 96%;
--muted-foreground: 215.4 16.3% 46.9%;
--accent: 174 35% 85%;
--accent-foreground: 174 55% 25%;

/* Colores semánticos */
--destructive: 0 84.2% 60.2%;
--success: 142 76% 36%;
--warning: 38 92% 50%;
--info: 199 89% 48%;

/* Bordes y anillos */
--border: 174 20% 88%;
--input: 174 20% 88%;
--ring: 174 55% 57%;
--radius: 0.5rem;

/* Sidebar */
--sidebar-background: 0 0% 98%;
--sidebar-foreground: 240 5.3% 26.1%;
--sidebar-primary: 240 5.9% 10%;
--sidebar-accent: 240 4.8% 95.9%;
--sidebar-border: 220 13% 91%;
```

---

## Inventario de Componentes

### Componentes UI Base (shadcn/ui) - 50+
| Categoría | Componentes |
|-----------|-------------|
| **Acciones** | Button, Toggle, ToggleGroup |
| **Formularios** | Input, InputOTP, Label, Textarea, Select, Checkbox, RadioGroup, Switch, Form |
| **Datos** | Table, Avatar, Badge, Calendar, Card, Carousel, Chart |
| **Feedback** | Alert, AlertDialog, Progress, Skeleton, Toast, Toaster, Sonner |
| **Overlays** | Dialog, Drawer, Sheet, Popover, Tooltip, HoverCard, ContextMenu, DropdownMenu |
| **Navegación** | Tabs, Breadcrumb, Pagination, NavigationMenu, Menubar, Command |
| **Layout** | Accordion, Collapsible, Resizable, ScrollArea, Separator, AspectRatio, Sidebar |

### Componentes de Landing (`landing-peludog`)
| Componente | Descripción |
|------------|-------------|
| Navbar | Navegación principal con logo, links y auth |
| Hero | Sección principal con CTA |
| Services | Grid de tarjetas de servicios |
| About | Información de la empresa |
| Contact | Información de contacto y mapa |
| CTA | Llamadas a la acción |
| Announcements | Sección de anuncios |
| Footer | Pie de página |

### Componentes de Dashboard (`vet-dashboard`)
| Componente | Descripción |
|------------|-------------|
| **Layout** | |
| Layout | Layout principal con sidebar |
| VetSidebar | Sidebar de navegación colapsable |
| **Diálogos** | |
| NewAppointmentDialog | Crear nueva cita |
| RescheduleDialog | Reprogramar cita |
| NewRecordDialog | Crear registro médico |
| RecordViewDialog | Ver registro médico |
| OwnerDialog | Crear/editar propietario |
| OwnerViewDialog | Ver propietario |
| OwnerProfileDialog | Perfil de propietario |
| PetDialog | Crear/editar mascota |
| PetViewDialog | Ver mascota |
| NewOrderDialog | Nueva orden de pago |
| OrderViewDialog | Ver orden |
| PartialPaymentDialog | Pago parcial |
| PaymentNoteDialog | Nota de pago |
| **Formularios** | |
| ConsultationForm | Formulario de consulta |
| VaccineForm | Formulario de vacunas |
| RecipeForm | Formulario de recetas |
| LabTestsForm | Formulario de exámenes |
| **Otros** | |
| PatientSearch | Búsqueda de pacientes |
| PatientContext | Context provider |
| OwnerProfileView | Vista de perfil |
| FileUploadSection | Subida de archivos |
| FileImportSection | Importación de archivos |

### Páginas

#### Landing (`landing-peludog`)
| Página | Ruta | Descripción |
|--------|------|-------------|
| Index | `/` | Landing page |
| Login | `/login` | Inicio de sesión |
| Register | `/register` | Registro |
| Appointments | `/appointments` | Agendar cita (público) |
| NotFound | `*` | Página 404 |

#### Dashboard (`vet-dashboard`)
| Página | Ruta | Descripción |
|--------|------|-------------|
| **Clínica** | | |
| Appointments | `/citas` | Gestión de citas |
| Owners | `/propietarios` | Propietarios y pacientes |
| MedicalHistory | `/historial` | Historial médico |
| NewConsult | `/consulta` | Nueva consulta |
| Payments | `/pagos` | Gestión de pagos |
| Reports | `/reportes` | Reportes médicos |
| **Gestión** | | |
| Metrics | `/metricas` | Métricas y estadísticas |
| Personnel | `/personal` | Gestión de personal |
| Shifts | `/turnos` | Gestión de turnos |
| Financial | `/financiero` | Gestión financiera |
| ProductsServices | `/productos-servicios` | Catálogo |
| ContentManagement | `/contenido` | Gestión de contenido |
| **Propietario** | | |
| Profile | `/perfil` | Perfil de usuario |
| Pets | `/mascotas` | Mis mascotas |
| OwnerAppointments | `/mis-citas` | Mis citas |
| PaymentHistory | `/historial-pagos` | Historial de pagos |
| ActiveRecords | `/registros-activos` | Registros activos |

---

## User Stories

### Epic 1: Fundamentos del Design System

#### US-1.1: Configuración de tokens de diseño
**Como** desarrollador
**Quiero** tener variables CSS centralizadas con el sistema de colores
**Para** mantener consistencia visual en toda la aplicación

**Criterios de aceptación:**
- [ ] Crear archivo de tokens CSS en `app/frontend/styles/tokens.css`
- [ ] Definir paleta de colores primarios (teal 174°)
- [ ] Definir colores semánticos (success, warning, destructive, info)
- [ ] Definir tokens de sidebar
- [ ] Configurar variables para sombras y bordes
- [ ] Implementar soporte para modo oscuro

**Archivos:**
- `app/frontend/styles/tokens.css`
- `app/frontend/entrypoints/application.css`

---

#### US-1.2: Configuración de Tailwind CSS
**Como** desarrollador
**Quiero** tener Tailwind configurado con los tokens del design system
**Para** usar clases utilitarias consistentes con la marca

**Criterios de aceptación:**
- [ ] Extender tema de Tailwind con colores personalizados
- [ ] Agregar colores semánticos (success, warning, info)
- [ ] Configurar border-radius personalizado
- [ ] Agregar animaciones (accordion-down, accordion-up)
- [ ] Configurar contenedor responsive
- [ ] Configurar tokens de sidebar

**Archivos:**
- `tailwind.config.js`

---

#### US-1.3: Utilidades base
**Como** desarrollador
**Quiero** tener funciones utilitarias comunes
**Para** facilitar la composición de clases CSS

**Criterios de aceptación:**
- [ ] Crear función `cn()` para merge de clases
- [ ] Instalar dependencias: `clsx`, `tailwind-merge`, `class-variance-authority`

**Archivos:**
- `app/frontend/lib/utils.ts`

---

### Epic 2: Componentes UI Base

#### US-2.1: Componentes de acción
**Como** desarrollador
**Quiero** componentes de acción estilizados
**Para** tener interacciones consistentes

**Criterios de aceptación:**
- [ ] Button (variantes: default, outline, destructive, secondary, ghost, link)
- [ ] Button (tamaños: sm, default, lg, icon)
- [ ] Toggle
- [ ] ToggleGroup

**Archivos:**
- `app/frontend/components/ui/button.tsx`
- `app/frontend/components/ui/toggle.tsx`
- `app/frontend/components/ui/toggle-group.tsx`

---

#### US-2.2: Componentes de contenedor
**Como** desarrollador
**Quiero** componentes contenedores modulares
**Para** organizar contenido consistentemente

**Criterios de aceptación:**
- [ ] Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- [ ] Separator
- [ ] AspectRatio
- [ ] ScrollArea

**Archivos:**
- `app/frontend/components/ui/card.tsx`
- `app/frontend/components/ui/separator.tsx`
- `app/frontend/components/ui/aspect-ratio.tsx`
- `app/frontend/components/ui/scroll-area.tsx`

---

#### US-2.3: Componentes de formulario
**Como** desarrollador
**Quiero** componentes de formulario estilizados
**Para** crear formularios consistentes y accesibles

**Criterios de aceptación:**
- [ ] Input
- [ ] InputOTP
- [ ] Label
- [ ] Textarea
- [ ] Select (Select, SelectTrigger, SelectContent, SelectItem, SelectGroup)
- [ ] Checkbox
- [ ] RadioGroup, RadioGroupItem
- [ ] Switch
- [ ] Form (con react-hook-form)

**Archivos:**
- `app/frontend/components/ui/input.tsx`
- `app/frontend/components/ui/input-otp.tsx`
- `app/frontend/components/ui/label.tsx`
- `app/frontend/components/ui/textarea.tsx`
- `app/frontend/components/ui/select.tsx`
- `app/frontend/components/ui/checkbox.tsx`
- `app/frontend/components/ui/radio-group.tsx`
- `app/frontend/components/ui/switch.tsx`
- `app/frontend/components/ui/form.tsx`

---

#### US-2.4: Componentes de overlay
**Como** desarrollador
**Quiero** componentes para modales y overlays
**Para** mostrar contenido emergente accesible

**Criterios de aceptación:**
- [ ] Dialog (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription)
- [ ] AlertDialog
- [ ] Sheet
- [ ] Drawer
- [ ] Popover
- [ ] HoverCard
- [ ] Tooltip
- [ ] ContextMenu
- [ ] DropdownMenu

**Archivos:**
- `app/frontend/components/ui/dialog.tsx`
- `app/frontend/components/ui/alert-dialog.tsx`
- `app/frontend/components/ui/sheet.tsx`
- `app/frontend/components/ui/drawer.tsx`
- `app/frontend/components/ui/popover.tsx`
- `app/frontend/components/ui/hover-card.tsx`
- `app/frontend/components/ui/tooltip.tsx`
- `app/frontend/components/ui/context-menu.tsx`
- `app/frontend/components/ui/dropdown-menu.tsx`

---

#### US-2.5: Componentes de feedback
**Como** desarrollador
**Quiero** componentes para notificaciones y feedback
**Para** comunicar estados al usuario

**Criterios de aceptación:**
- [ ] Toast y Toaster
- [ ] Sonner (toast alternativo)
- [ ] Alert
- [ ] Badge
- [ ] Progress
- [ ] Skeleton

**Archivos:**
- `app/frontend/components/ui/toast.tsx`
- `app/frontend/components/ui/toaster.tsx`
- `app/frontend/components/ui/use-toast.ts`
- `app/frontend/components/ui/sonner.tsx`
- `app/frontend/components/ui/alert.tsx`
- `app/frontend/components/ui/badge.tsx`
- `app/frontend/components/ui/progress.tsx`
- `app/frontend/components/ui/skeleton.tsx`

---

#### US-2.6: Componentes de navegación
**Como** desarrollador
**Quiero** componentes de navegación
**Para** facilitar la orientación del usuario

**Criterios de aceptación:**
- [ ] Tabs (Tabs, TabsList, TabsTrigger, TabsContent)
- [ ] Breadcrumb
- [ ] Pagination
- [ ] NavigationMenu
- [ ] Menubar
- [ ] Command (cmdk)

**Archivos:**
- `app/frontend/components/ui/tabs.tsx`
- `app/frontend/components/ui/breadcrumb.tsx`
- `app/frontend/components/ui/pagination.tsx`
- `app/frontend/components/ui/navigation-menu.tsx`
- `app/frontend/components/ui/menubar.tsx`
- `app/frontend/components/ui/command.tsx`

---

#### US-2.7: Componentes de datos
**Como** desarrollador
**Quiero** componentes para mostrar datos
**Para** presentar información de manera organizada

**Criterios de aceptación:**
- [ ] Table (Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption)
- [ ] Avatar (Avatar, AvatarImage, AvatarFallback)
- [ ] Calendar
- [ ] Chart (con recharts)
- [ ] Carousel

**Archivos:**
- `app/frontend/components/ui/table.tsx`
- `app/frontend/components/ui/avatar.tsx`
- `app/frontend/components/ui/calendar.tsx`
- `app/frontend/components/ui/chart.tsx`
- `app/frontend/components/ui/carousel.tsx`

---

#### US-2.8: Componentes de layout
**Como** desarrollador
**Quiero** componentes de organización de contenido
**Para** estructurar la UI de forma flexible

**Criterios de aceptación:**
- [ ] Accordion (Accordion, AccordionItem, AccordionTrigger, AccordionContent)
- [ ] Collapsible
- [ ] Resizable (ResizablePanelGroup, ResizablePanel, ResizableHandle)
- [ ] Sidebar (Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, useSidebar)

**Archivos:**
- `app/frontend/components/ui/accordion.tsx`
- `app/frontend/components/ui/collapsible.tsx`
- `app/frontend/components/ui/resizable.tsx`
- `app/frontend/components/ui/sidebar.tsx`

---

### Epic 3: Componentes de Landing

#### US-3.1: Navbar público
**Como** visitante
**Quiero** una barra de navegación clara
**Para** acceder fácilmente a las secciones principales

**Criterios de aceptación:**
- [ ] Logo de PawCare
- [ ] Links de navegación (Agendar Cita, Aliados)
- [ ] Botones de autenticación (Login, Register)
- [ ] Menú móvil responsive (Sheet)
- [ ] Sticky header con blur backdrop

**Archivos:**
- `app/frontend/components/landing/Navbar.tsx`

---

#### US-3.2: Hero section
**Como** visitante
**Quiero** ver una sección hero atractiva
**Para** entender rápidamente qué ofrece PawCare

**Criterios de aceptación:**
- [ ] Título principal con highlight de color primario
- [ ] Subtítulo descriptivo
- [ ] CTAs principales (Agendar Cita, Llamar)
- [ ] Imagen destacada con overlay
- [ ] Info badges (24/7, Emergencias)
- [ ] Gradiente de fondo

**Archivos:**
- `app/frontend/components/landing/Hero.tsx`

---

#### US-3.3: Sección de servicios
**Como** visitante
**Quiero** ver los servicios de forma clara
**Para** conocer qué ofrece la veterinaria

**Criterios de aceptación:**
- [ ] ServiceCard con icono, título, descripción
- [ ] Lista de características por servicio
- [ ] Botón de acción por tarjeta
- [ ] Grid responsive (1-2-4 columnas)
- [ ] Animación hover con sombra

**Archivos:**
- `app/frontend/components/landing/ServiceCard.tsx`
- `app/frontend/components/landing/ServicesSection.tsx`

---

#### US-3.4: Sección de contacto
**Como** visitante
**Quiero** ver información de contacto
**Para** comunicarme con la veterinaria

**Criterios de aceptación:**
- [ ] Tarjetas de info (ubicación, horarios, teléfonos, email)
- [ ] Placeholder de mapa interactivo
- [ ] Botones de acción (Llamar, Email)
- [ ] Servicios adicionales (estacionamiento, transporte, virtual)

**Archivos:**
- `app/frontend/components/landing/ContactSection.tsx`

---

#### US-3.5: Footer
**Como** visitante
**Quiero** un footer informativo
**Para** acceder a información adicional

**Criterios de aceptación:**
- [ ] Logo y descripción breve
- [ ] Links de navegación organizados
- [ ] Información de contacto
- [ ] Links de redes sociales
- [ ] Copyright

**Archivos:**
- `app/frontend/components/landing/Footer.tsx`

---

#### US-3.6: Secciones adicionales de landing
**Como** visitante
**Quiero** ver más información de la veterinaria
**Para** conocer mejor el negocio

**Criterios de aceptación:**
- [ ] About section (historia, misión)
- [ ] CTA section (llamada a acción destacada)
- [ ] Announcements section (anuncios/promociones)

**Archivos:**
- `app/frontend/components/landing/AboutSection.tsx`
- `app/frontend/components/landing/CTASection.tsx`
- `app/frontend/components/landing/AnnouncementsSection.tsx`

---

### Epic 4: Componentes de Dashboard

#### US-4.1: Layout de dashboard
**Como** usuario del dashboard
**Quiero** una interfaz organizada con sidebar
**Para** navegar fácilmente entre secciones

**Criterios de aceptación:**
- [ ] Layout con sidebar colapsable
- [ ] Header con búsqueda global
- [ ] Botones de notificaciones y perfil
- [ ] Área de contenido principal con Outlet
- [ ] SidebarProvider y SidebarTrigger

**Archivos:**
- `app/frontend/components/dashboard/DashboardLayout.tsx`

---

#### US-4.2: VetSidebar
**Como** usuario del dashboard
**Quiero** un sidebar de navegación organizado
**Para** acceder a todas las funciones del sistema

**Criterios de aceptación:**
- [ ] Logo en header del sidebar
- [ ] Secciones agrupadas (Clínica, Gestión, Propietario)
- [ ] Iconos por cada item de menú
- [ ] Estado activo visual
- [ ] Modo colapsado con tooltips
- [ ] Integración con Inertia Link

**Archivos:**
- `app/frontend/components/dashboard/VetSidebar.tsx`

---

#### US-4.3: Diálogos de citas
**Como** recepcionista
**Quiero** gestionar citas mediante diálogos
**Para** crear, ver y reprogramar citas

**Criterios de aceptación:**
- [ ] NewAppointmentDialog (crear cita)
- [ ] RescheduleDialog (reprogramar)
- [ ] Campos: paciente, propietario, fecha, hora, motivo
- [ ] Selector de fecha con Calendar
- [ ] Selector de horarios disponibles
- [ ] Validación de campos

**Archivos:**
- `app/frontend/components/dashboard/appointments/NewAppointmentDialog.tsx`
- `app/frontend/components/dashboard/appointments/RescheduleDialog.tsx`

---

#### US-4.4: Diálogos de propietarios
**Como** recepcionista
**Quiero** gestionar propietarios mediante diálogos
**Para** crear, ver y editar información de clientes

**Criterios de aceptación:**
- [ ] OwnerDialog (crear/editar)
- [ ] OwnerViewDialog (solo lectura)
- [ ] OwnerProfileDialog (perfil completo)
- [ ] Campos: nombre, teléfono, email, dirección
- [ ] Lista de mascotas asociadas
- [ ] Historial de visitas

**Archivos:**
- `app/frontend/components/dashboard/owners/OwnerDialog.tsx`
- `app/frontend/components/dashboard/owners/OwnerViewDialog.tsx`
- `app/frontend/components/dashboard/owners/OwnerProfileDialog.tsx`
- `app/frontend/components/dashboard/owners/OwnerProfileView.tsx`

---

#### US-4.5: Diálogos de mascotas
**Como** recepcionista
**Quiero** gestionar mascotas mediante diálogos
**Para** crear, ver y editar información de pacientes

**Criterios de aceptación:**
- [ ] PetDialog (crear/editar)
- [ ] PetViewDialog (solo lectura)
- [ ] Campos: nombre, especie, raza, edad, peso, foto
- [ ] Propietario asociado
- [ ] Historial médico resumido

**Archivos:**
- `app/frontend/components/dashboard/pets/PetDialog.tsx`
- `app/frontend/components/dashboard/pets/PetViewDialog.tsx`

---

#### US-4.6: Diálogos de registros médicos
**Como** veterinario
**Quiero** gestionar registros médicos mediante diálogos
**Para** documentar consultas y tratamientos

**Criterios de aceptación:**
- [ ] NewRecordDialog (crear registro)
- [ ] RecordViewDialog (ver registro)
- [ ] Campos: fecha, diagnóstico, tratamiento, notas
- [ ] Adjuntar archivos
- [ ] Firma del veterinario

**Archivos:**
- `app/frontend/components/dashboard/records/NewRecordDialog.tsx`
- `app/frontend/components/dashboard/records/RecordViewDialog.tsx`

---

#### US-4.7: Diálogos de pagos
**Como** recepcionista
**Quiero** gestionar pagos mediante diálogos
**Para** procesar cobros y ver órdenes

**Criterios de aceptación:**
- [ ] NewOrderDialog (crear orden)
- [ ] OrderViewDialog (ver orden)
- [ ] PartialPaymentDialog (pago parcial)
- [ ] PaymentNoteDialog (nota de pago)
- [ ] Items de la orden con precios
- [ ] Cálculo de totales
- [ ] Métodos de pago

**Archivos:**
- `app/frontend/components/dashboard/payments/NewOrderDialog.tsx`
- `app/frontend/components/dashboard/payments/OrderViewDialog.tsx`
- `app/frontend/components/dashboard/payments/PartialPaymentDialog.tsx`
- `app/frontend/components/dashboard/payments/PaymentNoteDialog.tsx`

---

#### US-4.8: Formularios médicos
**Como** veterinario
**Quiero** formularios especializados
**Para** documentar diferentes tipos de atención

**Criterios de aceptación:**
- [ ] ConsultationForm (consulta general)
- [ ] VaccineForm (vacunación)
- [ ] RecipeForm (recetas médicas)
- [ ] LabTestsForm (exámenes de laboratorio)
- [ ] Campos específicos por tipo
- [ ] Validación de campos requeridos

**Archivos:**
- `app/frontend/components/dashboard/medical/ConsultationForm.tsx`
- `app/frontend/components/dashboard/medical/VaccineForm.tsx`
- `app/frontend/components/dashboard/medical/RecipeForm.tsx`
- `app/frontend/components/dashboard/medical/LabTestsForm.tsx`

---

#### US-4.9: Componentes utilitarios de dashboard
**Como** usuario del dashboard
**Quiero** componentes de utilidad
**Para** buscar pacientes y subir archivos

**Criterios de aceptación:**
- [ ] PatientSearch (búsqueda con autocompletado)
- [ ] FileUploadSection (drag & drop de archivos)
- [ ] FileImportSection (importar datos)
- [ ] Previsualización de archivos
- [ ] Validación de tipos de archivo

**Archivos:**
- `app/frontend/components/dashboard/PatientSearch.tsx`
- `app/frontend/components/dashboard/FileUploadSection.tsx`
- `app/frontend/components/dashboard/FileImportSection.tsx`

---

### Epic 5: Layouts de Aplicación

#### US-5.1: Layout público (landing)
**Como** desarrollador
**Quiero** un layout para páginas públicas
**Para** mantener estructura consistente

**Criterios de aceptación:**
- [ ] Navbar en header
- [ ] Footer en bottom
- [ ] Providers (Tooltip, Toast)
- [ ] Slot para contenido

**Archivos:**
- `app/frontend/components/layouts/PublicLayout.tsx`

---

#### US-5.2: Layout de autenticación
**Como** desarrollador
**Quiero** un layout para páginas de auth
**Para** tener diseño consistente en login/register

**Criterios de aceptación:**
- [ ] Fondo con color primario
- [ ] Card centrada
- [ ] Botón de volver al inicio
- [ ] Logo prominente

**Archivos:**
- `app/frontend/components/layouts/AuthLayout.tsx`

---

#### US-5.3: Layout de dashboard
**Como** desarrollador
**Quiero** un layout para el dashboard
**Para** mantener estructura consistente

**Criterios de aceptación:**
- [ ] SidebarProvider
- [ ] VetSidebar
- [ ] Header con búsqueda
- [ ] Toast providers
- [ ] PatientProvider (context)

**Archivos:**
- `app/frontend/components/layouts/DashboardLayout.tsx`

---

### Epic 6: Páginas Públicas

#### US-6.1: Landing page
**Como** visitante
**Quiero** ver la página principal
**Para** conocer los servicios de la veterinaria

**Criterios de aceptación:**
- [ ] Hero section
- [ ] Services section
- [ ] About section
- [ ] Contact section
- [ ] CTA section
- [ ] Announcements section

**Archivos:**
- `app/frontend/pages/Index.tsx`

---

#### US-6.2: Página de Login
**Como** usuario
**Quiero** una página de login
**Para** acceder a mi cuenta

**Criterios de aceptación:**
- [ ] Formulario con email y contraseña
- [ ] Toggle de visibilidad de contraseña
- [ ] Checkbox "Recordarme"
- [ ] Link a recuperar contraseña
- [ ] Link a registro

**Archivos:**
- `app/frontend/pages/auth/Login.tsx`

---

#### US-6.3: Página de Registro
**Como** visitante
**Quiero** una página de registro
**Para** crear mi cuenta

**Criterios de aceptación:**
- [ ] Formulario con datos personales
- [ ] Validación de campos
- [ ] Aceptación de términos
- [ ] Link a login

**Archivos:**
- `app/frontend/pages/auth/Register.tsx`

---

#### US-6.4: Página de Agendar Cita (público)
**Como** visitante
**Quiero** agendar una cita
**Para** programar una visita para mi mascota

**Criterios de aceptación:**
- [ ] Wizard de 3 pasos
- [ ] Paso 1: Datos del propietario
- [ ] Paso 2: Datos de la mascota
- [ ] Paso 3: Fecha y hora
- [ ] Indicador de progreso
- [ ] Calendario interactivo
- [ ] Slots de tiempo

**Archivos:**
- `app/frontend/pages/appointments/NewAppointment.tsx`

---

### Epic 7: Páginas de Dashboard - Clínica

#### US-7.1: Gestión de Citas
**Como** recepcionista
**Quiero** gestionar todas las citas
**Para** organizar la agenda de la clínica

**Criterios de aceptación:**
- [ ] Vista de calendario (día/semana/mes)
- [ ] Lista de citas del día
- [ ] Filtros por estado, veterinario, fecha
- [ ] Acciones: crear, ver, reprogramar, cancelar
- [ ] Indicadores de estado (confirmada, pendiente, completada)

**Archivos:**
- `app/frontend/pages/dashboard/Appointments.tsx`

---

#### US-7.2: Gestión de Propietarios/Pacientes
**Como** recepcionista
**Quiero** gestionar propietarios y sus mascotas
**Para** mantener el registro de clientes

**Criterios de aceptación:**
- [ ] Tabla de propietarios con búsqueda
- [ ] Filtros por nombre, teléfono, email
- [ ] Ver perfil completo del propietario
- [ ] Lista de mascotas por propietario
- [ ] Acciones: crear, editar, ver

**Archivos:**
- `app/frontend/pages/dashboard/Owners.tsx`

---

#### US-7.3: Historial Médico
**Como** veterinario
**Quiero** consultar el historial médico
**Para** ver el historial completo de un paciente

**Criterios de aceptación:**
- [ ] Búsqueda de paciente
- [ ] Timeline de registros médicos
- [ ] Filtros por tipo de registro, fecha
- [ ] Ver detalle de cada registro
- [ ] Descargar/imprimir historial

**Archivos:**
- `app/frontend/pages/dashboard/MedicalHistory.tsx`

---

#### US-7.4: Nueva Consulta
**Como** veterinario
**Quiero** registrar una nueva consulta
**Para** documentar la atención médica

**Criterios de aceptación:**
- [ ] Selección de paciente (PatientSearch)
- [ ] Tabs por tipo: Consulta, Vacunas, Receta, Exámenes
- [ ] Formulario según tipo seleccionado
- [ ] Guardar y continuar
- [ ] Generar orden de pago

**Archivos:**
- `app/frontend/pages/dashboard/NewConsult.tsx`

---

#### US-7.5: Gestión de Pagos
**Como** recepcionista
**Quiero** gestionar los pagos
**Para** procesar cobros de servicios

**Criterios de aceptación:**
- [ ] Lista de órdenes pendientes
- [ ] Filtros por estado, fecha, propietario
- [ ] Procesar pago completo o parcial
- [ ] Ver detalle de orden
- [ ] Historial de pagos

**Archivos:**
- `app/frontend/pages/dashboard/Payments.tsx`

---

#### US-7.6: Reportes Médicos
**Como** veterinario
**Quiero** generar reportes médicos
**Para** documentar y compartir información

**Criterios de aceptación:**
- [ ] Tipos de reportes disponibles
- [ ] Selección de paciente y fechas
- [ ] Previsualización del reporte
- [ ] Descargar PDF
- [ ] Enviar por email

**Archivos:**
- `app/frontend/pages/dashboard/Reports.tsx`

---

### Epic 8: Páginas de Dashboard - Gestión

#### US-8.1: Métricas
**Como** administrador
**Quiero** ver métricas del negocio
**Para** tomar decisiones informadas

**Criterios de aceptación:**
- [ ] Dashboard con KPIs principales
- [ ] Gráficos de citas por período
- [ ] Gráficos de ingresos
- [ ] Top servicios
- [ ] Comparativas con períodos anteriores

**Archivos:**
- `app/frontend/pages/dashboard/Metrics.tsx`

---

#### US-8.2: Gestión de Personal
**Como** administrador
**Quiero** gestionar el personal
**Para** administrar empleados

**Criterios de aceptación:**
- [ ] Lista de empleados
- [ ] Filtros por rol, estado
- [ ] Crear/editar empleado
- [ ] Asignar roles y permisos
- [ ] Ver horarios asignados

**Archivos:**
- `app/frontend/pages/dashboard/Personnel.tsx`

---

#### US-8.3: Gestión de Turnos
**Como** administrador
**Quiero** gestionar turnos de trabajo
**Para** organizar los horarios del personal

**Criterios de aceptación:**
- [ ] Calendario de turnos
- [ ] Asignar turnos por empleado
- [ ] Vista por día/semana
- [ ] Detectar conflictos de horario
- [ ] Notificar cambios

**Archivos:**
- `app/frontend/pages/dashboard/Shifts.tsx`

---

#### US-8.4: Gestión Financiera
**Como** administrador
**Quiero** ver el estado financiero
**Para** controlar ingresos y gastos

**Criterios de aceptación:**
- [ ] Resumen de ingresos/gastos
- [ ] Gráficos por período
- [ ] Desglose por categoría
- [ ] Cuentas por cobrar
- [ ] Exportar reportes

**Archivos:**
- `app/frontend/pages/dashboard/Financial.tsx`

---

#### US-8.5: Productos y Servicios
**Como** administrador
**Quiero** gestionar el catálogo
**Para** mantener precios y servicios actualizados

**Criterios de aceptación:**
- [ ] Lista de productos
- [ ] Lista de servicios
- [ ] Crear/editar items
- [ ] Gestionar precios
- [ ] Categorías
- [ ] Estado activo/inactivo

**Archivos:**
- `app/frontend/pages/dashboard/ProductsServices.tsx`

---

#### US-8.6: Gestión de Contenido
**Como** administrador
**Quiero** gestionar contenido del sitio
**Para** actualizar información pública

**Criterios de aceptación:**
- [ ] Editar textos de landing
- [ ] Gestionar anuncios
- [ ] Subir imágenes
- [ ] Configurar horarios públicos
- [ ] Información de contacto

**Archivos:**
- `app/frontend/pages/dashboard/ContentManagement.tsx`

---

### Epic 9: Páginas de Dashboard - Propietario

#### US-9.1: Perfil de Usuario
**Como** propietario
**Quiero** ver y editar mi perfil
**Para** mantener mi información actualizada

**Criterios de aceptación:**
- [ ] Ver datos personales
- [ ] Editar información
- [ ] Cambiar contraseña
- [ ] Preferencias de notificación

**Archivos:**
- `app/frontend/pages/dashboard/Profile.tsx`

---

#### US-9.2: Mis Mascotas
**Como** propietario
**Quiero** ver mis mascotas registradas
**Para** gestionar su información

**Criterios de aceptación:**
- [ ] Lista de mascotas
- [ ] Ver perfil de mascota
- [ ] Ver historial médico resumido
- [ ] Próximas vacunas/citas

**Archivos:**
- `app/frontend/pages/dashboard/Pets.tsx`

---

#### US-9.3: Mis Citas
**Como** propietario
**Quiero** ver y gestionar mis citas
**Para** organizar las visitas de mis mascotas

**Criterios de aceptación:**
- [ ] Lista de citas próximas
- [ ] Historial de citas pasadas
- [ ] Solicitar nueva cita
- [ ] Cancelar/reprogramar cita
- [ ] Recordatorios

**Archivos:**
- `app/frontend/pages/dashboard/OwnerAppointments.tsx`

---

#### US-9.4: Historial de Pagos
**Como** propietario
**Quiero** ver mi historial de pagos
**Para** tener control de mis gastos

**Criterios de aceptación:**
- [ ] Lista de pagos realizados
- [ ] Filtros por fecha, mascota
- [ ] Ver detalle de cada pago
- [ ] Descargar recibos
- [ ] Pagos pendientes

**Archivos:**
- `app/frontend/pages/dashboard/PaymentHistory.tsx`

---

#### US-9.5: Registros Activos
**Como** propietario
**Quiero** ver registros médicos activos
**Para** dar seguimiento a tratamientos

**Criterios de aceptación:**
- [ ] Lista de tratamientos activos
- [ ] Recordatorios de medicamentos
- [ ] Próximas citas de seguimiento
- [ ] Ver indicaciones del veterinario

**Archivos:**
- `app/frontend/pages/dashboard/ActiveRecords.tsx`

---

### Epic 10: Hooks y Context

#### US-10.1: Hook useToast
**Como** desarrollador
**Quiero** un hook para notificaciones
**Para** mostrar mensajes al usuario

**Criterios de aceptación:**
- [ ] Función `toast()` para crear notificaciones
- [ ] Variantes: default, success, error, warning
- [ ] Auto-dismiss configurable
- [ ] Soporte para acciones

**Archivos:**
- `app/frontend/hooks/use-toast.ts`

---

#### US-10.2: Hook useMobile
**Como** desarrollador
**Quiero** detectar dispositivos móviles
**Para** adaptar la UI

**Criterios de aceptación:**
- [ ] Detectar ancho de pantalla
- [ ] Retornar booleano `isMobile`
- [ ] Actualizar en resize

**Archivos:**
- `app/frontend/hooks/use-mobile.tsx`

---

#### US-10.3: PatientContext
**Como** desarrollador
**Quiero** un context para el paciente seleccionado
**Para** compartir estado entre componentes

**Criterios de aceptación:**
- [ ] PatientProvider
- [ ] usePatient hook
- [ ] Estado: paciente seleccionado, propietario
- [ ] Acciones: seleccionar, limpiar

**Archivos:**
- `app/frontend/contexts/PatientContext.tsx`

---

### Epic 11: Dependencias

#### US-11.1: Dependencias de Radix UI
**Como** desarrollador
**Quiero** las dependencias de Radix instaladas
**Para** construir componentes accesibles

```bash
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-label @radix-ui/react-navigation-menu @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-hover-card @radix-ui/react-context-menu @radix-ui/react-menubar @radix-ui/react-scroll-area @radix-ui/react-collapsible @radix-ui/react-aspect-ratio
```

---

#### US-11.2: Dependencias de estilo
**Como** desarrollador
**Quiero** utilidades para manejo de clases
**Para** componer estilos eficientemente

```bash
npm install clsx tailwind-merge class-variance-authority
npm install -D tailwindcss-animate
```

---

#### US-11.3: Dependencias adicionales
**Como** desarrollador
**Quiero** dependencias para funcionalidades específicas
**Para** implementar features avanzadas

```bash
npm install date-fns react-day-picker sonner cmdk embla-carousel-react react-hook-form @hookform/resolvers zod recharts react-resizable-panels vaul input-otp
npm install @tanstack/react-query
```

---

## Orden de Implementación

### Fase 1: Fundamentos
1. US-11.1, US-11.2, US-11.3 (Dependencias)
2. US-1.1 (Tokens CSS)
3. US-1.2 (Tailwind config)
4. US-1.3 (Utilidades)

### Fase 2: Componentes UI Core
5. US-2.1 (Acciones)
6. US-2.2 (Contenedores)
7. US-2.3 (Formularios)
8. US-2.5 (Feedback)

### Fase 3: Componentes UI Avanzados
9. US-2.4 (Overlays)
10. US-2.6 (Navegación)
11. US-2.7 (Datos)
12. US-2.8 (Layout)

### Fase 4: Layouts
13. US-5.1 (PublicLayout)
14. US-5.2 (AuthLayout)
15. US-5.3 (DashboardLayout)

### Fase 5: Componentes de Landing
16. US-3.1 (Navbar)
17. US-3.2 (Hero)
18. US-3.3 (Services)
19. US-3.4 (Contact)
20. US-3.5 (Footer)
21. US-3.6 (About, CTA, Announcements)

### Fase 6: Componentes de Dashboard
22. US-4.1 (DashboardLayout)
23. US-4.2 (VetSidebar)
24. US-4.3-4.7 (Diálogos)
25. US-4.8 (Formularios médicos)
26. US-4.9 (Utilitarios)

### Fase 7: Hooks y Context
27. US-10.1 (useToast)
28. US-10.2 (useMobile)
29. US-10.3 (PatientContext)

### Fase 8: Páginas Públicas
30. US-6.1 (Landing)
31. US-6.2 (Login)
32. US-6.3 (Register)
33. US-6.4 (Appointments público)

### Fase 9: Páginas Dashboard - Clínica
34. US-7.1-7.6 (Appointments, Owners, MedicalHistory, NewConsult, Payments, Reports)

### Fase 10: Páginas Dashboard - Gestión
35. US-8.1-8.6 (Metrics, Personnel, Shifts, Financial, ProductsServices, ContentManagement)

### Fase 11: Páginas Dashboard - Propietario
36. US-9.1-9.5 (Profile, Pets, OwnerAppointments, PaymentHistory, ActiveRecords)

---

## Estructura de Carpetas Final

```
app/frontend/
├── components/
│   ├── ui/                           # Componentes base (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sidebar.tsx
│   │   └── ... (50+ componentes)
│   ├── layouts/                      # Layouts de aplicación
│   │   ├── PublicLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── landing/                      # Componentes de landing
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── CTASection.tsx
│   │   ├── AnnouncementsSection.tsx
│   │   └── Footer.tsx
│   └── dashboard/                    # Componentes de dashboard
│       ├── VetSidebar.tsx
│       ├── PatientSearch.tsx
│       ├── FileUploadSection.tsx
│       ├── FileImportSection.tsx
│       ├── appointments/
│       │   ├── NewAppointmentDialog.tsx
│       │   └── RescheduleDialog.tsx
│       ├── owners/
│       │   ├── OwnerDialog.tsx
│       │   ├── OwnerViewDialog.tsx
│       │   ├── OwnerProfileDialog.tsx
│       │   └── OwnerProfileView.tsx
│       ├── pets/
│       │   ├── PetDialog.tsx
│       │   └── PetViewDialog.tsx
│       ├── records/
│       │   ├── NewRecordDialog.tsx
│       │   └── RecordViewDialog.tsx
│       ├── payments/
│       │   ├── NewOrderDialog.tsx
│       │   ├── OrderViewDialog.tsx
│       │   ├── PartialPaymentDialog.tsx
│       │   └── PaymentNoteDialog.tsx
│       └── medical/
│           ├── ConsultationForm.tsx
│           ├── VaccineForm.tsx
│           ├── RecipeForm.tsx
│           └── LabTestsForm.tsx
├── contexts/
│   └── PatientContext.tsx
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── lib/
│   └── utils.ts
├── pages/
│   ├── Index.tsx                     # Landing
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── appointments/
│   │   └── NewAppointment.tsx        # Público
│   └── dashboard/
│       ├── Appointments.tsx
│       ├── Owners.tsx
│       ├── MedicalHistory.tsx
│       ├── NewConsult.tsx
│       ├── Payments.tsx
│       ├── Reports.tsx
│       ├── Metrics.tsx
│       ├── Personnel.tsx
│       ├── Shifts.tsx
│       ├── Financial.tsx
│       ├── ProductsServices.tsx
│       ├── ContentManagement.tsx
│       ├── Profile.tsx
│       ├── Pets.tsx
│       ├── OwnerAppointments.tsx
│       ├── PaymentHistory.tsx
│       └── ActiveRecords.tsx
├── styles/
│   └── tokens.css
└── entrypoints/
    └── application.css
```

---

## Notas Técnicas

### Compatibilidad
- **Tailwind CSS v4**: Nueva sintaxis `@import "tailwindcss"`
- **React 19**: Compatibilidad con nuevas features
- **Inertia.js**: Navegación (usar `Link` de Inertia, no React Router)

### Convenciones
- Colores en HSL para consistencia
- Usar `cn()` para composición de clases
- Componentes con `forwardRef` para refs
- Props extendiendo `HTMLAttributes` nativas
- Nombres de archivos en kebab-case para UI, PascalCase para componentes de negocio

### Adaptaciones para Inertia
- Reemplazar `react-router-dom` por `@inertiajs/react`
- Usar `Link` de Inertia en lugar de `NavLink`
- Adaptar layouts para usar `usePage()` hook

### Testing
- Cada componente UI debe tener tests básicos
- Usar `@testing-library/react`
- Mocks para Inertia en tests

---

## Resumen de User Stories

| Epic | Cantidad | Descripción |
|------|----------|-------------|
| 1. Fundamentos | 3 | Tokens, Tailwind, Utilidades |
| 2. UI Base | 8 | Componentes shadcn/ui |
| 3. Landing | 6 | Componentes de landing page |
| 4. Dashboard | 9 | Componentes de dashboard |
| 5. Layouts | 3 | Layouts de aplicación |
| 6. Páginas Públicas | 4 | Landing, Auth, Appointments |
| 7. Páginas Clínica | 6 | Gestión clínica |
| 8. Páginas Gestión | 6 | Administración |
| 9. Páginas Propietario | 5 | Portal de propietario |
| 10. Hooks/Context | 3 | Estado y utilidades |
| 11. Dependencias | 3 | Instalación de paquetes |
| **Total** | **56** | |
