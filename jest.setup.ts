/**
 * Setup de Jest.
 *
 * IMPORTANTE: aquí NO se mockea lógica de negocio ni respuestas de API. Lo único
 * que se sustituye son los módulos NATIVOS de almacenamiento (Keychain /
 * AsyncStorage), que no existen en el entorno Node de Jest. Las peticiones HTTP
 * van al backend real (`EXPO_PUBLIC_API_BASE_URL`, por defecto localhost:3000).
 *
 * Nota: en @testing-library/react-native v12.4+ los matchers se registran
 * automáticamente al importar la librería; no hace falta `extend-expect`.
 */

// Backend real por defecto si el script de test no lo definió.
process.env.EXPO_PUBLIC_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

// El preset de React Native reemplaza `fetch` por un polyfill que no hace red
// real en Node. Restauramos un cliente HTTP real (undici) para que los tests
// peguen DE VERDAD al backend.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetch, Headers, Request, Response } = require('undici');
Object.assign(globalThis, { fetch, Headers, Request, Response });

// Shim de plataforma: SecureStore en memoria (no es lógica de negocio).
jest.mock('expo-secure-store', () => {
  const mem = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => (mem.has(k) ? mem.get(k)! : null)),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      mem.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      mem.delete(k);
    }),
  };
});

// Shim de plataforma: AsyncStorage en memoria (mock oficial del paquete).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
