# PawCare Mobile — Arquitectura

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React Native (Expo SDK 56) |
| Lenguaje | TypeScript |
| Package Manager | Yarn Berry 4.x (node-modules linker) |
| Navegación | React Navigation |
| Backend | Rails API (existente) |

## Estructura de Directorios

```
pawcare-mobile/
├── App.tsx                  # Entry point
├── index.ts                 # Registro del componente raíz
├── app.json                 # Configuración Expo
├── tsconfig.json            # Config TypeScript
├── src/
│   ├── theme/               # Design tokens y theming
│   │   ├── index.ts         # Re-exports
│   │   └── tokens.ts        # Colores, spacing, tipografía, sombras
│   ├── components/          # Componentes reutilizables (UI)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── screens/             # Pantallas completas
│   │   ├── auth/            # Login, Register, ForgotPassword
│   │   ├── home/            # Dashboard principal
│   │   ├── pets/            # Listado y detalle de mascotas
│   │   ├── appointments/    # Citas veterinarias
│   │   └── profile/         # Perfil del usuario
│   ├── navigation/          # Configuración de navegación
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   └── MainTabs.tsx
│   ├── services/            # Comunicación con el API
│   │   ├── api.ts           # Cliente HTTP base
│   │   ├── auth.ts          # Endpoints de autenticación
│   │   ├── pets.ts          # Endpoints de mascotas
│   │   └── appointments.ts  # Endpoints de citas
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── ...
│   ├── types/               # Tipos TypeScript compartidos
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── navigation.ts
│   └── utils/               # Funciones utilitarias
│       ├── storage.ts       # AsyncStorage helpers
│       └── format.ts        # Formateo de fechas, moneda, etc.
├── assets/                  # Imágenes, iconos, fuentes
└── docs/                    # Documentación del proyecto
```

## Capas de Arquitectura

### 1. Navegación (React Navigation)

Maneja todo el flujo entre pantallas:

- **RootNavigator** — decide si mostrar AuthStack o MainTabs según el estado de autenticación.
- **AuthStack** — stack navigator para Login → Register → ForgotPassword.
- **MainTabs** — bottom tab navigator con las secciones principales (Home, Mascotas, Citas, Perfil).
- Cada tab puede tener su propio stack para navegación interna (ej: lista de mascotas → detalle).

```
RootNavigator
├── AuthStack (no autenticado)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
└── MainTabs (autenticado)
    ├── HomeStack
    │   └── HomeScreen
    ├── PetsStack
    │   ├── PetsListScreen
    │   └── PetDetailScreen
    ├── AppointmentsStack
    │   ├── AppointmentsListScreen
    │   └── AppointmentDetailScreen
    └── ProfileStack
        └── ProfileScreen
```

### 2. Screens (Pantallas)

Cada pantalla es un componente que:
- Recibe parámetros de navegación vía React Navigation.
- Orquesta la lógica de la vista (fetching, estado, interacciones).
- Compone componentes reutilizables del directorio `components/`.

### 3. Components (UI)

Piezas reutilizables que consumen los tokens del theme:
- **Button** — variantes primary, secondary, outline, destructive, ghost. Tamaños sm/md/lg.
- **Card** — contenedor con header, content, footer.
- **Input** — campo de texto con label, placeholder, estados de error.
- **Badge** — etiquetas de estado (primary, success, warning, destructive).
- **Avatar** — imagen circular con fallback a iniciales.

Estos componentes se construyen con `StyleSheet.create()` y los valores de `src/theme/tokens.ts`.

### 4. Theme

Los design tokens en `src/theme/tokens.ts` definen:
- **Paletas de color** — light y dark, con colores semánticos (primary, success, destructive, etc.)
- **Tipografía** — tamaños de fuente, line heights, font weights.
- **Espaciado** — escala de 4px (0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80).
- **Border radius** — sm (4px) hasta full (circular).
- **Sombras** — adaptadas al formato nativo (iOS shadow + Android elevation).
- **Layout** — constantes de header, bottom nav, padding, touch targets.

### 5. Services (API)

Capa de comunicación con el backend Rails:
- Un **cliente HTTP base** configura la URL, headers, y manejo de tokens.
- Cada módulo de servicio agrupa los endpoints relacionados.
- Las rutas del API están documentadas en `docs/rails-routes.txt`.

### 6. Hooks

Custom hooks que encapsulan lógica reutilizable:
- `useAuth` — estado de autenticación, login, logout, token management.
- `useTheme` — acceso a los tokens según el color scheme del dispositivo.

### 7. Types

Tipos TypeScript compartidos:
- **Models** — interfaces para entidades (User, Pet, Appointment, etc.)
- **API** — tipos de request/response.
- **Navigation** — tipado de las rutas y parámetros de navegación.

## Flujo de Datos

```
Usuario interactúa
       ↓
Screen (orquesta)
       ↓
Service (HTTP) ←→ Rails API
       ↓
Estado local / React State
       ↓
Components (renderizan con tokens del Theme)
```

## Convenciones

- **Archivos**: PascalCase para componentes (`Button.tsx`), camelCase para utilidades (`format.ts`).
- **Exports**: named exports preferidos sobre default exports (excepto screens para lazy loading).
- **Estilos**: `StyleSheet.create()` al final de cada archivo de componente, usando tokens del theme.
- **Tipos**: interfaces para objetos, types para unions y utilidades.
