/**
 * Configuración por entorno (RNF-ARQ-002).
 *
 * La base URL del API se lee de `process.env.EXPO_PUBLIC_API_BASE_URL` (variable
 * pública de Expo, embebida en el bundle). Si no está definida, se usa un valor
 * por defecto de desarrollo.
 *
 * Nota Android: el emulador alcanza el `localhost` de la máquina anfitriona en
 * `10.0.2.2`, por eso ese es el default de desarrollo (Rails suele correr en :3000).
 *
 * En staging/producción la URL DEBE ser HTTPS (RNF-SEC-001) y se inyecta vía
 * variable de entorno al construir.
 */

type Environment = 'development' | 'staging' | 'production';

const DEV_DEFAULT_API_BASE_URL = 'http://10.0.2.2:3000';

function resolveEnvironment(): Environment {
  // __DEV__ es global de React Native (true en dev server).
  if (typeof __DEV__ !== 'undefined' && __DEV__) return 'development';
  const explicit = process.env.EXPO_PUBLIC_ENV;
  if (explicit === 'staging' || explicit === 'production') return explicit;
  return 'production';
}

function resolveApiBaseUrl(env: Environment): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/+$/, '');
  if (env === 'development') return DEV_DEFAULT_API_BASE_URL;
  // Producción self-hosted: si no se inyectó URL en el build, queda vacía y el
  // usuario elige su servidor en runtime (ver `serverConfig` + ServerSettings).
  return '';
}

const environment: Environment = resolveEnvironment();

export const config = {
  environment,
  apiBaseUrl: resolveApiBaseUrl(environment),
  /** Timeout por defecto de las peticiones HTTP (ms). */
  requestTimeoutMs: 15000,
  /** true solo en desarrollo: habilita logs técnicos (RNF-OBS-001). */
  isDev: environment === 'development',
} as const;

export type AppConfig = typeof config;
